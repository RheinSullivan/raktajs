import React, {
	type AnchorHTMLAttributes,
	type CSSProperties,
	type KeyboardEvent,
	type MouseEvent,
	type ReactElement,
	type ReactNode,
	useCallback,
	useEffect,
} from "react";

export interface ClickProps
	extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
	readonly to: string;
	readonly prefetch?: boolean;
	readonly replace?: boolean;
	readonly activeClassName?: string;
	readonly children: ReactNode;
}

type ClickElementAttributes = Omit<
	AnchorHTMLAttributes<HTMLAnchorElement>,
	"href"
> & {
	readonly to: string;
};

interface NavigationState {
	readonly source: "rakta-click";
	readonly to: string;
}

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>): boolean {
	return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

function isExternalTo(to: string): boolean {
	return (
		to.startsWith("http://") ||
		to.startsWith("https://") ||
		to.startsWith("//") ||
		to.startsWith("mailto:") ||
		to.startsWith("tel:")
	);
}

function getCurrentPathname(): string {
	if (typeof window === "undefined") {
		return "/";
	}

	return window.location.pathname;
}

function getCleanPathname(to: string): string {
	const [pathname] = to.split(/[?#]/);

	if (pathname && pathname.length > 0) {
		return pathname;
	}

	return "/";
}

function getPathnameFromTo(to: string): string {
	const cleanPathname = getCleanPathname(to);

	if (typeof window === "undefined") {
		return cleanPathname;
	}

	try {
		return new URL(to, window.location.origin).pathname;
	} catch {
		return cleanPathname;
	}
}

function createNavigationState(to: string): NavigationState {
	return {
		source: "rakta-click",
		to,
	};
}

function navigate(to: string, shouldReplace: boolean): void {
	if (typeof window === "undefined") {
		return;
	}

	const navigationState = createNavigationState(to);

	if (shouldReplace) {
		window.history.replaceState(navigationState, "", to);
	} else {
		window.history.pushState(navigationState, "", to);
	}

	window.dispatchEvent(
		new PopStateEvent("popstate", {
			state: navigationState,
		}),
	);
}

function openExternalTo(to: string, target: string): void {
	if (typeof window === "undefined") {
		return;
	}

	if (target === "_blank") {
		window.open(to, "_blank", "noopener,noreferrer");
		return;
	}

	window.location.assign(to);
}

function prefetchPage(to: string): void {
	if (typeof window === "undefined" || typeof document === "undefined") {
		return;
	}

	const targetUrl = new URL(to, window.location.origin).href;
	const existingLinks = Array.from(
		document.querySelectorAll<HTMLLinkElement>('link[rel="prefetch"]'),
	);

	const alreadyPrefetched = existingLinks.some(
		(link) => link.href === targetUrl,
	);

	if (alreadyPrefetched) {
		return;
	}

	const link = document.createElement("link");

	link.rel = "prefetch";
	link.href = targetUrl;
	link.as = "document";

	document.head.appendChild(link);
}

function mergeClassNames(
	className: string | undefined,
	activeClassName: string | undefined,
	isActive: boolean,
): string {
	const classNames: string[] = [];

	if (className && className.length > 0) {
		classNames.push(className);
	}

	if (isActive && activeClassName && activeClassName.length > 0) {
		classNames.push(activeClassName);
	}

	return classNames.join(" ");
}

function applyClassName(
	clickAttributes: ClickElementAttributes,
	className: string,
): void {
	if (className.length === 0) {
		return;
	}

	clickAttributes.className = className;
}

function applyStyle(
	clickAttributes: ClickElementAttributes,
	style: CSSProperties | undefined,
): void {
	if (!style) {
		return;
	}

	clickAttributes.style = style;
}

function applyInternalAttributes(
	clickAttributes: ClickElementAttributes,
	target: AnchorHTMLAttributes<HTMLAnchorElement>["target"],
	rel: string | undefined,
	isActive: boolean,
): void {
	if (target) {
		clickAttributes.target = target;
	}

	if (rel && rel.length > 0) {
		clickAttributes.rel = rel;
	}

	if (isActive) {
		clickAttributes["aria-current"] = "page";
	}
}

function applyExternalAttributes(
	clickAttributes: ClickElementAttributes,
	target: AnchorHTMLAttributes<HTMLAnchorElement>["target"],
	rel: string | undefined,
): void {
	clickAttributes.target = target ?? "_blank";
	clickAttributes.rel = rel && rel.length > 0 ? rel : "noopener noreferrer";
}

function renderClickElement(
	attributes: ClickElementAttributes,
	children: ReactNode,
): ReactElement {
	return React.createElement("click", attributes, children);
}

export function Click({
	to,
	prefetch = false,
	replace = false,
	activeClassName,
	className,
	children,
	onClick,
	onKeyDown,
	style,
	target,
	rel,
	...restAttributes
}: ClickProps): ReactElement {
	const isExternal = isExternalTo(to);
	const isActive =
		!isExternal && getCurrentPathname() === getPathnameFromTo(to);

	const resolvedClassName = mergeClassNames(
		className,
		activeClassName,
		isActive,
	);

	useEffect(() => {
		if (!prefetch || isExternal) {
			return;
		}

		prefetchPage(to);
	}, [prefetch, isExternal, to]);

	const handleClick = useCallback(
		(event: MouseEvent<HTMLAnchorElement>): void => {
			onClick?.(event);

			if (event.defaultPrevented || isModifiedEvent(event)) {
				return;
			}

			if (isExternal) {
				event.preventDefault();
				openExternalTo(to, target ?? "_blank");
				return;
			}

			if (target === "_blank") {
				return;
			}

			event.preventDefault();
			navigate(to, replace);
		},
		[isExternal, onClick, replace, target, to],
	);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLAnchorElement>): void => {
			onKeyDown?.(event);

			if (event.defaultPrevented || event.key !== "Enter") {
				return;
			}

			if (isExternal) {
				event.preventDefault();
				openExternalTo(to, target ?? "_blank");
				return;
			}

			if (target === "_blank") {
				return;
			}

			event.preventDefault();
			navigate(to, replace);
		},
		[isExternal, onKeyDown, replace, target, to],
	);

	const clickAttributes: ClickElementAttributes = {
		...restAttributes,
		to,
		onClick: handleClick,
		onKeyDown: handleKeyDown,
	};

	applyClassName(clickAttributes, resolvedClassName);
	applyStyle(clickAttributes, style);

	if (isExternal) {
		applyExternalAttributes(clickAttributes, target, rel);
	} else {
		applyInternalAttributes(clickAttributes, target, rel, isActive);
	}

	return renderClickElement(clickAttributes, children);
}

export default Click;
