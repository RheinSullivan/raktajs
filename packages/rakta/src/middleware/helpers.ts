import type {
	RaktaMiddleware,
	RaktaMiddlewareContext,
	RaktaMiddlewareResult,
} from "./types";

export function defineMiddleware(middleware: RaktaMiddleware): RaktaMiddleware {
	return middleware;
}

export function before(
	handler: (
		context: RaktaMiddlewareContext,
	) => RaktaMiddlewareResult | Promise<RaktaMiddlewareResult>,
): RaktaMiddleware {
	return async (context, next) => {
		const result = await handler(context);

		if (result !== undefined) {
			return result;
		}

		return next();
	};
}

export function after(
	handler: (
		context: RaktaMiddlewareContext,
		response: Response,
	) => Response | Promise<Response> | undefined | Promise<undefined>,
): RaktaMiddleware {
	return async (context, next) => {
		const response = await next();
		const handledResponse = await handler(context, response);
		return handledResponse ?? response;
	};
}

export function redirect(
	location: string | URL,
	status: number = 307,
): Response {
	return Response.redirect(location, status);
}

export function rewrite(
	pathname: string,
	headers?: HeadersInit,
): {
	readonly kind: "rewrite";
	readonly pathname: string;
	readonly headers?: HeadersInit;
} {
	if (headers === undefined) {
		return { kind: "rewrite", pathname };
	}

	return { kind: "rewrite", pathname, headers };
}

export function abort(
	status: number = 403,
	body: BodyInit = "Request aborted by Rakta middleware.",
	headers?: HeadersInit,
): Response {
	if (headers === undefined) {
		return new Response(body, { status });
	}

	return new Response(body, { status, headers });
}
