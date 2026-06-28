export type ProcedureKind = "query" | "mutation";

export interface RpcPayload {
  readonly procedure: string;
  readonly input: unknown;
}

export interface RpcSuccessEnvelope<TData> {
  readonly ok: true;
  readonly data: TData;
}

export interface RpcErrorEnvelope {
  readonly ok: false;
  readonly error: string;
  readonly code: string;
  readonly details?: ReadonlyArray<{ path: ReadonlyArray<string>; message: string }>;
}

export type RpcEnvelope<TData> = RpcSuccessEnvelope<TData> | RpcErrorEnvelope;

/** A single defined procedure with kind, input schema, and handler. */
export interface ProcedureDefinition<TInput, TOutput> {
  readonly kind: ProcedureKind;
  readonly inputSchema?: {
    _run(value: unknown): ReadonlyArray<{ path: ReadonlyArray<string>; message: string; code: string }>;
    parse(value: unknown): TInput;
  };
  readonly handler: (ctx: { input: TInput }) => Promise<TOutput>;
}

/** A record of named procedure definitions forming a router. */
export type RouterDefinition = Record<string, ProcedureDefinition<unknown, unknown>>;

/** Extracts the inferred input type of a procedure. */
export type InferInput<TProcedure> = TProcedure extends ProcedureDefinition<infer TInput, unknown>
  ? TInput
  : never;

/** Extracts the inferred output type of a procedure. */
export type InferOutput<TProcedure> = TProcedure extends ProcedureDefinition<unknown, infer TOutput>
  ? TOutput
  : never;

/** Produces a typed client shape from a router definition. */
export type RouterClient<TRouter extends RouterDefinition> = {
  [K in keyof TRouter]: {
    query: (input: InferInput<TRouter[K]>) => Promise<InferOutput<TRouter[K]>>;
    mutate: (input: InferInput<TRouter[K]>) => Promise<InferOutput<TRouter[K]>>;
  };
};