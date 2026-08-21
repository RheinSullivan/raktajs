import React, { type ReactElement, useEffect } from "react";

export type ResourceAs =
	| "audio"
	| "document"
	| "fetch"
	| "font"
	| "image"
	| "script"
	| "style"
	| "track"
	| "video"
	| "worker";

export type ResourceRel =
	| "dns-prefetch"
	| "modulepreload"
	| "preconnect"
	| "prefetch"
	| "preload"
	| "stylesheet";

export interface ResourceProps {
	readonly href: string;
	readonly rel?: ResourceRel;
	readonly as?: ResourceAs;
	readonly crossOrigin?: "" | "anonymous" | "use-credentials";
	readonly media?: string;
	readonly type?: string;
}

function upsertResourceLink(props: ResourceProps): void {
	if (typeof document === "undefined") {
		return;
	}

	const selector = `link[rel="${props.rel ?? "preload"}"][href="${props.href}"]`;
	const existing = document.querySelector<HTMLLinkElement>(selector);
	const link = existing ?? document.createElement("link");

	link.rel = props.rel ?? "preload";
	link.href = props.href;

	if (props.as) link.as = props.as;
	if (props.crossOrigin !== undefined) link.crossOrigin = props.crossOrigin;
	if (props.media) link.media = props.media;
	if (props.type) link.type = props.type;

	if (!existing) {
		document.head.appendChild(link);
	}
}

export function Resource(props: ResourceProps): ReactElement | null {
	useEffect(() => {
		upsertResourceLink(props);
	}, [props]);

	if (typeof window === "undefined") {
		return React.createElement("link", {
			rel: props.rel ?? "preload",
			href: props.href,
			as: props.as,
			crossOrigin: props.crossOrigin,
			media: props.media,
			type: props.type,
		});
	}

	return null;
}

export default Resource;
