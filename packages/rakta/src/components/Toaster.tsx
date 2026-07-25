import React, { useEffect, useState, type ReactNode } from "react";

export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastItem {
	id: string;
	message: ReactNode;
	title?: string;
	type: ToastType;
	duration?: number;
}

type ToastListener = (toasts: readonly ToastItem[]) => void;

class ToastManager {
	private toasts: ToastItem[] = [];
	private listeners: Set<ToastListener> = new Set();

	public subscribe(listener: ToastListener): () => void {
		this.listeners.add(listener);
		listener(this.toasts);
		return () => {
			this.listeners.delete(listener);
		};
	}

	private notify(): void {
		for (const listener of this.listeners) {
			listener([...this.toasts]);
		}
	}

	public add(item: Omit<ToastItem, "id"> & { id?: string }): string {
		const id = item.id || `toast-${Math.random().toString(36).substring(2, 9)}`;
		const duration = item.duration ?? 3500;
		const newItem: ToastItem = { ...item, id };

		this.toasts = [newItem, ...this.toasts].slice(0, 5); // Limit max 5 visible toasts
		this.notify();

		if (duration > 0) {
			setTimeout(() => {
				this.remove(id);
			}, duration);
		}

		return id;
	}

	public remove(id: string): void {
		this.toasts = this.toasts.filter((t) => t.id !== id);
		this.notify();
	}

	public clear(): void {
		this.toasts = [];
		this.notify();
	}
}

export const toastManager = new ToastManager();

export const toast = {
	info: (message: ReactNode, options?: { title?: string; duration?: number }) =>
		toastManager.add({ type: "info", message, ...options }),
	success: (message: ReactNode, options?: { title?: string; duration?: number }) =>
		toastManager.add({ type: "success", message, ...options }),
	warning: (message: ReactNode, options?: { title?: string; duration?: number }) =>
		toastManager.add({ type: "warning", message, ...options }),
	error: (message: ReactNode, options?: { title?: string; duration?: number }) =>
		toastManager.add({ type: "error", message, ...options }),
	remove: (id: string) => toastManager.remove(id),
	clear: () => toastManager.clear(),
};

export function useToast() {
	const [toasts, setToasts] = useState<readonly ToastItem[]>([]);

	useEffect(() => {
		return toastManager.subscribe((items) => setToasts(items));
	}, []);

	return {
		toasts,
		toast,
		removeToast: (id: string) => toastManager.remove(id),
		clearToasts: () => toastManager.clear(),
	};
}

const TYPE_BORDER_MAP: Record<ToastType, string> = {
	info: "border-rose-500 text-rose-400 bg-rose-500/10",
	success: "border-emerald-500 text-emerald-400 bg-emerald-500/10",
	warning: "border-amber-500 text-amber-400 bg-amber-500/10",
	error: "border-red-600 text-red-400 bg-red-600/10",
};

/**
 * RaktaToast / Toaster: Brutalist floating toaster matching page.tsx aesthetics
 */
export function RaktaToast({
	position = "top-right",
}: {
	readonly position?: "top-right" | "top-center" | "bottom-right";
}) {
	const { toasts, removeToast } = useToast();

	if (toasts.length === 0) return null;

	const posClass =
		position === "top-center"
			? "top-4 left-1/2 -translate-x-1/2"
			: position === "bottom-right"
				? "bottom-4 right-4"
				: "top-4 right-4";

	return (
		<div
			className={`fixed z-[9999] flex flex-col gap-2.5 max-w-sm w-full p-2 pointer-events-none ${posClass}`}
			id="rakta-toaster-container"
		>
			{toasts.map((t) => {
				const badgeStyle = TYPE_BORDER_MAP[t.type];
				return (
					<div
						key={t.id}
						className="pointer-events-auto bg-black/95 border-2 border-white/80 p-3.5 font-mono text-xs shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] backdrop-blur-md animate-in slide-in-from-top-2 duration-200 transition-all"
					>
						<div className="flex items-start justify-between gap-3">
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-1">
									<span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 border ${badgeStyle}`}>
										[{t.type.toUpperCase()}]
									</span>
									{t.title && (
										<span className="font-bold text-white uppercase tracking-tight truncate">
											{t.title}
										</span>
									)}
								</div>
								<div className="text-gray-200 text-[11px] leading-snug break-words">
									{t.message}
								</div>
							</div>
							<button
								type="button"
								onClick={() => removeToast(t.id)}
								className="text-gray-500 hover:text-white p-0.5 border border-zinc-800 hover:border-white cursor-pointer"
								aria-label="Dismiss toast"
							>
								<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<title>Dismiss toast</title>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export const Toaster = RaktaToast;
