import { type ReactNode, useEffect } from "react";

export interface TitleProps {
	readonly children?: ReactNode;
	readonly text?: string;
}

export function Title({ children, text }: TitleProps) {
	const pageTitle = text || (typeof children === "string" ? children : "");

	useEffect(() => {
		if (typeof document !== "undefined" && pageTitle) {
			document.title = pageTitle;
		}
	}, [pageTitle]);

	return null;
}
