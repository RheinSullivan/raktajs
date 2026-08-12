// biome-ignore-all lint: Template welcome starter Rakta.js
// Header - uses Rakta.js: <photo>, toast, react-icons, gsap

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
	const headerRef = useRef<HTMLElement>(null);

	useEffect(() => {
		if (!headerRef.current) return;
		gsap.fromTo(
			headerRef.current,
			{ y: -40, opacity: 0 },
			{ y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
		);
	}, []);

	const handleLangToggle = useCallback(() => {
		onLangToggle();
		toast.info(
			lang === "ID"
				? "Switched to English 🇬🇧"
				: "Berganti ke Bahasa Indonesia 🇮🇩",
			{
				title: "LANGUAGE",
				duration: 2000,
			},
		);
	}, [lang, onLangToggle]);

	const handleMuteToggle = useCallback(() => {
		onMuteToggle();
		toast.info(isMuted ? "Audio enabled 🔊" : "Audio muted 🔇", {
			title: "AUDIO",
			duration: 1500,
		});
	}, [isMuted, onMuteToggle]);

	return (
		<header
			ref={headerRef}
			className="sticky top-0 z-40 border-b border-surface-stroke bg-black/90 backdrop-blur-md"
		>
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
				{/* Brand: [LOGO] Rakta.js */}
				<click to="/" className="flex items-center gap-2.5 no-underline">
					<photo
						path="/rakta-logo.svg"
						alt="Rakta.js Logo"
						width={26}
						height={26}
						className="h-6 w-6 flex-shrink-0 select-none"
					/>
					<span className="font-mono text-sm font-bold tracking-wider text-white leading-none">
						Rakta<span className="text-brand-pink">.js</span>
					</span>
					<span className="hidden sm:inline-flex items-center gap-1 border border-surface-stroke bg-zinc-900/80 px-2 py-0.5 font-mono text-[10px] uppercase text-gray-400 leading-none">
						<Terminal className="h-2.5 w-2.5" />
						v1.1.5 · FULLSTACK ENGINE
					</span>
				</click>

				{/* Controls */}
				<div className="flex items-center gap-3">
					{/* Aesthetic switcher */}
					<div className="hidden md:flex items-center gap-2 border border-surface-stroke bg-black p-1 font-mono text-[10px]">
						{(["LENIS-MODERN", "RETRO-CYBER", "NEO-BRUTALIST"] as const).map(
							(unit) => (
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
							),
						)}
					</div>

					{/* Low-latency toggle */}
					<button
						type="button"
						onClick={onLowLatencyToggle}
						className={`hidden lg:flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] uppercase transition-colors cursor-pointer ${
							lowLatencyMode
								? "border-emerald-500/50 bg-emerald-950/20 text-emerald-400"
								: "border-surface-stroke bg-zinc-900 text-gray-400"
						}`}
					>
						<span
							className={`w-1.5 h-1.5 rounded-full ${lowLatencyMode ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`}
						/>
						LATENCY: {lowLatencyMode ? "LOW" : "STD"}
					</button>

					{/* Mute toggle with react-icon */}
					<button
						type="button"
						onClick={handleMuteToggle}
						className="border border-surface-stroke bg-black p-2 font-mono text-xs text-gray-300 hover:border-white hover:text-white transition-colors cursor-pointer"
						aria-label="Toggle Audio"
					>
						{isMuted ? (
							<VolumeX className="h-3.5 w-3.5" />
						) : (
							<Volume2 className="h-3.5 w-3.5" />
						)}
					</button>

					{/* Language toggle */}
					<button
						type="button"
						onClick={handleLangToggle}
						className="border border-brand-pink bg-brand-pink/10 px-3 py-1 font-mono text-xs font-bold uppercase text-brand-pink hover:bg-brand-pink hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
					>
						<Globe className="h-3 w-3" />
						{lang}
					</button>
				</div>
			</div>
		</header>
	);
}
