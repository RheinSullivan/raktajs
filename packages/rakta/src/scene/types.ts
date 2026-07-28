// MegaScape - Rakta.js 3D Scene System (beyond React Three Fiber)
//
// Differences from React Three Fiber:
// 1. Lazy-loaded: zero bundle cost unless you import a 3D component
// 2. Adapter-based: works with Three.js, Babylon.js, or custom renderers
// 3. JatiLens-aware: automatic FPS tracking, memory usage, draw calls
// 4. Scroll-driven: native ScrollTrigger integration without extra setup
// 5. Adaptive quality: auto-reduces quality on low-end devices
// 6. SSR-safe: no canvas during SSR, hydrates on client
// 7. Cirebon-named: MegaScape, JatiCamera, TrusmiMaterial

export type SceneAdapter = "three" | "babylon" | "custom";
export type RenderMode = "realtime" | "on-demand" | "scroll-driven";
export type QualityPreset = "low" | "medium" | "high" | "auto";

export interface MegaScapeConfig {
	/** Canvas element or CSS selector */
	readonly target?: string | HTMLCanvasElement;
	/** 3D adapter to use (default: "three" if Three.js available) */
	readonly adapter?: SceneAdapter;
	/** Rendering strategy (default: "on-demand") */
	readonly renderMode?: RenderMode;
	/** Quality preset - "auto" detects device capability (default: "auto") */
	readonly quality?: QualityPreset;
	/** Enable JatiLens diagnostics in development (default: true in dev) */
	readonly diagnostics?: boolean;
	/** Pixel ratio cap - prevents retina overdraw (default: 1.5) */
	readonly maxPixelRatio?: number;
	/** Background color (default: transparent) */
	readonly background?: string | null;
	/** Camera config */
	readonly camera?: JatiCameraConfig;
}

export interface JatiCameraConfig {
	/** Camera type */
	readonly type?: "perspective" | "orthographic";
	/** FOV for perspective camera (default: 60) */
	readonly fov?: number;
	/** Camera position [x, y, z] */
	readonly position?: readonly [number, number, number];
	/** Look-at target [x, y, z] */
	readonly target?: readonly [number, number, number];
	readonly near?: number;
	readonly far?: number;
}

export interface TrusmiMaterialConfig {
	/** Color in hex or CSS color */
	readonly color?: string;
	readonly roughness?: number;
	readonly metalness?: number;
	readonly wireframe?: boolean;
	readonly opacity?: number;
	readonly transparent?: boolean;
	readonly emissive?: string;
	readonly emissiveIntensity?: number;
}

export interface SceneDiagnostics {
	readonly fps: number;
	readonly drawCalls: number;
	readonly triangles: number;
	readonly memoryMB: number;
	readonly renderTimeMs: number;
}

export interface ScrollSceneConfig extends MegaScapeConfig {
	/** Scroll progress drives this timeline (0–1) */
	readonly scrollProgress?: boolean;
	/** Scrub strength (default: 1 = exact, <1 = lagged) */
	readonly scrub?: number;
}
