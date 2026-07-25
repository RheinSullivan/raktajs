import React, { type CSSProperties, type ReactNode } from "react";

export type AlertType = "info" | "success" | "warning" | "error";

export interface RaktaAlertProps {
	readonly type?: AlertType;
	readonly title?: string;
	readonly children: ReactNode;
	readonly onClose?: () => void;
	readonly className?: string;
	readonly style?: CSSProperties;
}

const TYPE_CONFIGS: Record<
	AlertType,
	{
		badgeText: string;
		borderClass: string;
		bgClass: string;
		textClass: string;
		badgeBgClass: string;
		iconSvg: ReactNode;
	}
> = {
	info: {
		badgeText: "[SYS::INFO]",
		borderClass: "border-rose-500",
		bgClass: "bg-black/95",
		textClass: "text-rose-400",
		badgeBgClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
		iconSvg: (
			<svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<title>Info Icon</title>
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		),
	},
	success: {
		badgeText: "[SYS::SUCCESS]",
		borderClass: "border-emerald-500",
		bgClass: "bg-black/95",
		textClass: "text-emerald-400",
		badgeBgClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
		iconSvg: (
			<svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<title>Success Icon</title>
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		),
	},
	warning: {
		badgeText: "[SYS::WARN]",
		borderClass: "border-amber-500",
		bgClass: "bg-black/95",
		textClass: "text-amber-400",
		badgeBgClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
		iconSvg: (
			<svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<title>Warning Icon</title>
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
			</svg>
		),
	},
	error: {
		badgeText: "[SYS::ERR]",
		borderClass: "border-red-600",
		bgClass: "bg-black/95",
		textClass: "text-red-400",
		badgeBgClass: "bg-red-600/10 text-red-400 border-red-600/30",
		iconSvg: (
			<svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<title>Error Icon</title>
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		),
	},
};

/**
 * RaktaAlert: High-contrast Brutalist UI Alert styled to match Rakta's Neo-Brutalist page aesthetic.
 */
export function RaktaAlert({
	type = "info",
	title,
	children,
	onClose,
	className = "",
	style,
}: RaktaAlertProps) {
	const config = TYPE_CONFIGS[type];

	return (
		<div
			className={`border-2 ${config.borderClass} ${config.bgClass} p-4 font-mono shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] relative backdrop-blur-md ${className}`}
			style={style}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-start gap-3 flex-1 min-w-0">
					{config.iconSvg}
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1 flex-wrap">
							<span
								className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border ${config.badgeBgClass}`}
							>
								{config.badgeText}
							</span>
							{title && (
								<h4 className="text-xs font-bold text-white uppercase tracking-tight">
									{title}
								</h4>
							)}
						</div>
						<div className="text-xs text-gray-300 leading-relaxed break-words">
							{children}
						</div>
					</div>
				</div>
				{onClose && (
					<button
						type="button"
						onClick={onClose}
						className="p-1 border border-zinc-800 hover:border-white text-gray-400 hover:text-white transition-colors cursor-pointer"
						aria-label="Close Alert"
					>
						<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<title>Close Alert</title>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				)}
			</div>
		</div>
	);
}

export const Alert = RaktaAlert;
