import type { ValidationError } from "./errors";
import { RaktaType } from "./types";

export class BooleanType extends RaktaType<boolean> {
	_run(value: unknown): ReadonlyArray<ValidationError> {
		if (typeof value !== "boolean") {
			return [
				{
					path: [],
					message: "Expected a boolean",
					code: "invalid_type",
				},
			];
		}

		return [];
	}
}

export function boolean(): BooleanType {
	return new BooleanType();
}
