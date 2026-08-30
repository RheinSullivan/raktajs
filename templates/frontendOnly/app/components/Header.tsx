// biome-ignore-all lint: Template welcome starter Rakta.js , cerminan desain resmi.
// biome-ignore-all assist: Template welcome starter Rakta.js , cerminan desain resmi.
// Header - sticky navigation bar with lang toggle, mute, aesthetic switcher, latency, GitHub button.
// Active nav link shows a bottom-border underline indicator, not a hash symbol.

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
			{ title: "LANGUAGE", duration: 2000 },
		);
	}, [lang, onLangToggle]);

	const handleMuteToggle = useCallback(() => {
		onMuteToggle();
		toast.info(isMuted ? "Audio enabled 🔊" : "Audio muted 🔇", {
			title: "AUDIO",
			duration: 1500,
		});
	}, [isMuted, onMuteToggle]);

	// Navigation items — href is the scroll target id or route path.
	// The active indicator is a 2px bottom border on the link, not a hash symbol.
	const navItems = [
		{ label: "SHOWCASE", href: "features" },
		{ label: "DOCS", href: "https://github.com/RheinSullivan/raktajs" },
		{ label: "GAME", href: "game" },
		{ label: "SOLIDARITY", href: "humanitarian" },
		{
			label: "STARTED",
			href: "https://github.com/RheinSullivan/raktajs#quick-start",
		},
	] as const;

	return (
		<header
			ref={headerRef}
			className="sticky top-0 z-40 border-b border-surface-stroke bg-[#0d0e0f] backdrop-blur-md"
		>
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
				{/* Brand */}
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
				</click>

				{/* Center nav — active item gets a bottom-border underline, not a "#" prefix */}
				<nav className="hidden md:flex items-center gap-6">
					{navItems.map((item) => {
						const isExternal =
							item.href.startsWith("http://") ||
							item.href.startsWith("https://");
						return isExternal ? (
							<a
								key={item.label}
								href={item.href}
								target="_blank"
								rel="noopener noreferrer"
								className="font-mono text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors pb-px border-b-2 border-transparent hover:border-brand-pink"
							>
								{item.label}
							</a>
						) : (
							<pantura
								key={item.label}
								to={item.href}
								className="font-mono text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors pb-px border-b-2 border-transparent hover:border-brand-pink"
							>
								{item.label}
							</pantura>
						);
					})}
				</nav>

				{/* Right side controls */}
				<div className="flex items-center gap-3">
					{/* Palestine solidarity pill */}
					<pantura
						to="humanitarian"
						className="hidden lg:inline-flex items-center gap-1 border border-green-900/50 bg-green-950/10 px-2.5 py-1 font-mono text-[10px] uppercase text-green-400 hover:border-green-500/60 hover:text-green-300 transition-colors"
						aria-label="Palestine Solidarity"
					>
						🇵🇸 <span>SOLIDARITY</span>
					</pantura>

					{/* Aesthetic unit switcher */}
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

					{/* Mute toggle */}
					<button
						type="button"
						onClick={handleMuteToggle}
						className="border border-surface-stroke bg-black p-2 font-mono text-xs text-gray-300 hover:border-white hover:text-white transition-colors cursor-pointer"
						aria-label="Toggle Audio"
					>
						{isMuted ? (
							<FaVolumeXmark className="h-3.5 w-3.5 text-brand-pink" />
						) : (
							<FaVolumeHigh className="h-3.5 w-3.5 text-brand-green" />
						)}
					</button>

					{/* Language toggle */}
					<button
						type="button"
						onClick={handleLangToggle}
						className="border border-brand-pink bg-brand-pink/10 px-3 py-1 font-mono text-xs font-bold uppercase text-brand-pink hover:bg-brand-pink hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
					>
						<FaGlobe className="h-3 w-3" />
						{lang}
					</button>

					{/* GitHub button — solid bg-brand-pink, not transparent */}
					<a
						href="https://github.com/RheinSullivan/raktajs"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 bg-brand-pink hover:bg-white text-white hover:text-black px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
						aria-label="GitHub Repository"
					>
						<FaGithub className="h-3.5 w-3.5" />
						<span className="hidden sm:inline">GITHUB</span>
					</a>
				</div>
			</div>
		</header>
	);
}
