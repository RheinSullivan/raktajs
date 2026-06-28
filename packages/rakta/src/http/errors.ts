export class HttpResponseError extends Error {
    readonly status: number;
    readonly statusText: string;
    readonly url: string;

    constructor(response: Response) {
        super(
            `HTTP ${response.status} ${response.statusText} - ${response.url}`
        );

        this.name = "HttpResponseError";
        this.status = response.status;
        this.statusText = response.statusText;
        this.url = response.url;
    };
};

export class HttpTimeoutError extends Error {
    readonly url: string;
    readonly timeoutMs: number;

    constructor(
        url: string,
        timeoutMs: number
    ) {
        super(`Request to ${url} timed out after ${timeoutMs}ms`);

        this.name = "HttpTimeoutError";
        this.url = url;
        this.timeoutMs = timeoutMs;
    };
};

export class HttpNetworkError extends Error {
    readonly url: string;
    readonly originalError: Error;

    constructor(
        url: string,
        originalError: Error
    ) {
        super(`Network error for ${url}: ${originalError.message}`);

        this.name = "HttpNetworkError";
        this.url = url;
        this.originalError = originalError;
    };
};