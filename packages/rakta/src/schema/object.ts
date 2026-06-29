import type { ValidationError } from "./errors";
import { prefixErrors } from "./errors";
import { type Infer, RaktaType } from "./types";

export type ShapeRecord = Record<string, RaktaType<unknown>>;

export type InferShape<TShape extends ShapeRecord> = {
	[K in keyof TShape]: Infer<TShape[K]>;
};

export class ObjectType<TShape extends ShapeRecord> extends RaktaType<
	InferShape<TShape>
> {
	private readonly shape: TShape;

	constructor(shape: TShape) {
		super();
		this.shape = shape;
	}

	_run(value: unknown): ReadonlyArray<ValidationError> {
		if (typeof value !== "object" || value === null || Array.isArray(value)) {
			return [
				{
					path: [],
					message: "Expected an object",
					code: "invalid_type",
				},
			];
		}

		const errors: ValidationError[] = [];
		const record = value as Record<string, unknown>;

		for (const key of Object.keys(this.shape)) {
			const fieldSchema = this.shape[key];

			if (typeof fieldSchema === "undefined") {
				continue;
			}

			const fieldValue = record[key];
			const fieldErrors = fieldSchema._run(fieldValue);

			errors.push(...prefixErrors(fieldErrors, key));
		}

		return errors;
	}

	/** Merge additional fields into this schema. */
	extend<TExtension extends ShapeRecord>(
		extension: TExtension,
	): ObjectType<TShape & TExtension> {
		return new ObjectType({
			...this.shape,
			...extension,
		});
	}

	/** Create a new schema with only the specified keys. */
	pick<TKey extends keyof TShape>(
		keys: ReadonlyArray<TKey>,
	): ObjectType<Pick<TShape, TKey>> {
		const picked = {} as Pick<TShape, TKey>;

		for (const key of keys) {
			if (key in this.shape) {
				picked[key] = this.shape[key];
			}
		}

		return new ObjectType(picked);
	}

	/** Create a new schema omitting the specified keys. */
	omit<TKey extends keyof TShape>(
		keys: ReadonlyArray<TKey>,
	): ObjectType<Omit<TShape, TKey>> {
		const result = { ...this.shape };

		for (const key of keys) {
			delete result[key];
		}

		return new ObjectType(result);
	}
}

export function object<TShape extends ShapeRecord>(
	shape: TShape,
): ObjectType<TShape> {
	return new ObjectType(shape);
}
