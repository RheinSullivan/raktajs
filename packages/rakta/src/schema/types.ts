import type { ParseResult, ValidationError } from "./errors";
import { RaktaSchemaError } from "./errors";

/** Extracts the output type from any RaktaType. */
export type Infer<TSchema> =
	TSchema extends RaktaType<infer TOutput> ? TOutput : never;

/** Base class for all Rakta Schema validators. */
export abstract class RaktaType<TOutput> {
	/** Internal validation — returns errors array (empty = valid). */
	abstract _run(value: unknown): ReadonlyArray<ValidationError>;

	/**
	 * Validates `value` and returns `TOutput`.
	 * Throws `RaktaSchemaError` if validation fails.
	 */
	parse(value: unknown): TOutput {
		const result = this.safeParse(value);

		if (result.kind === "failure") {
			throw new RaktaSchemaError(result.errors);
		}

		return result.data;
	}

	/**
	 * Validates `value` and returns a discriminated union result.
	 * Never throws.
	 */
	safeParse(value: unknown): ParseResult<TOutput> {
		const errors = this._run(value);

		if (errors.length > 0) {
			return {
				kind: "failure",
				errors,
			};
		}

		return {
			kind: "success",
			data: value as TOutput,
		};
	}

	/** Wraps this schema in an optional wrapper. */
	optional(): OptionalType<TOutput> {
		return new OptionalType(this);
	}
}

/** Wraps any RaktaType to make it accept missing values. */
export class OptionalType<TOutput> extends RaktaType<TOutput | undefined> {
	private readonly inner: RaktaType<TOutput>;

	constructor(inner: RaktaType<TOutput>) {
		super();
		this.inner = inner;
	}

	_run(value: unknown): ReadonlyArray<ValidationError> {
		if (typeof value === "undefined") {
			return [];
		}

		return this.inner._run(value);
	}
}
