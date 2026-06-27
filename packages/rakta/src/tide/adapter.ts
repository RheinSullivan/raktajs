import { render, resolveRouteMode, type RenderConfig } from "rakta/render";
import { buildErrorResponse, buildHtmlResponse, createRuntimeContext } from "./runtime";
import { generateManifest, matchRoute } from "rakta/router";
import { join } from "path";
import type { TideAdapter, TideAdapterConfig } from "./types";
import { existsSync, readFileSync } from "fs";

// CLI integration: bun rakta tide render
const STATIC_MINE: Readonly<Record<string, string>> = {
    ".js": "applicaton/javascript; charset=utf-8",
    ".ts": "applicaton/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
};

function mimeForPath(filePath: string): string {
    const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
    return STATIC_MINE[ext] ?? "application/octet-stream";
};

interface ApiRouteExports {
    GET?: (req: Request) => Promise<Response>;
    POST?: (req: Request) => Promise<Response>;
    PUT?: (req: Request) => Promise<Response>;
    PATCH?: (req: Request) => Promise<Response>;
    DELETE?: (req: Request) => Promise<Response>;
    HEAD?: (req: Request) => Promise<Response>;
    OPTIONS?: (req: Request) => Promise<Response>;
};

/**
* Creates the Bun Tide adapter
* Handles static files, API routes, and page renoering.
*/
export function createBunAdapter(
  adapterConfig: TideAdapterConfig,
  renderConfig: RenderConfig
): TideAdapter {
  const manifest = generateManifest(adapterConfig.appDir);
  const searchDirs = [adapterConfig.publicDir, adapterConfig.outDir];

  // eslint-disable-next-line prefer-const
  let server: ReturnType<typeof Bun.serve>;

  async function handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // Static file resolution
    for (const dir of searchDirs) {
      const filePath = join(dir, pathname);
      if (existsSync(filePath) && !filePath.endsWith("/")) {
        return new Response(readFileSync(filePath), {
          headers: {
            "Content-Type": mimeForPath(pathname),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    // API route resolution
    const apiRoutes = manifest.routes.filter((r) => r.kind === "api");
    const apiMatch = matchRoute(pathname, apiRoutes);

    if (apiMatch) {
      const modulePath = join(
        adapterConfig.appDir, 
        apiMatch.entry.filePath
      );

      const mod = await import(modulePath) as ApiRouteExports;
      const method = request.method.toUpperCase() as keyof ApiRouteExports;
      const handler = mod[method];

      if (typeof handler !== "function") {
        return new Response(
            "Method not allowed", 
            { status: 405 }
        );
      }

      return await handler(request);
    }

    // Page route rendering
    const resolved = resolveRouteMode(
        pathname, 
        renderConfig
    );
    const context = createRuntimeContext(
        request, 
        url, 
        {}, 
        resolved.mode
    );

    const renderResult = await render(
      {
        routePath: context.pathname,
        mode: context.resolvedMode,
        params: context.params,
        searchParams: context.searchParams,
        requestHeaders: context.requestHeaders,
        timestampMs: context.timestampMs,
      },
      {
        appName: adapterConfig.appName,
        scriptPath: "/app.js",
        cssPath: "/globals.css",
        lang: "en",
      }
    );

    if (renderResult.kind === "failure") {
      return buildErrorResponse(renderResult.reason, renderResult.httpStatus);
    }

    return buildHtmlResponse(renderResult.html, renderResult.httpStatus);
  }

  return {
    kind: "bun",
    handle,
    start: async (): Promise<void> => {
      server = Bun.serve({
        port: adapterConfig.port,
        hostname: adapterConfig.host,
        fetch: handle,
      });
      console.log(
        `[Rakta.js Tide] Running at http://${adapterConfig.host}:${server.port}`
      );
    },
    stop: (): void => {
      server?.stop();
    },
  };
}
