// Seaweed Grass - Animated underwater grass for Shrimp Run game
// NOTE: Rakta.js uses automatic JSX transform - no React import needed.

export default function SeaweedGrass() {
	return (
		<div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none overflow-hidden z-0">
			{/* Left grass cluster */}
			<svg
				className="absolute bottom-0 left-[8%] w-8 h-12"
				viewBox="0 0 32 48"
			>
				<path
					d="M 10 48 Q 8 36, 12 24 Q 10 12, 8 0"
					fill="none"
					stroke="#059669"
					strokeWidth="2"
					className="animate-[sway-left_3s_infinite_ease-in-out]"
					style={{ transformOrigin: "10px 48px" }}
				/>
				<path
					d="M 16 48 Q 14 32, 18 16 Q 16 8, 14 0"
					fill="none"
					stroke="#10b981"
					strokeWidth="2.5"
					className="animate-[sway-right_3.5s_infinite_ease-in-out]"
					style={{ transformOrigin: "16px 48px" }}
				/>
			</svg>

			{/* Center-left grass cluster */}
			<svg
				className="absolute bottom-0 left-[28%] w-10 h-14"
				viewBox="0 0 40 56"
			>
				<path
					d="M 15 56 Q 12 40, 16 24 Q 14 12, 12 0"
					fill="none"
					stroke="#047857"
					strokeWidth="2"
					className="animate-[sway-right_2.8s_infinite_ease-in-out]"
					style={{ transformOrigin: "15px 56px", animationDelay: "0.5s" }}
				/>
				<path
					d="M 22 56 Q 20 36, 24 18 Q 22 9, 20 0"
					fill="none"
					stroke="#059669"
					strokeWidth="3"
					className="animate-[sway-left_3.2s_infinite_ease-in-out]"
					style={{ transformOrigin: "22px 56px", animationDelay: "0.8s" }}
				/>
			</svg>

			{/* Center grass cluster */}
			<svg
				className="absolute bottom-0 left-[48%] w-9 h-13"
				viewBox="0 0 36 52"
			>
				<path
					d="M 12 52 Q 10 38, 14 22 Q 12 10, 10 0"
					fill="none"
					stroke="#10b981"
					strokeWidth="2"
					className="animate-[sway-left_3.1s_infinite_ease-in-out]"
					style={{ transformOrigin: "12px 52px", animationDelay: "1s" }}
				/>
				<path
					d="M 20 52 Q 18 35, 22 20 Q 20 8, 18 0"
					fill="none"
					stroke="#059669"
					strokeWidth="2.5"
					className="animate-[sway-right_2.9s_infinite_ease-in-out]"
					style={{ transformOrigin: "20px 52px", animationDelay: "0.3s" }}
				/>
			</svg>

			{/* Center-right grass cluster */}
			<svg
				className="absolute bottom-0 left-[68%] w-8 h-12"
				viewBox="0 0 32 48"
			>
				<path
					d="M 11 48 Q 9 34, 13 20 Q 11 10, 9 0"
					fill="none"
					stroke="#047857"
					strokeWidth="2"
					className="animate-[sway-right_3.3s_infinite_ease-in-out]"
					style={{ transformOrigin: "11px 48px", animationDelay: "1.5s" }}
				/>
			</svg>

			{/* Right grass cluster */}
			<svg
				className="absolute bottom-0 left-[88%] w-9 h-13"
				viewBox="0 0 36 52"
			>
				<path
					d="M 14 52 Q 12 36, 16 22 Q 14 11, 12 0"
					fill="none"
					stroke="#10b981"
					strokeWidth="2.5"
					className="animate-[sway-left_2.7s_infinite_ease-in-out]"
					style={{ transformOrigin: "14px 52px", animationDelay: "0.2s" }}
				/>
			</svg>

			<style>{`
        @keyframes sway-left {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-4deg); }
        }
        
        @keyframes sway-right {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(4deg); }
        }
      `}</style>
		</div>
	);
}
