import React, { type FormHTMLAttributes, type FormEvent, type ReactNode } from "react";

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
	readonly action?: string;
	readonly csrfToken?: string;
	readonly children: ReactNode;
	readonly onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

export function Form({ action, csrfToken, children, onSubmit, ...rest }: FormProps) {
	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		if (onSubmit) {
			onSubmit(event);
		}
	};

	return (
		<form action={action} onSubmit={handleSubmit} {...rest}>
			{csrfToken && <input type="hidden" name="_csrf" value={csrfToken} />}
			{children}
		</form>
	);
}
