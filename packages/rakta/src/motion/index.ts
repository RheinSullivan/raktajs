// Rakta.js Motion System - IndonesiaMotion
//
// Named after the vast Indonesia archipelago: a connected web of islands,
// each independent yet part of the whole - like composable motion primitives.
//
// Architecture differs from Barba.js, Framer Motion, and CSS Transitions by:
// 1. Lifecycle-aware: hooks into MegaWeave router, cancels on navigation
// 2. Composable: chain transitions, share element contexts, sequence timelines
// 3. Zero-runtime in production unless imported (full tree-shaking)
// 4. Bun-native: no browser polyfill overhead
// 5. View Transitions API first: falls back to GSAP only when needed
// 6. Measurable: all transitions emit JatiLens performance marks

export {
	useCursorFollower,
	useDrag,
	useMagnetic,
	useParallax,
	useSpotlight,
	useTilt,
} from "./interactions";
export {
	createMotionTimeline,
	definePageTransition,
	defineSharedElement,
	MOTION_PRESETS,
	usePageTransition,
	useSharedElement,
} from "./transitions";
export type {
	IndonesiaTransitionConfig,
	MotionPreset,
	MotionTarget,
	PageTransitionHooks,
	SharedElementConfig,
	TransitionPhase,
} from "./types";
export {
	animateText,
	splitText,
	useKineticText,
} from "./typography";
