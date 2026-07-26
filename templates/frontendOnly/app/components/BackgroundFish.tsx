// Ikan latar belakang untuk arena ShrimpRun
// NOTE: Rakta.js menggunakan automatic JSX transform — tidak perlu import React.

import { FISH_CONFIG } from "../lib/fishData";

export default function BackgroundFish() {
	return (
		<div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
			{FISH_CONFIG.map((fish) => (
				<div
					key={fish.id}
					className="absolute"
					style={{
						top: `${fish.startY}%`,
						left: fish.direction === "right" ? "-10%" : "110%",
						animation: `swim-${fish.direction} ${fish.speed}s infinite linear`,
						animationDelay: `${fish.delay}s`,
						transform: fish.direction === "left" ? "scaleX(-1)" : "scaleX(1)",
					}}
				>
					<svg
						className="opacity-20"
						width={fish.size === "small" ? "24" : "36"}
						height={fish.size === "small" ? "16" : "24"}
						viewBox="0 0 40 24"
						role="img"
						aria-label="Background fish decoration"
					>
						<defs>
							<linearGradient
								id={`fishGrad${fish.id}`}
								x1="0%"
								y1="0%"
								x2="100%"
								y2="0%"
							>
								<stop offset="0%" style={{ stopColor: "#0891b2" }} />
								<stop offset="100%" style={{ stopColor: "#06b6d4" }} />
							</linearGradient>
						</defs>

						{/* Fish body */}
						<ellipse
							cx="20"
							cy="12"
							rx="15"
							ry="8"
							fill={`url(#fishGrad${fish.id})`}
						/>

						{/* Tail */}
						<path
							d="M 5 12 L 0 6 L 0 18 Z"
							fill={`url(#fishGrad${fish.id})`}
							opacity="0.8"
						/>

						{/* Eye */}
						<circle cx="28" cy="10" r="2" fill="#1e293b" />
						<circle cx="29" cy="9.5" r="0.8" fill="#ffffff" />
					</svg>
				</div>
			))}
		</div>
	);
}
