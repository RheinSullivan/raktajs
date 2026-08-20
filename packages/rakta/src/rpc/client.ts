import type {
	RouterClient,
	RouterDefinition,
	RpcCallConfig,
	RpcEnvelope,
} from "./types";

export interface RaktaClientConfig {
	readonly baseUrl: string;
	readonly headers?: Record<string, string>;
	readonly timeout?: number;
	readonly signal?: AbortSignal;
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
	callConfig?: RpcCallConfig,
): Promise<TOutput> {
	const callerSignal = callConfig?.signal ?? clientConfig.signal;
	if (callerSignal?.aborted) {
		if (callerSignal.reason instanceof Error) {
			throw callerSignal.reason;
		}
		const err = new Error("RPC request aborted by caller");
		err.name = "AbortError";
		throw err;
	}

	const timeoutMs = callConfig?.timeout ?? clientConfig.timeout ?? 30_000;
	const timeoutController = new AbortController();
	let timedOut = false;

	const timeoutHandle = setTimeout(() => {
		timedOut = true;
		timeoutController.abort();
	}, timeoutMs);

	let abortListener: (() => void) | undefined;
	let combinedSignal: AbortSignal = timeoutController.signal;

	if (callerSignal) {
		if (typeof AbortSignal.any === "function") {
			combinedSignal = AbortSignal.any([
				callerSignal,
				timeoutController.signal,
			]);
		} else {
			abortListener = () => timeoutController.abort();
			callerSignal.addEventListener("abort", abortListener, { once: true });
		}
	}

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
			signal: combinedSignal,
		});
	} catch (caughtError) {
		clearTimeout(timeoutHandle);
		if (callerSignal && abortListener) {
			callerSignal.removeEventListener("abort", abortListener);
		}

		const isAbort =
			timedOut ||
			(caughtError instanceof Error && caughtError.name === "AbortError") ||
			(typeof DOMException !== "undefined" &&
				caughtError instanceof DOMException &&
				caughtError.name === "AbortError") ||
			callerSignal?.aborted ||
			timeoutController.signal.aborted;

		if (isAbort) {
			if (timedOut) {
				throw new RaktaRpcError(
					`RPC call to procedure "${procedureName}" timed out after ${timeoutMs}ms`,
					"timeout",
				);
			}
			if (callerSignal?.aborted) {
				if (callerSignal.reason instanceof Error) {
					throw callerSignal.reason;
				}
				const err = new Error("RPC request aborted by caller");
				err.name = "AbortError";
				throw err;
			}
			throw new RaktaRpcError(
				`RPC call to procedure "${procedureName}" timed out after ${timeoutMs}ms`,
				"timeout",
			);
		}

		throw new RaktaRpcError(
			`RPC request failed: ${caughtError instanceof Error ? caughtError.message : String(caughtError)}`,
			"network_error",
		);
	} finally {
		clearTimeout(timeoutHandle);
		if (callerSignal && abortListener) {
			callerSignal.removeEventListener("abort", abortListener);
		}
	}

	let responseEnvelope: RpcEnvelope<TOutput>;

	try {
		const contentType = response.headers.get("content-type") ?? "";
		if (!contentType.includes("application/json")) {
			const textBody = await response.text();
			throw new RaktaRpcError(
				`RPC server returned HTTP ${response.status}: ${textBody.slice(0, 200)}`,
				"http_error",
			);
		}
		responseEnvelope = (await response.json()) as RpcEnvelope<TOutput>;
	} catch (caughtError) {
		if (caughtError instanceof RaktaRpcError) {
			throw caughtError;
		}
		throw new RaktaRpcError(
			`Failed to parse RPC response: ${caughtError instanceof Error ? caughtError.message : String(caughtError)}`,
			"parse_error",
		);
	}

	if (!responseEnvelope.ok) {
		throw new RaktaRpcError(
			responseEnvelope.error,
			responseEnvelope.code,
			responseEnvelope.details,
		);
	}

	return responseEnvelope.data;
}

const BUILT_IN_PROPS = new Set([
	"then",
	"catch",
	"finally",
	"toJSON",
	"inspect",
	"constructor",
]);

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
		get(_target, prop: string | symbol) {
			if (typeof prop === "symbol" || BUILT_IN_PROPS.has(prop)) {
				return undefined;
			}
			const procedureName = String(prop);
			return {
				query: (procedureInput: unknown, config?: RpcCallConfig) =>
					callProcedure(clientConfig, procedureName, procedureInput, config),
				mutate: (procedureInput: unknown, config?: RpcCallConfig) =>
					callProcedure(clientConfig, procedureName, procedureInput, config),
			};
		},
	});
}
