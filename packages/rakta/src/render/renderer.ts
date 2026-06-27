import type {
  RenderContext,
  RenderResult,
  RenderMode,
  RenderSuccess,
  RenderFailure,
} from "./types";
import { isRoadmapMode } from "./modes";

export interface RendererOptions {
  readonly appName: string;
  readonly scriptPath: string;
  readonly cssPath: string;
  readonly lang: string;
}

function buildHtmlShell(options: RendererOptions): string {
  return `
  <!DOCTYPE html>
    <html lang="${options.lang}">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>
                ${options.appName}
            </title>
            <link rel="stylesheet" href="${options.cssPath}" />
        </head>
        <body>
            <div id="rakta-root"></div>
            <script type="module" src="${options.scriptPath}"></script>
        </body>
    </html>`;
}

function makeSuccess(
  html: string,
  mode: RenderMode,
  renderMs: number,
  httpStatus: number = 200,
  fromCache: boolean = false
): RenderSuccess {
  return {
    kind: "success",
    html,
    mode,
    httpStatus,
    responseHeaders: { "Content-Type": "text/html; charset=utf-8" },
    fromCache,
    renderMs,
  };
}

function makeFailure(
  reason: string,
  mode: RenderMode,
  httpStatus: number = 500
): RenderFailure {
  return { kind: "failure", reason, mode, httpStatus };
}

/**
 * Render a page using the resolved mode from the context.
 * Roadmap modes (ssr, ssg, csg) fall back to a CSR shell in v0.1.0.
 */
export async function render(
  context: RenderContext,
  options: RendererOptions
): Promise<RenderResult> {
  const startMs = Date.now();

  // Roadmap modes: fall back to CSR shell with a warning
  if (isRoadmapMode(context.mode)) {
    console.warn(
      `[Rakta.js] Render mode "${context.mode}" is a roadmap feature (v0.2.0). ` +
        `Falling back to CSR for: ${context.routePath}`
    );
    return makeSuccess(buildHtmlShell(options), "csr", Date.now() - startMs);
  }

  switch (context.mode) {
    case "csr":
    case "spa":
      return makeSuccess(
        buildHtmlShell(options),
        context.mode,
        Date.now() - startMs
      );

    case "hybrid":
      // Hybrid resolution happens upstream in Tide. If it reaches the renderer
      // as hybrid, the route had no specific override - fall back to CSR.
      return makeSuccess(buildHtmlShell(options), "csr", Date.now() - startMs);

    case "ssr":
    case "ssg":
    case "csg":
      // These are already caught by isRoadmapMode above, but TypeScript
      // requires an exhaustive switch for the RenderMode union.
      return makeFailure(
        `Render mode "${context.mode}" is not yet implemented.`,
        context.mode,
        501
      );
  }
}

export function renderNotFound(options: RendererOptions): RenderSuccess {
  return makeSuccess(buildHtmlShell(options), "csr", 0, 404);
}

export function renderServerError(reason: string, mode: RenderMode): RenderFailure {
  return makeFailure(reason, mode, 500);
}