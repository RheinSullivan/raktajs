import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import type { RaktaConfig } from "./define-config.js";
import { defaultConfig } from "./define-config.js";

const CONFIG_FILENAMES: ReadonlyArray<string> = [
  "rakta.config.ts",
  "rakta.config.js",
  "rakta.config.mts",
  "rakta.config.mjs",
];

export async function loadConfig(
  cwd: string = process.cwd()
): Promise<Required<RaktaConfig>> {
  const resolvedCwd = resolve(cwd);

  for (const filename of CONFIG_FILENAMES) {
    const configPath = join(resolvedCwd, filename);
    if (!existsSync(configPath)) continue;

    const module = await import(configPath) as { default?: RaktaConfig };
    const userConfig: RaktaConfig = module.default ?? {};
    return mergeConfig(defaultConfig, userConfig);
  }

  return defaultConfig;
}

export function mergeConfig(
  base: Required<RaktaConfig>,
  override: RaktaConfig
): Required<RaktaConfig> {
  return {
    appName: override.appName ?? base.appName,
    appDir: override.appDir ?? base.appDir,
    publicDir: override.publicDir ?? base.publicDir,
    port: override.port ?? base.port,
    css: override.css ? { ...base.css, ...override.css } : base.css,
    seo: override.seo ? { ...base.seo, ...override.seo } : base.seo,
    server: override.server ? { ...base.server, ...override.server } : base.server,
    build: override.build ? { ...base.build, ...override.build } : base.build,
    autoImport: override.autoImport
      ? { ...base.autoImport, ...override.autoImport }
      : base.autoImport,
    rpc: override.rpc ? { ...base.rpc, ...override.rpc } : base.rpc,
    render: override.render
      ? {
          defaultMode: override.render.defaultMode ?? base.render.defaultMode,
          routes: { ...base.render.routes, ...override.render.routes },
        }
      : base.render,
  };
}