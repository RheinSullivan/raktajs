// MegaScape - Rakta.js 3D Scene System
//
// Named after Mega Mendung, the iconic cloud batik motif of Cirebon,
// which flows in layered depth like a 3D scene.
//
// Philosophy vs React Three Fiber:
// - RTF requires Three.js as a peer dep (always in bundle)
// - MegaScape adapts to whatever 3D library you already have
// - RTF has no built-in performance tracking
// - MegaScape emits JatiLens marks for every render frame
// - RTF requires manual ScrollTrigger integration
// - MegaScape has scroll-driven scenes as a first-class API
// - RTF re-renders on every React state change
// - MegaScape uses on-demand rendering (only renders when scene changes)
//
// Status: Experimental (v1.0.3 roadmap target)
// Three.js and related packages are optional peer dependencies.

export { clearAssetCache, loadGLTF, loadTexture } from "./loader";
export {
	createMegaScape,
	detectDeviceQuality,
	useMegaScapeScene,
	useScrollScene,
} from "./scene";
export type {
	JatiCameraConfig,
	MegaScapeConfig,
	QualityPreset,
	RenderMode,
	SceneAdapter,
	SceneDiagnostics,
	ScrollSceneConfig,
	TrusmiMaterialConfig,
} from "./types";
