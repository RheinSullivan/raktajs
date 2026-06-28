import type { RouterDefinition, RpcPayload, RpcEnvelope } from "./types";
import { RaktaSchemaError } from "../schema/errors";

/**
 * Creates a Rakta RPC router from a map of procedure definitions.
 * The return value is typed as `TRouter` so TypeScript can infer procedure types.
 */
export function createRaktaRouter<TRouter extends RouterDefinition>(
  procedures: TRouter
): TRouter {
  return procedures;
}

/**
 * Creates an HTTP request handler for the given router.
 * Mount at your chosen base path, e.g. POST /rpc
 *
 * CLI integration: bun rakta tide:render
 */
export function createRpcHandler<TRouter extends RouterDefinition>(
  router: TRouter
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    if (request.method !== "POST") {
      return jsonResponse<string>(
        { ok: false, error: "Only POST requests are accepted", code: "method_not_allowed" },
        405
      );
    }

    let payload: RpcPayload;
    try {
      payload = await request.json() as RpcPayload;
    } catch {
      return jsonResponse<string>(
        { ok: false, error: "Invalid JSON body", code: "parse_error" },
        400
      );
    }

    if (typeof payload.procedure !== "string") {
      return jsonResponse<string>(
        { ok: false, error: "Missing procedure name", code: "invalid_request" },
        400
      );
    }

    const procedure = router[payload.procedure];
    if (!procedure) {
      return jsonResponse<string>(
        {
          ok: false,
          error: `Procedure "${payload.procedure}" not found`,
          code: "not_found",
        },
        404
      );
    }

    // Validate input if schema is provided
    let validatedInput: unknown = payload.input;

    if (procedure.inputSchema) {
      const validationErrors = procedure.inputSchema._run(payload.input);
      if (validationErrors.length > 0) {
        return jsonResponse<string>(
          {
            ok: false,
            error: "Input validation failed",
            code: "validation_error",
            details: validationErrors.map((e) => ({
              path: e.path,
              message: e.message,
            })),
          },
          422
        );
      }
      validatedInput = procedure.inputSchema.parse(payload.input);
    }

    try {
      const output = await procedure.handler({ input: validatedInput });
      return jsonResponse({ ok: true, data: output }, 200);
    } catch (err) {
      if (err instanceof RaktaSchemaError) {
        return jsonResponse<string>(
          { ok: false, error: err.message, code: "schema_error" },
          422
        );
      }
      const message = err instanceof Error ? err.message : "Internal server error";
      return jsonResponse<string>(
        { ok: false, error: message, code: "internal_error" },
        500
      );
    }
  };
}

function jsonResponse<TData>(
  envelope: RpcEnvelope<TData>,
  status: number
): Response {
  return new Response(JSON.stringify(envelope), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}