// RaktaTesting - Component test utilities
// Lightweight component testing primitives compatible with React Testing Library patterns.
// Actual DOM rendering requires a test environment (jsdom / happy-dom).

export interface ComponentTestOptions {
	readonly props?: Readonly<Record<string, unknown>>;
	/** Additional wrapper HTML to inject around the rendered component */
	readonly wrapper?: string;
}

export interface RenderedComponent {
	/** Root element (or undefined in non-DOM environments) */
	readonly container: Element | undefined;
	/** Query helpers */
	getByText(text: string): Element | undefined;
	getByRole(role: string): Element | undefined;
	getByTestId(testId: string): Element | undefined;
	/** Assert element exists */
	exists(selector: string): boolean;
	/** Returns inner HTML as string */
	html(): string;
}

/**
 * Create a lightweight rendered component stub for unit testing.
 * Actual DOM mounting requires jsdom or happy-dom runtime.
 */
export function renderComponent(html: string): RenderedComponent {
	// In non-DOM environments, return a text-based query stub.
	const text = html;

	return {
		container: undefined,
		getByText: (query) => {
			if (text.includes(query)) {
				return { textContent: query } as unknown as Element;
			}

			return undefined;
		},
		getByRole: (_role) => undefined,
		getByTestId: (id) => {
			const match = text.includes(`data-testid="${id}"`);
			return match
				? ({ dataset: { testid: id } } as unknown as Element)
				: undefined;
		},
		exists: (selector) => text.includes(selector),
		html: () => text,
	};
}

/**
 * Assert that a rendered component contains expected text.
 */
export function expectText(rendered: RenderedComponent, text: string): void {
	const el = rendered.getByText(text);

	if (!el) {
		throw new Error(
			`Expected to find text "${text}" in rendered output.\nHTML: ${rendered.html()}`,
		);
	}
}

/**
 * Assert that a rendered component contains a test ID.
 */
export function expectTestId(
	rendered: RenderedComponent,
	testId: string,
): void {
	const el = rendered.getByTestId(testId);

	if (!el) {
		throw new Error(
			`Expected to find [data-testid="${testId}"] in rendered output.\nHTML: ${rendered.html()}`,
		);
	}
}
