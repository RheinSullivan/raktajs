export interface ValidationError {
	readonly path: ReadonlyArray<string>;
	readonly message: string;
	readonly code: string;
}

export interface ParseSuccess<TOutput> {
	readonly kind: "success";
	readonly data: TOutput;
}

export interface ParseFailure {
	readonly kind: "failure";
	readonly errors: ReadonlyArray<ValidationError>;
}

export type ParseResult<TOutput> = ParseSuccess<TOutput> | ParseFailure;

export class RaktaSchemaError extends Error {
	readonly errors: ReadonlyArray<ValidationError>;

	constructor(errors: ReadonlyArray<ValidationError>) {
		const first = errors[0];

		const prefix = first
			? `[${first.path.join(".") || "root"}] ${first.message}`
			: "Validation failed";

		super(
			`Rakta Schema: ${prefix}${
				errors.length > 1 ? ` (and ${errors.length - 1} more)` : ""
			}`,
		);

		this.name = "RaktaSchemaError";
		this.errors = errors;
	}
}

export function prefixErrors(
	errors: ReadonlyArray<ValidationError>,
	key: string,
): ValidationError[] {
	return errors.map((error) => ({
		...error,
		path: [key, ...error.path],
	}));
}

export const preFixErrors = prefixErrors;
