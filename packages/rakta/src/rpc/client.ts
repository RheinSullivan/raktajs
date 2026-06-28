import type { RouterDefinition, RouterClient, RpcEnvelope } from "./types";

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
    details?: ReadonlyArray<RaktaRpcErrorDetail>
  ) {
    super(message);

    this.name = "RaktaRpcError";
    this.code = code;

    if (details) {
      this.details = details;
    }
  }
}

async function callProcedure<TInput, TOutput>(
  config: RaktaClientConfig,
  procedureName: string,
  input: TInput
): Promise<TOutput> {
  const controller = new AbortController();
  const timeoutMs = config.timeout ?? 30_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;

  try {
    response = await fetch(config.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: JSON.stringify({
        procedure: procedureName,
        input,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  const envelope = await response.json() as RpcEnvelope<TOutput>;

  if (!envelope.ok) {
    throw new RaktaRpcError(
      envelope.error,
      envelope.code,
      envelope.details
    );
  }

  return envelope.data;
}

/**
 * Creates a type-safe RPC client.
 *
 * Usage:
 *   const api = createRaktaClient<AppRouter>({ baseUrl: "http://localhost:4000/rpc" });
 *   const result = await api.hello.query({ name: "Rakta" });
 */
export function createRaktaClient<TRouter extends RouterDefinition>(
  config: RaktaClientConfig
): RouterClient<TRouter> {
  return new Proxy({} as RouterClient<TRouter>, {
    get(_target, procedureName: string) {
      return {
        query: (input: unknown) =>
          callProcedure(config, procedureName, input),
        mutate: (input: unknown) =>
          callProcedure(config, procedureName, input),
      };
    },
  });
}
