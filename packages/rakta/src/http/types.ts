export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

export type HttpQueryValue = string | number | boolean;

export type HttpQueryParams = Record<string, HttpQueryValue>;

export type HttpJsonPrimitive = string | number | boolean;

export type HttpJsonValue = HttpJsonPrimitive | HttpJsonObject | HttpJsonArray;

export interface HttpJsonObject {
	readonly [key: string]: HttpJsonValue;
}

export interface HttpJsonArray extends ReadonlyArray<HttpJsonValue> {}

export type HttpRequestBody = HttpJsonObject | HttpJsonArray;

export interface HttpClientConfig {
	readonly baseUrl: string;
	readonly headers?: Record<string, string>;
	readonly timeout?: number;
}

export interface HttpRequestConfig {
	readonly headers?: Record<string, string>;
	readonly params?: HttpQueryParams;
	readonly timeout?: number;
	/** Number of retry attempts on transient network errors (default: 0). */
	readonly retries?: number;
	/** Base delay in ms between retries - doubled on each attempt (default: 100). */
	readonly retryDelay?: number;
}

export type RequestInterceptorFn = (
	url: string,
	init: RequestInit,
) => [string, RequestInit] | Promise<[string, RequestInit]>;

export type ResponseInterceptorFn<TData> = (
	response: Response,
	data: TData,
) => TData | Promise<TData>;
