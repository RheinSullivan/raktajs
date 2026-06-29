import React from "react";

interface RaktaShrimpMascotProps {
	readonly isJumping: boolean;
	readonly isDead: boolean;
	readonly style?: React.CSSProperties;
}

/**
 * RaktaShrimpMascot — The animated shrimp hero of ShrimpRun.
 * Drawn entirely with inline SVG. No external assets required.
 */
export default function RaktaShrimpMascot({
	isJumping,
	isDead,
	style,
}: RaktaShrimpMascotProps) {
	const bodyColor = isDead ? "#6b7280" : "#dc2626";
	const eyeColor = isDead ? "#374151" : "#fff";
	const legAnimation =
		isJumping || isDead ? "none" : "shrimpLegs 0.3s steps(2) infinite";

	return (
		<svg
			viewBox="0 0 48 48"
			width="48"
			height="48"
			style={{ display: "block", ...style }}
			aria-label={
				isDead ? "dead shrimp" : isJumping ? "shrimp jumping" : "running shrimp"
			}
			role="img"
		>
			<style>{`
                @keyframes shrimpLegs {
                    0%  { transform: translateY(0); }
                    50% { transform: translateY(2px); }
                }
            `}</style>

			{/* Body */}
			<path
				d="M8 30 Q10 14 24 12 Q38 10 40 22 Q42 32 32 36 Q20 40 8 30Z"
				fill={bodyColor}
			/>

			{/* Shell segments */}
			<path
				d="M12 28 Q16 20 24 18 Q30 17 34 22"
				stroke="#b91c1c"
				strokeWidth="1.5"
				fill="none"
				opacity={isDead ? 0.3 : 0.6}
			/>
			<path
				d="M14 32 Q19 24 28 22 Q33 21 36 26"
				stroke="#b91c1c"
				strokeWidth="1.5"
				fill="none"
				opacity={isDead ? 0.3 : 0.6}
			/>

			{/* Eye */}
			<circle cx="34" cy="18" r="4" fill="#1e293b" />
			<circle cx="35" cy="17" r="2" fill={eyeColor} />
			{isDead && (
				<>
					<line
						x1="32"
						y1="16"
						x2="36"
						y2="20"
						stroke="#374151"
						strokeWidth="1.5"
					/>
					<line
						x1="36"
						y1="16"
						x2="32"
						y2="20"
						stroke="#374151"
						strokeWidth="1.5"
					/>
				</>
			)}

			{/* Antennae */}
			<line
				x1="34"
				y1="14"
				x2="40"
				y2="6"
				stroke={bodyColor}
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<line
				x1="32"
				y1="13"
				x2="36"
				y2="4"
				stroke={bodyColor}
				strokeWidth="1.5"
				strokeLinecap="round"
			/>

			{/* Tail */}
			<path
				d="M10 30 Q4 26 6 20"
				stroke={bodyColor}
				strokeWidth="2"
				fill="none"
				strokeLinecap="round"
			/>
			<path
				d="M10 30 Q2 30 4 36"
				stroke={bodyColor}
				strokeWidth="2"
				fill="none"
				strokeLinecap="round"
			/>
			<path
				d="M10 30 Q6 34 8 40"
				stroke={bodyColor}
				strokeWidth="2"
				fill="none"
				strokeLinecap="round"
			/>

			{/* Legs */}
			<g
				style={{
					animation: legAnimation,
					transformOrigin: "24px 36px",
				}}
			>
				<line
					x1="18"
					y1="36"
					x2="14"
					y2="44"
					stroke={bodyColor}
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<line
					x1="22"
					y1="38"
					x2="18"
					y2="46"
					stroke={bodyColor}
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<line
					x1="26"
					y1="38"
					x2="24"
					y2="46"
					stroke={bodyColor}
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<line
					x1="30"
					y1="37"
					x2="28"
					y2="45"
					stroke={bodyColor}
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
			</g>
		</svg>
	);
}
