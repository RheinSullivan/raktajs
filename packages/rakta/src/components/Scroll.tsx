import React, {
	type AnchorHTMLAttributes,
	type CSSProperties,
	type HTMLAttributes,
	type KeyboardEvent,
	type MouseEvent,
	type ReactElement,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Rakta.js GunungjatiScroll - Named after Sunan Gunung Jati, the iconic
// landmark and wali songo figure of Cirebon, West Java.
// Smooth scroll navigation: <scroll to="section-id"> and <anchor id="section-id">
// ─────────────────────────────────────────────────────────────────────────────

// ─── Scroll Options ──────────────────────────────────────────────────────────

export interface GunungjatiScrollOptions {
	/** Offset in pixels from the top of the target element (default: 0) */
	readonly offset?: number;
	/** Scroll duration in milliseconds (default: 600) */
	readonly duration?: number;
	/** CSS easing function (default: "cubic-bezier(0.4, 0, 0.2, 1)") */
	readonly easing?: string;
	/** Whether to update the browser URL hash (default: false) */
	readonly updateHash?: boolean;
}

export type SintrenOptions = GunungjatiScrollOptions;

// ─── Scroll Component Props ───────────────────────────────────────────────────

export interface ScrollProps
	extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
	/** The id of the target marker to navigate to */
	readonly to: string;
	/** Pixel offset from top of the target (default: 0) */
	readonly offset?: number;
	/** Duration in milliseconds (default: 600) */
	readonly duration?: number;
	/** CSS easing (default: "cubic-bezier(0.4, 0, 0.2, 1)") */
	readonly easing?: string;
	/** Update the URL hash on scroll (default: false) */
	readonly updateHash?: boolean;
	/** Extra class applied when target section is in viewport */
	readonly activeClassName?: string;
	readonly children: ReactNode;
}

// ─── Anchor Component Props ───────────────────────────────────────────────────

export interface AnchorProps extends HTMLAttributes<HTMLElement> {
	/** The id used as a Sintren target marker */
	readonly id: string;
	readonly children?: ReactNode;
	readonly style?: CSSProperties;
}

// ─── Scroll Utility ───────────────────────────────────────────────────────────

function getScrollTarget(id: string): Element | null {
	if (typeof document === "undefined") return null;
	return document.getElementById(id);
}

