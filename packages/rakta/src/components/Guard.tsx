import type { ReactNode } from "react";

export interface GuardProps {
	readonly isAllowed: boolean;
	readonly children: ReactNode;
	readonly fallback?: ReactNode;
}

export function Guard({ isAllowed, children, fallback = null }: GuardProps) {
	if (!isAllowed) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}
