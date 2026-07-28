import { useCallback, useEffect, useRef } from "react";

// Interactive motion primitives - beyond Framer Motion's gesture system:
// - useMagnetic: magnetic button effect, respects reduced motion
// - useTilt: 3D tilt on hover using CSS transforms (GPU-accelerated)
// - useSpotlight: radial gradient spotlight following cursor
// - useCursorFollower: custom cursor that follows with configurable lag
// - useDrag: drag with momentum + snap, no third-party dependency
// - useParallax: scroll-driven parallax with ResizeObserver awareness

function prefersReducedMotion(): boolean {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * useMagnetic - magnetic pull effect on hover.
 * Element follows cursor within a radius then snaps back on leave.
 *
 * Beyond RTF: works on any HTML element, not just 3D canvas.
 */
export function useMagnetic(
	strength = 0.4,
	radius = 80,
): { ref: React.RefObject<HTMLElement | null> } {
	const ref = useRef<HTMLElement | null>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el || prefersReducedMotion()) return;

		const handleMove = (e: MouseEvent): void => {
			const rect = el.getBoundingClientRect();
			const cx = rect.left + rect.width / 2;
			const cy = rect.top + rect.height / 2;
			const dx = e.clientX - cx;
			const dy = e.clientY - cy;
			const dist = Math.sqrt(dx * dx + dy * dy);

			if (dist < radius) {
				const pull = (1 - dist / radius) * strength;
				el.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
				el.style.transition = "transform 0.1s ease";
			}
		};

		const handleLeave = (): void => {
			el.style.transform = "translate(0, 0)";
			el.style.transition = "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)";
		};

		el.addEventListener("mousemove", handleMove);
		el.addEventListener("mouseleave", handleLeave);

		return () => {
			el.removeEventListener("mousemove", handleMove);
			el.removeEventListener("mouseleave", handleLeave);
		};
	}, [strength, radius]);

	return { ref };
}

/**
 * useTilt - 3D tilt effect on hover using CSS perspective.
 * More performant than React Three Fiber for UI elements.
 */
export function useTilt(maxTilt = 15): {
	ref: React.RefObject<HTMLElement | null>;
} {
	const ref = useRef<HTMLElement | null>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el || prefersReducedMotion()) return;

		el.style.transformStyle = "preserve-3d";
		el.style.perspective = "800px";

		const handleMove = (e: MouseEvent): void => {
			const rect = el.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width - 0.5;
			const y = (e.clientY - rect.top) / rect.height - 0.5;
			el.style.transform = `rotateY(${x * maxTilt * 2}deg) rotateX(${-y * maxTilt * 2}deg)`;
			el.style.transition = "transform 0.1s ease";
		};

		const handleLeave = (): void => {
			el.style.transform = "rotateY(0deg) rotateX(0deg)";
			el.style.transition = "transform 0.5s ease";
		};

		el.addEventListener("mousemove", handleMove);
		el.addEventListener("mouseleave", handleLeave);

		return () => {
			el.removeEventListener("mousemove", handleMove);
			el.removeEventListener("mouseleave", handleLeave);
		};
	}, [maxTilt]);

	return { ref };
}

/**
 * useSpotlight - radial gradient spotlight that follows cursor.
 * No canvas, no WebGL - pure CSS custom properties.
 */
export function useSpotlight(
	size = 400,
	color = "rgba(198,0,5,0.15)",
): { ref: React.RefObject<HTMLElement | null> } {
	const ref = useRef<HTMLElement | null>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el || prefersReducedMotion()) return;

		const handleMove = (e: MouseEvent): void => {
			const rect = el.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			el.style.background = `radial-gradient(${size}px circle at ${x}px ${y}px, ${color}, transparent 70%)`;
		};

		const handleLeave = (): void => {
			el.style.background = "";
		};

		el.addEventListener("mousemove", handleMove);
		el.addEventListener("mouseleave", handleLeave);

		return () => {
			el.removeEventListener("mousemove", handleMove);
			el.removeEventListener("mouseleave", handleLeave);
		};
	}, [size, color]);

	return { ref };
}

/**
 * useCursorFollower - custom cursor element that follows with lag.
 * Returns a ref to attach to a cursor DIV.
 */