function resolveEasing(easing: string): (t: number) => number {
	// Predefined named easings
	const presets: Record<string, (t: number) => number> = {
		linear: (t) => t,
		ease: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
		"ease-in": (t) => t * t * t,
		"ease-out": (t) => 1 - (1 - t) ** 3,
		"ease-in-out": (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
	};

	if (easing in presets) {
		return presets[easing] as (t: number) => number;
	}

	// Default: smooth cubic
	return (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
}

function smoothScrollTo(
	targetElement: Element,
	options: Required<GunungjatiScrollOptions>,
): void {
	if (typeof window === "undefined") return;

	const targetRect = targetElement.getBoundingClientRect();
	const startY = window.scrollY;
	const targetY = startY + targetRect.top - options.offset;
	const distance = targetY - startY;
	const easingFn = resolveEasing(options.easing);

	let startTime: number | null = null;

	function step(currentTime: number): void {
		if (startTime === null) startTime = currentTime;

		const elapsed = currentTime - startTime;
		const progress = Math.min(elapsed / options.duration, 1);
		const easedProgress = easingFn(progress);

		window.scrollTo(0, startY + distance * easedProgress);

		if (progress < 1) {
			window.requestAnimationFrame(step);
		} else if (options.updateHash) {
			window.history.replaceState(null, "", `#${targetElement.id}`);
		}
	}

	window.requestAnimationFrame(step);
}

// ─── Programmatic Hook ────────────────────────────────────────────────────────

/**
 * useScrollTo - programmatic smooth navigation hook.
 *
 * @example
 * const scrollTo = useScrollTo();
 * scrollTo("contact", { offset: 80 });
 */
export function useScrollTo(
	defaultOptions?: GunungjatiScrollOptions,
): (id: string, overrides?: GunungjatiScrollOptions) => void {
	return useCallback(
		(id: string, overrides?: GunungjatiScrollOptions) => {
			const target = getScrollTarget(id);
			if (!target) return;

			smoothScrollTo(target, {
				offset: overrides?.offset ?? defaultOptions?.offset ?? 0,
				duration: overrides?.duration ?? defaultOptions?.duration ?? 600,
				easing: overrides?.easing ?? defaultOptions?.easing ?? "ease-in-out",
				updateHash:
					overrides?.updateHash ?? defaultOptions?.updateHash ?? false,
			});
		},
		[defaultOptions],
	);
}

// ─── <scroll to=""> Component ─────────────────────────────────────────────────

type ScrollElementAttributes = Omit<
	AnchorHTMLAttributes<HTMLAnchorElement>,
	"href"
> & {
	readonly to: string;
};

function renderScrollElement(
	attributes: ScrollElementAttributes,
	children: ReactNode,
): ReactElement {
	return React.createElement("scroll", attributes, children);
}

/**
 * Scroll - backward-compatible smooth navigation trigger component.
 *
 * @example
 * <Scroll to="about" offset={80}>
 *   Go to About
 * </Scroll>
 */
export function Scroll({
	to,
	offset = 0,
	duration = 600,
	easing = "ease-in-out",
	updateHash = false,
	activeClassName,
	className,
	children,
	onClick,
	onKeyDown,
	style,
	...restAttributes
}: ScrollProps): ReactElement {
	const isActiveRef = useRef(false);

	const handleScroll = useCallback((): void => {
		const target = getScrollTarget(to);
		if (!target) return;

		smoothScrollTo(target, { offset, duration, easing, updateHash });
	}, [to, offset, duration, easing, updateHash]);

	const handleClick = useCallback(
		(event: MouseEvent<HTMLAnchorElement>): void => {
			onClick?.(event);
			if (event.defaultPrevented) return;
			event.preventDefault();
			handleScroll();
		},
		[onClick, handleScroll],
	);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLAnchorElement>): void => {
			onKeyDown?.(event);
			if (event.defaultPrevented || event.key !== "Enter") return;
			event.preventDefault();
			handleScroll();
		},
		[onKeyDown, handleScroll],
	);

	// Active detection via IntersectionObserver
	useEffect(() => {
		if (!activeClassName) return;
		if (typeof window === "undefined") return;

		const target = getScrollTarget(to);
		if (!target) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					isActiveRef.current = entry.isIntersecting;
				}
			},
			{ threshold: 0.5 },
		);

		observer.observe(target);
		return () => observer.disconnect();
	}, [to, activeClassName]);

	const resolvedClassName = [
		className,
		activeClassName && isActiveRef.current ? activeClassName : undefined,
	]
		.filter(Boolean)
		.join(" ");

	const scrollAttributes: ScrollElementAttributes = {
		...restAttributes,
		to,
		onClick: handleClick,
		onKeyDown: handleKeyDown,
		role: "button",
		tabIndex: 0,
	};

	if (resolvedClassName) {
		scrollAttributes.className = resolvedClassName;
	}

	if (style) {
		scrollAttributes.style = style;
	}

	return renderScrollElement(scrollAttributes, children);
}

// ─── <anchor id=""> Component ─────────────────────────────────────────────────

/**
 * Anchor - backward-compatible target marker component.
 *
 * @example
 * <Anchor id="about">
 *   <h2>About Us</h2>
 * </Anchor>
 */
export function Anchor({
	id,
	children,
	style,
	...restAttributes
}: AnchorProps): ReactElement {
	return React.createElement(
		"anchor",
		{
			...restAttributes,
			id,
			style: {
				display: "block",
				...style,
			},
		},
		children,
	);
}

// ─── Cirebon Cultural Identity Exports ─────────────────────────────────────────
// Named after Sintren - the mesmerizing, mystical traditional folk performance
// art of Cirebon, flowing smoothly with rhythmic elegance.

/** Sintren: smooth in-page navigation trigger. */
export const Sintren = Scroll;

/** Paksi: target marker for Sintren, named after Paksi Naga Liman. */
export const Paksi = Anchor;

/** useSintren: programmatic smooth scroll hook */
export const useSintren = useScrollTo;

export default Scroll;
