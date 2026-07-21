import type {
	RaktaMiddleware,
	RaktaMiddlewareContext,
	RaktaMiddlewareStack,
	RaktaMiddlewareStackOptions,
} from "./types";

function createContext(
	request: Request,
	options: RaktaMiddlewareStackOptions,
): RaktaMiddlewareContext {
	const url = new URL(request.url);

	return {
		request,
		url,
		pathname: url.pathname,
		method: request.method.toUpperCase(),
		params: options.params ?? {},
		scope: options.scope ?? "global",
		state: options.state ?? new Map<string, unknown>(),
	};
}

function buildRewriteResponse(
	originalRequest: Request,
	pathname: string,
	headers?: HeadersInit,
): Response {
	const rewrittenUrl = new URL(originalRequest.url);
	rewrittenUrl.pathname = pathname;

	const responseHeaders = new Headers(headers);
	responseHeaders.set("x-rakta-rewrite", rewrittenUrl.toString());

	return new Response(undefined, {
		status: 204,
		headers: responseHeaders,
	});
}

export function createMiddlewareStack(
	middlewares: readonly RaktaMiddleware[] = [],
): RaktaMiddlewareStack {
	return {
		middlewares: [...middlewares],

		async handle(request, terminal, options = {}) {
			const context = createContext(request, options);
			let activeIndex = -1;

			const dispatch = async (index: number): Promise<Response> => {
				if (index <= activeIndex) {
					throw new Error("Rakta middleware next() was called more than once.");
				}

				activeIndex = index;

				const middleware = middlewares[index];

				if (middleware === undefined) {
					return terminal(context);
				}

				const result = await middleware(context, () => dispatch(index + 1));

				if (result instanceof Response) {
					return result;
				}

				if (result?.kind === "rewrite") {
					return buildRewriteResponse(request, result.pathname, result.headers);
				}

				return dispatch(index + 1);
			};

			return dispatch(0);
		},
	};
}
