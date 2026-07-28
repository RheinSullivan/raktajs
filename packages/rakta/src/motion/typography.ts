// Kinetic typography - text splitting and animation
// Beyond Rive's text capabilities: works on any DOM text, no runtime needed

/**
 * splitText - splits text content into spans for individual animation.
 * Returns { chars, words, lines } for GSAP stagger or manual animation.
 */
export function splitText(
	element: HTMLElement,
	mode: "chars" | "words" | "lines" = "chars",
): { chars: HTMLElement[]; words: HTMLElement[]; lines: HTMLElement[] } {
	const original = element.textContent ?? "";
	const chars: HTMLElement[] = [];
	const words: HTMLElement[] = [];
	const lines: HTMLElement[] = [];

	if (mode === "chars" || mode === "words") {
		element.innerHTML = "";
		const wordList = original.trim().split(/\s+/);

		for (const word of wordList) {
			const wordSpan = document.createElement("span");
			wordSpan.style.display = "inline-block";
			wordSpan.style.whiteSpace = "nowrap";
			words.push(wordSpan);

			if (mode === "chars") {
				for (const char of word) {
					const charSpan = document.createElement("span");
					charSpan.style.display = "inline-block";
					charSpan.textContent = char;
					wordSpan.appendChild(charSpan);
					chars.push(charSpan);
				}
			} else {
				wordSpan.textContent = word;
			}

			element.appendChild(wordSpan);
			element.appendChild(document.createTextNode(" "));
		}
	}

	return { chars, words, lines };
}

/**
 * animateText - animate split text with GSAP if available, CSS otherwise.
 */
export function animateText(
	elements: HTMLElement[],
	preset: "fade-up" | "fade-in" | "scale" | "wave" = "fade-up",
	options?: { stagger?: number; duration?: number; ease?: string },
): void {
	const gsap = (typeof globalThis !== "undefined" &&
		(globalThis as Record<string, unknown>).gsap) as
		| { fromTo(t: unknown, f: unknown, o: unknown): void }
		| undefined;

	const stagger = options?.stagger ?? 0.03;
	const duration = options?.duration ?? 0.6;
	const ease = options?.ease ?? "power2.out";

	if (gsap) {
		const presetMap = {
			"fade-up": { y: 20, opacity: 0 },
			"fade-in": { opacity: 0 },
			scale: { scale: 0.8, opacity: 0 },
			wave: { y: "100%", opacity: 0 },
		};
		gsap.fromTo(elements, presetMap[preset], {
			y: 0,
			opacity: 1,
			scale: 1,
			duration,
			ease,
			stagger,
		});
		return;
	}

	// CSS fallback
	for (let i = 0; i < elements.length; i++) {
		const el = elements[i];
		if (!el) continue;
		el.style.opacity = "0";
		el.style.transform = preset === "fade-up" ? "translateY(20px)" : "none";
		el.style.transition = `opacity ${duration}s ${ease}, transform ${duration}s ${ease}`;
		el.style.transitionDelay = `${i * stagger}s`;
		requestAnimationFrame(() => {
			el.style.opacity = "1";
			el.style.transform = "none";
		});
	}
}

/**
 * useKineticText - React hook for kinetic text effects.
 * Returns ref + trigger function.
 */
export function useKineticText(
	preset: "fade-up" | "fade-in" | "scale" | "wave" = "fade-up",
	options?: { stagger?: number; duration?: number },
): {
	ref: { current: HTMLElement | null };
	trigger: () => void;
} {
	const elRef: HTMLElement | null = null;
	const ref = { current: elRef };

	const trigger = (): void => {
		if (!ref.current) return;
		const { chars } = splitText(ref.current, "chars");
		animateText(chars, preset, options);
	};

	return { ref, trigger };
}
