import type { RenderConfig } from "../render/types";

export interface CssConfig {
	readonly framework: "tailwind" | "bootstrap" | "sass" | "none";

	readonly configPath?: string;
}

export interface SeoConfig {
	readonly defaultTitle?: string;
	readonly titleTemplate?: string;
	readonly defaultDescription?: string;
	readonly siteUrl?: string;
	readonly defaultOpenGraphImage?: string;
}

export interface CorsConfig {
	readonly origin: string | string[];
	readonly methods?: string[];
	readonly headers?: string[];
	readonly credentials?: boolean;
	readonly maxAge?: number;
}

export interface ServerConfig {
	readonly port?: number;
	readonly hostname?: string;
	readonly cors?: boolean | CorsConfig;
	readonly compression?: boolean;
	readonly trustProxy?: boolean;
}

export interface BuildConfig {
	readonly entryPoint?: string;
	readonly outDir?: string;
	readonly sourcemap?: boolean;
	readonly minify?: boolean;
	readonly splitting?: boolean;
	readonly target?: "browser" | "bun" | "node";
}

export interface AutoImportConfig {
	readonly enabled: boolean;
	readonly directories: string[];
	readonly outputDirectory: string;
	readonly extensions?: string[];
	readonly dts?: boolean;
}

export interface RpcConfig {
	readonly enabled: boolean;
	readonly basePath?: string;
	readonly maxBodySize?: number;
}

export interface RaktaConfig {
	readonly appName?: string;
	readonly appDir?: string;
	readonly publicDir?: string;
	readonly port?: number;
	readonly css?: CssConfig;
	readonly seo?: SeoConfig;
	readonly server?: ServerConfig;
	readonly build?: BuildConfig;
	readonly autoImport?: AutoImportConfig;
	readonly rpc?: RpcConfig;
	readonly render?: RenderConfig;
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
	},
	server: {
		port: 3000,
		hostname: "0.0.0.0",
		cors: true,
		compression: false,
		trustProxy: false,
	},
	build: {
		entryPoint: "entry.client.tsx",
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
