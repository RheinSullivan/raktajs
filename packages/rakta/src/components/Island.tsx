import React, {
	type HTMLAttributes,
	type ReactElement,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";

export type IslandMode = "load" | "idle" | "visible";

export interface IslandProps
	extends Omit<HTMLAttributes<HTMLElement>, "children"> {
	readonly children: ReactNode;
	readonly fallback?: ReactNode;
	readonly mode?: IslandMode;
	readonly rootMargin?: string;
}

function shouldRenderImmediately(mode: IslandMode): boolean {
	return mode === "load" || typeof window === "undefined";
}

export function Island({
	children,
	fallback = null,
	mode = "load",
	rootMargin = "200px",
	...rest
}: IslandProps): ReactElement {
	const islandRef = useRef<HTMLElement>(null);
	const [isReady, setIsReady] = useState(() => shouldRenderImmediately(mode));

	useEffect(() => {
		if (isReady) {
			return;
		}

		if (mode === "idle") {
			const requestIdle =
				window.requestIdleCallback ??
				((callback) => window.setTimeout(callback, 1));
			const cancelIdle =
				window.cancelIdleCallback ?? ((handle) => window.clearTimeout(handle));
			const idleHandle = requestIdle(() => setIsReady(true));

			return () => cancelIdle(idleHandle);
		}

		if (mode === "visible") {
			const target = islandRef.current;

			if (!target || typeof IntersectionObserver === "undefined") {
				setIsReady(true);
				return;
			}

			const observer = new IntersectionObserver(
				(entries) => {
					if (entries.some((entry) => entry.isIntersecting)) {
						setIsReady(true);
						observer.disconnect();
					}
				},
				{ rootMargin },
			);

			observer.observe(target);
			return () => observer.disconnect();
		}

		setIsReady(true);
	}, [isReady, mode, rootMargin]);

	return React.createElement(
		"island",
		{
			...rest,
			ref: islandRef,
			mode,
			"data-rakta-ready": isReady ? "true" : "false",
		},
		isReady ? children : fallback,
	);
}

export default Island;
