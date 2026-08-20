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
			// Track total time spent in all middleware layers.
			// This is exposed via X-Rakta-Middleware-Ms response header in dev mode
			// so the terminal reporter can surface it as frameworkMs.
			let middlewareTotalMs = 0;

			const dispatch = async (index: number): Promise<Response> => {
				if (index <= activeIndex) {
					throw new Error("Rakta middleware next() was called more than once.");
				}

				activeIndex = index;

				const middleware = middlewares[index];

				if (middleware === undefined) {
					return terminal(context);
				}

				let nextResponse: Response | undefined;
				const mwStart = Date.now();

				const nextFn = async (): Promise<Response> => {
					const res = await dispatch(index + 1);
					nextResponse = res;
					return res;
				};

				const result = await middleware(context, nextFn);
				middlewareTotalMs += Date.now() - mwStart;

				if (result instanceof Response) {
					return result;
				}

				if (result?.kind === "rewrite") {
					return buildRewriteResponse(request, result.pathname, result.headers);
				}

				if (nextResponse !== undefined) {
					return nextResponse;
				}

				return dispatch(index + 1);
			};

			const response = await dispatch(0);

			// Attach timing header (development diagnostic, stripped in production
			// by the tide adapter's response pipeline if desired).
			if (middlewareTotalMs > 0) {
				const headers = new Headers(response.headers);
				headers.set("X-Rakta-Middleware-Ms", String(middlewareTotalMs));
				return new Response(response.body, {
					status: response.status,
					statusText: response.statusText,
					headers,
				});
			}

			return response;
		},
	};
}
