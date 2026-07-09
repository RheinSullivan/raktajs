import type { RenderMode } from "rakta/render";
import type { SeoConfig } from "../config/defineConfig";

export type TideAdapterKind = "bun" | "node" | "edge";

export interface TideRuntimeContext {
	readonly request: Request;
	readonly url: URL;
	readonly pathname: string;
	readonly method: string;
	readonly params: Readonly<Record<string, string>>;
	readonly searchParams: Readonly<Record<string, string>>;
	readonly requestHeaders: Readonly<Record<string, string>>;
	readonly resolvedMode: RenderMode;
	readonly timestampMs: number;
}

export interface TideResponseBlueprint {
	readonly body: string;
	readonly status: number;
	readonly headers: Record<string, string>;
	readonly mode: RenderMode;
}

export interface TideAdapterConfig {
	readonly kind: TideAdapterKind;
	readonly port: number;
	readonly host: string;
	readonly appName: string;
	readonly seo: SeoConfig;
	readonly appDir: string;
	readonly publicDir: string;
	readonly outDir: string;
}

export interface TideRenderStrategyResult {
	readonly handled: boolean;
	readonly response: Response;
}

export type TideRender = (
	context: TideRuntimeContext,
) => Promise<TideResponseBlueprint | Response>;

export interface TideAdapter {
	readonly kind: TideAdapterKind;
	readonly handle: (request: Request) => Promise<Response>;
	readonly start: () => Promise<void>;
	readonly stop: () => void;
}
