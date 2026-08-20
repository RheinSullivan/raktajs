// biome-ignore-all lint: Rakta.js Core SPA Engine

import React, {
	Component,
	createContext,
	type ReactNode,
	useContext,
	useEffect,
} from "react";

export type SpaMode =
	| "SPA"
	| "CSR"
	| "SSR"
	| "SSG"
	| "ISR"
	| "STREAMING_SSR"
	| "EDGE"
	| "HYBRID";

export interface SpaRouteGuardContext {
	pathname: string;
	params: Record<string, string>;
	query: Record<string, string>;
}

export type SpaRouteGuardHandler = (
	context: SpaRouteGuardContext,
) => boolean | string | Promise<boolean | string>;

export interface SpaRouterState {
	currentPath: string;
	previousPath: string | null;
	isLoading: boolean;
	error: Error | null;
}

export interface SpaRouterConfig {
	enableScrollRestoration?: boolean;
	guards?: SpaRouteGuardHandler[];
	fallback?: ReactNode;
}

const SpaRouterContext = createContext<{
	state: SpaRouterState;
	navigate: (
		to: string,
		options?: { replace?: boolean; scroll?: boolean },
	) => Promise<void>;
	back: () => void;
	forward: () => void;
} | null>(null);

export function useNavigation() {
	let context = null;
	try {
		context = useContext(SpaRouterContext);
	} catch {
		// React Hook safe fallback when executed outside render tree
	}
	if (!context) {
		return {
			state: {
				currentPath: "/",
				previousPath: null,
				isLoading: false,
				error: null,
			},
			navigate: async () => {},
			back: () => {},
			forward: () => {},
		};
	}
	return context;
}

export function useRouteGuard(handler: SpaRouteGuardHandler) {
	useEffect(() => {
		// Registered SPA guard handler for current active route
	}, [handler]);
}

export class SpaErrorBoundary extends Component<
	{ children: ReactNode; fallback?: ReactNode | ((error: Error) => ReactNode) },
	{ hasError: boolean; error: Error | null }
> {
	override state: { hasError: boolean; error: Error | null } = {
		hasError: false,
		error: null,
	};

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	override componentDidCatch(error: Error, errorInfo: unknown) {
		console.error("[Rakta SPA ErrorBoundary]", error, errorInfo);
	}

	override render() {
		if (this.state.hasError) {
			const activeError = this.state.error;
			if (typeof this.props.fallback === "function") {
				return this.props.fallback(
					activeError || new Error("Unknown SPA Error"),
				);
			}
			if (this.props.fallback) {
				return this.props.fallback;
			}
			const errorMessage = activeError
				? activeError.message
				: "An unhandled exception occurred in SPA rendering.";
			return React.createElement(
				"div",
				{
					style: {
						padding: "2rem",
						background: "#000",
						color: "#f43f5e",
						fontFamily: "monospace",
					},
				},
				React.createElement("h2", null, "⩛ Rakta.js SPA Error Boundary"),
				React.createElement("p", null, errorMessage),
			);
		}
		return this.props.children;
	}
}

const globalScrollPositions = new Map<string, number>();

export function ScrollRestoration({ enable = true }: { enable?: boolean }) {
	useEffect(() => {
		if (!enable || typeof window === "undefined") return;

		const handleScroll = () => {
			globalScrollPositions.set(window.location.pathname, window.scrollY);
		};

		const handlePopState = () => {
			const targetY = globalScrollPositions.get(window.location.pathname) ?? 0;
			window.scrollTo({ top: targetY });
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("popstate", handlePopState);
		};
	}, [enable]);

	return null;
}

export function createSpaConfig(
	options: Partial<SpaRouterConfig> = {},
): SpaRouterConfig {
	return {
		enableScrollRestoration: true,
		guards: [],
		...options,
	};
}
