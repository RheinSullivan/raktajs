import type { ValidationError } from "./errors";
import { type Infer, RaktaType } from "./types";

export class ArrayType<TItem extends RaktaType<unknown>> extends RaktaType<
	Array<Infer<TItem>>
> {
	private readonly itemSchema: TItem;
	private readonly minLength?: number;
	private readonly maxLength?: number;

	constructor(itemSchema: TItem, minLength?: number, maxLength?: number) {
		super();

		this.itemSchema = itemSchema;

		if (typeof minLength === "number") {
			this.minLength = minLength;
		}

		if (typeof maxLength === "number") {
			this.maxLength = maxLength;
		}
	}

	private clone(minLength?: number, maxLength?: number): ArrayType<TItem> {
		return new ArrayType(this.itemSchema, minLength, maxLength);
	}

	min(length: number): ArrayType<TItem> {
		return this.clone(length, this.maxLength);
	}

	max(length: number): ArrayType<TItem> {
		return this.clone(this.minLength, length);
	}

	nonempty(): ArrayType<TItem> {
		return this.min(1);
	}

	_run(value: unknown): ReadonlyArray<ValidationError> {
		if (!Array.isArray(value)) {
			return [
				{
					path: [],
					message: "Expected an array",
					code: "invalid_type",
				},
			];
		}

		const errors: ValidationError[] = [];

		if (typeof this.minLength === "number" && value.length < this.minLength) {
			errors.push({
				path: [],
				message: `Array must contain at least ${this.minLength} item(s)`,
				code: "too_small",
			});
		}

		if (typeof this.maxLength === "number" && value.length > this.maxLength) {
			errors.push({
				path: [],
				message: `Array must contain at most ${this.maxLength} item(s)`,
				code: "too_big",
			});
		}

		for (let index = 0; index < value.length; index += 1) {
			const itemValue = value[index];
			const itemErrors = this.itemSchema._run(itemValue);

			errors.push(
				...itemErrors.map((error: ValidationError) => ({
					...error,
					path: [String(index), ...error.path],
				})),
			);
		}

		return errors;
	}
}

export function array<TItem extends RaktaType<unknown>>(
	itemSchema: TItem,
): ArrayType<TItem> {
	return new ArrayType(itemSchema);
}
