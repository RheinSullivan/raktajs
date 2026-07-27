// TrusmiVector — Rakta.js Interactive Vector Animation System
//
// Named after Trusmi, the batik village of Cirebon whose artisans
// weave intricate patterns — like state machines weaving motion.
//
// How it goes beyond Rive:
// 1. NO proprietary .riv format — works with SVG (open standard)
// 2. State machines defined in TypeScript (type-safe, tree-shakeable)
// 3. Accessible: animations respect prefers-reduced-motion automatically
// 4. React-native: hooks instead of imperative API
// 5. GSAP-backed for production-quality easing
// 6. Zero-cost when not imported: fully tree-shakeable
// 7. JatiLens performance marks for animation frame timing
// 8. Mascot system: predefined ShrimpRun mascot states built-in

export { useImageZoom, useTrusmiGallery } from "./imageExperience";
export {
	createStateMachine,
	SHRIMP_MASCOT_STATES,
	useMascot,
	useTrusmiVector,
} from "./stateMachine";
export type {
	MascotState,
	StateMachineConfig,
	StateMachineTransition,
	TrusmiVectorConfig,
	VectorAnimationState,
} from "./types";
