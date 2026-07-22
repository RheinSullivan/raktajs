// biome-ignore-all lint: Generated Rakta.js welcome starter mirrors the source design.
// biome-ignore-all assist: Generated Rakta.js welcome starter mirrors the source design.
// NOTE: useState, useEffect, useRef are auto-imported by Rakta.js — no explicit import needed.

// Helper function to dynamically generate small, medium, and large coral sizes randomly
const getRandomObstacleSize = (
	pos: "TOP" | "BOTTOM",
): {
	height: number;
	width: number;
	sizeClass: "KECIL" | "SEDANG" | "BESAR";
} => {
	const rand = Math.random();
	let sizeClass: "KECIL" | "SEDANG" | "BESAR";
	let height = 60;
	let width = 40;

	if (rand < 0.33) {
		sizeClass = "KECIL";
		height = Math.floor(Math.random() * 8) + 32; // 32 - 40px (Small & super easy to dodge)
		width = Math.floor(Math.random() * 5) + 26; // 26 - 31px
	} else if (rand < 0.67) {
		sizeClass = "SEDANG";
		height = Math.floor(Math.random() * 10) + 55; // 55 - 65px (Standard medium size)
		width = Math.floor(Math.random() * 6) + 38; // 38 - 44px
	} else {
		sizeClass = "BESAR";
		height = Math.floor(Math.random() * 12) + 75; // 75 - 87px (Challenge size, still extremely fair)
		width = Math.floor(Math.random() * 6) + 48; // 48 - 54px
	}

	return { height, width, sizeClass };
};

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
	const [simSpeed, setSimSpeed] = useState<"NORMAL" | "FAST" | "TURBO">(
		"NORMAL",
	);

	// Game/Simulation States
	const [isPlaying, setIsPlaying] = useState(false);
	const [score, setScore] = useState(0);
	const [highScore, setHighScore] = useState(() => {
		try {
			return parseInt(
				localStorage.getItem("rakta_shrimprun_highscore") || "0",
				10,
			);
		} catch {
			return 0;
		}
	});
	const [hasCollision, setHasCollision] = useState(false);
	const [liveFps, setLiveFps] = useState(144.0);

	// Configuration Change Floating Toast State
	const [configToast, setConfigToast] = useState<string | null>(null);
	const toastTimeoutRef = useRef<any>(null);

	const showConfigToast = (message: string) => {
		if (toastTimeoutRef.current) {
			clearTimeout(toastTimeoutRef.current);
		}
		setConfigToast(message);
		toastTimeoutRef.current = setTimeout(() => {
			setConfigToast(null);
		}, 1800);
	};

	// Position references (Ref-based game loop for 144fps-smooth physics)
	const [playerY, setPlayerY] = useState(40); // in px from ground
	const [obstacleX, setObstacleX] = useState(100); // in percentage (0 to 100)
	const [obstaclePos, setObstaclePos] = useState<"TOP" | "BOTTOM">("BOTTOM");

	// Highly-variable obstacle properties
	const [obstaclePalette, setObstaclePalette] = useState(0);
	const [obstacleVariant, setObstacleVariant] = useState(0);
	const [obstacleScaleX, setObstacleScaleX] = useState(1);
	const [obstacleHeight, setObstacleHeight] = useState(95);
	const [obstacleWidth, setObstacleWidth] = useState(64);
	const [obstacleSizeClass, setObstacleSizeClass] = useState<
		"KECIL" | "SEDANG" | "BESAR"
	>("SEDANG");

	const playerYRef = useRef(40);
	const obstacleXRef = useRef(100);
	const obstaclePosRef = useRef<"TOP" | "BOTTOM">("BOTTOM");

	const obstacleHeightRef = useRef(95);
	const obstacleWidthRef = useRef(64);
	const obstaclePaletteRef = useRef(0);
	const obstacleVariantRef = useRef(0);
	const obstacleScaleXRef = useRef(1);
	const obstacleSizeClassRef = useRef<"KECIL" | "SEDANG" | "BESAR">("SEDANG");

	const isPlayingRef = useRef(false);
	const velocityRef = useRef(0);
	const scoreRef = useRef(0);

	const containerRef = useRef<HTMLDivElement>(null);
	const playerRef = useRef<HTMLDivElement>(null);
	const obstacleRef = useRef<HTMLDivElement>(null);
	const gameLoopId = useRef<number | null>(null);
	const lastTimeRef = useRef<number>(0);

	// Synchronize refs with state for local check loops
	useEffect(() => {
		isPlayingRef.current = isPlaying;
	}, [isPlaying]);

	// Audio configuration sync
	const handleToggleMute = () => {
		const nextMuted = !isMuted;
		setIsMutedState(nextMuted);
		setMute(nextMuted);
	};

	// Sound test / UI click sound
	const handleAestheticChange = (unit: AestheticUnit) => {
		setAestheticUnit(unit);
		playJumpSound();
		showConfigToast(`STYLE CHANGED: ${unit.replace("-", " ")}`);
	};

	// Jump/Swim control (continuous swim/flap, never locking or forcing ground return)
	const triggerJump = () => {
		if (!isPlayingRef.current) {
			startSimulation();
			return;
		}

		// Swimming upward stroke with slight water damping impulse
		velocityRef.current = 6.2;
		playJumpSound();
	};

	// Start/Restart Simulation
	const startSimulation = () => {
		// Reset positions and states to mid-water level
		playerYRef.current = 80;
		obstacleXRef.current = 100;

		const initialPos = Math.random() > 0.5 ? "TOP" : "BOTTOM";
		obstaclePosRef.current = initialPos;
		setObstaclePos(initialPos);

		const {
			height: initialHeight,
			width: initialWidth,
			sizeClass: initialSizeClass,
		} = getRandomObstacleSize(initialPos);
		obstacleHeightRef.current = initialHeight;
		setObstacleHeight(initialHeight);
		obstacleWidthRef.current = initialWidth;
		setObstacleWidth(initialWidth);
		obstacleSizeClassRef.current = initialSizeClass;
		setObstacleSizeClass(initialSizeClass);

		const initialPalette = Math.floor(Math.random() * 5);
		obstaclePaletteRef.current = initialPalette;
		setObstaclePalette(initialPalette);

		const initialVariant = Math.floor(Math.random() * 3);
		obstacleVariantRef.current = initialVariant;
		setObstacleVariant(initialVariant);

		const initialScaleX = Math.random() > 0.5 ? 1 : -1;
		obstacleScaleXRef.current = initialScaleX;
		setObstacleScaleX(initialScaleX);

		velocityRef.current = 0;
		scoreRef.current = 0;

		setPlayerY(80);
		setObstacleX(100);
		setScore(0);
		setHasCollision(false);
		setIsPlaying(true);
		isPlayingRef.current = true;

		lastTimeRef.current = performance.now();
	};

	// Physics game loop
	useEffect(() => {
		const tick = (timestamp: number) => {
			if (!isPlayingRef.current) {
				gameLoopId.current = requestAnimationFrame(tick);
				return;
			}

			// Calculate delta time for perfectly rate-independent smooth animation
			const now = performance.now();
			let dt = now - lastTimeRef.current;
			// Cap dt to prevent massive jumps when tab is inactive or window loses focus
			if (dt > 100) dt = 16.666;
			lastTimeRef.current = now;

			// Delta time factor normalized to standard 60 FPS (16.666 ms per frame)
			const dtFactor = dt / 16.666;

			// Live FPS Simulation (smooth fluctuations centered around 144Hz)
			const targetFps = lowLatencyMode ? 144.0 : 120.0;
			const flux = Math.random() * 0.16 - 0.08;
			setLiveFps(parseFloat((targetFps + flux).toFixed(2)));

			// Speed configuration modifier
			let speedFactor = 1.0;
			if (simSpeed === "FAST") speedFactor = 1.4;
			if (simSpeed === "TURBO") speedFactor = 1.9;

			// 1. Update swimming buoyancy physics (constant pull of water gravity) scaled by delta time
			playerYRef.current += velocityRef.current * dtFactor;
			velocityRef.current -= 0.32 * dtFactor; // Gentle water buoyancy damping

			// Bottom boundary (seabed)
			if (playerYRef.current < 0) {
				playerYRef.current = 0;
				velocityRef.current = 0;
			}

			const containerHeight = containerRef.current?.clientHeight || 380;
			const maxSwimHeight = containerHeight - 65; // keep within screen bounds nicely

			// Top boundary (ocean surface)
			if (playerYRef.current > maxSwimHeight) {
				playerYRef.current = maxSwimHeight;
				velocityRef.current = 0;
			}
			setPlayerY(playerYRef.current);

			// 2. Update OBSTACLE sliding (percentages 0 to 100), scaled by dtFactor for smooth, predictable speeds
			// Reduced base speed from 1.3 to 0.42 for amazing accessibility and precise reactions
			obstacleXRef.current -= 0.42 * speedFactor * dtFactor;

			if (obstacleXRef.current < -5) {
				obstacleXRef.current = 105; // Reset obstacle to right side

				// Randomly place coral at either TOP or BOTTOM
				const nextPos = Math.random() > 0.5 ? "TOP" : "BOTTOM";
				obstaclePosRef.current = nextPos;
				setObstaclePos(nextPos);

				// Highly-variable organic dimensions via our randomized category size generator
				const {
					height: nextHeight,
					width: nextWidth,
					sizeClass: nextSizeClass,
				} = getRandomObstacleSize(nextPos);
				obstacleHeightRef.current = nextHeight;
				setObstacleHeight(nextHeight);
				obstacleWidthRef.current = nextWidth;
				setObstacleWidth(nextWidth);
				obstacleSizeClassRef.current = nextSizeClass;
				setObstacleSizeClass(nextSizeClass);

				// Completely new randomized color palettes & forms on each pass
				const nextPalette = Math.floor(Math.random() * 5);
				obstaclePaletteRef.current = nextPalette;
				setObstaclePalette(nextPalette);

				const nextVariant = Math.floor(Math.random() * 3);
				obstacleVariantRef.current = nextVariant;
				setObstacleVariant(nextVariant);

				const nextScaleX = Math.random() > 0.5 ? 1 : -1;
				obstacleScaleXRef.current = nextScaleX;
				setObstacleScaleX(nextScaleX);

				scoreRef.current += 100;
				setScore(scoreRef.current);
				playScoreSound();

				// Save High Score
				if (scoreRef.current > highScore) {
					setHighScore(scoreRef.current);
					try {
						localStorage.setItem(
							"rakta_shrimprun_highscore",
							scoreRef.current.toString(),
						);
					} catch (e) {
						console.warn("Storage write failed", e);
					}
				}
			}
			setObstacleX(obstacleXRef.current);

			// 3. Collision Detection from real DOM boxes, so physics matches the visible SVG.
			const playerRect = playerRef.current?.getBoundingClientRect();
			const obstacleRect = obstacleRef.current?.getBoundingClientRect();
			let isCollided = false;

			if (playerRect && obstacleRect) {
				const shrimpHitbox = {
					left: playerRect.left + 12,
					right: playerRect.right - 10,
					top: playerRect.top + 15,
					bottom: playerRect.bottom - 20,
				};
				const coralHorizontalInset = Math.max(3, obstacleRect.width * 0.18);
				const coralVerticalInset =
					obstaclePosRef.current === "BOTTOM"
						? { top: obstacleRect.top + 5, bottom: obstacleRect.bottom }
						: { top: obstacleRect.top, bottom: obstacleRect.bottom - 5 };
				const coralHitbox = {
					left: obstacleRect.left + coralHorizontalInset,
					right: obstacleRect.right - coralHorizontalInset,
					top: coralVerticalInset.top,
					bottom: coralVerticalInset.bottom,
				};

				isCollided =
					shrimpHitbox.left < coralHitbox.right &&
					shrimpHitbox.right > coralHitbox.left &&
					shrimpHitbox.top < coralHitbox.bottom &&
					shrimpHitbox.bottom > coralHitbox.top;
			}

			if (isCollided) {
				// COLLISION DETECTED
				isPlayingRef.current = false;
				setIsPlaying(false);
				setHasCollision(true);
				playGameOverSound();
			}

			gameLoopId.current = requestAnimationFrame(tick);
		};

		gameLoopId.current = requestAnimationFrame(tick);

		return () => {
			if (gameLoopId.current) {
				cancelAnimationFrame(gameLoopId.current);
			}
		};
	}, [simSpeed, lowLatencyMode, highScore]);

	// Key event listeners for jumping
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.code === "Space") {
				e.preventDefault();
				triggerJump();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
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
			{/* Top Navigation Bar (Header) - PRESERVED */}
			<header className="bg-[#0d0e0f]/60 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 border-b border-white/5">
				<nav className="grid grid-cols-2 md:grid-cols-3 items-center w-full px-6 md:px-10 py-5 max-w-7xl mx-auto">
					{/* Logo on the left */}
					<div className="flex justify-start">
						{/* Rakta.js <click> SPA anchor + <photo> optimized image */}
						<click
							className="font-mono text-xl font-extrabold text-[#FAFAFA] tracking-tighter flex items-center gap-2"
							to="/"
						>
							{/* Rakta.js <photo> component: replaces <img> with built-in lazy loading */}
							<photo
								path="/rakta-logo.svg"
								alt="Rakta.js Logo"
								className="w-6 h-6 md:w-7 md:h-7 shrink-0"
								draggable={false}
							/>
							<span className="text-[#E11D48]">Rakta.js</span>
						</click>
					</div>

					{/* Center navigation links using Rakta.js <click to> paths */}
					<div className="hidden md:flex justify-center items-center gap-7">
						<click
							className="text-[#E11D48] font-bold border-b border-[#E11D48] pb-0.5 font-mono text-[11px] tracking-wider uppercase"
							to="https://raktajs.dev/showcase"
							target="_blank"
							rel="noopener noreferrer"
						>
							Showcase
						</click>
						<click
							className="text-[#b5b5b5] font-bold hover:text-[#FAFAFA] transition-colors font-mono text-[11px] tracking-wider uppercase"
							to="https://raktajs.dev/docs"
							target="_blank"
							rel="noopener noreferrer"
						>
							Docs
						</click>
						<click
							className="text-[#b5b5b5] font-bold hover:text-[#FAFAFA] transition-colors font-mono text-[11px] tracking-wider uppercase"
							to="/shrimprun"
						>
							ShrimpRun
						</click>
						<click
							className="text-[#b5b5b5] font-bold hover:text-[#FAFAFA] transition-colors font-mono text-[11px] tracking-wider uppercase"
							to="https://www.npmjs.com/package/create-rakta-app"
							target="_blank"
							rel="noopener noreferrer"
						>
							Get Started
						</click>
					</div>

					{/* Action items on the right */}
					<div className="flex justify-end items-center gap-5">
						<div className="flex items-center gap-3.5 text-[#b5b5b5]/60">
							<a
								href="https://github.com/RheinSullivan/raktajs"
								target="_blank"
								rel="noopener noreferrer"
								title="View GitHub"
								className="hover:text-[#E11D48] cursor-pointer transition-colors p-1"
							>
								<Github size={18} />
							</a>
						</div>
						<a
							href="https://raktajs.dev/"
							target="_blank"
							rel="noopener noreferrer"
							className="bg-[#E11D48] text-[#FAFAFA] px-5 py-1.5 font-mono text-[11px] font-bold tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all border border-[#E11D48]/30 text-center"
						>
							raktajs.dev
						</a>
					</div>
				</nav>
			</header>

			{/* Main Content Area */}
			<main className="pt-24 md:pt-32 px-5 md:px-10 max-w-7xl mx-auto flex flex-col gap-12 relative z-10">
				{/* Header Sound Toggle button and configuration (Self-contained widget) */}
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-3">
						<span className="h-2 w-2 rounded-full bg-brand-green animate-pulse"></span>
						<span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
							RAKTA SANDBOX RUNNING
						</span>
					</div>
					<button
						onClick={handleToggleMute}
						className="flex items-center gap-2 border border-zinc-800 hover:border-white px-3 py-1.5 font-mono text-[10px] text-zinc-400 hover:text-white uppercase transition-colors cursor-pointer"
						title="Toggle Synthesizer Sound Effects"
					>
						{isMuted ? (
							<>
								<VolumeX className="w-3.5 h-3.5 text-brand-pink" /> AUDIO: MUTED
							</>
						) : (
							<>
								<Volume2 className="w-3.5 h-3.5 text-brand-green" /> AUDIO:
								ACTIVE
							</>
						)}
					</button>
				</div>

				{/* Hero Section */}
				<section className="flex flex-col gap-6 items-start">
					<span className="font-mono text-xs font-bold text-brand-pink border border-brand-pink px-3.5 py-1.5 tracking-wider uppercase">
						V1.0.1
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
							1.0.1
						</span>
					</div>
					<div className="p-6 md:p-8 flex flex-col gap-2 group hover:bg-white/5 transition-colors">
						<span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
							STATUS
						</span>
						<div className="flex items-center gap-2.5">
							<div className="w-2.5 h-2.5 bg-brand-green animate-pulse"></div>
							<span className="font-mono text-xl text-white font-semibold">
								OPERATIONAL
							</span>
						</div>
					</div>
					<div className="p-6 md:p-8 flex flex-col gap-2 group hover:bg-white/5 transition-colors">
						<span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
							PORT <Info className="w-3 h-3 text-brand-pink" />
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
				<section id="shrimprun" className="flex flex-col gap-4 scroll-mt-28">
					<div className={containerBorderClass}>
						<div
							ref={containerRef}
							onClick={triggerJump}
							className={viewportClass}
							id="game-viewport"
						>
							{/* Dynamic CSS Keyframes for Ocean & Cyber Scenery */}
							<style>{`
                @keyframes seaweed-wave-1 {
                  0% { transform: skewX(-14deg) rotate(-8deg) scaleY(0.96); }
                  50% { transform: skewX(0deg) rotate(0deg) scaleY(1.04); }
                  100% { transform: skewX(14deg) rotate(8deg) scaleY(0.96); }
                }
                @keyframes seaweed-wave-2 {
                  0% { transform: skewX(10deg) rotate(6deg) scaleY(1.04); }
                  50% { transform: skewX(-2deg) rotate(-2deg) scaleY(0.96); }
                  100% { transform: skewX(-10deg) rotate(-6deg) scaleY(1.04); }
                }
                @keyframes bubble-rise {
                  0% { transform: translateY(0) translateX(0) scale(0.6); opacity: 0; }
                  10% { opacity: 0.7; }
                  90% { opacity: 0.7; }
                  100% { transform: translateY(-440px) translateX(30px) scale(1.3); opacity: 0; }
                }
                @keyframes rays-drift {
                  0%, 100% { opacity: 0.5; transform: skewX(-15deg) scaleX(1); }
                  50% { opacity: 0.7; transform: skewX(-5deg) scaleX(1.1); }
                }
                @keyframes cyber-rise {
                  0% { transform: translateY(0) translateX(0) scale(0.6); opacity: 0; }
                  10% { opacity: 0.8; }
                  90% { opacity: 0.8; }
                  100% { transform: translateY(-440px) translateX(-20px) scale(1.2); opacity: 0; }
                }
                .seaweed-waving-left-1 {
                  transform-origin: bottom center;
                  animation: seaweed-wave-1 3.5s infinite ease-in-out alternate;
                }
                .seaweed-waving-left-2 {
                  transform-origin: bottom center;
                  animation: seaweed-wave-2 4.2s infinite ease-in-out alternate;
                }
                .seaweed-waving-right-1 {
                  transform-origin: bottom center;
                  animation: seaweed-wave-1 4.8s infinite ease-in-out alternate;
                }
                .seaweed-waving-right-2 {
                  transform-origin: bottom center;
                  animation: seaweed-wave-2 3.9s infinite ease-in-out alternate;
                }
              `}</style>

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
											backgroundImage: `linear-gradient(rgba(240, 46, 170, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(240, 46, 170, 0.2) 1px, transparent 1px)`,
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
									<div className="absolute inset-0 pointer-events-none z-10 opacity-5 bg-[linear-gradient(to_bottom,rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(to_right,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]" />
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
									className={`font-mono text-3xl md:text-4xl tracking-widest font-extrabold ${aestheticUnit === "NEO-BRUTALIST"
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
										className={`font-mono text-[10px] mt-1 ${aestheticUnit === "NEO-BRUTALIST"
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
									className={`font-mono text-lg md:text-xl font-bold ${aestheticUnit === "NEO-BRUTALIST"
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
									className={`text-center z-20 pointer-events-none p-4 max-w-sm rounded backdrop-blur-sm ${aestheticUnit === "NEO-BRUTALIST"
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
										className={`font-mono text-[10px] mt-2 font-bold tracking-widest uppercase ${aestheticUnit === "NEO-BRUTALIST"
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
									className={`text-center z-20 pointer-events-none p-6 max-w-sm rounded backdrop-blur-md ${aestheticUnit === "NEO-BRUTALIST"
											? "bg-[#FFFBEB] border-4 border-black text-black shadow-[8px_8px_0px_#000000]"
											: aestheticUnit === "RETRO-CYBER"
												? "bg-[#0d0118]/95 border-2 border-pink-500 text-pink-400 shadow-[0_0_20px_rgba(244,63,94,0.6)]"
												: "bg-black/90 border-2 border-brand-pink text-white"
										}`}
								>
									<p
										className={`font-mono text-sm uppercase tracking-widest font-extrabold ${aestheticUnit === "NEO-BRUTALIST"
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
										className={`font-mono text-xs mt-4 font-bold border px-3 py-1 animate-pulse ${aestheticUnit === "NEO-BRUTALIST"
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
								ref={playerRef}
								className="absolute left-[18%] z-20 flex items-center justify-center"
								style={{
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
												: Math.max(
													-28,
													Math.min(28, velocityRef.current * -4.2),
												)
									}
								/>
							</div>

							{/* Coral Reef Obstacle */}
							<div
								ref={obstacleRef}
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
									className={`absolute bottom-4 left-6 flex items-center gap-1.5 font-mono text-[9px] z-20 font-semibold uppercase tracking-wider ${aestheticUnit === "NEO-BRUTALIST"
											? "text-black bg-white border border-black px-1.5 py-0.5 shadow-[1px_1px_0_#000]"
											: aestheticUnit === "RETRO-CYBER"
												? "text-fuchsia-400"
												: "text-cyan-400"
										}`}
								>
									<span
										className={`w-1.5 h-1.5 rounded-full animate-ping ${aestheticUnit === "NEO-BRUTALIST" ? "bg-black" : "bg-cyan-400"}`}
									></span>
									SWIMMING IN STRONG CURRENTS
								</div>
							)}

							{/* Floating Settings/Config Toast */}
							{configToast && (
								<div
									className={`absolute bottom-12 px-4 py-1.5 font-mono text-[10px] z-30 font-bold uppercase tracking-widest animate-bounce ${aestheticUnit === "NEO-BRUTALIST"
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
							<span className="w-1 h-1 bg-zinc-800 rounded-full hidden sm:inline"></span>

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
											onClick={() => handleAestheticChange(unit)}
											className={`transition-all cursor-pointer ${btnClass}`}
										>
											{unit}
										</button>
									);
								})}
							</div>

							<span className="w-1 h-1 bg-zinc-800 rounded-full hidden sm:inline"></span>

							<div className="flex items-center gap-1.5">
								<span>CORAL:</span>
								<span
									className={`px-2 py-0.5 font-bold text-[9px] tracking-wider rounded border ${aestheticUnit === "NEO-BRUTALIST"
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
									onClick={() => {
										const nextMode = !lowLatencyMode;
										setLowLatencyMode(nextMode);
										playJumpSound();
										showConfigToast(
											`LATENCY MODE: ${nextMode ? "LOW LATENCY" : "STANDARD"}`,
										);
									}}
									className={`px-2 py-0.5 font-bold cursor-pointer transition-all ${aestheticUnit === "NEO-BRUTALIST"
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
				<section className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-surface-stroke mt-10">
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
							<ArrowRight className="w-3.5 h-3.5" />
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
							<ArrowRight className="w-3.5 h-3.5" />
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
							<ArrowRight className="w-3.5 h-3.5" />
						</div>
					</div>
				</section>
			</main>

			{/* Footer Element WITH exclusive background-image hotlink - PRESERVED */}
			<footer
				className="border-t border-white/5 bg-[#0d0e0f]/90 pt-20 pb-12 relative overflow-hidden"
				style={{
					backgroundImage: `url('https://lh3.googleusercontent.com/aida/AP1WRLt-u2z0I8QQa-lz7v4xuAy7_-SEjx9iK_2gAihPLP2Y7cE8xVyD3_xEQIboq7JajowWZ7gxnxwWwWUrYF-9OVlrfWV92x_58F0PTrOHmqdfMJlyB6-s4n_tB1AuahHSDxyn6wQdledyhbe89hi8dtnB5nHXg5lmmS8o1XuzUPBMqoS9FinRmJWUBCW3fapYfl1pJhBVtx0f8_iBatLEeHoGv5BYZIrFx0uQpURC5uan42Vfg0p3Tqa0WrA')`,
					backgroundRepeat: "repeat",
					backgroundAttachment: "scroll",
				}}
			>
				<div className="absolute inset-0 bg-[#0d0e0f]/90 z-0 pointer-events-none" />

				<div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-start gap-16 mb-20 relative z-10">
					<div className="flex flex-col items-start gap-6 max-w-xs">
						{/* Footer brand with logo + name — Rakta.js <click> + <photo> */}
						<click to="/" className="flex items-center gap-2.5 group">
							<photo
								path="/rakta-logo.svg"
								alt="Rakta.js Logo"
								className="w-7 h-7 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity"
								draggable={false}
							/>
							<span className="font-mono text-2xl font-extrabold text-[#FAFAFA] tracking-tighter">
								Rakta.js
							</span>
						</click>
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
							<a
								className="text-[#b5b5b5]/60 font-sans text-xs hover:text-[#E11D48] transition-all"
								href="https://raktajs.dev/docs"
								target="_blank"
								rel="noopener noreferrer"
							>
								Documentation
							</a>
							<a
								className="text-[#b5b5b5]/60 font-sans text-xs hover:text-[#E11D48] transition-all"
								href="https://raktajs.dev/showcase"
								target="_blank"
								rel="noopener noreferrer"
							>
								Showcase
							</a>
						</div>
						<div className="flex flex-col gap-4 font-mono">
							<span className="text-[#FAFAFA] text-[10px] tracking-widest font-bold uppercase">
								COMMUNITY
							</span>
							<a
								className="text-[#b5b5b5]/60 font-sans text-xs hover:text-[#E11D48] transition-all"
								href="https://github.com/RheinSullivan/raktajs/"
								target="_blank"
								rel="noreferrer"
							>
								GitHub
							</a>
							<a
								className="text-[#b5b5b5]/60 font-sans text-xs hover:text-[#E11D48] transition-all"
								href="https://discord.com"
								target="_blank"
								rel="noreferrer"
							>
								Discord
							</a>
						</div>
						<div className="flex flex-col gap-4 font-mono">
							<span className="text-[#FAFAFA] text-[10px] tracking-widest font-bold uppercase">
								SOCIAL
							</span>
							<a
								className="text-[#b5b5b5]/60 font-sans text-xs hover:text-[#E11D48] transition-all"
								href="https://twitter.com"
								target="_blank"
								rel="noreferrer"
							>
								Twitter
							</a>
							<click
								className="text-[#b5b5b5]/60 font-sans text-xs hover:text-[#E11D48] transition-all"
								to="/"
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
								to="/"
							>
								Privacy
							</click>
						</div>
					</div>
				</div>

				<div className="max-w-7xl mx-auto px-6 md:px-10 flex justify-between items-center border-t border-white/5 pt-10 relative z-10">
					<p className="text-[#b5b5b5]/30 font-mono text-[10px]">
						© 2024 Rakta.js Inc. Engineered for speed.
					</p>
					<div className="flex gap-6 text-[#b5b5b5]/30">
						<span className="material-symbols-outlined text-[16px]">
							Rhein Sullivan
						</span>
						<span className="material-symbols-outlined text-[16px]">
							Vyagra Nexus
						</span>
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
