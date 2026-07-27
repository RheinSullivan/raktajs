import {
	HttpNetworkError,
	HttpResponseError,
	HttpTimeoutError,
} from "./errors";
import type {
	HttpClientConfig,
	HttpMethod,
	HttpRequestBody,
	HttpRequestConfig,
	RequestInterceptorFn,
	ResponseInterceptorFn,
} from "./types";

type HttpJsonResponse = HttpRequestBody | string;

function buildUrl(
	baseUrl: string,
	path: string,
	params?: HttpRequestConfig["params"],
): string {
	const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
	const fullUrl = path.startsWith("http") ? path : `${base}${path}`;
	const parsedUrl = new URL(fullUrl);

	if (params) {
		for (const [key, value] of Object.entries(params)) {
			parsedUrl.searchParams.set(key, String(value));
		}
	}

	return parsedUrl.toString();
}

function canSendBody(method: HttpMethod): boolean {
	return method !== "GET" && method !== "HEAD";
}

function createRequestInit(
	method: HttpMethod,
	headers: Record<string, string>,
	body?: HttpRequestBody,
	keepalive?: boolean,
): RequestInit {
	const requestInit: RequestInit = {
		method,
		headers,
		// keepalive: reuses the underlying TCP connection for sequential requests
		// to the same host. This eliminates TCP handshake overhead on every call,
		// which is the most common cause of per-request latency in SPA apps that
		// make many API calls to a single backend.
		keepalive: keepalive ?? true,
	};

	if (body !== undefined && canSendBody(method)) {
		requestInit.body = JSON.stringify(body);
	}

	return requestInit;
}

async function withRetry<T>(
	operation: () => Promise<T>,
	retries: number,
	delayMs: number,
): Promise<T> {
	let lastError: unknown;

	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			return await operation();
		} catch (caughtError) {
			lastError = caughtError;

			// Don't retry on timeout or HTTP errors - only network errors.
			if (
				caughtError instanceof HttpTimeoutError ||
				caughtError instanceof HttpResponseError
			) {
				throw caughtError;
			}

			if (attempt < retries) {
				// Exponential back-off: 100ms, 200ms, 400ms…
				await new Promise<void>((resolve) =>
					setTimeout(resolve, delayMs * 2 ** attempt),
				);
			}
		}
	}

	throw lastError;
}

/**
 * PanturaFetch - Rakta.js built-in type-safe HTTP client.
 *
 * Named after the Pantura (Pantai Utara) highway: fast, reliable, coastal.
 *
 * Performance improvements over v1.0.3:
 * - Default timeout reduced from 30 000 ms → 10 000 ms.
 * - keepalive: true by default - reuses TCP connections, eliminates handshake
 *   overhead on sequential requests to the same host.
 * - Retry support for transient network errors (configurable, off by default).
 * - Interceptor chain no longer wraps every call in Promise.resolve().
 *
 * Usage:
 *   const http = createRaktaHttp({ baseUrl: "http://localhost:4000" });
 *   const users = await http.get<User[]>("/users");
 */
export class RaktaHttpClient {
	private readonly clientConfig: Required<Omit<HttpClientConfig, "headers">> & {
		readonly headers: Record<string, string>;
	};

	private readonly requestInterceptors: RequestInterceptorFn[] = [];
	private readonly responseInterceptors: ResponseInterceptorFn<HttpJsonResponse>[] =
		[];

	constructor(config: HttpClientConfig) {
		this.clientConfig = {
			baseUrl: config.baseUrl,
			headers: config.headers ?? {
				"Content-Type": "application/json",
			},
			// 10 s is a more sensible default than 30 s for an interactive SPA.
			// Users who need longer timeouts can override per-request or globally.
			timeout: config.timeout ?? 10_000,
		};
	}

	addRequestInterceptor(interceptorFn: RequestInterceptorFn): this {
		this.requestInterceptors.push(interceptorFn);
		return this;
	}

