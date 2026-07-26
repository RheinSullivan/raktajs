// Bubble Layer - Background ocean bubbles for Shrimp Run game
// NOTE: Rakta.js uses automatic JSX transform - no React import needed.

export default function BubbleLayer() {
	return (
		<div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
			{/* Bottom-left bubbles */}
			<div
				className="absolute bottom-12 left-[10%] w-3 h-3 bg-cyan-200/30 rounded-full animate-[bubble-rise_4s_infinite_ease-out]"
				style={{ animationDelay: "0s" }}
			/>
			<div
				className="absolute bottom-8 left-[15%] w-2 h-2 bg-cyan-200/25 rounded-full animate-[bubble-rise_5s_infinite_ease-out]"
				style={{ animationDelay: "1.2s" }}
			/>

			{/* Center bubbles */}
			<div
				className="absolute bottom-16 left-[45%] w-2.5 h-2.5 bg-white/20 rounded-full animate-[bubble-rise_4.5s_infinite_ease-out]"
				style={{ animationDelay: "0.5s" }}
			/>
			<div
				className="absolute bottom-10 left-[50%] w-2 h-2 bg-cyan-200/30 rounded-full animate-[bubble-rise_5.5s_infinite_ease-out]"
				style={{ animationDelay: "2s" }}
			/>

			{/* Right bubbles */}
			<div
				className="absolute bottom-14 left-[75%] w-2 h-2 bg-cyan-200/25 rounded-full animate-[bubble-rise_4.8s_infinite_ease-out]"
				style={{ animationDelay: "3s" }}
			/>
			<div
				className="absolute bottom-6 left-[80%] w-3 h-3 bg-white/15 rounded-full animate-[bubble-rise_6s_infinite_ease-out]"
				style={{ animationDelay: "1.5s" }}
			/>

			{/* Additional scattered bubbles for depth */}
			<div
				className="absolute bottom-20 left-[25%] w-1.5 h-1.5 bg-cyan-200/20 rounded-full animate-[bubble-rise_5.2s_infinite_ease-out]"
				style={{ animationDelay: "0.8s" }}
			/>
			<div
				className="absolute bottom-4 left-[60%] w-2 h-2 bg-white/18 rounded-full animate-[bubble-rise_4.3s_infinite_ease-out]"
				style={{ animationDelay: "2.5s" }}
			/>
		</div>
	);
}
