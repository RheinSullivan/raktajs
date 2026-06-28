import { isAbsolute, join } from "node:path";
import { loadConfig } from "../config/load-config";
import { buildProject } from "../forge/build";

function resolveProjectPath(
  cwd: string,
  pathValue: string
): string {
  if (isAbsolute(pathValue)) {
    return pathValue;
  }

  return join(cwd, pathValue);
}

export async function buildCommand(
  cwd: string = process.cwd()
): Promise<void> {
  const config = await loadConfig(cwd);

  const appDirectory = config.appDir ?? "app";
  const publicDirectory = config.publicDir ?? "public";
  const outputDirectory = config.build.outDir ?? "dist";
  const entryFile = config.build.entryPoint ?? "entry.client.tsx";

  const entryPoint = resolveProjectPath(
    join(cwd, appDirectory),
    entryFile
  );

  const outDir = resolveProjectPath(
    cwd,
    outputDirectory
  );

  console.log("\n  Building Rakta.js application...\n");

  const result = await buildProject({
    entryPoint,
    outDir,
    appDir: join(cwd, appDirectory),
    publicDir: join(cwd, publicDirectory),
    appName: config.appName,
    sourcemap: config.build.sourcemap ?? false,
    minify: config.build.minify ?? true,
    splitting: config.build.splitting ?? false,
    target: config.build.target ?? "browser",
    renderConfig: config.render,
  });

  if (!result.success) {
    console.error("  Build failed:");

    for (const error of result.errors) {
      console.error(`    ${error}`);
    }

    process.exit(1);
  }

  console.log(`  Build complete in ${result.buildMs}ms`);
  console.log(`  Output: ${outDir}`);
  console.log(`  Artifacts: ${result.artifacts.length}\n`);
}
