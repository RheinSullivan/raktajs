// biome-ignore-all lint: Template welcome starter Rakta.js , cerminan desain resmi.
// biome-ignore-all assist: Template welcome starter Rakta.js , cerminan desain resmi.
// Halaman utama Rakta.js - Welcome Experience (Gambar 2).

export default function App() {
	// Modal states
	const [isDocsOpen, setIsDocsOpen] = useState(false);
	const [isComponentsOpen, setIsComponentsOpen] = useState(false);
	const [isDeployOpen, setIsDeployOpen] = useState(false);

	// Layout & Settings States
	const [isMuted, setIsMutedState] = useState(false);
	const [aestheticUnit, setAestheticUnit] =
		useState<AestheticUnit>("LENIS-MODERN");
	const [lowLatencyMode, setLowLatencyMode] = useState(true);

	// Configuration Change Floating Toast State
	const [configToast, setConfigToast] = useState<string | null>(null);
	const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [isCopiedDonation, setIsCopiedDonation] = useState(false);

	// ShrimpRun game state and physics (all managed in useShrimpRun hook)
	const {
		isPlaying,
		score,
		highScore,
		hasCollision,
		liveFps,
		simSpeed,
		setSimSpeed,
		playerY,
		obstacleX,
		obstaclePos,
		obstacleHeight,
		obstacleWidth,
		obstaclePalette,
		obstacleVariant,
		obstacleScaleX,
		obstacleSizeClass,
		startSimulation,
		triggerJump,
	} = useShrimpRun();

	const prevPlayerYRef = useRef(playerY);
	const containerRef = useRef<HTMLDivElement>(null);

	// Derive rotation from playerY delta for ShrimpCharacter visual
	const deltaY = playerY - prevPlayerYRef.current;
	prevPlayerYRef.current = playerY;

	const showConfigToast = (message: string) => {
		if (toastTimeoutRef.current) {
			clearTimeout(toastTimeoutRef.current);
		}
		setConfigToast(message);
		toastTimeoutRef.current = setTimeout(() => {
			setConfigToast(null);
		}, 1800);
	};

	const handleCopyDonationLink = (e?: { stopPropagation?: () => void }) => {
		if (e?.stopPropagation) e.stopPropagation();
		if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
			void navigator.clipboard.writeText(
				"https://buymeacoffee.com/rheinsullivan",
			);
		}
		setIsCopiedDonation(true);
		playJumpSound();
		showConfigToast("BuyMeACoffee link copied to clipboard!");
		setTimeout(() => setIsCopiedDonation(false), 2500);
	};

	// Audio toggle
	const handleToggleMute = () => {
		const nextMuted = !isMuted;
		setIsMutedState(nextMuted);
		setMute(nextMuted);
	};

	// Aesthetic style change with sound feedback
	const handleAestheticChange = (unit: AestheticUnit) => {
		setAestheticUnit(unit);
		playJumpSound();
		showConfigToast(`STYLE CHANGED: ${unit.replace("-", " ")}`);
	};

	// Space bar jump listener
	useEffect(() => {
		const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
			if (keyboardEvent.code === "Space") {
				keyboardEvent.preventDefault();
				triggerJump();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [triggerJump]);

	// GSAP Animation for Humanitarian Solidarity Section
	const solidaritySectionRef = useRef<HTMLElement | null>(null);
	useEffect(() => {
		if (!solidaritySectionRef.current) return;
		const animationContext = gsap.context(() => {
			gsap.fromTo(
				".gsap-solidarity-item",
				{ opacity: 0, y: 24 },
				{
					opacity: 1,
					y: 0,
					duration: 0.7,
					stagger: 0.12,
					ease: "power2.out",
					scrollTrigger: undefined,
				},
			);
		}, solidaritySectionRef);

		return () => animationContext.revert();
	}, []);

	// Dynamic Theme Styling Variables based on aestheticUnit
	const containerBorderClass =
		aestheticUnit === "RETRO-CYBER"
			? "border-2 border-fuchsia-600 p-1 bg-fuchsia-950/20 shadow-[0_0_20px_rgba(240,46,170,0.5)] transition-all duration-300"
			: aestheticUnit === "NEO-BRUTALIST"
				? "border-4 border-black p-1 bg-black shadow-[8px_8px_0px_#000000] transition-all duration-300"
				: "border border-white/20 p-1 transition-all duration-300"; // LENIS-MODERN

	const viewportClass =
		aestheticUnit === "RETRO-CYBER"
			? "border border-fuchsia-500 relative h-[360px] md:h-[400px] bg-[#0d0118] overflow-hidden flex flex-col items-center justify-center group cursor-pointer select-none transition-all duration-300"
			: aestheticUnit === "NEO-BRUTALIST"
				? "border-2 border-black relative h-[360px] md:h-[400px] bg-[#FFFBEB] overflow-hidden flex flex-col items-center justify-center group cursor-pointer select-none transition-all duration-300"
				: "border border-zinc-800 relative h-[360px] md:h-[400px] bg-[#020712] overflow-hidden flex flex-col items-center justify-center group cursor-pointer select-none transition-all duration-300"; // LENIS-MODERN

	return (
		<div className="min-h-screen bg-black text-white relative font-sans selection:bg-brand-pink selection:text-white">
			{/* Top Navigation Bar (Header) */}
			<header className="bg-[#0d0e0f] fixed top-0 left-0 right-0 z-50 border-b border-white/5">
				<nav className="grid grid-cols-2 md:grid-cols-3 items-center w-full px-6 md:px-10 py-5 max-w-7xl mx-auto">
					{/* Logo on the left */}
					<div className="flex justify-start items-center">
						<click
							className="font-mono text-xl font-extrabold text-[#FAFAFA] tracking-tighter flex items-center gap-2.5 group"
							to="hero"
						>
							<photo
								path="/rakta-logo.svg"
								alt="Rakta.js Logo"
								className="w-7 h-7 object-contain transition-transform group-hover:scale-105"
							/>
							<div className="flex items-center">
								<span>Rakta</span>
								<span className="text-[#E11D48]">.js</span>
							</div>
						</click>
					</div>

					{/* Center navigation links */}
					<div className="hidden md:flex justify-center items-center gap-7">
						<click
							className="bg-[#E11D48] text-white font-bold px-2 py-1 font-mono text-[11px] tracking-wider uppercase cursor-pointer"
							to="showcase"
						>
							SHOWCASE
						</click>
						<click
							className="text-[#b5b5b5] font-bold hover:bg-[#E11D48] hover:text-white px-2 py-1 transition-colors font-mono text-[11px] tracking-wider uppercase cursor-pointer"
							to="features"
						>
							DOCS
						</click>
						<click
							className="text-[#b5b5b5] font-bold hover:bg-[#E11D48] hover:text-white px-2 py-1 transition-colors font-mono text-[11px] tracking-wider uppercase cursor-pointer"
							to="shrimprun"
						>
							GAME
						</click>
						<click
							className="text-[#b5b5b5] font-bold hover:bg-[#E11D48] hover:text-white px-2 py-1 transition-colors font-mono text-[11px] tracking-wider uppercase cursor-pointer"
							to="humanitarian"
						>
							SOLIDARITY
						</click>
						<click
							className="text-[#b5b5b5] font-bold hover:bg-[#E11D48] hover:text-white px-2 py-1 transition-colors font-mono text-[11px] tracking-wider uppercase cursor-pointer"
							to="cta"
						>
							STARTED
						</click>
					</div>

					{/* Action items on the right */}
					<div className="flex justify-end items-center">
						<click
							to="https://github.com/RheinSullivan/raktajs"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 bg-[#E11D48] text-[#FAFAFA] px-4 py-2 font-mono text-[11px] font-bold tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all text-center"
						>
							<FaGithub size={15} />
							<span>GITHUB</span>
						</click>
					</div>
				</nav>
			</header>

			{/* Main Content Area */}
			<main className="pt-24 md:pt-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col gap-12 relative z-10">
				{/* Header Sound Toggle button and configuration (Self-contained widget) */}
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-3">
						<span className="h-2 w-2 rounded-full bg-brand-green animate-pulse" />
						<span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
							RAKTA SANDBOX RUNNING
						</span>
					</div>
					<button
						type="button"
						onClick={handleToggleMute}
						className="flex items-center gap-2 border border-zinc-800 hover:border-white px-3 py-1.5 font-mono text-[10px] text-zinc-400 hover:text-white uppercase transition-colors cursor-pointer"
						title="Toggle Synthesizer Sound Effects"
					>
						{isMuted ? (
							<>
								<FaVolumeXmark className="w-3.5 h-3.5 text-brand-pink" /> AUDIO:
								MUTED
							</>
						) : (
							<>
								<FaVolumeHigh className="w-3.5 h-3.5 text-brand-green" /> AUDIO:
								ACTIVE
							</>
						)}
					</button>
				</div>

				{/* Hero Section */}
				<section className="flex flex-col gap-6 items-start">
					<span className="font-mono text-xs font-bold text-brand-pink border border-brand-pink px-3.5 py-1.5 tracking-wider uppercase bg-brand-pink/5">
						V1.2.3-STABLE
					</span>
					<h1 className="font-sans font-extrabold text-white uppercase tracking-tighter leading-[0.85] text-[48px] sm:text-[72px] md:text-[110px]">
						RAKTA IS READY
					</h1>
					<p className="font-sans text-lg text-zinc-400 max-w-2xl leading-relaxed">
						Your high-performance environment is live. Start building the next
						era of web.
					</p>
				</section>

				{/* Status Grid (Section 1) */}
				<section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 border border-surface-stroke divide-y md:divide-y-0 md:divide-x divide-surface-stroke bg-zinc-950/20">
					<div className="p-6 md:p-8 flex flex-col gap-2 group hover:bg-white/5 transition-colors">
						<span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
							ENGINE
						</span>
						<span className="font-mono text-xl text-white font-semibold">
							1.2.3-STABLE
						</span>
					</div>
					<div className="p-6 md:p-8 flex flex-col gap-2 group hover:bg-white/5 transition-colors">
						<span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
							STATUS
						</span>
						<div className="flex items-center gap-2.5">
							<div className="w-2.5 h-2.5 bg-brand-green animate-pulse" />
							<span className="font-mono text-xl text-white font-semibold">
								OPERATIONAL
							</span>
						</div>
					</div>
					<div className="p-6 md:p-8 flex flex-col gap-2 group hover:bg-white/5 transition-colors">
						<span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
							PORT <FaCircleInfo className="w-3 h-3 text-brand-pink" />
						</span>
						<span className="font-mono text-xl text-white font-semibold">
							3000
						</span>
					</div>
					<div className="p-6 md:p-8 flex flex-col gap-2 group hover:bg-white/5 transition-colors">
						<span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
							REGION
						</span>
						<span className="font-mono text-xl text-white font-semibold">
							LOCAL
						</span>
					</div>
				</section>

				{/* Shrimprun Simulation & Configurations (Section 2) */}
				<section className="flex flex-col gap-4">
					<div className={containerBorderClass}>
						<div
							ref={containerRef}
							onClick={triggerJump}
							className={viewportClass}
							id="game-viewport"
						>
							{/* Theme 1: LENIS-MODERN background elements */}
							{aestheticUnit === "LENIS-MODERN" && (
								<>
									<div className="absolute inset-0 bg-gradient-to-b from-[#0e214d] via-[#061129] to-[#01040a] z-0 pointer-events-none" />
									<div
										className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-cyan-400/15 via-teal-400/5 to-transparent mix-blend-screen pointer-events-none z-0"
										style={{
											clipPath: "polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)",
											animation: "rays-drift 8s infinite ease-in-out",
										}}
									/>
									<div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
										<div
											className="absolute w-2 h-2 bg-white/20 rounded-full bottom-[-10px] left-[12%] animate-[bubble-rise_6s_infinite_linear]"
											style={{ animationDelay: "0s" }}
										/>
										<div
											className="absolute w-3 h-3 bg-white/15 rounded-full bottom-[-15px] left-[32%] animate-[bubble-rise_8s_infinite_linear]"
											style={{ animationDelay: "1.8s" }}
										/>
										<div
											className="absolute w-1.5 h-1.5 bg-white/25 rounded-full bottom-[-10px] left-[58%] animate-[bubble-rise_5s_infinite_linear]"
											style={{ animationDelay: "3.2s" }}
										/>
										<div
											className="absolute w-4 h-4 bg-white/10 rounded-full bottom-[-20px] left-[78%] animate-[bubble-rise_10s_infinite_linear]"
											style={{ animationDelay: "0.8s" }}
										/>
										<div
											className="absolute w-2.5 h-2.5 bg-white/20 rounded-full bottom-[-12px] left-[92%] animate-[bubble-rise_7s_infinite_linear]"
											style={{ animationDelay: "4.5s" }}
										/>
									</div>
									<div
										className="absolute bottom-0 left-4 z-0 pointer-events-none opacity-40 w-10 h-[120px]"
										style={{
											transformOrigin: "bottom center",
											animation:
												"seaweed-wave-1 3.2s infinite ease-in-out alternate",
										}}
									>
										<svg
											width="100%"
											height="100%"
											viewBox="0 0 40 120"
											fill="none"
											preserveAspectRatio="none"
										>
											<path
												d="M10 120 C15 90, 5 60, 15 30 C20 15, 10 5, 12 0 C16 10, 12 20, 20 40 C28 60, 20 90, 25 120 Z"
												fill="#14b8a6"
											/>
										</svg>
									</div>
									<div
										className="absolute bottom-0 left-12 z-0 pointer-events-none opacity-20 w-7 h-[90px]"
										style={{
											transformOrigin: "bottom center",
											animation:
												"seaweed-wave-2 3.8s infinite ease-in-out alternate",
										}}
									>
										<svg
											width="100%"
											height="100%"
											viewBox="0 0 30 90"
											fill="none"
											preserveAspectRatio="none"
										>
											<path
												d="M10 90 C15 67, 5 45, 15 22 C20 11, 10 3, 12 0 C16 7, 12 15, 20 30 C28 45, 20 67, 25 90 Z"
												fill="#0f766e"
											/>
										</svg>
									</div>
									<div
										className="absolute bottom-0 right-6 z-0 pointer-events-none opacity-40 w-11 h-[130px]"
										style={{
											transformOrigin: "bottom center",
											animation:
												"seaweed-wave-1 4.5s infinite ease-in-out alternate",
										}}
									>
										<svg
											width="100%"
											height="100%"
											viewBox="0 0 45 130"
											fill="none"
											preserveAspectRatio="none"
										>
											<path
												d="M20 130 C15 92, 25 65, 15 32 C10 14, 25 4, 22 0 C28 9, 18 23, 28 46 C38 69, 25 102, 30 130 Z"
												fill="#0d9488"
											/>
										</svg>
									</div>
									<div
										className="absolute bottom-0 right-16 z-0 pointer-events-none opacity-25 w-9 h-[100px]"
										style={{
											transformOrigin: "bottom center",
											animation:
												"seaweed-wave-2 3.6s infinite ease-in-out alternate",
										}}
									>
										<svg
											width="100%"
											height="100%"
											viewBox="0 0 35 100"
											fill="none"
											preserveAspectRatio="none"
										>
											<path
												d="M15 100 C10 72, 20 50, 12 25 C8 11, 20 3, 18 0 C23 7, 15 18, 23 36 C31 54, 20 80, 25 100 Z"
												fill="#115e59"
											/>
										</svg>
									</div>
								</>
							)}

							{/* Theme 2: RETRO-CYBER background elements */}
							{aestheticUnit === "RETRO-CYBER" && (
								<>
									<div className="absolute inset-0 bg-gradient-to-b from-[#1c0033] via-[#0b001a] to-[#04000b] z-0 pointer-events-none" />
									<div
										className="absolute inset-0 pointer-events-none z-0 opacity-20"
										style={{
											backgroundImage:
												"linear-gradient(rgba(240, 46, 170, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(240, 46, 170, 0.2) 1px, transparent 1px)",
											backgroundSize: "24px 24px",
											transform: "perspective(140px) rotateX(65deg)",
											transformOrigin: "bottom center",
											bottom: "-40px",
											height: "140%",
										}}
									/>
									<div className="absolute inset-x-0 bottom-0 h-44 flex items-end justify-center pointer-events-none z-0 overflow-hidden">
										<div
											className="w-56 h-56 rounded-full bg-gradient-to-t from-fuchsia-600 via-pink-500 to-yellow-400 opacity-60 relative translate-y-28"
											style={{
												boxShadow: "0 0 40px rgba(240,46,170,0.5)",
												backgroundImage:
													"repeating-linear-gradient(to bottom, transparent, transparent 10px, #0d0118 10px, #0d0118 13px), linear-gradient(to top, #f02eaa, #f59e0b)",
											}}
										/>
									</div>
									<div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
										<div
											className="absolute w-2 h-2 bg-pink-500/40 bottom-[-10px] left-[15%] animate-[cyber-rise_5s_infinite_linear]"
											style={{ animationDelay: "0s" }}
										/>
										<div
											className="absolute w-1.5 h-1.5 bg-fuchsia-500/50 bottom-[-10px] left-[40%] animate-[cyber-rise_7s_infinite_linear]"
											style={{ animationDelay: "2.5s" }}
										/>
										<div
											className="absolute w-2.5 h-2.5 bg-cyan-400/40 bottom-[-10px] left-[68%] animate-[cyber-rise_6s_infinite_linear]"
											style={{ animationDelay: "1.2s" }}
										/>
										<div
											className="absolute w-1.5 h-1.5 bg-purple-400/50 bottom-[-10px] left-[88%] animate-[cyber-rise_8s_infinite_linear]"
											style={{ animationDelay: "4s" }}
										/>
									</div>
									<div className="absolute inset-0 pointer-events-none z-10 opacity-5 bg-[linear-gradient(to_bottom,rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(to_right,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,255,0,0.06))] bg-[size:100%_4px,3px_100%]" />
								</>
							)}

							{/* Theme 3: NEO-BRUTALIST background elements */}
							{aestheticUnit === "NEO-BRUTALIST" && (
								<>
									<div
										className="absolute inset-0 pointer-events-none z-0 opacity-[0.12]"
										style={{
											backgroundImage:
												"linear-gradient(to right, #000 1.5px, transparent 1.5px), linear-gradient(to bottom, #000 1.5px, transparent 1.5px)",
											backgroundSize: "20px 20px",
										}}
									/>
									<div className="absolute bottom-0 inset-x-0 h-28 pointer-events-none z-0 flex items-end justify-between px-10">
										<div className="w-16 h-16 rounded-none bg-black border-2 border-black -translate-y-4 opacity-[0.05]" />
										<div className="w-20 h-20 rounded-full bg-black border-2 border-black -translate-y-8 opacity-[0.05]" />
										<div className="w-24 h-24 rounded-none bg-black border-2 border-black translate-y-6 opacity-[0.05]" />
									</div>
								</>
							)}

							{/* Game UI Headers */}
							<div className="absolute top-6 left-6 flex flex-col gap-1 z-30">
								<span
									className={`font-mono text-[9px] uppercase tracking-wider ${aestheticUnit === "NEO-BRUTALIST" ? "text-black font-extrabold" : "text-zinc-400"}`}
								>
									SCORE
								</span>
								<span
									className={`font-mono text-3xl md:text-4xl tracking-widest font-extrabold ${
										aestheticUnit === "NEO-BRUTALIST"
											? "text-black bg-white border-2 border-black px-3 py-0.5 shadow-[3px_3px_0px_#000000]"
											: aestheticUnit === "RETRO-CYBER"
												? "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-fuchsia-500 drop-shadow-[0_0_8px_rgba(240,46,170,0.6)]"
												: "text-white"
									}`}
									id="live-score"
								>
									{score.toString().padStart(6, "0")}
								</span>
								{highScore > 0 && (
									<span
										className={`font-mono text-[10px] mt-1 ${
											aestheticUnit === "NEO-BRUTALIST"
												? "text-black font-extrabold bg-[#ffff00] border border-black px-1.5 py-0.5 w-fit shadow-[1.5px_1.5px_0px_#000000]"
												: aestheticUnit === "RETRO-CYBER"
													? "text-fuchsia-400 drop-shadow-[0_0_4px_rgba(240,46,170,0.4)]"
													: "text-cyan-400"
										}`}
									>
										BEST: {highScore.toString().padStart(6, "0")}
									</span>
								)}
							</div>

							<div className="absolute top-6 right-6 flex flex-col items-end gap-1 z-30">
								<span
									className={`font-mono text-[9px] uppercase tracking-wider ${aestheticUnit === "NEO-BRUTALIST" ? "text-black font-extrabold" : "text-zinc-400"}`}
								>
									PERFORMANCE
								</span>
								<span
									className={`font-mono text-lg md:text-xl font-bold ${
										aestheticUnit === "NEO-BRUTALIST"
											? "text-black bg-[#E11D48] border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_#000000]"
											: aestheticUnit === "RETRO-CYBER"
												? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
												: "text-brand-pink"
									}`}
									id="live-fps"
								>
									{liveFps.toFixed(2)} FPS
								</span>
							</div>

							{/* Simulation Game Messages */}
							{!isPlaying && !hasCollision && (
								<div
									className={`text-center z-20 pointer-events-none p-4 max-w-sm rounded backdrop-blur-sm ${
										aestheticUnit === "NEO-BRUTALIST"
											? "bg-[#FFFBEB] border-4 border-black text-black shadow-[6px_6px_0px_#000000]"
											: aestheticUnit === "RETRO-CYBER"
												? "bg-[#1a0033]/80 border-2 border-fuchsia-500 text-pink-400 shadow-[0_0_15px_rgba(240,46,170,0.5)]"
												: "bg-black/60 border border-cyan-500/30 text-white"
									}`}
								>
									<p className="font-mono text-xs uppercase tracking-widest animate-pulse font-bold">
										CLICK CONTAINER OR PRESS SPACE TO SWIM
									</p>
									<p
										className={`font-mono text-[10px] mt-2 font-bold tracking-widest uppercase ${
											aestheticUnit === "NEO-BRUTALIST"
												? "text-black"
												: aestheticUnit === "RETRO-CYBER"
													? "text-cyan-400"
													: "text-cyan-400"
										}`}
									>
										SHRIMPRUN {aestheticUnit.replace("-", " ")} V2.0
									</p>
								</div>
							)}

							{hasCollision && (
								<div
									className={`text-center z-20 pointer-events-none p-6 max-w-sm rounded backdrop-blur-md ${
										aestheticUnit === "NEO-BRUTALIST"
											? "bg-[#FFFBEB] border-4 border-black text-black shadow-[8px_8px_0px_#000000]"
											: aestheticUnit === "RETRO-CYBER"
												? "bg-[#0d0118]/95 border-2 border-pink-500 text-pink-400 shadow-[0_0_20px_rgba(244,63,94,0.6)]"
												: "bg-black/90 border-2 border-brand-pink text-white"
									}`}
								>
									<p
										className={`font-mono text-sm uppercase tracking-widest font-extrabold ${
											aestheticUnit === "NEO-BRUTALIST"
												? "text-red-600"
												: "text-brand-pink"
										}`}
									>
										SIMULATION HALTED
									</p>
									<p className="font-mono text-[11px] mt-1 uppercase font-semibold">
										SHRIMP COLLIDED WITH CORAL
									</p>
									<p
										className={`font-mono text-xs mt-4 font-bold border px-3 py-1 animate-pulse ${
											aestheticUnit === "NEO-BRUTALIST"
												? "bg-black text-white border-black"
												: aestheticUnit === "RETRO-CYBER"
													? "bg-fuchsia-950/20 text-fuchsia-400 border-fuchsia-500/50"
													: "bg-brand-green/5 text-brand-green border-brand-green/30"
										}`}
									>
										CLICK TO RE-INITIALIZE
									</p>
								</div>
							)}

							{/* Animated Shrimp Character */}
							<div
								className="absolute left-[18%] z-20 flex items-center justify-center pointer-events-none"
								style={{
									left: "18%",
									bottom: `${playerY}px`,
								}}
								id="player-shrimp"
							>
								<ShrimpCharacter
									status={
										hasCollision ? "DEAD" : !isPlaying ? "IDLE" : "SWIMMING"
									}
									playerY={playerY}
									rotation={
										hasCollision
											? 180
											: !isPlaying
												? Math.sin(Date.now() / 150) * 5
												: Math.max(-28, Math.min(28, deltaY * 4.2))
									}
								/>
							</div>

							{/* Coral Reef Obstacle */}
							<div
								className="absolute z-20"
								style={{
									left: `${obstacleX}%`,
									bottom: obstaclePos === "BOTTOM" ? "0px" : "auto",
									top: obstaclePos === "TOP" ? "0px" : "auto",
									width: `${obstacleWidth}px`,
									height: `${obstacleHeight}px`,
								}}
								id="obstacle-cube"
							>
								<CoralObstacle
									position={obstaclePos}
									height={obstacleHeight}
									width={obstacleWidth}
									paletteIndex={obstaclePalette}
									variant={obstacleVariant}
									scaleX={obstacleScaleX}
								/>
							</div>

							{/* Live interactive speed banner inside when playing */}
							{isPlaying && (
								<div
									className={`absolute bottom-4 left-6 flex items-center gap-1.5 font-mono text-[9px] z-20 font-semibold uppercase tracking-wider ${
										aestheticUnit === "NEO-BRUTALIST"
											? "text-black bg-white border border-black px-1.5 py-0.5 shadow-[1px_1px_0_#000]"
											: aestheticUnit === "RETRO-CYBER"
												? "text-fuchsia-400"
												: "text-cyan-400"
									}`}
								>
									<span
										className={`w-1.5 h-1.5 rounded-full animate-ping ${aestheticUnit === "NEO-BRUTALIST" ? "bg-black" : "bg-cyan-400"}`}
									/>
									SWIMMING IN STRONG CURRENTS
								</div>
							)}

							{/* Floating Settings/Config Toast */}
							{configToast && (
								<div
									className={`absolute bottom-12 px-4 py-1.5 font-mono text-[10px] z-30 font-bold uppercase tracking-widest animate-bounce ${
										aestheticUnit === "NEO-BRUTALIST"
											? "bg-[#ffff00] text-black border-2 border-black shadow-[4px_4px_0px_#000000]"
											: aestheticUnit === "RETRO-CYBER"
												? "bg-fuchsia-950/90 text-fuchsia-400 border border-fuchsia-500 shadow-[0_0_10px_rgba(240,46,170,0.6)] backdrop-blur-sm"
												: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 backdrop-blur-sm"
									}`}
								>
									{configToast}
								</div>
							)}
						</div>
					</div>

					{/* Simulation Config Controls */}
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
						<div className="font-mono text-[10px] text-zinc-500 flex flex-wrap items-center gap-x-4 gap-y-1.5">
							<span
								className={`font-semibold ${aestheticUnit === "NEO-BRUTALIST" ? "text-black font-extrabold" : "text-white"}`}
							>
								SHRIMPRUN SIMULATION
							</span>
							<span className="w-1 h-1 bg-zinc-800 rounded-full hidden sm:inline" />

							{/* Aesthetic Unit custom selector */}
							<div className="flex items-center gap-1">
								<span>STYLE:</span>
								{(
									[
										"LENIS-MODERN",
										"RETRO-CYBER",
										"NEO-BRUTALIST",
									] as AestheticUnit[]
								).map((unit) => {
									const isActive = aestheticUnit === unit;
									let btnClass = "";
									if (aestheticUnit === "NEO-BRUTALIST") {
										btnClass = isActive
											? "text-black font-extrabold border-2 border-black bg-[#ffff00] px-1.5 py-0.5 shadow-[2px_2px_0px_#000000] rounded-none"
											: "text-zinc-600 border border-transparent font-medium px-1.5 py-0.5 rounded-none hover:border-black hover:text-black";
									} else if (aestheticUnit === "RETRO-CYBER") {
										btnClass = isActive
											? "text-fuchsia-400 font-bold border border-fuchsia-500 bg-fuchsia-950/40 px-1.5 py-0.5 shadow-[0_0_8px_rgba(240,46,170,0.6)] rounded"
											: "text-zinc-600 hover:text-fuchsia-300 px-1.5 py-0.5 rounded";
									} else {
										btnClass = isActive
											? "text-brand-pink font-bold border border-brand-pink/30 bg-brand-pink/5 px-1.5 py-0.5 rounded"
											: "text-zinc-600 hover:text-zinc-300 px-1.5 py-0.5 rounded";
									}

									return (
										<button
											key={unit}
											type="button"
											onClick={() => handleAestheticChange(unit)}
											className={`transition-all cursor-pointer ${btnClass}`}
										>
											{unit}
										</button>
									);
								})}
							</div>

							<span className="w-1 h-1 bg-zinc-800 rounded-full hidden sm:inline" />

							<div className="flex items-center gap-1.5">
								<span>CORAL:</span>
								<span
									className={`px-2 py-0.5 font-bold text-[9px] tracking-wider rounded border ${
										aestheticUnit === "NEO-BRUTALIST"
											? "text-black border-2 border-black bg-white shadow-[1px_1px_0px_#000000] rounded-none"
											: obstacleSizeClass === "KECIL"
												? "text-amber-400 border-amber-400/30 bg-amber-400/5"
												: obstacleSizeClass === "SEDANG"
													? "text-cyan-400 border-cyan-400/30 bg-cyan-400/5"
													: "text-rose-400 border-rose-400/30 bg-rose-400/5"
									}`}
								>
									{obstacleSizeClass}
								</span>
							</div>
						</div>

						{/* Simulated Speed & Latency toggles */}
						<div className="font-mono text-[10px] text-zinc-500 flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-end">
							<div className="flex items-center gap-1">
								<span>SPEED:</span>
								{(["NORMAL", "FAST", "TURBO"] as const).map((speed) => {
									const isActive = simSpeed === speed;
									let btnClass = "";
									if (aestheticUnit === "NEO-BRUTALIST") {
										btnClass = isActive
											? "text-black font-extrabold border-2 border-black bg-white px-1.5 py-0.5 shadow-[2px_2px_0px_#000000] rounded-none"
											: "text-zinc-600 border border-transparent font-medium px-1.5 py-0.5 rounded-none hover:border-black hover:text-black";
									} else if (aestheticUnit === "RETRO-CYBER") {
										btnClass = isActive
											? "text-cyan-400 font-bold border border-cyan-500 bg-cyan-950/40 px-1.5 py-0.5 shadow-[0_0_8px_rgba(34,211,238,0.6)] rounded"
											: "text-zinc-600 hover:text-cyan-300 px-1.5 py-0.5 rounded";
									} else {
										btnClass = isActive
											? "text-brand-green font-bold border border-brand-green/30 bg-brand-green/5 px-1.5 py-0.5 rounded"
											: "text-zinc-600 hover:text-zinc-300 px-1.5 py-0.5 rounded";
									}

									return (
										<button
											key={speed}
											type="button"
											onClick={() => {
												setSimSpeed(speed);
												playScoreSound();
												showConfigToast(`SPEED SET: ${speed}`);
											}}
											className={`transition-all cursor-pointer ${btnClass}`}
										>
											{speed}
										</button>
									);
								})}
							</div>

							<div className="flex items-center gap-2">
								<span>LOW LATENCY MODE:</span>
								<button
									type="button"
									onClick={() => {
										const nextMode = !lowLatencyMode;
										setLowLatencyMode(nextMode);
										playJumpSound();
										showConfigToast(
											`LATENCY MODE: ${nextMode ? "LOW LATENCY" : "STANDARD"}`,
										);
									}}
									className={`px-2 py-0.5 font-bold cursor-pointer transition-all ${
										aestheticUnit === "NEO-BRUTALIST"
											? lowLatencyMode
												? "bg-black text-[#ffff00] border-2 border-black px-2 py-0.5 font-extrabold shadow-[2px_2px_0px_#000000] rounded-none"
												: "bg-white text-zinc-400 border border-zinc-300 px-2 py-0.5 font-medium rounded-none hover:border-black hover:text-black"
											: aestheticUnit === "RETRO-CYBER"
												? lowLatencyMode
													? "bg-pink-950/40 text-pink-400 border border-pink-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] rounded"
													: "bg-zinc-950 text-zinc-600 border border-zinc-800 rounded"
												: lowLatencyMode
													? "bg-brand-pink/10 text-brand-pink border border-brand-pink/30 rounded"
													: "bg-zinc-900 text-zinc-500 border border-zinc-800 rounded"
									}`}
								>
									{lowLatencyMode ? "ON" : "OFF"}
								</button>
							</div>
						</div>
					</div>
				</section>

				{/* Next Steps (Section 3) */}
				<section className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-surface-stroke my-10">
					{/* Docs Card */}
					<div
						onClick={() => setIsDocsOpen(true)}
						className="group border-b border-surface-stroke md:border-b-0 md:border-r border-surface-stroke p-8 md:p-12 transition-all duration-300 hover:bg-white hover:text-black cursor-pointer flex flex-col justify-between min-h-[300px]"
					>
						<div>
							<span className="font-mono text-[10px] text-brand-pink group-hover:text-black mb-10 block tracking-widest font-bold">
								01
							</span>
							<h3 className="font-sans text-3xl font-extrabold mb-4 uppercase tracking-tight">
								DOCS
							</h3>
							<p className="font-sans text-xs text-zinc-500 group-hover:text-black/70 leading-relaxed mb-6">
								Technical specifications and API references for the Rakta
								ecosystem.
							</p>
						</div>
						<div className="flex items-center gap-2 font-mono text-[10px] font-extrabold tracking-wider group-hover:translate-x-1.5 transition-transform">
							<span>READ SYSTEM MANUAL</span>
							<FaArrowRight className="w-3.5 h-3.5" />
						</div>
					</div>

					{/* Components Card */}
					<div
						onClick={() => setIsComponentsOpen(true)}
						className="group border-b border-surface-stroke md:border-b-0 md:border-r border-surface-stroke p-8 md:p-12 transition-all duration-300 hover:bg-white hover:text-black cursor-pointer flex flex-col justify-between min-h-[300px]"
					>
						<div>
							<span className="font-mono text-[10px] text-brand-pink group-hover:text-black mb-10 block tracking-widest font-bold">
								02
							</span>
							<h3 className="font-sans text-3xl font-extrabold mb-4 uppercase tracking-tight">
								COMPONENTS
							</h3>
							<p className="font-sans text-xs text-zinc-500 group-hover:text-black/70 leading-relaxed mb-6">
								Browse the library of pre-built brutalist modules and patterns.
							</p>
						</div>
						<div className="flex items-center gap-2 font-mono text-[10px] font-extrabold tracking-wider group-hover:translate-x-1.5 transition-transform">
							<span>EXPLORE LIBRARY</span>
							<FaArrowRight className="w-3.5 h-3.5" />
						</div>
					</div>

					{/* Deploy Card */}
					<div
						onClick={() => setIsDeployOpen(true)}
						className="group p-8 md:p-12 transition-all duration-300 hover:bg-white hover:text-black cursor-pointer flex flex-col justify-between min-h-[300px]"
					>
						<div>
							<span className="font-mono text-[10px] text-brand-pink group-hover:text-black mb-10 block tracking-widest font-bold">
								03
							</span>
							<h3 className="font-sans text-3xl font-extrabold mb-4 uppercase tracking-tight">
								DEPLOY
							</h3>
							<p className="font-sans text-xs text-zinc-500 group-hover:text-black/70 leading-relaxed mb-6">
								Push your high-performance application to production edge nodes.
							</p>
						</div>
						<div className="flex items-center gap-2 font-mono text-[10px] font-extrabold tracking-wider group-hover:translate-x-1.5 transition-transform">
							<span>INITIATE LAUNCH</span>
							<FaArrowRight className="w-3.5 h-3.5" />
						</div>
					</div>
				</section>

				{/* Solidarity & Palestine Humanitarian Relief Section (Section 4) */}
				<section
					id="humanitarian"
					ref={solidaritySectionRef}
					className="border-t border-surface-stroke my-10 flex flex-col bg-black"
				>
					{/* Header Bar matching Rakta Neo-Brutalist Layout */}
					<div className="p-8 md:p-12 border-b border-surface-stroke flex flex-col md:flex-row md:items-end justify-between gap-8 bg-black">
						<div className="flex flex-col gap-4 max-w-2xl">
							<div className="flex items-center gap-3">
								<span className="font-mono text-[10px] text-brand-pink tracking-widest font-bold uppercase flex items-center gap-1.5">
									<span className="inline-flex items-center">
										<svg
											stroke="currentColor"
											fill="currentColor"
											strokeWidth="0"
											viewBox="0 0 24 24"
											height="14"
											width="14"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path d="M9.3349 11.5022L11.5049 11.5027C13.9902 11.5027 16.0049 13.5174 16.0049 16.0027L9.00388 16.0018L9.00488 17.0027L17.0049 17.0019V16.0027C17.0049 14.9202 16.6867 13.8996 16.1188 13.0019L19.0049 13.0027C20.9972 13.0027 22.7173 14.1679 23.521 15.8541C21.1562 18.9747 17.3268 21.0027 13.0049 21.0027C10.2436 21.0027 7.90437 20.4121 6.00447 19.3779L6.00592 10.0737C7.25147 10.2521 8.39122 10.7583 9.3349 11.5022ZM4.00488 9.00268C4.51772 9.00268 4.94039 9.38872 4.99816 9.88606L5.00488 10.0018V19.0027C5.00488 19.555 4.55717 20.0027 4.00488 20.0027H2.00488C1.4526 20.0027 1.00488 19.555 1.00488 19.0027V10.0027C1.00488 9.45039 1.4526 9.00268 2.00488 9.00268H4.00488ZM13.6513 3.57806L14.0046 3.93183L14.3584 3.57806C15.3347 2.60175 16.9177 2.60175 17.894 3.57806C18.8703 4.55437 18.8703 6.13728 17.894 7.11359L14.0049 11.0027L10.1158 7.11359C9.13948 6.13728 9.13948 4.55437 10.1158 3.57806C11.0921 2.60175 12.675 2.60175 13.6513 3.57806Z" />
										</svg>
									</span>
									04 / SOLIDARITY
								</span>
								<span className="text-zinc-700">|</span>
								<div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-2.5 py-1">
									{/* Indonesia Flag SVG */}
									<svg
										viewBox="0 0 30 20"
										className="w-4 h-3 border border-white/20 shrink-0"
									>
										<rect width="30" height="10" fill="#E11D48" />
										<rect y="10" width="30" height="10" fill="#FFFFFF" />
									</svg>
									<span className="font-mono text-[11px] font-bold text-white tracking-wider">
										INDONESIA
									</span>
									<span className="text-zinc-600 font-mono text-xs">⇄</span>
									{/* Palestine Flag SVG */}
									<svg
										viewBox="0 0 30 20"
										className="w-4 h-3 border border-white/20 shrink-0"
									>
										<rect width="30" height="6.66" fill="#000000" />
										<rect y="6.66" width="30" height="6.66" fill="#FFFFFF" />
										<rect y="13.33" width="30" height="6.66" fill="#009736" />
										<polygon points="0,0 12,10 0,20" fill="#E4312B" />
									</svg>
									<span className="font-mono text-[11px] font-bold text-white tracking-wider">
										PALESTINE
									</span>
								</div>
							</div>

							<h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-white uppercase tracking-tight leading-[0.9]">
								HUMANITARIAN RELIEF
							</h2>

							<p className="font-sans text-xs sm:text-sm text-zinc-500 leading-relaxed">
								Direct humanitarian solidarity by the Indonesian developer
								ecosystem to provide emergency medical relief, clean water, and
								food aid in Palestine.
							</p>
						</div>

						{/* Direct Action Buttons */}
						<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
							<button
								onClick={handleCopyDonationLink}
								type="button"
								className="flex items-center justify-center gap-2 font-mono text-[11px] font-bold px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white uppercase tracking-wider transition-all cursor-pointer active:scale-95 border border-zinc-800"
							>
								{isCopiedDonation ? (
									<>
										<span className="text-emerald-400 inline-flex items-center">
											<svg
												stroke="currentColor"
												fill="currentColor"
												strokeWidth="0"
												viewBox="0 0 24 24"
												height="16"
												width="16"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path d="M16.4524 8.22183L11.5019 13.1709L8.67421 10.3431L7.25999 11.7574L11.5026 16L17.8666 9.63604L16.4524 8.22183Z" />
											</svg>
										</span>
										<span className="text-emerald-400">COPIED</span>
									</>
								) : (
									<>
										<span className="text-zinc-400 inline-flex items-center">
											<svg
												stroke="currentColor"
												fill="currentColor"
												strokeWidth="0"
												viewBox="0 0 24 24"
												height="14"
												width="14"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path d="M6.9998 6V3C6.9998 2.44772 7.44752 2 7.9998 2H19.9998C20.5521 2 20.9998 2.44772 20.9998 3V17C20.9998 17.5523 20.5521 18 19.9998 18H16.9998V20.9991C16.9998 21.5519 16.5499 22 15.993 22H4.00666C3.45059 22 3 21.5554 3 20.9991L3.0026 7.00087C3.0027 6.44811 3.45264 6 4.00942 6H6.9998ZM8.9998 6H16.9998V16H18.9998V4H8.9998V6Z" />
											</svg>
										</span>
										<span>COPY LINK</span>
									</>
								)}
							</button>

							<a
								href="https://buymeacoffee.com/rheinsullivan"
								target="_blank"
								rel="noopener noreferrer"
								onClick={() => playJumpSound()}
								className="flex items-center justify-center gap-2 font-mono text-[11px] font-extrabold px-6 py-3.5 bg-brand-pink text-white hover:bg-white hover:text-black uppercase tracking-wider transition-all active:scale-95"
							>
								<span className="inline-flex items-center">
									<svg
										stroke="currentColor"
										fill="currentColor"
										strokeWidth="0"
										viewBox="0 0 24 24"
										height="16"
										width="16"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M5 3H20C21.1046 3 22 3.89543 22 5V8C22 9.10457 21.1046 10 20 10H18V13C18 15.2091 16.2091 17 14 17H8C5.79086 17 4 15.2091 4 13V4C4 3.44772 4.44772 3 5 3ZM18 5V8H20V5H18ZM2 19H20V21H2V19Z" />
									</svg>
								</span>
								<span>DONATE NOW</span>
								<span className="inline-flex items-center">
									<svg
										stroke="currentColor"
										fill="currentColor"
										strokeWidth="0"
										viewBox="0 0 24 24"
										height="14"
										width="14"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
									</svg>
								</span>
							</a>
						</div>
					</div>

					{/* 3-Column Grid Matching Next Steps Section */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-0">
						{/* Card 1: Channel & Allocation Notice */}
						<div className="gsap-solidarity-item border-b border-surface-stroke md:border-b-0 md:border-r border-surface-stroke p-8 md:p-12 flex flex-col justify-between min-h-[260px] bg-black hover:bg-white hover:text-black group transition-all duration-300">
							<div>
								<span className="font-mono text-[10px] text-brand-pink group-hover:text-black mb-8 block tracking-widest font-bold uppercase flex items-center gap-1.5">
									<span className="inline-flex items-center">
										<svg
											stroke="currentColor"
											fill="currentColor"
											strokeWidth="0"
											viewBox="0 0 24 24"
											height="12"
											width="12"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path d="M5 3H20C21.1046 3 22 3.89543 22 5V8C22 9.10457 21.1046 10 20 10H18V13C18 15.2091 16.2091 17 14 17H8C5.79086 17 4 15.2091 4 13V4C4 3.44772 4.44772 3 5 3ZM18 5V8H20V5H18ZM2 19H20V21H2V19Z" />
										</svg>
									</span>
									OFFICIAL CHANNEL
								</span>
								<h3 className="font-sans text-2xl font-extrabold mb-3 uppercase tracking-tight">
									BUYMEACOFFEE
								</h3>
								<p className="font-sans text-xs text-zinc-500 group-hover:text-black/70 leading-relaxed mb-4">
									buymeacoffee.com/rheinsullivan · Max. 30% framework
									operational cost, the rest goes entirely to humanitarian
									relief.
								</p>
							</div>
							<div className="font-mono text-[10px] font-extrabold tracking-wider flex items-center gap-2 text-zinc-400 group-hover:text-black">
								<span className="text-emerald-400 group-hover:text-black inline-flex items-center">
									<svg
										stroke="currentColor"
										fill="currentColor"
										strokeWidth="0"
										viewBox="0 0 24 24"
										height="14"
										width="14"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M12 1L20.2169 2.82598C20.6745 2.92766 21 3.33347 21 3.80217V13.7889C21 15.795 19.9974 17.6684 18.3282 18.7812L12 23L5.6718 18.7812C4.00261 17.6684 3 15.795 3 13.7889V3.80217C3 3.33347 3.32553 2.92766 3.78307 2.82598L12 1ZM11.2756 14.5858L8.27562 11.5858L9.68983 10.1716L11.2756 11.7574L15.2756 7.75736L16.6898 9.17157L11.2756 14.5858Z" />
									</svg>
								</span>
								<span>VERIFIED REPOSITORY CHANNEL</span>
							</div>
						</div>

						{/* Card 2: Relief Allocation */}
						<div className="gsap-solidarity-item border-b border-surface-stroke md:border-b-0 md:border-r border-surface-stroke p-8 md:p-12 flex flex-col justify-between min-h-[260px] bg-black hover:bg-white hover:text-black group transition-all duration-300">
							<div>
								<span className="font-mono text-[10px] text-brand-pink group-hover:text-black mb-8 block tracking-widest font-bold uppercase flex items-center gap-1.5">
									<span className="inline-flex items-center">
										<svg
											stroke="currentColor"
											fill="currentColor"
											strokeWidth="0"
											viewBox="0 0 24 24"
											height="12"
											width="12"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path d="M20.2427 4.7574C21.3679 5.88258 22 7.4087 22 8.99999C22 10.5913 21.3679 12.1174 20.2427 13.2426L13.2427 20.2426C13.1174 20.3679 12.9913 20.4913 12.8642 20.6129C10.6235 22.5705 7.13824 22.5705 4.89748 20.6129C2.65672 18.6554 2.36539 15.2911 4.00311 13.0011L3.99999 12.9979L11 5.99793C12.1046 4.89336 13.8954 4.89336 15 5.99793C16.1046 7.10249 16.1046 8.89335 15 9.99791L8.17157 16.8263L9.58578 18.2405L16.4142 11.4121C18.1953 9.63099 18.1953 6.73484 16.4142 4.95368C14.633 3.17253 11.7369 3.17253 9.95578 4.95368L3.12735 11.7821C0.65603 14.7491 1.05063 19.2681 4.13139 21.7552C7.21215 24.2422 11.788 24.2422 14.8688 21.7552C15.0784 21.5857 15.2799 21.4042 15.4727 21.2114L22.4727 14.2114C24.0358 12.6482 24.8984 10.5565 24.8984 8.38278C24.8984 6.20905 24.0358 4.11741 22.4727 2.55423C20.9095 0.991046 18.8179 0.128449 16.6441 0.128449C14.4704 0.128449 12.3788 0.991046 10.8156 2.55423L9.40138 3.96844L10.8156 5.38266L12.2298 3.96844C13.3551 2.84327 14.8812 2.21121 16.4725 2.21121C18.0638 2.21121 19.59 2.84327 20.7152 3.96844L20.2427 4.7574Z" />
										</svg>
									</span>
									DIRECT ALLOCATION
								</span>
								<h3 className="font-sans text-2xl font-extrabold mb-3 uppercase tracking-tight">
									≥ 70% PALESTINE
								</h3>
								<p className="font-sans text-xs text-zinc-500 group-hover:text-black/70 leading-relaxed mb-4">
									Emergency medical supply shipments, trauma care units, clean
									water filtration, and food rations.
								</p>
							</div>
							<div className="font-mono text-[10px] font-extrabold tracking-wider flex items-center gap-2 text-zinc-400 group-hover:text-black">
								<span className="text-brand-pink group-hover:text-black inline-flex items-center">
									<svg
										stroke="currentColor"
										fill="currentColor"
										strokeWidth="0"
										viewBox="0 0 24 24"
										height="14"
										width="14"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M20.2427 4.7574C21.3679 5.88258 22 7.4087 22 8.99999C22 10.5913 21.3679 12.1174 20.2427 13.2426L13.2427 20.2426C13.1174 20.3679 12.9913 20.4913 12.8642 20.6129C10.6235 22.5705 7.13824 22.5705 4.89748 20.6129C2.65672 18.6554 2.36539 15.2911 4.00311 13.0011L3.99999 12.9979L11 5.99793C12.1046 4.89336 13.8954 4.89336 15 5.99793C16.1046 7.10249 16.1046 8.89335 15 9.99791L8.17157 16.8263L9.58578 18.2405L16.4142 11.4121C18.1953 9.63099 18.1953 6.73484 16.4142 4.95368C14.633 3.17253 11.7369 3.17253 9.95578 4.95368L3.12735 11.7821C0.65603 14.7491 1.05063 19.2681 4.13139 21.7552C7.21215 24.2422 11.788 24.2422 14.8688 21.7552C15.0784 21.5857 15.2799 21.4042 15.4727 21.2114L22.4727 14.2114C24.0358 12.6482 24.8984 10.5565 24.8984 8.38278C24.8984 6.20905 24.0358 4.11741 22.4727 2.55423C20.9095 0.991046 18.8179 0.128449 16.6441 0.128449C14.4704 0.128449 12.3788 0.991046 10.8156 2.55423L9.40138 3.96844L10.8156 5.38266L12.2298 3.96844C13.3551 2.84327 14.8812 2.21121 16.4725 2.21121C18.0638 2.21121 19.59 2.84327 20.7152 3.96844L20.2427 4.7574Z" />
									</svg>
								</span>
								<span>PRIORITY HUMANITARIAN AID</span>
							</div>
						</div>

						{/* Card 3: Framework Operational Overhead */}
						<div className="gsap-solidarity-item p-8 md:p-12 flex flex-col justify-between min-h-[260px] bg-black hover:bg-white hover:text-black group transition-all duration-300">
							<div>
								<span className="font-mono text-[10px] text-brand-pink group-hover:text-black mb-8 block tracking-widest font-bold uppercase flex items-center gap-1.5">
									<span className="inline-flex items-center">
										<svg
											stroke="currentColor"
											fill="currentColor"
											strokeWidth="0"
											viewBox="0 0 24 24"
											height="12"
											width="12"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM9.71002 19.6674C8.74743 17.6259 8.15732 15.3742 8.02731 13H4.06189C4.458 16.1765 6.71639 18.7747 9.71002 19.6674ZM10.0307 13C10.1811 15.4388 10.8778 17.7297 12 19.752C13.1222 17.7297 13.8189 15.4388 13.9693 13H10.0307ZM19.9381 13H15.9727C15.8427 15.3742 15.2526 17.6259 14.29 19.6674C17.2836 18.7747 19.542 16.1765 19.9381 13ZM4.06189 11H8.02731C8.15732 8.62577 8.74743 6.37407 9.71002 4.33256C6.71639 5.22533 4.458 7.8235 4.06189 11ZM10.0307 11H13.9693C13.8189 8.56122 13.1222 6.27025 12 4.24799C10.8778 6.27025 10.1811 8.56122 10.0307 11ZM14.29 4.33256C15.2526 6.37407 15.8427 8.62577 15.9727 11H19.9381C19.542 7.8235 17.2836 5.22533 14.29 4.33256Z" />
										</svg>
									</span>
									INFRASTRUCTURE
								</span>
								<h3 className="font-sans text-2xl font-extrabold mb-3 uppercase tracking-tight">
									≤ 30% OPERATIONS
								</h3>
								<p className="font-sans text-xs text-zinc-500 group-hover:text-black/70 leading-relaxed mb-4">
									Dedicated strictly to edge distribution nodes, repository
									bandwidth, and continuous integration server costs.
								</p>
							</div>
							<div className="font-mono text-[10px] font-extrabold tracking-wider flex items-center gap-2 text-zinc-400 group-hover:text-black">
								<span className="text-zinc-400 group-hover:text-black inline-flex items-center">
									<svg
										stroke="currentColor"
										fill="currentColor"
										strokeWidth="0"
										viewBox="0 0 24 24"
										height="14"
										width="14"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M12.0049 2.00293C17.3923 2.00293 21.8114 6.2042 22.1738 11.5219L21.0639 10.412C20.6734 10.0215 20.0402 10.0215 19.6497 10.412C19.2592 10.8025 19.2592 11.4357 19.6497 11.8262L22.2355 14.412L24.8213 11.8262C25.2118 11.4357 25.2118 10.8025 24.8213 10.412C24.4308 10.0215 23.7976 10.0215 23.4071 10.412L22.4996 11.3195C22.0859 5.48074 17.4236 0.802929 11.7549 0.802929C9.98981 0.802929 8.32787 1.22846 6.85961 1.98204L8.02606 3.87729C9.16269 3.34479 10.4281 3.05293 11.7549 3.05293C11.8382 3.05293 11.9214 3.05398 12.0044 3.05606L12.0049 2.00293ZM3.57568 11.8263L1.63451 13.7674C1.24399 14.1579 1.24399 14.7911 1.63451 15.1816C2.02504 15.5722 2.65821 15.5722 3.04873 15.1816L4.50049 13.7299C4.91418 19.5686 9.57649 24.2464 15.2451 24.2464C17.0103 24.2464 18.6722 23.8209 20.1405 23.0673L18.974 21.172C17.8374 21.7046 16.572 21.9964 15.2451 21.9964C15.1618 21.9964 15.0786 21.9954 14.9956 21.9933L14.9951 23.0464C9.60777 23.0464 5.18868 18.8451 4.82628 13.5274L5.93619 14.6373C6.32671 15.0279 6.95988 15.0279 7.3504 14.6373C7.74093 14.2468 7.74093 13.6136 7.3504 13.2231L3.57568 11.8263Z" />
									</svg>
								</span>
								<span>NO PERSONAL PROFIT</span>
							</div>
						</div>
					</div>
				</section>
			</main>

			{/* Footer Element */}
			<footer className="border-t border-white/5 bg-[#0d0e0f] pt-20 pb-12 relative overflow-hidden">
				<div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-start gap-16 mb-20 relative z-10">
					<div className="flex flex-col items-start gap-6 max-w-xs">
						<div className="flex items-center gap-3">
							<photo
								path="/rakta-logo.svg"
								alt="Rakta.js Logo"
								className="w-8 h-8 object-contain"
							/>
							<span className="font-mono text-2xl font-extrabold text-[#FAFAFA] tracking-tighter flex items-center">
								<span>Rakta</span>
								<span className="text-[#E11D48]">.js</span>
							</span>
						</div>
						<p className="font-sans text-xs text-[#b5b5b5]/50 leading-relaxed">
							The ultra-minimalist React framework designed for high-stakes
							performance and developer bliss.
						</p>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-10">
						<div className="flex flex-col gap-4 font-mono">
							<span className="text-[#FAFAFA] text-[10px] tracking-widest font-bold uppercase">
								RESOURCES
							</span>
							<click
								className="text-[#b5b5b5]/60 font-sans text-xs hover:text-[#E11D48] transition-all"
								to="#features"
							>
								Documentation
							</click>
							<click
								className="text-[#b5b5b5]/60 font-sans text-xs hover:text-[#E11D48] transition-all"
								to="#showcase"
							>
								Showcase
							</click>
						</div>
						<div className="flex flex-col gap-4 font-mono">
							<span className="text-[#FAFAFA] text-[10px] tracking-widest font-bold uppercase">
								COMMUNITY
							</span>
							<click
								className="text-[#b5b5b5]/60 font-sans text-xs hover:text-[#E11D48] transition-all"
								to="https://github.com/RheinSullivan/raktajs"
								target="_blank"
								rel="noreferrer"
							>
								GitHub
							</click>
							<click
								className="text-[#b5b5b5]/60 font-sans text-xs hover:text-[#E11D48] transition-all"
								to="https://discord.com"
								target="_blank"
								rel="noreferrer"
							>
								Discord
							</click>
							<click
								className="text-emerald-400/80 font-sans text-xs hover:text-emerald-300 transition-all font-semibold flex items-center gap-1"
								to="#humanitarian"
							>
								<span>🇵🇸 Palestine Relief</span>
							</click>
						</div>
						<div className="flex flex-col gap-4 font-mono">
							<span className="text-[#FAFAFA] text-[10px] tracking-widest font-bold uppercase">
								SOCIAL
							</span>
							<click
								className="text-[#b5b5b5]/60 font-sans text-xs hover:text-[#E11D48] transition-all"
								to="https://twitter.com"
								target="_blank"
								rel="noreferrer"
							>
								Twitter
							</click>
							<click
								className="text-[#b5b5b5]/60 font-sans text-xs hover:text-[#E11D48] transition-all"
								to="#"
							>
								Blog
							</click>
						</div>
						<div className="flex flex-col gap-4 font-mono">
							<span className="text-[#FAFAFA] text-[10px] tracking-widest font-bold uppercase">
								LEGAL
							</span>
							<click
								className="text-[#b5b5b5]/60 font-sans text-xs hover:text-[#E11D48] transition-all"
								to="#"
							>
								Privacy
							</click>
						</div>
					</div>
				</div>

				<div className="max-w-7xl mx-auto px-6 md:px-10 flex justify-between items-center border-t border-white/5 pt-10 relative z-10">
					<p className="text-[#b5b5b5]/30 font-mono text-[10px]">
						© 2026 Rakta.js Inc. Engineered for speed.
					</p>
					<div className="flex gap-6 text-[#b5b5b5]/30">
						<span className="text-[12px] font-mono">Vyagra Nexus™</span>
						<span className="text-[12px] font-mono">Cirebon</span>
					</div>
				</div>
			</footer>

			{/* Render Modals with interactive portal overlays */}
			<DocsModal
				isOpen={isDocsOpen}
				onClose={() => {
					playJumpSound();
					setIsDocsOpen(false);
				}}
			/>

			<ComponentsModal
				isOpen={isComponentsOpen}
				onClose={() => {
					playJumpSound();
					setIsComponentsOpen(false);
				}}
			/>

			<DeployModal
				isOpen={isDeployOpen}
				onClose={() => {
					playJumpSound();
					setIsDeployOpen(false);
				}}
			/>
		</div>
	);
}
