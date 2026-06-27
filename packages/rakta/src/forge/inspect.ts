import { existsSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type {
  ForgeInspectReport,
  ForgeBuildArtifact,
  ArtifactKind,
  ForgeRouteModeEntry,
} from "./types";
import { readManifest } from "../router/manifest";
import { resolveRouteMode } from "../render/modes";
import type { RenderConfig } from "../render/types";

export interface InspectOptions {
  readonly outDir: string;
  readonly renderConfig: RenderConfig;
}

function detectArtifactKind(filename: string): ArtifactKind {
  if (filename === "route-manifest.json") return "manifest";
  if (filename.endsWith(".css")) return "stylesheet";
  if (filename.endsWith(".js") || filename.endsWith(".mjs")) return "script";
  return "asset";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(2)} MB`;
}

function scanDirectory(dirPath: string): ForgeBuildArtifact[] {
  if (!existsSync(dirPath)) return [];
  const collected: ForgeBuildArtifact[] = [];

  function walk(current: string): void {
    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        collected.push({
          outputPath: full,
          sizeBytes: statSync(full).size,
          kind: detectArtifactKind(entry.name),
        });
      }
    }
  }

  walk(dirPath);
  return collected;
}

export function inspectBuild(options: InspectOptions): ForgeInspectReport {
  const artifacts = scanDirectory(options.outDir);
  const manifestPath = join(options.outDir, "route-manifest.json");
  const manifest = readManifest(manifestPath);

  const emptyManifest = {
    version: "1" as const,
    generatedAt: new Date().toISOString(),
    routes: [],
  };

  const routeModes: ForgeRouteModeEntry[] = (manifest ?? emptyManifest).routes
    .filter((r) => r.kind === "page" || r.kind === "api")
    .map((r) => {
      const resolved = resolveRouteMode(r.urlPattern, options.renderConfig);
      return {
        pattern: r.urlPattern,
        mode: resolved.mode,
        source: resolved.source,
      };
    });

  return {
    buildDir: options.outDir,
    artifacts,
    manifest: manifest ?? emptyManifest,
    routeModes,
    totalSizeBytes: artifacts.reduce((sum, a) => sum + a.sizeBytes, 0),
    inspectedAt: new Date().toISOString(),
  };
}

export function printInspectReport(report: ForgeInspectReport): void {
  const sep = "─".repeat(58);
  console.log(`
        \n Rakta.js Forge - Build Inspection
    `);
  console.log(`
        ${sep}
    `);
  console.log(`
        Directory:  ${report.buildDir}
    `);
  console.log(`
        Inspected:  ${report.inspectedAt}
    `);
  console.log(`
        Total size: ${formatBytes(report.totalSizeBytes)}\n
    `);

  if (report.artifacts.length > 0) {
    console.log("Artifacts:");
    for (const artifact of report.artifacts) {
      const rel = artifact.outputPath.replace(report.buildDir, ".").replace(/\\/g, "/");
      console.log(`
        [${artifact.kind.padEnd(10)}]  
        ${rel.padEnd(38)}  
        ${formatBytes(artifact.sizeBytes)}`
      );
    }
    console.log("");
  }

  if (report.routeModes.length > 0) {
    console.log("Route Render Modes:");
    for (const rm of report.routeModes) {
      const src = rm.source === "route-override" ? "(override)" : "(default) ";
      console.log(`
        ${rm.mode.toUpperCase().padEnd(8)}  
        ${rm.pattern.padEnd(36)}  ${src}`
      );
    }
    console.log("");
  }

  console.log(`${sep}\n`);
}