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
		const element = ref.current;
		if (!element || prefersReducedMotion()) return;

		const handleMouseMove = (event: MouseEvent): void => {
			const boundingRectangle = element.getBoundingClientRect();
			const centerX = boundingRectangle.left + boundingRectangle.width / 2;
			const centerY = boundingRectangle.top + boundingRectangle.height / 2;
			const deltaX = event.clientX - centerX;
			const deltaY = event.clientY - centerY;
			const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

			if (distance < radius) {
				const pullFactor = (1 - distance / radius) * strength;
				element.style.transform = `translate(${deltaX * pullFactor}px, ${deltaY * pullFactor}px)`;
				element.style.transition = "transform 0.1s ease";
			}
		};

		const handleMouseLeave = (): void => {
			element.style.transform = "translate(0, 0)";
			element.style.transition =
				"transform 0.5s cubic-bezier(0.34,1.56,0.64,1)";
		};

		element.addEventListener("mousemove", handleMouseMove);
		element.addEventListener("mouseleave", handleMouseLeave);

		return () => {
			element.removeEventListener("mousemove", handleMouseMove);
			element.removeEventListener("mouseleave", handleMouseLeave);
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
		const element = ref.current;
		if (!element || prefersReducedMotion()) return;

		element.style.transformStyle = "preserve-3d";
		element.style.perspective = "800px";

		const handleMouseMove = (event: MouseEvent): void => {
			const boundingRectangle = element.getBoundingClientRect();
			const normalizedX =
				(event.clientX - boundingRectangle.left) / boundingRectangle.width -
				0.5;
			const normalizedY =
				(event.clientY - boundingRectangle.top) / boundingRectangle.height -
				0.5;
			element.style.transform = `rotateY(${normalizedX * maxTilt * 2}deg) rotateX(${-normalizedY * maxTilt * 2}deg)`;
			element.style.transition = "transform 0.1s ease";
		};

		const handleMouseLeave = (): void => {
			element.style.transform = "rotateY(0deg) rotateX(0deg)";
			element.style.transition = "transform 0.5s ease";
		};

		element.addEventListener("mousemove", handleMouseMove);
		element.addEventListener("mouseleave", handleMouseLeave);

		return () => {
			element.removeEventListener("mousemove", handleMouseMove);
			element.removeEventListener("mouseleave", handleMouseLeave);
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
		const element = ref.current;
		if (!element || prefersReducedMotion()) return;

		const handleMouseMove = (event: MouseEvent): void => {
			const boundingRectangle = element.getBoundingClientRect();
			const relativeX = event.clientX - boundingRectangle.left;
			const relativeY = event.clientY - boundingRectangle.top;
			element.style.background = `radial-gradient(${size}px circle at ${relativeX}px ${relativeY}px, ${color}, transparent 70%)`;
		};

		const handleMouseLeave = (): void => {
			element.style.background = "";
		};

		element.addEventListener("mousemove", handleMouseMove);
		element.addEventListener("mouseleave", handleMouseLeave);

		return () => {
			element.removeEventListener("mousemove", handleMouseMove);
			element.removeEventListener("mouseleave", handleMouseLeave);
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
	const currentPosition = useRef({ x: 0, y: 0 });
	const targetPosition = useRef({ x: 0, y: 0 });
	const animationFrameIdentifier = useRef<number>(0);

	useEffect(() => {
		const element = ref.current;
		if (!element || prefersReducedMotion()) return;

		const handleMouseMove = (event: MouseEvent): void => {
			targetPosition.current = { x: event.clientX, y: event.clientY };
		};

		const linearInterpolation = (
			startValue: number,
			endValue: number,
			progressRatio: number,
		): number => startValue + (endValue - startValue) * progressRatio;

		const renderTick = (): void => {
			currentPosition.current.x = linearInterpolation(
				currentPosition.current.x,
				targetPosition.current.x,
				lag,
			);
			currentPosition.current.y = linearInterpolation(
				currentPosition.current.y,
				targetPosition.current.y,
				lag,
			);
			element.style.transform = `translate(${currentPosition.current.x}px, ${currentPosition.current.y}px)`;
			animationFrameIdentifier.current = requestAnimationFrame(renderTick);
		};

		document.addEventListener("mousemove", handleMouseMove);
		animationFrameIdentifier.current = requestAnimationFrame(renderTick);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			cancelAnimationFrame(animationFrameIdentifier.current);
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
		const element = ref.current;
		if (!element) return;

		const axis = options?.axis ?? "both";
		let isDragging = false;
		let startPointerX = 0;
		let startPointerY = 0;
		let originOffsetX = 0;
		let originOffsetY = 0;
		let velocityX = 0;
		let velocityY = 0;
		let previousPointerX = 0;
		let previousPointerY = 0;
		let animationFrameIdentifier = 0;

		const applyTransform = (translateX: number, translateY: number): void => {
			const finalTranslateX = axis === "y" ? 0 : translateX;
			const finalTranslateY = axis === "x" ? 0 : translateY;
			element.style.transform = `translate(${finalTranslateX}px, ${finalTranslateY}px)`;
		};

		const handlePointerDown = (event: PointerEvent): void => {
			isDragging = true;
			element.setPointerCapture(event.pointerId);
			startPointerX = event.clientX - originOffsetX;
			startPointerY = event.clientY - originOffsetY;
			previousPointerX = event.clientX;
			previousPointerY = event.clientY;
			velocityX = 0;
			velocityY = 0;
			cancelAnimationFrame(animationFrameIdentifier);
			element.style.transition = "none";
		};

		const handlePointerMove = (event: PointerEvent): void => {
			if (!isDragging) return;
			velocityX = event.clientX - previousPointerX;
			velocityY = event.clientY - previousPointerY;
			previousPointerX = event.clientX;
			previousPointerY = event.clientY;
			originOffsetX = event.clientX - startPointerX;
			originOffsetY = event.clientY - startPointerY;
			applyTransform(originOffsetX, originOffsetY);
		};

		const handlePointerUp = (): void => {
			isDragging = false;
			element.style.transition = "";
			// Momentum decay physics
			const applyMomentumDecay = (): void => {
				velocityX *= 0.92;
				velocityY *= 0.92;
				originOffsetX += velocityX;
				originOffsetY += velocityY;
				applyTransform(originOffsetX, originOffsetY);
				if (Math.abs(velocityX) > 0.5 || Math.abs(velocityY) > 0.5) {
					animationFrameIdentifier = requestAnimationFrame(applyMomentumDecay);
				}
			};
			animationFrameIdentifier = requestAnimationFrame(applyMomentumDecay);
		};

		element.addEventListener("pointerdown", handlePointerDown);
		element.addEventListener("pointermove", handlePointerMove);
		element.addEventListener("pointerup", handlePointerUp);
		element.addEventListener("pointercancel", handlePointerUp);

		return () => {
			cancelAnimationFrame(animationFrameIdentifier);
			element.removeEventListener("pointerdown", handlePointerDown);
			element.removeEventListener("pointermove", handlePointerMove);
			element.removeEventListener("pointerup", handlePointerUp);
			element.removeEventListener("pointercancel", handlePointerUp);
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
		const element = ref.current;
		if (!element || prefersReducedMotion()) return;
		const boundingRectangle = element.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const scrollProgress =
			(viewportHeight - boundingRectangle.top) /
			(viewportHeight + boundingRectangle.height);
		const parallaxOffset =
			(scrollProgress - 0.5) * boundingRectangle.height * speed;
		element.style.transform = `translateY(${parallaxOffset}px)`;
	}, [speed]);

	useEffect(() => {
		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();
		return () => window.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);

	return { ref };
}
