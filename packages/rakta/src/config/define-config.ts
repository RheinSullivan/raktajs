import type { RenderConfig } from "../render/types.js";

export interface CssConfig {
  framework: "tailwind" | "bootstrap" | "sass" | "none";
  configPath?: string;
}

export interface SeoConfig {
  defaultTitle?: string;
  titleTemplate?: string;
  defaultDescription?: string;
  siteUrl?: string;
  defaultOpenGraphImage?: string;
}

export interface CorsConfig {
  origin: string | string[];
  methods?: string[];
  headers?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export interface ServerConfig {
  port?: number;
  hostname?: string;
  cors?: boolean | CorsConfig;
  compression?: boolean;
  trustProxy?: boolean;
}

export interface BuildConfig {
  outDir?: string;
  sourcemap?: boolean;
  minify?: boolean;
  splitting?: boolean;
  target?: "browser" | "bun" | "node";
}

export interface AutoImportConfig {
  enabled: boolean;
  directories: string[];
  outputDirectory: string;
  extensions?: string[];
  dts?: boolean;
}

export interface RpcConfig {
  enabled: boolean;
  basePath?: string;
  maxBodySize?: number;
}

export interface RaktaConfig {
  appName?: string;
  appDir?: string;
  publicDir?: string;
  port?: number;
  css?: CssConfig;
  seo?: SeoConfig;
  server?: ServerConfig;
  build?: BuildConfig;
  autoImport?: AutoImportConfig;
  rpc?: RpcConfig;
  render?: RenderConfig;
}

export function defineConfig(config: RaktaConfig): RaktaConfig {
  return config;
}

/** Alias matching the config example in the docs. */
export const defineRaktaConfig = defineConfig;

export const defaultConfig: Required<RaktaConfig> = {
  appName: "Rakta.js App",
  appDir: "app",
  publicDir: "public",
  port: 3000,
  css: {
    framework: "tailwind",
  },
  seo: {
    defaultTitle: "Rakta.js App",
    titleTemplate: "%s | Rakta.js App",
    defaultDescription: "Built with Rakta.js",
    siteUrl: "http://localhost:3000",
    // defaultOpenGraphImage: undefined,
  },
  server: {
    port: 3000,
    hostname: "0.0.0.0",
    cors: true,
    compression: false,
    trustProxy: false,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: true,
    splitting: false,
    target: "browser",
  },
  autoImport: {
    enabled: false,
    directories: ["components", "lib", "stores", "schemas"],
    outputDirectory: ".rakta",
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    dts: true,
  },
  rpc: {
    enabled: false,
    basePath: "/rpc",
    maxBodySize: 1_048_576,
  },
  render: {
    defaultMode: "csr",
    routes: {},
  },
};