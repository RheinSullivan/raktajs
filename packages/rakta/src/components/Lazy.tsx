import React, { type ReactNode, Suspense, useEffect, useState } from "react";

export interface LazyProps {
	readonly children: ReactNode;
	readonly fallback?: ReactNode;
	readonly delayMs?: number;
}

export function Lazy({ children, fallback = null, delayMs = 0 }: LazyProps) {
	const [isReady, setIsReady] = useState(delayMs === 0);

	useEffect(() => {
		if (delayMs <= 0) return;
		const timer = setTimeout(() => setIsReady(true), delayMs);
		return () => clearTimeout(timer);
	}, [delayMs]);

	if (!isReady) {
		return <>{fallback}</>;
	}

	return <Suspense fallback={fallback}>{children}</Suspense>;
}
