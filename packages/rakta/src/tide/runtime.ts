import type { RenderMode } from "rakta/render";
import type { TideRuntimeContext } from "./types";

export function createRuntimeContext(
    request: Request,
    url: URL,
    params: Readonly<Record<string, string>>,
    resolvedMode: RenderMode
): TideRuntimeContext {
    const searchParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
        searchParams[key] = value;
    });

    const requestHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
        requestHeaders[key] = value;
    });

    return {
        url,
        params,
        request,
        searchParams,
        resolvedMode,
        requestHeaders,
        pathname: url.pathname,
        timestampMs: Date.now(),
        method: request.method.toUpperCase(),
    };
};

export function buildTextResponse(
    body: string,
    status: number,
    headers: Record<string, string>
): Response {
    return new Response(body, { status, headers });
};

export function buildHtmlResponse(
    html: string,
    status: number = 200
): Response {
    return buildTextResponse(html, status, {
        "Content-Type": "text.html; charset=utf-8",
    });
};

export function buildJsonResponse(
    data: Record<
        string, string
        | number
        | boolean
        | object
    >,
    status: number = 200
): Response {
    return buildTextResponse(JSON.stringify(data), status, {
        "Content-Type": "application/json; charset=utf-8",
    });
}

export function buildErrorResponse(
    massage: string,
    status: number = 500
): Response {
    return buildJsonResponse({ error: massage }, status);
}