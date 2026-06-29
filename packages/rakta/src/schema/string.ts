import type { ValidationError } from "./errors";
import { RaktaType } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const URL_PATTERN = /^https?:\/\/[^\s$.?#].[^\s]*$/i;

type StringRule = (value: string) => ReadonlyArray<ValidationError>;

export class StringType extends RaktaType<string> {
	private readonly rules: ReadonlyArray<StringRule>;

	constructor(rules: ReadonlyArray<StringRule> = []) {
		super();
		this.rules = rules;
	}

	private addRule(rule: StringRule): StringType {
		return new StringType([...this.rules, rule]);
	}

	_run(value: unknown): ReadonlyArray<ValidationError> {
		if (typeof value !== "string") {
			return [
				{
					path: [],
					message: "Expected a string",
					code: "invalid_type",
				},
			];
		}

		const errors: ValidationError[] = [];

		for (const rule of this.rules) {
			errors.push(...rule(value));
		}

		return errors;
	}

	min(length: number): StringType {
		return this.addRule((value: string): ReadonlyArray<ValidationError> => {
			if (value.length >= length) {
				return [];
			}

			return [
				{
					path: [],
					message: `Must be at least ${length} character(s)`,
					code: "too_small",
				},
			];
		});
	}

	max(length: number): StringType {
		return this.addRule((value: string): ReadonlyArray<ValidationError> => {
			if (value.length <= length) {
				return [];
			}

			return [
				{
					path: [],
					message: `Must be at most ${length} character(s)`,
					code: "too_big",
				},
			];
		});
	}

	email(): StringType {
		return this.addRule((value: string): ReadonlyArray<ValidationError> => {
			if (EMAIL_PATTERN.test(value)) {
				return [];
			}

			return [
				{
					path: [],
					message: "Invalid email address",
					code: "invalid_email",
				},
			];
		});
	}

	url(): StringType {
		return this.addRule((value: string): ReadonlyArray<ValidationError> => {
			if (URL_PATTERN.test(value)) {
				return [];
			}

			return [
				{
					path: [],
					message: "Invalid URL",
					code: "invalid_url",
				},
			];
		});
	}

	regex(pattern: RegExp, customMessage?: string): StringType {
		return this.addRule((value: string): ReadonlyArray<ValidationError> => {
			if (pattern.test(value)) {
				return [];
			}

			return [
				{
					path: [],
					message:
						customMessage ?? `Did not match pattern ${pattern.toString()}`,
					code: "invalid_pattern",
				},
			];
		});
	}

	nonempty(): StringType {
		return this.min(1);
	}
}

export function string(): StringType {
	return new StringType();
}
