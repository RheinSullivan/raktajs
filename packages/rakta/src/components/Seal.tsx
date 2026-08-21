import { Component, type ErrorInfo, type ReactNode } from "react";

export interface SealProps {
	readonly children: ReactNode;
	readonly fallback?: ReactNode | ((error: Error) => ReactNode);
}

interface SealState {
	hasError: boolean;
	error: Error | null;
}

export class Seal extends Component<SealProps, SealState> {
	override state: SealState = {
		hasError: false,
		error: null,
	};

	static getDerivedStateFromError(error: Error): SealState {
		return { hasError: true, error };
	}

	override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		if (process.env.NODE_ENV === "development") {
			console.error(
				"[Rakta.js <seal>] Caught runtime error:",
				error,
				errorInfo,
			);
		}
	}

	override render(): ReactNode {
		if (this.state.hasError) {
			if (typeof this.props.fallback === "function") {
				return this.props.fallback(
					this.state.error || new Error("Unknown error"),
				);
			}
			return this.props.fallback ?? null;
		}

		return this.props.children;
	}
}
