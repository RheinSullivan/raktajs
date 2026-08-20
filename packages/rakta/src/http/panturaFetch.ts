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
	};

	if (keepalive !== undefined) {
		requestInit.keepalive = keepalive;
	}

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

			// Don't retry on timeout, caller cancellation, or HTTP response errors - only transient network errors.
			const isAbortOrTimeout =
				caughtError instanceof HttpTimeoutError ||
				(caughtError instanceof Error && caughtError.name === "AbortError");

			if (isAbortOrTimeout || caughtError instanceof HttpResponseError) {
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
 * Usage:
 *   const http = createRaktaHttp({ baseUrl: "http://localhost:4000" });
 *   const users = await http.get<User[]>("/users");
 */
export class RaktaHttpClient {
	private readonly clientConfig: {
		readonly baseUrl: string;
		readonly headers: Record<string, string>;
		readonly timeout: number;
		readonly signal?: AbortSignal;
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
			// 10 s is a sensible default for an interactive SPA.
			timeout: config.timeout ?? 10_000,
			...(config.signal ? { signal: config.signal } : {}),
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
			requestConfig?.keepalive,
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
		const callerSignal = requestConfig?.signal ?? this.clientConfig.signal;

		const doFetch = async (): Promise<TData> => {
			if (callerSignal?.aborted) {
				if (callerSignal.reason instanceof Error) {
					throw callerSignal.reason;
				}
				const err = new Error("Request aborted by caller");
				err.name = "AbortError";
				throw err;
			}

			const timeoutController = new AbortController();
			let timedOut = false;

			const timeoutHandle = setTimeout(() => {
				timedOut = true;
				timeoutController.abort();
			}, timeoutMs);

			let abortListener: (() => void) | undefined;
			let combinedSignal: AbortSignal = timeoutController.signal;

			if (callerSignal) {
				if (typeof AbortSignal.any === "function") {
					combinedSignal = AbortSignal.any([
						callerSignal,
						timeoutController.signal,
					]);
				} else {
					abortListener = () => timeoutController.abort();
					callerSignal.addEventListener("abort", abortListener, { once: true });
				}
			}

			const finalInit = { ...requestInit, signal: combinedSignal };

			let response: Response;

			try {
				response = await fetch(resolvedUrl, finalInit);
			} catch (caughtError) {
				clearTimeout(timeoutHandle);
				if (callerSignal && abortListener) {
					callerSignal.removeEventListener("abort", abortListener);
				}

				const isAbortOrTimeout =
					timedOut ||
					(caughtError instanceof Error && caughtError.name === "AbortError") ||
					(typeof DOMException !== "undefined" &&
						caughtError instanceof DOMException &&
						caughtError.name === "AbortError") ||
					callerSignal?.aborted ||
					timeoutController.signal.aborted;

				if (isAbortOrTimeout) {
					if (timedOut) {
						throw new HttpTimeoutError(resolvedUrl, timeoutMs);
					}
					if (callerSignal?.aborted) {
						if (callerSignal.reason instanceof Error) {
							throw callerSignal.reason;
						}
						const err = new Error("Request aborted by caller");
						err.name = "AbortError";
						throw err;
					}
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
			if (callerSignal && abortListener) {
				callerSignal.removeEventListener("abort", abortListener);
			}

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
