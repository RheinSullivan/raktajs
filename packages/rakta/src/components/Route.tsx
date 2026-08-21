import React, { type ReactElement, type ReactNode, useEffect, useState } from "react";

export interface RouteProps {
	readonly path: string;
	readonly exact?: boolean;
	readonly fallback?: ReactNode;
	readonly children: ReactNode;
}

function getPathname(): string {
	if (typeof window === "undefined") {
		return "/";
	}

	return window.location.pathname;
}

function matchesRoute(pathname: string, path: string, exact: boolean): boolean {
	if (exact) {
		return pathname === path;
	}

	return pathname === path || pathname.startsWith(`${path.replace(/\/$/, "")}/`);
}

export function Route({
	path,
	exact = true,
	fallback = null,
	children,
}: RouteProps): ReactElement {
	const [pathname, setPathname] = useState(getPathname);

	useEffect(() => {
		const updatePathname = () => setPathname(getPathname());

		window.addEventListener("popstate", updatePathname);
		window.addEventListener("rakta:route-change", updatePathname);

		return () => {
			window.removeEventListener("popstate", updatePathname);
			window.removeEventListener("rakta:route-change", updatePathname);
		};
	}, []);

	return (
		<>
			{matchesRoute(pathname, path, exact) ? children : fallback}
		</>
	);
}

export default Route;
