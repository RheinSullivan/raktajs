// @rakta/forms - Form handling ecosystem package
// Type-safe form state, validation, and submission primitives.

export type FieldError = string | readonly string[];

export type FormErrors<T> = {
	readonly [K in keyof T]?: FieldError;
};

export interface FormState<T> {
	readonly values: T;
	readonly errors: FormErrors<T>;
	readonly touched: Readonly<Record<keyof T, boolean>>;
	readonly submitting: boolean;
	readonly submitted: boolean;
}

export interface FormValidator<T> {
	validate(values: T): FormErrors<T> | Promise<FormErrors<T>>;
}

export type SubmitHandler<T> = (values: T) => void | Promise<void>;

/**
 * Create an initial form state from default values.
 */
export function createFormState<T extends Record<string, unknown>>(
	defaultValues: T,
): FormState<T> {
	const touched = Object.fromEntries(
		Object.keys(defaultValues).map((k) => [k, false]),
	) as Record<keyof T, boolean>;

	return {
		values: defaultValues,
		errors: {},
		touched,
		submitting: false,
		submitted: false,
	};
}

/**
 * Validate a form against a simple rules object.
 * Rules are functions that return an error string or undefined.
 */
export type ValidationRules<T> = {
	readonly [K in keyof T]?: (value: T[K]) => string | undefined;
};

export function validateForm<T extends Record<string, unknown>>(
	values: T,
	rules: ValidationRules<T>,
): FormErrors<T> {
	const errors: Record<string, string> = {};

	for (const key of Object.keys(rules)) {
		const rule = rules[key as keyof T];

		if (rule) {
			const error = rule(values[key as keyof T] as T[keyof T]);

			if (error) {
				errors[key] = error;
			}
		}
	}

	return errors as FormErrors<T>;
}

/**
 * Parse FormData from a Request into a plain object.
 */
export async function parseFormData(
	request: Request,
): Promise<Record<string, string>> {
	const formData = await request.formData();
	const result: Record<string, string> = {};

	for (const [key, value] of formData.entries()) {
		result[key] = String(value);
	}

	return result;
}

/**
 * Common validation rule builders.
 */
export const rules = {
	required:
		(message = "This field is required.") =>
		(value: unknown) => {
			if (value === undefined || value === null || value === "") {
				return message;
			}

			return undefined;
		},

	minLength: (min: number, message?: string) => (value: string) => {
		if (typeof value === "string" && value.length < min) {
			return message ?? `Must be at least ${min} characters.`;
		}

		return undefined;
	},

	maxLength: (max: number, message?: string) => (value: string) => {
		if (typeof value === "string" && value.length > max) {
			return message ?? `Must be at most ${max} characters.`;
		}

		return undefined;
	},

	email:
		(message = "Must be a valid email address.") =>
		(value: string) => {
			const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (typeof value === "string" && !re.test(value)) {
				return message;
			}

			return undefined;
		},
};
