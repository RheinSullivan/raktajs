

export default function Header({
	lang,
	onLangToggle,
	isMuted,
	onMuteToggle,
	aestheticUnit,
	onAestheticChange,
	lowLatencyMode,
	onLowLatencyToggle,
}: HeaderProps) {
	return (
		<header className="sticky top-0 z-40 border-b border-surface-stroke bg-black/90 backdrop-blur-md">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
				<div className="flex items-center gap-3">
					<span className="flex h-3 w-3 relative">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-pink opacity-75"></span>
						<span className="relative inline-flex rounded-full h-3 w-3 bg-brand-pink"></span>
					</span>
					<span className="font-mono text-sm font-bold uppercase tracking-wider text-white">
						RAKTA<span className="text-brand-pink">.JS</span>
					</span>
					<span className="hidden sm:inline-block border border-surface-stroke bg-zinc-900/80 px-2 py-0.5 font-mono text-[10px] uppercase text-gray-400">
						v1.0.5 • CORE ENGINE
					</span>
				</div>

				<div className="flex items-center gap-3">
					<div className="hidden md:flex items-center gap-2 border border-surface-stroke bg-black p-1 font-mono text-[10px]">
						{(["LENIS-MODERN", "RETRO-CYBER", "NEO-BRUTALIST"] as const).map((unit) => (
							<button
								key={unit}
								type="button"
								onClick={() => onAestheticChange(unit)}
								className={`px-2 py-1 uppercase transition-colors cursor-pointer ${
									aestheticUnit === unit
										? "bg-brand-pink text-white font-bold"
										: "text-gray-400 hover:text-white"
								}`}
							>
								{unit.replace("-", " ")}
							</button>
						))}
					</div>

					<button
						type="button"
						onClick={onLowLatencyToggle}
						className={`hidden lg:flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] uppercase transition-colors cursor-pointer ${
							lowLatencyMode
								? "border-emerald-500/50 bg-emerald-950/20 text-emerald-400"
								: "border-surface-stroke bg-zinc-900 text-gray-400"
						}`}
					>
						<span className={`w-1.5 h-1.5 rounded-full ${lowLatencyMode ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`}></span>
						LATENCY: {lowLatencyMode ? "LOW" : "STD"}
					</button>

					<button
						type="button"
						onClick={onMuteToggle}
						className="border border-surface-stroke bg-black p-2 font-mono text-xs text-gray-300 hover:border-white hover:text-white transition-colors cursor-pointer"
						aria-label="Toggle Audio"
					>
						{isMuted ? "🔇" : "🔊"}
					</button>

					<button
						type="button"
						onClick={onLangToggle}
						className="border border-brand-pink bg-brand-pink/10 px-3 py-1 font-mono text-xs font-bold uppercase text-brand-pink hover:bg-brand-pink hover:text-white transition-colors cursor-pointer"
					>
						{lang}
					</button>
				</div>
			</div>
		</header>
	);
}
