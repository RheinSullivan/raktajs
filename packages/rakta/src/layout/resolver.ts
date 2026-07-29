// RaktaLayout - Layout Resolver
// Given a manifest and a request pathname, resolves the full layout chain:
// root → nested ancestors → nearest specific layout (error/loading/not-found)
// Also handles persistent layouts (never unmounted during navigation).

import type {
	RaktaLayoutEntry,
	RaktaLayoutKind,
	RaktaLayoutManifest,
} from "./types";

export interface ResolvedLayoutChain {
	/** Layouts from outermost (root) to innermost, for rendering nesting. */
	readonly chain: readonly RaktaLayoutEntry[];
	/** The error layout closest to the current route, if any. */
	readonly errorLayout?: RaktaLayoutEntry | undefined;
	/** The loading layout closest to the current route, if any. */
	readonly loadingLayout?: RaktaLayoutEntry | undefined;
	/** The not-found layout closest to the current route, if any. */
	readonly notFoundLayout?: RaktaLayoutEntry | undefined;
	/** Parallel slot layouts keyed by slot name. */
	readonly parallelSlots: Readonly<Record<string, RaktaLayoutEntry>>;
	/** Persistent layouts that should never unmount. */
	readonly persistentLayouts: readonly RaktaLayoutEntry[];
}

export function resolveLayoutChain(
	manifest: RaktaLayoutManifest,
	pathname: string,
): ResolvedLayoutChain {
	const normalized = normalizePath(pathname);
	const allEntries = manifest.entries;

	// Build layout chain: root → nested layouts that match the path
	const chain: RaktaLayoutEntry[] = [];
	const persistentLayouts: RaktaLayoutEntry[] = [];
	const parallelSlots: Record<string, RaktaLayoutEntry> = {};
	let errorLayout: RaktaLayoutEntry | undefined;
	let loadingLayout: RaktaLayoutEntry | undefined;
	let notFoundLayout: RaktaLayoutEntry | undefined;

	for (const entry of allEntries) {
		if (!matchesPath(entry.routePattern, normalized)) {
			continue;
		}

		switch (entry.kind) {
			case "root":
			case "nested":
			case "group":
				chain.push(entry);
				break;
			case "persistent":
				persistentLayouts.push(entry);
				break;
			case "parallel":
				if (entry.slot) {
					parallelSlots[entry.slot] = entry;
				}
				break;
			case "error":
				if (!errorLayout || entry.order > errorLayout.order) {
					errorLayout = entry;
				}
				break;
			case "loading":
				if (!loadingLayout || entry.order > loadingLayout.order) {
					loadingLayout = entry;
				}
				break;
			case "not-found":
				if (!notFoundLayout || entry.order > notFoundLayout.order) {
					notFoundLayout = entry;
				}
				break;
		}
	}

	// Sort chain by order (root first, deepest last)
	chain.sort((a, b) => a.order - b.order);

	return {
		chain,
		errorLayout,
		loadingLayout,
		notFoundLayout,
		parallelSlots,
		persistentLayouts,
	};
}

/**
 * Determine if a layout's route pattern matches the current pathname.
 */
function matchesPath(pattern: string, pathname: string): boolean {
	if (pattern === "/") {
		return true;
	}

	return pathname === pattern || pathname.startsWith(`${pattern}/`);
}

function normalizePath(pathname: string): string {
	const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
	return p.length > 1 ? p.replace(/\/+$/, "") : p;
}

/**
 * Check if a layout kind is a special (error/loading/not-found) layout.
 */
export function isSpecialLayout(kind: RaktaLayoutKind): boolean {
	return kind === "error" || kind === "loading" || kind === "not-found";
}
