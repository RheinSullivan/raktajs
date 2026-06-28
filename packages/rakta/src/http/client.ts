import type {
    HttpClientConfig,
    HttpRequestBody,
    HttpRequestConfig,
    HttpMethod,
    RequestInterceptorFn,
    ResponseInterceptorFn,
} from "./types.js";
import {
    HttpResponseError,
    HttpTimeoutError,
    HttpNetworkError,
} from "./errors";

function buildUrl(
    baseUrl: string,
    path: string,
    params?: HttpRequestConfig["params"]
): string {
    const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const fullUrl = path.startsWith("http") ? path : `${base}${path}`;
    const url = new URL(fullUrl);

    if (params) {
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, String(value));
        }
    }

    return url.toString();
};

function canSendBody(
    method: HttpMethod,
    body: HttpRequestBody
): boolean {
    return method !== "GET" && method !== "HEAD" && Object.keys(body).length >= 0;
};

function createRequestInit(
    method: HttpMethod,
    headers: Record<string, string>,
    body?: HttpRequestBody
): RequestInit {
    const init: RequestInit = {
        method,
        headers,
    };

    if (body && canSendBody(method, body)) {
        init.body = JSON.stringify(body);
    }

    return init;
};

export class RaktaHttpClient {
    private readonly config: Required<Omit<HttpClientConfig, "headers">> & {
        headers: Record<string, string>;
    };

    private readonly requestInterceptors: RequestInterceptorFn[] = [];
    private readonly responseInterceptors: ResponseInterceptorFn<HttpJsonResponse>[] = [];

    constructor(config: HttpClientConfig) {
        this.config = {
            baseUrl: config.baseUrl,
            headers: config.headers ?? {
                "Content-Type": "application/json",
            },
            timeout: config.timeout ?? 30_000,
        };
    };

    addRequestInterceptor(fn: RequestInterceptorFn): this {
        this.requestInterceptors.push(fn);
        return this;
    };

    addResponseInterceptor<TData>(fn: ResponseInterceptorFn<TData>): this {
        const interceptor: ResponseInterceptorFn<HttpJsonResponse> = async (
            response: Response,
            data: HttpJsonResponse
        ): Promise<HttpJsonResponse> => {
            return await Promise.resolve(
                fn(response, data as TData)
            ) as HttpJsonResponse;
        };

        this.responseInterceptors.push(interceptor);

        return this;
    };

    private async execute<TData>(
        method: HttpMethod,
        path: string,
        body?: HttpRequestBody,
        requestConfig?: HttpRequestConfig
    ): Promise<TData> {
        let url = buildUrl(
            this.config.baseUrl,
            path,
            requestConfig?.params
        );

        let init = createRequestInit(
            method,
            {
                ...this.config.headers,
                ...(requestConfig?.headers ?? {}),
            },
            body
        );

        // Run request interceptors
        for (const interceptor of this.requestInterceptors) {
            [url, init] = await Promise.resolve(interceptor(url, init));
        }

        const timeoutMs = requestConfig?.timeout ?? this.config.timeout;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        init.signal = controller.signal;

        let response: Response;

        try {
            response = await fetch(url, init);
        } catch (error) {
            clearTimeout(timer);

            if (error instanceof DOMException && error.name === "AbortError") {
                throw new HttpTimeoutError(url, timeoutMs);
            }

            throw new HttpNetworkError(
                url,
                error instanceof Error ? error : new Error(String(error))
            );
        }

        clearTimeout(timer);

        if (!response.ok) {
            throw new HttpResponseError(response);
        }

        const contentType = response.headers.get("content-type") ?? "";
        let data: HttpJsonResponse;

        if (contentType.includes("application/json")) {
            data = await response.json() as HttpJsonResponse;
        } else {
            data = await response.text();
        }

        // Run response interceptors
        let intercepted: HttpJsonResponse = data;

        for (const interceptor of this.responseInterceptors) {
            intercepted = await Promise.resolve(
                interceptor(response, intercepted)
            );
        }

        return intercepted as TData;
    };

    get<TData>(
        path: string,
        config?: HttpRequestConfig
    ): Promise<TData> {
        return this.execute<TData>(
            "GET",
            path,
            undefined,
            config
        );
    };

    post<TData>(
        path: string,
        body?: HttpRequestBody,
        config?: HttpRequestConfig
    ): Promise<TData> {
        return this.execute<TData>(
            "POST",
            path,
            body,
            config
        );
    };

    put<TData>(
        path: string,
        body?: HttpRequestBody,
        config?: HttpRequestConfig
    ): Promise<TData> {
        return this.execute<TData>(
            "PUT",
            path,
            body,
            config
        );
    };

    patch<TData>(
        path: string,
        body?: HttpRequestBody,
        config?: HttpRequestConfig
    ): Promise<TData> {
        return this.execute<TData>(
            "PATCH",
            path,
            body,
            config
        );
    };

    delete<TData>(
        path: string,
        config?: HttpRequestConfig
    ): Promise<TData> {
        return this.execute<TData>(
            "DELETE",
            path,
            undefined,
            config
        );
    };
};

type HttpJsonResponse = HttpRequestBody | string;

/**
 * Creates a Rakta HTTP client.
 *
 * Usage:
 *   const http = createRaktaHttp({ baseUrl: "http://localhost:4000" });
 *   const users = await http.get<User[]>("/users");
 */
export function createRaktaHttp(config: HttpClientConfig): RaktaHttpClient {
    return new RaktaHttpClient(config);
};