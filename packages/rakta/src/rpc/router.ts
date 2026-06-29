import type { RouterDefinition, RpcPayload, RpcEnvelope } from "./types";
import { RaktaSchemaError } from "../schema/errors";

/**
 * CarubanWire - Creates a Rakta RPC router from a map of procedure definitions.
 * The return value is typed as `TRouter` so TypeScript can infer procedure types.
 */
export function createRaktaRouter<TRouter extends RouterDefinition>(
	procedures: TRouter,
): TRouter {
	return procedures;
}

/**
 * Creates an HTTP request handler for the given router.
 * Mount at your chosen base path, e.g. POST /rpc
 */
export function createRpcHandler<TRouter extends RouterDefinition>(
	router: TRouter,
): (request: Request) => Promise<Response> {
	return async (request: Request): Promise<Response> => {
		if (request.method !== "POST") {
			return buildJsonResponse<string>(
				{
					ok: false,
					error: "Only POST requests are accepted",
					code: "method_not_allowed",
				},
				405,
			);
		}

		let rpcPayload: RpcPayload;

		try {
			rpcPayload = (await request.json()) as RpcPayload;
		} catch {
			return buildJsonResponse<string>(
				{ ok: false, error: "Invalid JSON body", code: "parse_error" },
				400,
			);
		}

		if (typeof rpcPayload.procedure !== "string") {
			return buildJsonResponse<string>(
				{
					ok: false,
					error: "Missing procedure name",
					code: "invalid_request",
				},
				400,
			);
		}

		const selectedProcedure = router[rpcPayload.procedure];

		if (selectedProcedure === undefined) {
			return buildJsonResponse<string>(
				{
					ok: false,
					error: `Procedure "${rpcPayload.procedure}" not found`,
					code: "not_found",
				},
				404,
			);
		}

		let validatedInput: unknown = rpcPayload.input;

		if (selectedProcedure.inputSchema !== undefined) {
			const validationErrors = selectedProcedure.inputSchema._run(
				rpcPayload.input,
			);

			if (validationErrors.length > 0) {
				return buildJsonResponse<string>(
					{
						ok: false,
						error: "Input validation failed",
						code: "validation_error",
						details: validationErrors.map((validationError) => ({
							path: validationError.path,
							message: validationError.message,
						})),
					},
					422,
				);
			}

			validatedInput = selectedProcedure.inputSchema.parse(rpcPayload.input);
		}

		try {
			const procedureOutput = await selectedProcedure.handler({
				input: validatedInput,
			});

			return buildJsonResponse({ ok: true, data: procedureOutput }, 200);
		} catch (caughtError) {
			if (caughtError instanceof RaktaSchemaError) {
				return buildJsonResponse<string>(
					{
						ok: false,
						error: caughtError.message,
						code: "schema_error",
					},
					422,
				);
			}

			const errorMessage =
				caughtError instanceof Error
					? caughtError.message
					: "Internal server error";

			return buildJsonResponse<string>(
				{ ok: false, error: errorMessage, code: "internal_error" },
				500,
			);
		}
	};
}

function buildJsonResponse<TData>(
	responseEnvelope: RpcEnvelope<TData>,
	statusCode: number,
): Response {
	return new Response(JSON.stringify(responseEnvelope), {
		status: statusCode,
		headers: { "Content-Type": "application/json; charset=utf-8" },
	});
}
