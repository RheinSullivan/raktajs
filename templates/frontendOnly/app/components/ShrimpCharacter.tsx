// biome-ignore-all lint: Generated Rakta.js welcome starter mirrors the source design.
// biome-ignore-all assist: Generated Rakta.js welcome starter mirrors the source design.
// NOTE: Rakta.js uses automatic JSX transform — no React import needed.

interface ShrimpCharacterProps {
	status: "IDLE" | "SWIMMING" | "JUMPING" | "DEAD";
	playerY: number;
	rotation?: number;
}

export default function ShrimpCharacter({
	status,
	playerY,
	rotation,
}: ShrimpCharacterProps) {
	// Determine tail animation, legs animation, and body rotation/curving based on status
	let bodyClass = "";
	let tailClass = "";
	let legsClass = "";
	let antennaClass = "";
	let shrimpColor = "fill-rose-500";
	let shellShade = "fill-rose-600";
	let eyeColor = "fill-black";
	let isDead = status === "DEAD";

	if (status === "DEAD") {
		bodyClass = "animate-bounce"; // floats dead-like
		shrimpColor = "fill-orange-400"; // "cooked" color
		shellShade = "fill-orange-500";
		eyeColor = "fill-zinc-800";
	} else if (status === "SWIMMING") {
		bodyClass = "animate-[shrimp-swim_0.4s_infinite_alternate]";
		tailClass = "animate-[shrimp-tail_0.2s_infinite_alternate]";
		legsClass = "animate-[shrimp-legs_0.15s_infinite_alternate]";
		antennaClass = "animate-[shrimp-antenna_0.6s_infinite_alternate]";
	} else {
		// IDLE
		bodyClass = "animate-[shrimp-float_2s_infinite_ease-in-out]";
		tailClass = "animate-[shrimp-tail_0.8s_infinite_alternate]";
		legsClass = "animate-[shrimp-legs_0.6s_infinite_alternate]";
		antennaClass = "animate-[shrimp-antenna_1.5s_infinite_alternate]";
	}

	// Calculate dynamic rotation based on jump velocity/height or supplied rotation prop
	const finalRotation =
		rotation !== undefined
			? rotation
			: isDead
				? 180
				: Math.sin(Date.now() / 150) * 5;

	return (
		<div
			className="relative w-16 h-16 flex items-center justify-center select-none pointer-events-none transition-transform duration-75"
			style={{
				transform: `rotate(${finalRotation}deg)`,
			}}
		>
			{/* Little Bubble Trail from Shrimp Mouth (Only when active/swimming) */}
			{!isDead && status !== "IDLE" && (
				<div className="absolute -left-2 top-4 w-12 h-6 pointer-events-none overflow-visible">
					<div className="absolute left-0 bottom-0 w-1.5 h-1.5 bg-cyan-200/40 rounded-full animate-[bubble-up_0.8s_infinite_ease-out_infinite] scale-75"></div>
					<div className="absolute left-2 top-1 w-2.5 h-2.5 bg-cyan-200/30 rounded-full animate-[bubble-up_1.2s_infinite_ease-out_infinite_0.3s]"></div>
					<div className="absolute left-4 bottom-2 w-2 h-2 bg-white/40 rounded-full animate-[bubble-up_1s_infinite_ease-out_infinite_0.1s] scale-90"></div>
				</div>
			)}

			{/* Main Shrimp SVG */}
			<svg
				viewBox="0 0 100 100"
				className={`w-full h-full drop-shadow-[0_4px_12px_rgba(244,63,94,0.3)] ${bodyClass}`}
			>
				<defs>
					<linearGradient id="shrimpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop
							offset="0%"
							className={
								isDead ? "stop-color-orange-300" : "stop-color-rose-400"
							}
							style={{ stopColor: isDead ? "#fb923c" : "#fb7185" }}
						/>
						<stop
							offset="100%"
							className={
								isDead ? "stop-color-orange-600" : "stop-color-rose-600"
							}
							style={{ stopColor: isDead ? "#ea580c" : "#e11d48" }}
						/>
					</linearGradient>
					<linearGradient id="coralGrad" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" style={{ stopColor: "#06b6d4" }} />
						<stop offset="100%" style={{ stopColor: "#0891b2" }} />
					</linearGradient>
				</defs>

				{/* Antennas / Sungut (waving forward) */}
				<g className={antennaClass} style={{ transformOrigin: "75px 45px" }}>
					<path
						d="M 72 42 C 85 35, 95 38, 102 34"
						fill="none"
						stroke={isDead ? "#fdba74" : "#fecdd3"}
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
					<path
						d="M 72 45 C 88 48, 97 52, 105 53"
						fill="none"
						stroke={isDead ? "#fdba74" : "#fecdd3"}
						strokeWidth="1.2"
						strokeLinecap="round"
					/>
				</g>

				{/* Swimmerets / Kaki Renang (underneath) */}
				<g className={legsClass} style={{ transformOrigin: "50px 60px" }}>
					{/* Leg 1 */}
					<path
						d="M 40 58 Q 38 68 33 66"
						fill="none"
						stroke={isDead ? "#f97316" : "#fda4af"}
						strokeWidth="2.5"
						strokeLinecap="round"
					/>
					{/* Leg 2 */}
					<path
						d="M 48 58 Q 46 69 41 67"
						fill="none"
						stroke={isDead ? "#f97316" : "#fda4af"}
						strokeWidth="2.5"
						strokeLinecap="round"
					/>
					{/* Leg 3 */}
					<path
						d="M 56 57 Q 55 68 51 66"
						fill="none"
						stroke={isDead ? "#f97316" : "#fda4af"}
						strokeWidth="2.5"
						strokeLinecap="round"
					/>
					{/* Leg 4 */}
					<path
						d="M 64 56 Q 63 66 60 64"
						fill="none"
						stroke={isDead ? "#f97316" : "#fda4af"}
						strokeWidth="2"
						strokeLinecap="round"
					/>
				</g>

				{/* Segmented Body Curves */}
				{/* Tail Segment & Fan (Ekor) */}
				<g className={tailClass} style={{ transformOrigin: "28px 45px" }}>
					{/* Tail fan */}
					<path
						d="M 16 38 C 12 34, 10 44, 8 41 C 10 45, 11 50, 15 48 C 12 53, 8 50, 6 54 C 11 56, 17 52, 20 46 Z"
						fill="url(#shrimpGrad)"
					/>
					{/* Segment 1 */}
					<path d="M 28 46 Q 20 48 22 40 Q 30 38 28 46" fill={shellShade} />
				</g>

				{/* Main curved middle segments */}
				<path
					d="M 30 46 C 25 32, 45 22, 58 28 C 65 31, 62 48, 55 54 C 44 58, 35 55, 30 46 Z"
					fill="url(#shrimpGrad)"
				/>

				{/* Shell Segments detailing overlays */}
				<path
					d="M 36 34 C 40 28, 48 28, 52 32 C 48 38, 42 38, 36 34 Z"
					fill={shellShade}
					opacity="0.6"
				/>
				<path
					d="M 44 38 C 48 32, 55 34, 58 38 C 54 44, 48 44, 44 38 Z"
					fill={shellShade}
					opacity="0.6"
				/>
				<path
					d="M 50 43 C 54 39, 60 41, 62 45 C 58 50, 53 50, 50 43 Z"
					fill={shellShade}
					opacity="0.6"
				/>

				{/* Head Segment (Kepala) */}
				<path
					d="M 55 30 C 65 24, 76 34, 74 46 C 72 54, 62 55, 55 48 Z"
					fill="url(#shrimpGrad)"
				/>
				{/* Head horn (Rostrum) */}
				<path d="M 72 38 L 84 34 L 75 42 Z" fill="url(#shrimpGrad)" />

				{/* Eye (Mata) */}
				{isDead ? (
					// "X" Eye for dead state
					<g>
						<path
							d="M 64 36 L 68 40 M 68 36 L 64 40"
							stroke="#18181b"
							strokeWidth="2.5"
							strokeLinecap="round"
						/>
					</g>
				) : (
					// Cute big shiny eye
					<g>
						<circle cx="66" cy="38" r="4.5" fill={eyeColor} />
						<circle cx="67.5" cy="36.5" r="1.5" fill="white" />
					</g>
				)}

				{/* Cute blush under eye (Only when alive) */}
				{!isDead && (
					<ellipse
						cx="68"
						cy="44"
						rx="3.5"
						ry="2"
						fill="#fda4af"
						opacity="0.8"
					/>
				)}

				{/* Little decorative shell sparkles */}
				{!isDead && (
					<path
						d="M 45 24 L 47 26 M 47 24 L 45 26"
						stroke="#ffffff"
						strokeWidth="1"
						strokeLinecap="round"
						opacity="0.5"
					/>
				)}
			</svg>

			{/* Style overrides for custom keyframe animations inside index.css */}
			<style>{`
        @keyframes shrimp-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes shrimp-swim {
          0% { transform: scale(1) translateY(0); }
          100% { transform: scale(1.02, 0.98) translateY(-1px); }
        }
        @keyframes shrimp-tail {
          0% { transform: rotate(-5deg); }
          100% { transform: rotate(8deg); }
        }
        @keyframes shrimp-legs {
          0% { transform: rotate(-10deg); }
          100% { transform: rotate(15deg); }
        }
        @keyframes shrimp-antenna {
          0% { transform: rotate(-2deg); }
          100% { transform: rotate(3deg); }
        }
        @keyframes bubble-up {
          0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translate(-30px, -40px) scale(1.2); opacity: 0; }
        }
      `}</style>
		</div>
	);
}
