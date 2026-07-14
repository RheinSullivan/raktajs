// biome-ignore-all lint: Generated Rakta.js welcome starter mirrors the source design.
// biome-ignore-all assist: Generated Rakta.js welcome starter mirrors the source design.
import React from "react";

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
	// High-fidelity glowing marine palettes
	const palettes = [
		{
			primary: "#f43f5e",
			secondary: "#fda4af",
			shadow: "#9f1239",
			polyps: "#ffe4e6",
			name: "rose",
		}, // 0: Neon Rose
		{
			primary: "#06b6d4",
			secondary: "#67e8f9",
			shadow: "#155e75",
			polyps: "#ecfeff",
			name: "cyan",
		}, // 1: Cyan Glow
		{
			primary: "#a855f7",
			secondary: "#d8b4fe",
			shadow: "#581c87",
			polyps: "#faf5ff",
			name: "amethyst",
		}, // 2: Amethyst Purple
		{
			primary: "#f59e0b",
			secondary: "#fde047",
			shadow: "#78350f",
			polyps: "#fefce8",
			name: "amber",
		}, // 3: Gold Amber
		{
			primary: "#10b981",
			secondary: "#6ee7b7",
			shadow: "#065f46",
			polyps: "#e6fffa",
			name: "emerald",
		}, // 4: Neon Emerald
	];

	const palette = palettes[paletteIndex % palettes.length];

	return (
		<div
			className="absolute flex items-center justify-center pointer-events-none"
			style={{
				height: `${height}px`,
				width: `${width}px`,
				transform: `scaleX(${scaleX})`,
			}}
		>
			<svg
				viewBox="0 0 80 120"
				className="w-full h-full drop-shadow-[0_6px_14px_rgba(0,0,0,0.7)]"
				preserveAspectRatio="none"
			>
				<defs>
					<linearGradient
						id={`coralGrad-${palette.name}`}
						x1="0%"
						y1="0%"
						x2="100%"
						y2="100%"
					>
						<stop offset="0%" stopColor={palette.secondary} />
						<stop offset="50%" stopColor={palette.primary} />
						<stop offset="100%" stopColor={palette.shadow} />
					</linearGradient>
					<filter id="coralGlow">
						<feGaussianBlur stdDeviation="1.8" result="coloredBlur" />
						<feMerge>
							<feMergeNode in="coloredBlur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				<g
					transform={
						position === "TOP" ? "scale(1, -1) translate(0, -120)" : undefined
					}
					filter="url(#coralGlow)"
				>
					{variant === 0 ? (
						// VARIANT 0: Staghorn Branching Coral
						<g>
							{/* Background sub-branches */}
							<path
								d="M 35 120 C 30 100, 15 90, 10 70 C 5 50, 20 40, 15 25 C 10 10, 25 5, 30 15 C 35 30, 28 45, 38 65 Q 42 90, 40 120"
								fill={palette.shadow}
								opacity="0.85"
							/>
							<path
								d="M 45 120 C 50 105, 65 95, 70 75 C 75 55, 60 45, 65 30 C 70 15, 55 10, 50 20 C 45 35, 52 45, 42 65 Q 40 90, 45 120"
								fill={palette.shadow}
								opacity="0.85"
							/>

							{/* Main center branching structures */}
							<path
								d="M 40 120 C 35 90, 20 80, 24 55 C 28 30, 15 20, 22 10 C 29 0, 37 15, 35 30 C 33 45, 42 55, 40 75 C 38 95, 42 110, 40 120 Z"
								fill={`url(#coralGrad-${palette.name})`}
							/>
							<path
								d="M 40 120 C 45 95, 55 85, 52 65 C 49 45, 62 35, 58 20 C 54 5, 46 12, 48 25 C 50 38, 42 50, 44 70 C 46 90, 42 105, 40 120 Z"
								fill={`url(#coralGrad-${palette.name})`}
							/>

							{/* Fine details - Polyps and decorative nodes */}
							<circle cx="22" cy="11" r="3.5" fill={palette.secondary} />
							<circle cx="58" cy="21" r="3.5" fill={palette.secondary} />
							<circle cx="30" cy="15" r="2.5" fill={palette.secondary} />

							<g fill={palette.polyps}>
								<circle cx="28" cy="40" r="2" />
								<circle cx="24" cy="55" r="1.5" />
								<circle cx="34" cy="68" r="2" />
								<circle cx="50" cy="45" r="2" />
								<circle cx="54" cy="65" r="1.5" />
								<circle cx="44" cy="85" r="2.5" />
								<circle cx="36" cy="98" r="2" />
							</g>
						</g>
					) : variant === 1 ? (
						// VARIANT 1: Gorgonian Sea Fan
						<g>
							{/* Fan mesh background glow */}
							<path
								d="M 40 120 C 40 95, 18 80, 12 50 C 6 20, 32 10, 40 28 C 48 10, 74 20, 68 50 C 62 80, 40 95, 40 120 Z"
								fill={`url(#coralGrad-${palette.name})`}
								opacity="0.3"
							/>

							{/* Organic Fan Trunk */}
							<path
								d="M 36 120 Q 38 90 32 60 T 18 25"
								fill="none"
								stroke={palette.shadow}
								strokeWidth="5"
								strokeLinecap="round"
							/>
							<path
								d="M 44 120 Q 42 90 48 60 T 62 25"
								fill="none"
								stroke={palette.shadow}
								strokeWidth="5"
								strokeLinecap="round"
							/>

							{/* Glowing Branch Ribs */}
							<path
								d="M 40 120 Q 40 85 36 50 T 40 12"
								fill="none"
								stroke={`url(#coralGrad-${palette.name})`}
								strokeWidth="5.5"
								strokeLinecap="round"
							/>
							<path
								d="M 37 90 C 24 75, 16 60, 14 38 C 12 22, 28 15, 30 25"
								fill="none"
								stroke={`url(#coralGrad-${palette.name})`}
								strokeWidth="4.5"
								strokeLinecap="round"
							/>
							<path
								d="M 43 90 C 56 75, 64 60, 66 38 C 68 22, 52 15, 50 25"
								fill="none"
								stroke={`url(#coralGrad-${palette.name})`}
								strokeWidth="4.5"
								strokeLinecap="round"
							/>

							{/* Cross connection grid arcs */}
							<path
								d="M 21 68 Q 40 55 59 68 M 15 42 Q 40 32 65 42 M 26 24 Q 40 18 54 24"
								fill="none"
								stroke={palette.secondary}
								strokeWidth="2.5"
								opacity="0.8"
							/>

							{/* Polyp beads on ribs */}
							<circle cx="40" cy="30" r="3" fill={palette.polyps} />
							<circle cx="24" cy="45" r="2.5" fill={palette.polyps} />
							<circle cx="56" cy="45" r="2.5" fill={palette.polyps} />
							<circle cx="30" cy="65" r="3" fill={palette.polyps} />
							<circle cx="50" cy="65" r="3" fill={palette.polyps} />
							<circle cx="15" cy="36" r="2" fill={palette.polyps} />
							<circle cx="65" cy="36" r="2" fill={palette.polyps} />
						</g>
					) : (
						// VARIANT 2: Glowing Tube Sponge
						<g>
							{/* Back shadows */}
							<path
								d="M 12 120 L 12 60 A 10 10 0 0 1 32 60 L 32 120 Z"
								fill={palette.shadow}
								opacity="0.6"
							/>
							<path
								d="M 48 120 L 48 50 A 10 10 0 0 1 68 50 L 68 120 Z"
								fill={palette.shadow}
								opacity="0.6"
							/>

							{/* Middle Tube (Tallest) */}
							<path
								d="M 28 120 L 28 35 C 28 28, 52 28, 52 35 L 52 120 Z"
								fill={`url(#coralGrad-${palette.name})`}
							/>
							<ellipse
								cx="40"
								cy="35"
								rx="12"
								ry="5.5"
								fill={palette.shadow}
								stroke={palette.secondary}
								strokeWidth="2.5"
							/>
							<ellipse cx="40" cy="35" rx="7" ry="3" fill="#01040a" />

							{/* Left Tube */}
							<path
								d="M 10 120 L 10 58 C 10 52, 30 52, 30 58 L 30 120 Z"
								fill={`url(#coralGrad-${palette.name})`}
							/>
							<ellipse
								cx="20"
								cy="58"
								rx="10"
								ry="4.5"
								fill={palette.shadow}
								stroke={palette.secondary}
								strokeWidth="2"
							/>
							<ellipse cx="20" cy="58" rx="5" ry="2" fill="#01040a" />

							{/* Right Tube */}
							<path
								d="M 50 120 L 50 48 C 50 42, 70 42, 70 48 L 70 120 Z"
								fill={`url(#coralGrad-${palette.name})`}
							/>
							<ellipse
								cx="60"
								cy="48"
								rx="10"
								ry="4.5"
								fill={palette.shadow}
								stroke={palette.secondary}
								strokeWidth="2"
							/>
							<ellipse cx="60" cy="48" rx="5" ry="2" fill="#01040a" />

							{/* Textures/Breathe pores on tubes */}
							<g fill={palette.polyps} opacity="0.8">
								<circle cx="40" cy="65" r="2" />
								<circle cx="34" cy="80" r="1.5" />
								<circle cx="46" cy="95" r="2.5" />
								<circle cx="20" cy="85" r="1.8" />
								<circle cx="24" cy="100" r="2" />
								<circle cx="60" cy="75" r="2" />
								<circle cx="56" cy="90" r="1.5" />
								<circle cx="64" cy="105" r="1.8" />
							</g>
						</g>
					)}
				</g>
			</svg>
		</div>
	);
}
