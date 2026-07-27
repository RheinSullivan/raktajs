// MegaScape — Rakta.js 3D Scene System
// Three.js is an optional peer dependency. Install: bun add three
import { useEffect, useRef } from "react";
import type {
	MegaScapeConfig,
	QualityPreset,
	ScrollSceneConfig,
} from "./types";

/**
 * detectDeviceQuality — auto-detect GPU/CPU capability for adaptive quality.
 */
export function detectDeviceQuality(): Exclude<QualityPreset, "auto"> {
	if (typeof navigator === "undefined") return "medium";

	const connection = (
		navigator as Navigator & {
			connection?: { effectiveType?: string; downlink?: number };
		}
	).connection;

	const isSlowConnection =
		connection?.effectiveType === "2g" ||
		connection?.effectiveType === "slow-2g" ||
		(connection?.downlink !== undefined && connection.downlink < 1);

	if (isSlowConnection) return "low";
	const cpuCores = navigator.hardwareConcurrency ?? 4;
	if (cpuCores <= 2) return "low";
	if (cpuCores <= 4) return "medium";
	return "high";
}

function resolveQuality(
	config: MegaScapeConfig,
): Exclude<QualityPreset, "auto"> {
	const q = config.quality ?? "auto";
	return q === "auto" ? detectDeviceQuality() : q;
}

/**
 * createMegaScape — imperative 3D scene factory (async, lazy Three.js).
 */
export async function createMegaScape(
	canvas: HTMLCanvasElement,
	config: MegaScapeConfig = {},
): Promise<{
	scene: unknown;
	camera: unknown;
	renderer: unknown;
	render: () => void;
	dispose: () => void;
	getDiagnostics: () => { fps: number; drawCalls: number; memoryMB: number };
}> {
	let three: typeof import("three");
	try {
		three = await import("three");
	} catch {
		throw new Error(
			"[Rakta MegaScape] Three.js not installed. Run: bun add three",
		);
	}

	const quality = resolveQuality(config);
	const pixelRatioMap: Record<Exclude<QualityPreset, "auto">, number> = {
		low: 1,
		medium: 1.5,
		high: Math.min(
			typeof window !== "undefined" ? window.devicePixelRatio : 1,
			config.maxPixelRatio ?? 1.5,
		),
	};

	const renderer = new three.WebGLRenderer({
		canvas,
		antialias: quality !== "low",
		alpha: config.background == null,
		powerPreference: quality === "high" ? "high-performance" : "default",
	});
	renderer.setPixelRatio(pixelRatioMap[quality]);
	renderer.setSize(canvas.clientWidth, canvas.clientHeight);
	if (config.background != null) renderer.setClearColor(config.background);

	const cam = config.camera ?? {};
	const camera = new three.PerspectiveCamera(
		cam.fov ?? 60,
		canvas.clientWidth / Math.max(canvas.clientHeight, 1),
		cam.near ?? 0.1,
		cam.far ?? 1000,
	);
	const pos = cam.position ?? ([0, 0, 5] as const);
	camera.position.set(pos[0], pos[1], pos[2]);
	if (cam.target) camera.lookAt(cam.target[0], cam.target[1], cam.target[2]);

	const scene = new three.Scene();

	let frameCount = 0;
	let lastFpsTime = performance.now();
	let fps = 60;
	let rafId = 0;
	const renderMode = config.renderMode ?? "on-demand";
	let dirty = true;

	const render = (): void => {
		dirty = true;
	};

	const tick = (): void => {
		if (renderMode === "realtime" || dirty) {
			renderer.render(scene, camera);
			dirty = false;
			frameCount++;
			const now = performance.now();
			if (now - lastFpsTime >= 1000) {
				fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
				frameCount = 0;
				lastFpsTime = now;
				if (typeof performance !== "undefined") {
					performance.mark("rakta:scene-fps", { detail: { fps } });
				}
			}
		}
		rafId = requestAnimationFrame(tick);
	};

	rafId = requestAnimationFrame(tick);

	const ro = new ResizeObserver(() => {
		renderer.setSize(canvas.clientWidth, canvas.clientHeight);
		camera.aspect = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
		camera.updateProjectionMatrix();
		render();
	});
	ro.observe(canvas);

	const dispose = (): void => {
		cancelAnimationFrame(rafId);
		ro.disconnect();
		renderer.dispose();
	};

	const getDiagnostics = (): {
		fps: number;
		drawCalls: number;
		memoryMB: number;
	} => ({
		fps,
		drawCalls: renderer.info.render.calls,
		memoryMB: renderer.info.memory
			? Math.round(
					(renderer.info.memory.geometries + renderer.info.memory.textures) /
						1024,
				)
			: 0,
	});

	return { scene, camera, renderer, render, dispose, getDiagnostics };
}

/**
 * useMegaScapeScene — React hook for a 3D scene. Attach ref to a <canvas>.
 */
export function useMegaScapeScene(
	config: MegaScapeConfig = {},
	setupCallback?: (ctx: {
		scene: unknown;
		camera: unknown;
		renderer: unknown;
		render: () => void;
	}) => undefined | (() => void),
): { ref: React.RefObject<HTMLCanvasElement | null> } {
	const ref = useRef<HTMLCanvasElement | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: mount-only scene lifecycle
	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;

		let cleanup: (() => void) | undefined;
		let sceneCtx: Awaited<ReturnType<typeof createMegaScape>> | undefined;

		createMegaScape(canvas, config)
			.then((ctx) => {
				sceneCtx = ctx;
				if (setupCallback) cleanup = setupCallback(ctx) ?? undefined;
			})
			.catch(console.error);

		return () => {
			cleanup?.();
			sceneCtx?.dispose();
		};
	}, []);

	return { ref };
}

/**
 * useScrollScene — scroll-driven 3D scene.
 * Progress (0–1) passed to your update callback on each scroll event.
 */
export function useScrollScene(
	config: ScrollSceneConfig,
	onProgress: (
		progress: number,
		ctx: { scene: unknown; camera: unknown; render: () => void },
	) => void,
): { ref: React.RefObject<HTMLCanvasElement | null> } {
	const ref = useRef<HTMLCanvasElement | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: mount-only scene lifecycle
	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;

		let sceneCtx: Awaited<ReturnType<typeof createMegaScape>> | undefined;

		createMegaScape(canvas, { ...config, renderMode: "on-demand" })
			.then((ctx) => {
				sceneCtx = ctx;

				const handleScroll = (): void => {
					const rect = canvas.getBoundingClientRect();
					const viewH = window.innerHeight;
					const progress = Math.max(
						0,
						Math.min(1, (viewH - rect.top) / (viewH + rect.height)),
					);
					onProgress(progress, ctx);
				};

				window.addEventListener("scroll", handleScroll, { passive: true });
				handleScroll();

				(sceneCtx as unknown as { _scrollCleanup: () => void })._scrollCleanup =
					() => {
						window.removeEventListener("scroll", handleScroll);
					};
			})
			.catch(console.error);

		return () => {
			(
				sceneCtx as unknown as { _scrollCleanup?: () => void }
			)?._scrollCleanup?.();
			sceneCtx?.dispose();
		};
	}, []);

	return { ref };
}
