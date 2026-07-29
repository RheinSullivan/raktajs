// NOTE: Rakta.js Auto Import mengimpor BackgroundFish, BubbleLayer, dan SeaweedGrass secara otomatis.

export default function ShrimpRunGame({
	isPlaying,
	score,
	highScore,
	hasCollision,
	liveFps,
	playerY,
	obstacleX,
	obstaclePos,
	obstacleHeight,
	obstacleWidth,
	obstaclePalette: _obstaclePalette,
	obstacleVariant: _obstacleVariant,
	obstacleScaleX,
	obstacleSizeClass,
	simSpeed,
	onSpeedChange,
	onStartSimulation,
	onTriggerJump,
}: ShrimpRunGameProps) {
	return (
		<section className="border-b border-surface-stroke bg-[#050505] py-12 px-4 sm:px-6">
			<div className="mx-auto max-w-4xl">
				<div className="flex items-center justify-between border-b border-surface-stroke bg-zinc-900/50 p-4 font-mono text-xs">
					<div className="flex items-center gap-4">
						<span className="font-bold text-white uppercase">
							SHRIMPRUN PHYSICS ARENA
						</span>
						<span className="text-brand-green font-bold">{liveFps} FPS</span>
					</div>
					<div className="flex items-center gap-3">
						<span className="text-gray-400">
							SCORE: <strong className="text-white">{score}</strong>
						</span>
						<span className="text-gray-400">
							BEST: <strong className="text-brand-pink">{highScore}</strong>
						</span>
					</div>
				</div>

				<div className="relative h-[220px] w-full overflow-hidden border-x border-b border-surface-stroke bg-black select-none game-viewport-bg">
					{/* Background layers (z-0) */}
					<BubbleLayer />
					<BackgroundFish />
					<SeaweedGrass />

					{isPlaying && (
						<button
							type="button"
							onClick={onTriggerJump}
							className="absolute inset-0 z-10 cursor-pointer bg-transparent p-0"
							aria-label="Jump"
						/>
					)}
					<div className="absolute top-0 left-0 right-0 h-1 bg-brand-pink/30"></div>

					<div
						className="absolute left-[15%] transition-all duration-75 flex items-center justify-center text-2xl"
						style={{
							bottom: `${playerY}px`,
							transform: `scaleX(${hasCollision ? -1 : 1}) rotate(${hasCollision ? 90 : 0}deg)`,
						}}
					>
						🦐
					</div>

					<div
						className="absolute bottom-0 border-t-2 border-brand-pink bg-rose-950/40 backdrop-blur-sm flex flex-col items-center justify-start p-1"
						style={{
							left: `${obstacleX}%`,
							height: `${obstacleHeight}px`,
							width: `${obstacleWidth}px`,
							top: obstaclePos === "TOP" ? "0px" : "auto",
							bottom: obstaclePos === "BOTTOM" ? "0px" : "auto",
							transform: `scaleX(${obstacleScaleX})`,
						}}
					>
						<span className="font-mono text-[8px] text-brand-pink uppercase tracking-widest">
							{obstacleSizeClass}
						</span>
					</div>

					{!isPlaying && (
						<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4">
							<h3 className="font-mono text-xl font-bold uppercase text-white mb-2">
								{hasCollision
									? "COLLISION DETECTED"
									: "CLICK OR TAP TO START SHRIMPRUN"}
							</h3>
							<p className="font-mono text-xs text-gray-400 mb-4">
								144 FPS Zero-Allocation Physics Loop Engine
							</p>
							<button
								type="button"
								onClick={onStartSimulation}
								className="border border-brand-pink bg-brand-pink px-6 py-2.5 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
							>
								{hasCollision ? "RETRY SIMULATION" : "START SIMULATION"}
							</button>
						</div>
					)}
				</div>

				<div className="flex items-center justify-between bg-zinc-950 p-3 font-mono text-[10px] text-gray-400 border-x border-b border-surface-stroke">
					<span>SIMULATION SPEED:</span>
					<div className="flex items-center gap-2">
						{(["NORMAL", "FAST", "TURBO"] as const).map((speed) => (
							<button
								key={speed}
								type="button"
								onClick={() => onSpeedChange(speed)}
								className={`px-2 py-0.5 uppercase cursor-pointer border ${
									simSpeed === speed
										? "border-brand-pink text-brand-pink font-bold bg-rose-950/20"
										: "border-zinc-800 text-gray-500 hover:text-white"
								}`}
							>
								{speed}
							</button>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
