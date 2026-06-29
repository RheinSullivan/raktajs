import type { ValidationError } from "./errors";
import { RaktaType } from "./types";

type NumberRule = (value: number) => ValidationError | undefined;

export class NumberType extends RaktaType<number> {
	private readonly rules: ReadonlyArray<NumberRule>;

	constructor(rules: ReadonlyArray<NumberRule> = []) {
		super();
		this.rules = rules;
	}

	private addRule(rule: NumberRule): NumberType {
		return new NumberType([...this.rules, rule]);
	}

	_run(value: unknown): ReadonlyArray<ValidationError> {
		if (typeof value !== "number" || Number.isNaN(value)) {
			return [
				{
					path: [],
					message: "Expected a number",
					code: "invalid_type",
				},
			];
		}

		const errors: ValidationError[] = [];

		for (const rule of this.rules) {
			const result = rule(value);

			if (result) {
				errors.push(result);
			}
		}

		return errors;
	}

	min(threshold: number): NumberType {
		return this.addRule((value: number): ValidationError | undefined =>
			value < threshold
				? {
						path: [],
						message: `Must be at least ${threshold}`,
						code: "too_small",
					}
				: undefined,
		);
	}

	max(threshold: number): NumberType {
		return this.addRule((value: number): ValidationError | undefined =>
			value > threshold
				? {
						path: [],
						message: `Must be at most ${threshold}`,
						code: "too_big",
					}
				: undefined,
		);
	}

	int(): NumberType {
		return this.addRule((value: number): ValidationError | undefined =>
			!Number.isInteger(value)
				? {
						path: [],
						message: "Expected an integer",
						code: "not_integer",
					}
				: undefined,
		);
	}

	positive(): NumberType {
		return this.addRule((value: number): ValidationError | undefined =>
			value <= 0
				? {
						path: [],
						message: "Must be a positive number",
						code: "not_positive",
					}
				: undefined,
		);
	}

	nonnegative(): NumberType {
		return this.addRule((value: number): ValidationError | undefined =>
			value < 0
				? {
						path: [],
						message: "Must be zero or positive",
						code: "not_nonnegative",
					}
				: undefined,
		);
	}
}

export function number(): NumberType {
	return new NumberType();
}
