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
): RequestInit {
	const requestInit: RequestInit = {
		method,
		headers,
	};

	if (body !== undefined && canSendBody(method)) {
		requestInit.body = JSON.stringify(body);
	}

	return requestInit;
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
			timeout: config.timeout ?? 30_000,
		};
	}

	addRequestInterceptor(interceptorFn: RequestInterceptorFn): this {
		this.requestInterceptors.push(interceptorFn);
		return this;
	}

	addResponseInterceptor<TData>(
		interceptorFn: ResponseInterceptorFn<TData>,
	): this {
		const wrappedInterceptor: ResponseInterceptorFn<HttpJsonResponse> = async (
			response: Response,
			data: HttpJsonResponse,
		): Promise<HttpJsonResponse> => {
			return (await Promise.resolve(
				interceptorFn(response, data as TData),
			)) as HttpJsonResponse;
		};

		this.responseInterceptors.push(wrappedInterceptor);
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

		for (const interceptorFn of this.requestInterceptors) {
			[resolvedUrl, requestInit] = await Promise.resolve(
				interceptorFn(resolvedUrl, requestInit),
			);
		}

		const timeoutMs = requestConfig?.timeout ?? this.clientConfig.timeout;
		const abortController = new AbortController();
		const timeoutHandle = setTimeout(() => abortController.abort(), timeoutMs);

		requestInit = { ...requestInit, signal: abortController.signal };

		let response: Response;

		try {
			response = await fetch(resolvedUrl, requestInit);
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

		let interceptedData: HttpJsonResponse = responseData;

		for (const interceptorFn of this.responseInterceptors) {
			interceptedData = await Promise.resolve(
				interceptorFn(response, interceptedData),
			);
		}

		return interceptedData as TData;
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
 * Usage:
 *   const http = createRaktaHttp({ baseUrl: "http://localhost:4000" });
 *   const users = await http.get<User[]>("/users");
 */
export function createRaktaHttp(config: HttpClientConfig): RaktaHttpClient {
	return new RaktaHttpClient(config);
}
