// RaktaAPI - RESTful API helpers
// Lightweight, zero-dependency utilities for building REST endpoints.

export interface ParsedRouteParams {
	readonly [key: string]: string;
}

export interface PaginatedResponseBody<TItem> {
	readonly items: readonly TItem[];
	readonly total: number;
	readonly page: number;
	readonly pageSize: number;
	readonly totalPages: number;
	readonly hasNext: boolean;
	readonly hasPrev: boolean;
}

/**
 * Parse named route parameters from a URL pattern.
 *
 * @example
 * parseRouteParams("/users/:userId/posts/:postId", "/users/42/posts/7")
 * // → { userId: "42", postId: "7" }
 */
export function parseRouteParams(
	pattern: string,
	pathname: string,
): ParsedRouteParams {
	const patternSegments = pattern.split("/");
	const pathSegments = pathname.split("/");

	if (patternSegments.length !== pathSegments.length) {
		return {};
	}

	const params: Record<string, string> = {};

	for (
		let segmentIndex = 0;
		segmentIndex < patternSegments.length;
		segmentIndex++
	) {
		const patternSegment = patternSegments[segmentIndex];
		const pathSegment = pathSegments[segmentIndex];

		if (patternSegment === undefined || pathSegment === undefined) {
			break;
		}

		if (patternSegment.startsWith(":")) {
			params[patternSegment.slice(1)] = decodeURIComponent(pathSegment);
		}
	}

	return params;
}

/**
 * Parse query string into a typed record.
 * Multi-value keys become arrays.
 */
export function parseQueryString(
	search: string,
): Record<string, string | string[]> {
	const params = new URLSearchParams(
		search.startsWith("?") ? search.slice(1) : search,
	);
	const result: Record<string, string | string[]> = {};

	for (const key of params.keys()) {
		const values = params.getAll(key);
		result[key] = values.length === 1 ? (values[0] ?? "") : values;
	}

	return result;
}

/**
 * Return a 200 JSON response.
 */
export function jsonSuccess(data: unknown, status = 200): Response {
	return Response.json({ ok: true, data }, { status });
}

/**
 * Return an error JSON response.
 */
export function jsonError(
	message: string,
	status = 400,
	code = "ERROR",
): Response {
	return Response.json({ ok: false, error: message, code }, { status });
}

/**
 * Return a paginated collection response.
 */
export function paginatedResponse<TItem>(
	items: readonly TItem[],
	total: number,
	page: number,
	pageSize: number,
): Response {
	const totalPages = Math.ceil(total / pageSize);
	const body: PaginatedResponseBody<TItem> = {
		items,
		total,
		page,
		pageSize,
		totalPages,
		hasNext: page < totalPages,
		hasPrev: page > 1,
	};

	return Response.json({ ok: true, data: body });
}

/** 404 Not Found response. */
export function NotFoundResponse(message = "Not found."): Response {
	return jsonError(message, 404, "NOT_FOUND");
}

/** 400 Bad Request response. */
export function BadRequestResponse(message = "Bad request."): Response {
	return jsonError(message, 400, "BAD_REQUEST");
}

/** 401 Unauthorized response. */
export function UnauthorizedResponse(message = "Unauthorized."): Response {
	return jsonError(message, 401, "UNAUTHORIZED");
}

/** 403 Forbidden response. */
export function ForbiddenResponse(message = "Forbidden."): Response {
	return jsonError(message, 403, "FORBIDDEN");
}

/** 422 Unprocessable Entity response. */
export function ValidationErrorResponse(
	errors: readonly { field: string; message: string }[],
): Response {
	return Response.json(
		{
			ok: false,
			error: "Validation failed.",
			code: "VALIDATION_ERROR",
			errors,
		},
		{ status: 422 },
	);
}

/** 500 Internal Server Error response. */
export function InternalErrorResponse(
	message = "Internal server error.",
): Response {
	return jsonError(message, 500, "INTERNAL_ERROR");
}

/**
 * Extract pagination parameters from a Request.
 */
export function parsePagination(
	request: Request,
	defaults: { page?: number; pageSize?: number } = {},
): { page: number; pageSize: number; offset: number } {
	const url = new URL(request.url);
	const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
	const pageSize = Math.max(
		1,
		Math.min(
			100,
			parseInt(
				url.searchParams.get("pageSize") ??
					url.searchParams.get("limit") ??
					String(defaults.pageSize ?? 20),
				10,
			),
		),
	);

	return { page, pageSize, offset: (page - 1) * pageSize };
}
