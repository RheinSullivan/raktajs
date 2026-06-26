import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { scanRoutes } from "./scanner";
import type { RouteManifest } from "./types";

export function generateManifest(appDir: string): RouteManifest {
    const routes = scanRoutes({ appDir });

    const manifest: RouteManifest = {
        version: "1",
        generatedAt: new Date().toISOString(),
        routes,
    };

    return manifest;
};

export function writeManifest(manifest: RouteManifest, outputPath: string): void {
  writeFileSync(outputPath, JSON.stringify(manifest, null, 2), "utf-8");
}

export function readManifest(manifestPath: string): RouteManifest | null {
  if (!existsSync(manifestPath)) return null;

  const raw = readFileSync(manifestPath, "utf-8");

  const parsed: unknown = JSON.parse(raw);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("version" in parsed) ||
    !("routes" in parsed)
  ) {
    return null;
  }

  return parsed as RouteManifest;
}

export function printManifest(manifest: RouteManifest): void {
  const pageRoutes = manifest.routes.filter((route) => route.kind === "page");
  const apiRoutes = manifest.routes.filter((route) => route.kind === "api");
  const layoutRoutes = manifest.routes.filter((route) => route.kind === "layout");
  const specialRoutes = manifest.routes.filter((route) =>
    ["loading", "not-found", "error"].includes(route.kind)
  );

  const line = "─".repeat(56);

  console.log(`\n  Rakta.js Route Manifest`);
  console.log(`  ${line}`);
  console.log(`  Generated: ${manifest.generatedAt}`);
  console.log(`  Total:     ${manifest.routes.length} routes\n`);

  if (pageRoutes.length > 0) {
    console.log("  Pages:");
    for (const route of pageRoutes) {
      const dynamic = route.isDynamic ? `  [params: ${route.paramNames.join(", ")}]` : "";
      console.log(`    GET  ${route.urlPattern}${dynamic}`);
    }
    console.log("");
  }

  if (apiRoutes.length > 0) {
    console.log("  API Routes:");
    for (const route of apiRoutes) {
      const dynamic = route.isDynamic ? `  [params: ${route.paramNames.join(", ")}]` : "";
      console.log(`    ANY  ${route.urlPattern}${dynamic}`);
    }
    console.log("");
  }

  if (layoutRoutes.length > 0) {
    console.log("  Layouts:");
    for (const route of layoutRoutes) {
      console.log(`    ${route.urlPattern === "/" ? "root" : route.urlPattern}`);
    }
    console.log("");
  }

  if (specialRoutes.length > 0) {
    console.log("  Special:");
    for (const route of specialRoutes) {
      console.log(`    [${route.kind}]  ${route.filePath}`);
    }
    console.log("");
  }

  console.log(`  ${line}\n`);
}