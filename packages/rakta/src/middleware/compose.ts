// Middleware composition utilities - ordering, scoping, named middleware chains

import { createMiddlewareStack } from "./stack";
import type {
	RaktaMiddleware,
	RaktaMiddlewareScope,
	RaktaMiddlewareStack,
} from "./types";

export interface NamedMiddleware {
	readonly name: string;
	readonly middleware: RaktaMiddleware;
	/** Lower number runs first. Default: 100 */
	readonly order?: number;
	/** Which scopes this middleware applies to. Omit to run in all scopes. */
	readonly scopes?: readonly RaktaMiddlewareScope[];
}

export interface MiddlewareComposer {
	/** Add a named middleware. */
	add(entry: NamedMiddleware): this;

	/** Remove a middleware by name. */
	remove(name: string): this;

	/** Build a stack filtered to the given scope. */
	forScope(scope: RaktaMiddlewareScope): RaktaMiddlewareStack;

	/** Build a stack that runs ALL registered middleware in order. */
	all(): RaktaMiddlewareStack;

	/** Return ordered list of middleware for inspection. */
	list(): readonly NamedMiddleware[];
}

export function createMiddlewareComposer(): MiddlewareComposer {
	const registry = new Map<string, NamedMiddleware>();

	function sorted(): NamedMiddleware[] {
		return Array.from(registry.values()).sort(
			(firstMiddleware, secondMiddleware) =>
				(firstMiddleware.order ?? 100) - (secondMiddleware.order ?? 100),
		);
	}

	return {
		add(entry) {
			registry.set(entry.name, entry);
			return this;
		},

		remove(name) {
			registry.delete(name);
			return this;
		},

		forScope(scope) {
			const filtered = sorted()
				.filter((entry) => !entry.scopes || entry.scopes.includes(scope))
				.map((entry) => entry.middleware);
			return createMiddlewareStack(filtered);
		},

		all() {
			return createMiddlewareStack(
				sorted().map((namedMiddleware) => namedMiddleware.middleware),
			);
		},

		list() {
			return sorted();
		},
	};
}

/**
 * Compose multiple middleware functions into a single stack.
 * Runs in the order provided.
 */
export function compose(
	...middlewares: RaktaMiddleware[]
): RaktaMiddlewareStack {
	return createMiddlewareStack(middlewares);
}

/**
 * Create a middleware that only runs when the pathname matches a pattern.
 * Supports exact strings and glob-style `**` wildcards.
 */
export function routeMiddleware(
	pattern: string,
	middleware: RaktaMiddleware,
): RaktaMiddleware {
	const regex = patternToRegex(pattern);

	return async (context, next) => {
		if (!regex.test(context.pathname)) {
			return next();
		}

		return middleware(context, next);
	};
}

function patternToRegex(pattern: string): RegExp {
	const escaped = pattern
		.replace(/[.+?^${}()|[\]\\]/g, "\\$&")
		.replace(/\*\*/g, "(.+)")
		.replace(/\*/g, "([^/]+)");
	return new RegExp(`^${escaped}$`);
}
