import type { RaktaType } from "../schema/types";
import type { ProcedureDefinition, ProcedureKind } from "./types";

/**
 * CarubanWire — Fluent builder for a single type-safe RPC procedure.
 *
 * Usage:
 *   publicProcedure
 *     .input(object({ name: string().min(1) }))
 *     .query(async ({ input }) => ({ message: `Hello ${input.name}` }))
 */
export class ProcedureBuilder<TInput = void> {
	private readonly inputSchema?: RaktaType<TInput>;

	constructor(inputSchema?: RaktaType<TInput>) {
		if (inputSchema !== undefined) {
			this.inputSchema = inputSchema;
		}
	}

	/** Attach an input schema. Returns a new builder with TInput typed. */
	input<TNewInput>(schema: RaktaType<TNewInput>): ProcedureBuilder<TNewInput> {
		return new ProcedureBuilder<TNewInput>(schema);
	}

	/** Define a read procedure (CarubanWire query). */
	query<TOutput>(
		handler: (ctx: { readonly input: TInput }) => Promise<TOutput>,
	): ProcedureDefinition<TInput, TOutput> {
		return this.build("query", handler);
	}

	/** Define a write procedure (CarubanWire mutation). */
	mutation<TOutput>(
		handler: (ctx: { readonly input: TInput }) => Promise<TOutput>,
	): ProcedureDefinition<TInput, TOutput> {
		return this.build("mutation", handler);
	}

	private build<TOutput>(
		kind: ProcedureKind,
		handler: (ctx: { readonly input: TInput }) => Promise<TOutput>,
	): ProcedureDefinition<TInput, TOutput> {
		if (this.inputSchema !== undefined) {
			return {
				kind,
				inputSchema: this.inputSchema,
				handler,
			};
		}

		return {
			kind,
			handler,
		};
	}
}

/** The base public procedure builder. Chain .input() and .query()/.mutation() from here. */
export const publicProcedure = new ProcedureBuilder<void>();
