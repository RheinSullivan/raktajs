// biome-ignore-all lint/suspicious/noTemplateCurlyInString: Starter templates intentionally contain template-string source code.

export const STARTER_CORAL_OBSTACLE_CODE = `// biome-ignore-all lint: Generated Rakta.js welcome starter mirrors the source design.
// biome-ignore-all assist: Generated Rakta.js welcome starter mirrors the source design.
// NOTE: Rakta.js uses automatic JSX transform - no React import needed.

interface CoralObstacleProps {
	position: "TOP" | "BOTTOM";
	height: number;
	width?: number;
	paletteIndex?: number;
	variant?: number;
	scaleX?: number;
}

export default function CoralObstacle({
	position,
	height,
	width = 64,
	paletteIndex = 0,
	variant = 0,
	scaleX = 1,
}: CoralObstacleProps) {
	const palettes = [
		{ primary: "#f43f5e", secondary: "#fda4af", shadow: "#9f1239", polyps: "#ffe4e6", name: "rose" },
		{ primary: "#06b6d4", secondary: "#67e8f9", shadow: "#155e75", polyps: "#ecfeff", name: "cyan" },
		{ primary: "#a855f7", secondary: "#d8b4fe", shadow: "#581c87", polyps: "#faf5ff", name: "amethyst" },
		{ primary: "#f59e0b", secondary: "#fde047", shadow: "#78350f", polyps: "#fefce8", name: "amber" },
		{ primary: "#10b981", secondary: "#6ee7b7", shadow: "#065f46", polyps: "#e6fffa", name: "emerald" },
	];
	const palette = palettes[paletteIndex % palettes.length]!;
	return (
		<div className="absolute flex items-center justify-center pointer-events-none" style={{ height: \`\${height}px\`, width: \`\${width}px\`, transform: \`scaleX(\${scaleX})\` }}>
			<svg viewBox="0 0 80 120" className="w-full h-full drop-shadow-[0_6px_14px_rgba(0,0,0,0.7)]" preserveAspectRatio="none">
				<defs>
					<linearGradient id={\`coralGrad-\${palette.name}\`} x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor={palette.secondary} />
						<stop offset="50%" stopColor={palette.primary} />
						<stop offset="100%" stopColor={palette.shadow} />
					</linearGradient>
					<filter id="coralGlow">
						<feGaussianBlur stdDeviation="1.8" result="coloredBlur" />
						<feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
					</filter>
				</defs>
				<g transform={position === "TOP" ? "scale(1, -1) translate(0, -120)" : undefined} filter="url(#coralGlow)">
					{variant === 0 ? (
						<g>
							<path d="M 35 120 C 30 100, 15 90, 10 70 C 5 50, 20 40, 15 25 C 10 10, 25 5, 30 15 C 35 30, 28 45, 38 65 Q 42 90, 40 120" fill={palette.shadow} opacity="0.85" />
							<path d="M 40 120 C 35 90, 20 80, 24 55 C 28 30, 15 20, 22 10 C 29 0, 37 15, 35 30 C 33 45, 42 55, 40 75 C 38 95, 42 110, 40 120 Z" fill={\`url(#coralGrad-\${palette.name})\`} />
							<circle cx="22" cy="11" r="3.5" fill={palette.secondary} />
						</g>
					) : <g><path d="M 40 120 C 40 95, 18 80, 12 50 C 6 20, 32 10, 40 28 C 48 10, 74 20, 68 50 C 62 80, 40 95, 40 120 Z" fill={\`url(#coralGrad-\${palette.name})\`} opacity="0.3" /></g>}
				</g>
			</svg>
		</div>
	);
}
`;

export const STARTER_TYPES_CODE = `// biome-ignore-all lint: Generated Rakta.js welcome starter mirrors the source design.
// biome-ignore-all assist: Generated Rakta.js welcome starter mirrors the source design.
export interface SystemMetric {
	name: string;
	value: string | number;
	status: "nominal" | "warning" | "critical";
}

export interface GameHighScore {
	name: string;
	score: number;
	date: string;
}

export type AestheticUnit = "LENIS-MODERN" | "RETRO-CYBER" | "NEO-BRUTALIST";

export interface DocArticle {
	id: string;
	title: string;
	category: string;
	content: string;
}
`;

export const STARTER_CSS_CODE = `@import url("https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap");
:root {
	--font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;
	--font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
	--color-brand-pink: #e11d48;
	--color-brand-green: #00ff00;
	--color-surface-bg: #000000;
	--color-surface-card: #0d0d0d;
	--color-surface-stroke: #1f1f1f;
}
body {
	background-color: #000000;
	color: #ffffff;
	font-family: var(--font-sans);
	overflow-x: hidden;
}
`;

export const STARTER_PAGE_CODE = `// biome-ignore-all lint: Template welcome starter Rakta.js , cerminan desain resmi.
// biome-ignore-all assist: Template welcome starter Rakta.js , cerminan desain resmi.
// Halaman utama Rakta.js - Welcome Experience converted from React.js original by Muhammad Rizky Ramadhan (Rhein Sullivan)

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
		showConfigToast(\`STYLE CHANGED: \${unit.replace("-", " ")}\`);
	};

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
				{/* Humanitarian Solidarity Section (Section 4) */}
				<section
					id="humanitarian"
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

					{/* 3-Column Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-0">
						{/* Card 1: Channel & Allocation Notice */}
						<div className="border-b border-surface-stroke md:border-b-0 md:border-r border-surface-stroke p-8 md:p-12 flex flex-col justify-between min-h-[260px] bg-black hover:bg-white hover:text-black group transition-all duration-300">
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
						<div className="border-b border-surface-stroke md:border-b-0 md:border-r border-surface-stroke p-8 md:p-12 flex flex-col justify-between min-h-[260px] bg-black hover:bg-white hover:text-black group transition-all duration-300">
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
						<div className="p-8 md:p-12 flex flex-col justify-between min-h-[260px] bg-black hover:bg-white hover:text-black group transition-all duration-300">
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
		</div>
	);
}
`;
