// RaktaOps - Server Actions
// A lightweight, type-safe server action system.
// Actions are async functions that run on the server, callable from the client
// via a generated RPC-like mechanism.

export type ServerActionResult<TData, TError = string> =
	| { ok: true; data: TData }
	| { ok: false; error: TError };

/**
 * Define a server action - a typed async function that runs server-side.
 *
 * @example
 * export const createPost = defineServerAction(
 *   async (input: { title: string; body: string }) => {
 *     const post = await db.posts.create(input);
 *     return post;
 *   }
 * );
 */
export function defineServerAction<TInput, TOutput>(
	handler: (input: TInput, request?: Request) => Promise<TOutput>,
): (input: TInput, request?: Request) => Promise<ServerActionResult<TOutput>> {
	return async (input, request) => {
		try {
			const data = await handler(input, request);
			return { ok: true, data };
		} catch (err) {
			const error =
				err instanceof Error ? err.message : "Server action failed.";
			return { ok: false, error };
		}
	};
}

/**
 * Create a server action handler that can be mounted as an HTTP POST endpoint.
 * Reads JSON from the request body, passes it to the action, and returns JSON.
 */
export function createServerActionHandler<TInput, TOutput>(
	action: (
		input: TInput,
		request?: Request,
	) => Promise<ServerActionResult<TOutput>>,
): (request: Request) => Promise<Response> {
	return async (request) => {
		if (request.method !== "POST") {
			return new Response(
				JSON.stringify({ ok: false, error: "Method Not Allowed" }),
				{
					status: 405,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		let input: TInput;

		try {
			input = (await request.json()) as TInput;
		} catch {
			return new Response(
				JSON.stringify({ ok: false, error: "Invalid JSON body" }),
				{ status: 400, headers: { "Content-Type": "application/json" } },
			);
		}

		const result = await action(input, request);

		return new Response(JSON.stringify(result), {
			status: result.ok ? 200 : 422,
			headers: { "Content-Type": "application/json" },
		});
	};
}
