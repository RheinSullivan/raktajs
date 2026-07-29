// RaktaTesting - E2E test utilities
// Provides a lightweight HTTP client for end-to-end API testing.
// Works against any server that handles Request/Response - no browser needed.

export interface E2EClient {
	/** Make a GET request. */
	get(path: string, init?: RequestInit): Promise<E2EResponse>;
	/** Make a POST request with a JSON body. */
	post(path: string, body: unknown, init?: RequestInit): Promise<E2EResponse>;
	/** Make a PUT request with a JSON body. */
	put(path: string, body: unknown, init?: RequestInit): Promise<E2EResponse>;
	/** Make a DELETE request. */
	delete(path: string, init?: RequestInit): Promise<E2EResponse>;
	/** Make a PATCH request with a JSON body. */
	patch(path: string, body: unknown, init?: RequestInit): Promise<E2EResponse>;
}

export interface E2EResponse {
	readonly status: number;
	readonly ok: boolean;
	readonly headers: Headers;
	json<T = unknown>(): Promise<T>;
	text(): Promise<string>;
}

/**
 * Create an E2E client that calls a server handler function directly.
 * Use this for testing Rakta.js API handlers without starting an HTTP server.
 *
 * @example
 * const client = createE2EClient("http://localhost", (req) => handler(req));
 * const res = await client.get("/api/users");
 * expect(res.status).toBe(200);
 */
export function createE2EClient(
	baseUrl: string,
	handler: (request: Request) => Promise<Response> | Response,
): E2EClient {
	async function request(
		path: string,
		init: RequestInit = {},
	): Promise<E2EResponse> {
		const url = `${baseUrl.replace(/\/$/, "")}${path}`;
		const req = new Request(url, init);
		const res = await handler(req);

		return {
			status: res.status,
			ok: res.ok,
			headers: res.headers,
			json: () => res.clone().json() as Promise<unknown>,
			text: () => res.clone().text(),
		} as E2EResponse;
	}

	function jsonBody(body: unknown): RequestInit {
		return {
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		};
	}

	return {
		get: (path, init) => request(path, { method: "GET", ...init }),
		post: (path, body, init) =>
			request(path, { method: "POST", ...jsonBody(body), ...init }),
		put: (path, body, init) =>
			request(path, { method: "PUT", ...jsonBody(body), ...init }),
		delete: (path, init) => request(path, { method: "DELETE", ...init }),
		patch: (path, body, init) =>
			request(path, { method: "PATCH", ...jsonBody(body), ...init }),
	};
}
