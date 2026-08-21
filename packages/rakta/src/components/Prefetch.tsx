import React, {
	type HTMLAttributes,
	type ReactElement,
	type ReactNode,
	useCallback,
	useEffect,
} from "react";

export type PrefetchAs = "document" | "fetch" | "script" | "style" | "image";
export type PrefetchWhen = "mount" | "hover";

export interface PrefetchProps
	extends Omit<HTMLAttributes<HTMLElement>, "children"> {
	readonly to: string;
	readonly as?: PrefetchAs;
	readonly when?: PrefetchWhen;
	readonly children?: ReactNode;
}

function appendPrefetchLink(to: string, as: PrefetchAs): void {
	if (typeof document === "undefined" || typeof window === "undefined") {
		return;
	}

	const href = new URL(to, window.location.origin).href;
	const existing = document.querySelector<HTMLLinkElement>(
		`link[rel="prefetch"][href="${href}"]`,
	);

	if (existing) {
		return;
	}

	const link = document.createElement("link");
	link.rel = "prefetch";
	link.href = href;
	link.as = as;
	document.head.appendChild(link);
}

export function Prefetch({
	to,
	as = "document",
	when = "mount",
	children = null,
	onMouseEnter,
	...rest
}: PrefetchProps): ReactElement {
	useEffect(() => {
		if (when === "mount") {
			appendPrefetchLink(to, as);
		}
	}, [as, to, when]);

	const handleMouseEnter = useCallback(
		(event: React.MouseEvent<HTMLElement>) => {
			onMouseEnter?.(event);

			if (!event.defaultPrevented && when === "hover") {
				appendPrefetchLink(to, as);
			}
		},
		[as, onMouseEnter, to, when],
	);

	return React.createElement(
		"prefetch",
		{ ...rest, to, as, when, onMouseEnter: handleMouseEnter },
		children,
	);
}

export default Prefetch;
