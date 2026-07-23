import type { RouterClient, RouterDefinition, RpcEnvelope } from "./types";

export interface RaktaClientConfig {
	readonly baseUrl: string;
	readonly headers?: Record<string, string>;
	readonly timeout?: number;
}

export interface RaktaRpcErrorDetail {
	readonly path: ReadonlyArray<string>;
	readonly message: string;
}

export class RaktaRpcError extends Error {
	readonly code: string;
	readonly details?: ReadonlyArray<RaktaRpcErrorDetail>;

	constructor(
		message: string,
		code: string,
		details?: ReadonlyArray<RaktaRpcErrorDetail>,
	) {
		super(message);

		this.name = "RaktaRpcError";
		this.code = code;

		if (details !== undefined) {
			this.details = details;
		}
	}
}

async function callProcedure<TInput, TOutput>(
	clientConfig: RaktaClientConfig,
	procedureName: string,
	procedureInput: TInput,
): Promise<TOutput> {
	const abortController = new AbortController();
	const timeoutMs = clientConfig.timeout ?? 30_000;
	const timeoutHandle = setTimeout(() => abortController.abort(), timeoutMs);

	let response: Response;

	try {
		response = await fetch(clientConfig.baseUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(clientConfig.headers ?? {}),
			},
			body: JSON.stringify({
				procedure: procedureName,
				input: procedureInput,
			}),
			signal: abortController.signal,
		});
	} finally {
		clearTimeout(timeoutHandle);
	}

	const responseEnvelope = (await response.json()) as RpcEnvelope<TOutput>;

	if (!responseEnvelope.ok) {
		throw new RaktaRpcError(
			responseEnvelope.error,
			responseEnvelope.code,
			responseEnvelope.details,
		);
	}

	return responseEnvelope.data;
}

/**
 * CarubanWire - Creates a type-safe RPC client.
 *
 * Usage:
 *   const api = createRaktaClient<AppRouter>({ baseUrl: "http://localhost:4000/rpc" });
 *   const result = await api.hello.query({ name: "Rakta" });
 */
export function createRaktaClient<TRouter extends RouterDefinition>(
	clientConfig: RaktaClientConfig,
): RouterClient<TRouter> {
	return new Proxy({} as RouterClient<TRouter>, {
		get(_target, procedureName: string) {
			return {
				query: (procedureInput: unknown) =>
					callProcedure(clientConfig, procedureName, procedureInput),
				mutate: (procedureInput: unknown) =>
					callProcedure(clientConfig, procedureName, procedureInput),
			};
		},
	});
}
