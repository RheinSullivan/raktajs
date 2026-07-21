export type RaktaMiddlewareScope =
	| "global"
	| "route"
	| "nested"
	| "layout"
	| "api"
	| "edge";

export interface RaktaMiddlewareContext {
	readonly request: Request;
	readonly url: URL;
	readonly pathname: string;
	readonly method: string;
	readonly params: Readonly<Record<string, string>>;
	readonly scope: RaktaMiddlewareScope;
	readonly state: Map<string, unknown>;
}

export interface RaktaRewriteResult {
	readonly kind: "rewrite";
	readonly pathname: string;
	readonly headers?: HeadersInit;
}

export type RaktaMiddlewareResult = Response | RaktaRewriteResult | undefined;

export type RaktaMiddlewareNext = () => Promise<Response>;

export type RaktaMiddleware = (
	context: RaktaMiddlewareContext,
	next: RaktaMiddlewareNext,
) => RaktaMiddlewareResult | Promise<RaktaMiddlewareResult>;

export interface RaktaMiddlewareStackOptions {
	readonly scope?: RaktaMiddlewareScope;
	readonly params?: Readonly<Record<string, string>>;
	readonly state?: Map<string, unknown>;
}

export interface RaktaMiddlewareStack {
	readonly middlewares: readonly RaktaMiddleware[];
	handle(
		request: Request,
		terminal: (context: RaktaMiddlewareContext) => Response | Promise<Response>,
		options?: RaktaMiddlewareStackOptions,
	): Promise<Response>;
}
