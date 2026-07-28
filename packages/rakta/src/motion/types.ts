export type TransitionPhase =
	| "before-leave"
	| "leaving"
	| "before-enter"
	| "entering"
	| "done";

export type MotionPreset =
	| "fade"
	| "slide-up"
	| "slide-down"
	| "slide-left"
	| "slide-right"
	| "scale"
	| "blur"
	| "wipe"
	| "morph"
	| "none";

export interface MotionTarget {
	readonly selector: string;
	readonly preset?: MotionPreset;
	readonly duration?: number;
	readonly ease?: string;
	readonly delay?: number;
}

export interface PageTransitionHooks {
	readonly onBeforeLeave?: (from: Element, to: Element) => void | Promise<void>;
	readonly onLeave?: (from: Element, done: () => void) => void;
	readonly onBeforeEnter?: (to: Element) => void | Promise<void>;
	readonly onEnter?: (to: Element, done: () => void) => void;
	readonly onAfterEnter?: (to: Element) => void;
}

export interface IndonesiaTransitionConfig {
	readonly preset?: MotionPreset;
	readonly duration?: number;
	readonly ease?: string;
	/** Use native View Transitions API when available (default: true) */
	readonly useViewTransition?: boolean;
	/** Shared element selectors for matched-element transitions */
	readonly sharedElements?: readonly string[];
	readonly hooks?: PageTransitionHooks;
}

export interface SharedElementConfig {
	readonly id: string;
	readonly selector: string;
	readonly duration?: number;
	readonly ease?: string;
}
