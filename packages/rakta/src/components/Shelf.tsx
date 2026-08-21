import { type ReactNode, useEffect, useState } from "react";

export interface ShelfProps<T> {
	readonly storageKey: string;
	readonly initialValue: T;
	readonly children: (value: T, setValue: (newValue: T) => void) => ReactNode;
}

export function Shelf<T>({
	storageKey,
	initialValue,
	children,
}: ShelfProps<T>) {
	const [value, setValue] = useState<T>(() => {
		if (typeof window === "undefined") return initialValue;
		try {
			const saved = localStorage.getItem(storageKey);
			return saved ? JSON.parse(saved) : initialValue;
		} catch {
			return initialValue;
		}
	});

	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			localStorage.setItem(storageKey, JSON.stringify(value));
		} catch {
			// ignore quota errors
		}
	}, [storageKey, value]);

	return <>{children(value, setValue)}</>;
}
