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

//
// Rakta.js PanturaScroll - Named after Jalur Pantura (Pantai Utara / North
// Coast Road), the legendary highway connecting coastal cities of Java.
// Smooth scroll navigation: <pantura to="section-id"> and <reborns id="section-id">
//

// GSAP Type Reference

interface GSAPInstance {
	to: (
		target: Window,
		vars: {
			scrollTo?: { y: number; autoKill?: boolean };
			duration?: number;
			ease?: string;
			onComplete?: () => void;
		},
	) => void;
}

// Options

export interface PanturaOptions {
	/** Offset in pixels from the top of the target element (default: 0) */
	readonly offset?: number;
	/** Scroll duration in milliseconds (default: 600) */
	readonly duration?: number;
	/** CSS easing function (default: "ease-in-out") */
	readonly easing?: string;
	/** Whether to update the browser URL hash (default: false) */
	readonly updateHash?: boolean;
}

// Component Props

export interface PanturaProps
	extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
	/** The id of the target Reborns marker to navigate to */
	readonly to: string;
	/** Pixel offset from top of the target (default: 0) */
	readonly offset?: number;
	/** Duration in milliseconds (default: 600) */
	readonly duration?: number;
	/** CSS easing (default: "ease-in-out") */
	readonly easing?: string;
	/** Update the URL hash on scroll (default: false) */
	readonly updateHash?: boolean;
	/** Extra class applied when target section is in viewport */
	readonly activeClassName?: string;
	readonly children: ReactNode;
}

export interface RebornsProps extends HTMLAttributes<HTMLElement> {
	/** The id used as a Pantura scroll target marker */
	readonly id: string;
	readonly children?: ReactNode;
	readonly style?: CSSProperties;
}

// Scroll Utility

function getScrollTarget(id: string): Element | null {
	if (typeof document === "undefined") return null;
	return document.getElementById(id);
}

function resolveGSAPEasing(easing: string): string {
	const map: Record<string, string> = {
		linear: "none",
		ease: "power1.inOut",
		"ease-in": "power2.in",
		"ease-out": "power2.out",
		"ease-in-out": "power2.inOut",
		"cubic-bezier(0.4, 0, 0.2, 1)": "power2.inOut",
		"cubic-bezier(0.25, 0.1, 0.25, 1)": "power1.inOut",
	};
	return map[easing] ?? "power2.inOut";
}

function resolveRAFEasing(easing: string): (t: number) => number {
	const presets: Record<string, (t: number) => number> = {
		linear: (t) => t,
		ease: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
		"ease-in": (t) => t * t * t,
		"ease-out": (t) => 1 - (1 - t) ** 3,
		"ease-in-out": (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
	};
	return (
		presets[easing] ??
		((t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2))
	);
}

function smoothScrollRAF(
	targetElement: Element,
	options: Required<PanturaOptions>,
): void {
	if (typeof window === "undefined") return;

	const targetRect = targetElement.getBoundingClientRect();
	const startY = window.scrollY;
	const targetY = startY + targetRect.top - options.offset;
	const distance = targetY - startY;
	const easingFn = resolveRAFEasing(options.easing);
	let startTime: number | null = null;

	function step(currentTime: number): void {
		if (startTime === null) startTime = currentTime;
		const elapsed = currentTime - startTime;
		const progress = Math.min(elapsed / options.duration, 1);
		window.scrollTo(0, startY + distance * easingFn(progress));
		if (progress < 1) {
			window.requestAnimationFrame(step);
		} else if (options.updateHash) {
			window.history.replaceState(null, "", `#${targetElement.id}`);
		}
	}

	window.requestAnimationFrame(step);
}

function smoothScrollTo(
	targetElement: Element,
	options: Required<PanturaOptions>,
): void {
	if (typeof window === "undefined") return;

	const gsap = (globalThis as typeof globalThis & { gsap?: GSAPInstance }).gsap;

	if (gsap) {
		const targetRect = targetElement.getBoundingClientRect();
		const targetY = window.scrollY + targetRect.top - options.offset;

		gsap.to(window, {
			scrollTo: { y: targetY, autoKill: true },
			duration: options.duration / 1000,
			ease: resolveGSAPEasing(options.easing),
			onComplete: () => {
				if (options.updateHash) {
					window.history.replaceState(null, "", `#${targetElement.id}`);
				}
			},
		});
	} else {
		smoothScrollRAF(targetElement, options);
	}
}

// usePantura Hook

/**
 * usePantura ,  programmatic smooth scroll hook.
 *
 * @example
 * const scrollTo = usePantura();
 * scrollTo("contact", { offset: 80 });
 */
export function usePantura(
	defaultOptions?: PanturaOptions,
): (id: string, overrides?: PanturaOptions) => void {
	return useCallback(
		(id: string, overrides?: PanturaOptions) => {
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

// <pantura to=""> Component

type PanturaElementAttributes = Omit<
	AnchorHTMLAttributes<HTMLAnchorElement>,
	"href"
> & {
	readonly to: string;
};

/**
 * Pantura ,  smooth scroll trigger. Named after Jalur Pantura, the iconic
 * north coast highway of Java. Navigates to a `<reborns id="">` target.
 *
 * @example
 * <Pantura to="about" offset={80}>Go to About</Pantura>
 */
export function Pantura({
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
}: PanturaProps): ReactElement {
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

	const attrs: PanturaElementAttributes = {
		...restAttributes,
		to,
		onClick: handleClick,
		onKeyDown: handleKeyDown,
		role: "button",
		tabIndex: 0,
	};

	if (resolvedClassName) attrs.className = resolvedClassName;
	if (style) attrs.style = style;

	return React.createElement("pantura", attrs, children);
}

// <reborns id=""> Component

/**
 * Reborns ,  scroll target marker. Place this around the section you want
 * `<pantura to="">` to navigate to.
 *
 * @example
 * <Reborns id="about"><h2>About Us</h2></Reborns>
 */
export function Reborns({
	id,
	children,
	style,
	...restAttributes
}: RebornsProps): ReactElement {
	return React.createElement(
		"reborns",
		{
			...restAttributes,
			id,
			style: { display: "block", ...style },
		},
		children,
	);
}

export default Pantura;