	addResponseInterceptor<TData>(
		interceptorFn: ResponseInterceptorFn<TData>,
	): this {
		const wrapped: ResponseInterceptorFn<HttpJsonResponse> = (
			response: Response,
			data: HttpJsonResponse,
		) => interceptorFn(response, data as TData) as Promise<HttpJsonResponse>;

		this.responseInterceptors.push(wrapped);
		return this;
	}

	private async execute<TData>(
		method: HttpMethod,
		path: string,
		body?: HttpRequestBody,
		requestConfig?: HttpRequestConfig,
	): Promise<TData> {
		let resolvedUrl = buildUrl(
			this.clientConfig.baseUrl,
			path,
			requestConfig?.params,
		);

		let requestInit = createRequestInit(
			method,
			{
				...this.clientConfig.headers,
				...(requestConfig?.headers ?? {}),
			},
			body,
		);

		// Run request interceptors (most apps have zero, so this loop is cheap).
		for (const interceptorFn of this.requestInterceptors) {
			[resolvedUrl, requestInit] = await interceptorFn(
				resolvedUrl,
				requestInit,
			);
		}

		const timeoutMs = requestConfig?.timeout ?? this.clientConfig.timeout;
		const retries = requestConfig?.retries ?? 0;
		const retryDelay = requestConfig?.retryDelay ?? 100;

		const doFetch = async (): Promise<TData> => {
			const abortController = new AbortController();
			const timeoutHandle = setTimeout(
				() => abortController.abort(),
				timeoutMs,
			);

			const finalInit = { ...requestInit, signal: abortController.signal };

			let response: Response;

			try {
				response = await fetch(resolvedUrl, finalInit);
			} catch (caughtError) {
				clearTimeout(timeoutHandle);

				if (
					caughtError instanceof DOMException &&
					caughtError.name === "AbortError"
				) {
					throw new HttpTimeoutError(resolvedUrl, timeoutMs);
				}

				throw new HttpNetworkError(
					resolvedUrl,
					caughtError instanceof Error
						? caughtError
						: new Error(String(caughtError)),
				);
			}

			clearTimeout(timeoutHandle);

			if (!response.ok) {
				throw new HttpResponseError(response);
			}

			const contentType = response.headers.get("content-type") ?? "";
			let responseData: HttpJsonResponse;

			if (contentType.includes("application/json")) {
				responseData = (await response.json()) as HttpJsonResponse;
			} else {
				responseData = await response.text();
			}

			// Run response interceptors.
			for (const interceptorFn of this.responseInterceptors) {
				responseData = await interceptorFn(response, responseData);
			}

			return responseData as TData;
		};

		return withRetry(doFetch, retries, retryDelay);
	}

	get<TData>(path: string, config?: HttpRequestConfig): Promise<TData> {
		return this.execute<TData>("GET", path, undefined, config);
	}

	post<TData>(
		path: string,
		body?: HttpRequestBody,
		config?: HttpRequestConfig,
	): Promise<TData> {
		return this.execute<TData>("POST", path, body, config);
	}

	put<TData>(
		path: string,
		body?: HttpRequestBody,
		config?: HttpRequestConfig,
	): Promise<TData> {
		return this.execute<TData>("PUT", path, body, config);
	}

	patch<TData>(
		path: string,
		body?: HttpRequestBody,
		config?: HttpRequestConfig,
	): Promise<TData> {
		return this.execute<TData>("PATCH", path, body, config);
	}

	delete<TData>(path: string, config?: HttpRequestConfig): Promise<TData> {
		return this.execute<TData>("DELETE", path, undefined, config);
	}
}

/**
 * Creates a PanturaFetch HTTP client instance.
 *
 * @example
 * const http = createRaktaHttp({ baseUrl: "http://localhost:4000" });
 * const users = await http.get<User[]>("/users");
 *
 * // With retry on transient network failures:
 * const data = await http.get<Report>("/report", { retries: 2 });
 */
export function createRaktaHttp(config: HttpClientConfig): RaktaHttpClient {
	return new RaktaHttpClient(config);
}
