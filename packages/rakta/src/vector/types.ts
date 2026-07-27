export interface VectorAnimationState {
	readonly name: string;
	readonly loop?: boolean;
	readonly duration?: number;
	readonly gsapVars?: Record<string, unknown>;
}

export interface StateMachineTransition {
	readonly from: string;
	readonly to: string;
	readonly on: string;
	readonly guard?: (data?: unknown) => boolean;
	readonly action?: (data?: unknown) => void;
}

export interface StateMachineConfig {
	readonly initial: string;
	readonly states: readonly VectorAnimationState[];
	readonly transitions: readonly StateMachineTransition[];
}

export interface TrusmiVectorConfig {
	/** SVG element or CSS selector */
	readonly target: string | SVGElement;
	/** State machine config */
	readonly machine: StateMachineConfig;
	/** Respect prefers-reduced-motion (default: true) */
	readonly reducedMotion?: boolean;
}

export type MascotState =
	| "idle"
	| "run"
	| "jump"
	| "fall"
	| "hurt"
	| "celebrate"
	| "dead";