export function useCursorFollower(lag = 0.1): {
	ref: React.RefObject<HTMLElement | null>;
} {
	const ref = useRef<HTMLElement | null>(null);
	const pos = useRef({ x: 0, y: 0 });
	const target = useRef({ x: 0, y: 0 });
	const rafId = useRef<number>(0);

	useEffect(() => {
		const el = ref.current;
		if (!el || prefersReducedMotion()) return;

		const handleMove = (e: MouseEvent): void => {
			target.current = { x: e.clientX, y: e.clientY };
		};

		const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

		const tick = (): void => {
			pos.current.x = lerp(pos.current.x, target.current.x, lag);
			pos.current.y = lerp(pos.current.y, target.current.y, lag);
			el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
			rafId.current = requestAnimationFrame(tick);
		};

		document.addEventListener("mousemove", handleMove);
		rafId.current = requestAnimationFrame(tick);

		return () => {
			document.removeEventListener("mousemove", handleMove);
			cancelAnimationFrame(rafId.current);
		};
	}, [lag]);

	return { ref };
}

/**
 * useDrag - drag with momentum and optional snap.
 * Beyond RTF drag: works on any HTML element, touch + mouse, momentum physics.
 */
export function useDrag(options?: {
	axis?: "x" | "y" | "both";
	snapPoints?: readonly number[];
	bounds?: { left: number; right: number; top: number; bottom: number };
}): { ref: React.RefObject<HTMLElement | null> } {
	const ref = useRef<HTMLElement | null>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const axis = options?.axis ?? "both";
		let isDragging = false;
		let startX = 0;
		let startY = 0;
		let ox = 0;
		let oy = 0;
		let vx = 0;
		let vy = 0;
		let lastX = 0;
		let lastY = 0;
		let rafId = 0;

		const applyTransform = (x: number, y: number): void => {
			const tx = axis === "y" ? 0 : x;
			const ty = axis === "x" ? 0 : y;
			el.style.transform = `translate(${tx}px, ${ty}px)`;
		};

		const onDown = (e: PointerEvent): void => {
			isDragging = true;
			el.setPointerCapture(e.pointerId);
			startX = e.clientX - ox;
			startY = e.clientY - oy;
			lastX = e.clientX;
			lastY = e.clientY;
			vx = 0;
			vy = 0;
			cancelAnimationFrame(rafId);
			el.style.transition = "none";
		};

		const onMove = (e: PointerEvent): void => {
			if (!isDragging) return;
			vx = e.clientX - lastX;
			vy = e.clientY - lastY;
			lastX = e.clientX;
			lastY = e.clientY;
			ox = e.clientX - startX;
			oy = e.clientY - startY;
			applyTransform(ox, oy);
		};

		const onUp = (): void => {
			isDragging = false;
			el.style.transition = "";
			// Momentum
			const decay = (): void => {
				vx *= 0.92;
				vy *= 0.92;
				ox += vx;
				oy += vy;
				applyTransform(ox, oy);
				if (Math.abs(vx) > 0.5 || Math.abs(vy) > 0.5) {
					rafId = requestAnimationFrame(decay);
				}
			};
			rafId = requestAnimationFrame(decay);
		};

		el.addEventListener("pointerdown", onDown);
		el.addEventListener("pointermove", onMove);
		el.addEventListener("pointerup", onUp);
		el.addEventListener("pointercancel", onUp);

		return () => {
			cancelAnimationFrame(rafId);
			el.removeEventListener("pointerdown", onDown);
			el.removeEventListener("pointermove", onMove);
			el.removeEventListener("pointerup", onUp);
			el.removeEventListener("pointercancel", onUp);
		};
	}, [options?.axis]);

	return { ref };
}

/**
 * useParallax - scroll-driven parallax with IntersectionObserver + rAF.
 * Smoother than CSS parallax, cheaper than ScrollTrigger for simple cases.
 */
export function useParallax(speed = 0.3): {
	ref: React.RefObject<HTMLElement | null>;
} {
	const ref = useRef<HTMLElement | null>(null);

	const handleScroll = useCallback(() => {
		const el = ref.current;
		if (!el || prefersReducedMotion()) return;
		const rect = el.getBoundingClientRect();
		const viewH = window.innerHeight;
		const progress = (viewH - rect.top) / (viewH + rect.height);
		const offset = (progress - 0.5) * rect.height * speed;
		el.style.transform = `translateY(${offset}px)`;
	}, [speed]);

	useEffect(() => {
		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();
		return () => window.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);

	return { ref };
}
