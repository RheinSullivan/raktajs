// biome-ignore-all lint: Template welcome starter Rakta.js , cerminan desain resmi.
// biome-ignore-all assist: Template welcome starter Rakta.js , cerminan desain resmi.
// NOTE: Rakta.js Auto Import mengimpor BackgroundFish, BubbleLayer, SeaweedGrass,
// ShrimpCharacter, dan CoralObstacle secara otomatis.

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
	obstaclePalette,
	obstacleVariant,
	obstacleScaleX,
	obstacleSizeClass,
	simSpeed,
	onSpeedChange,
	onStartSimulation,
	onTriggerJump,
}: ShrimpRunGameProps) {
	const prevPlayerYRef = useRef(playerY);
	const shrimpRotationRef = useRef(0);

	const deltaY = playerY - prevPlayerYRef.current;
	prevPlayerYRef.current = playerY;
	if (!hasCollision && isPlaying) {
		shrimpRotationRef.current = Math.max(-28, Math.min(28, -deltaY * 4));
	}

	const shrimpStatus: "IDLE" | "SWIMMING" | "DEAD" = hasCollision
		? "DEAD"
		: isPlaying
			? "SWIMMING"
			: "IDLE";

	const finalRotation = hasCollision
		? 90
		: isPlaying
			? shrimpRotationRef.current
			: Math.sin(Date.now() / 800) * 4;

	return (
		<section className="border-b border-surface-stroke bg-[#050505] py-12 px-4 sm:px-6">
			<div className="mx-auto max-w-4xl">
				{/* Status bar */}
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

				{/* Game viewport */}
				<div className="relative h-[260px] w-full overflow-hidden border-x border-b border-surface-stroke bg-black select-none game-viewport-bg">
					<BubbleLayer />
					<BackgroundFish />
					<SeaweedGrass />

					{isPlaying && (
						<button
							type="button"
							onClick={onTriggerJump}
							className="absolute inset-0 z-10 cursor-pointer bg-transparent p-0"
							aria-label="Swim up"
						/>
					)}

					<div className="absolute top-0 left-0 right-0 h-px bg-brand-pink/40 z-20 pointer-events-none" />

					{/* Shrimp character */}
					<div
						className="absolute left-[15%] z-20"
						style={{ bottom: `${playerY}px` }}
					>
						<ShrimpCharacter
							status={shrimpStatus}
							playerY={playerY}
							rotation={finalRotation}
						/>
					</div>

					{/* Coral obstacle */}
					<div
						className="absolute z-20"
						style={{
							left: `${obstacleX}%`,
							bottom: obstaclePos === "BOTTOM" ? "0px" : "auto",
							top: obstaclePos === "TOP" ? "0px" : "auto",
							width: `${obstacleWidth}px`,
							height: `${obstacleHeight}px`,
						}}
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

					{/* Size class label */}
					{isPlaying && (
						<div
							className="absolute z-20 pointer-events-none"
							style={{
								left: `calc(${obstacleX}% + 2px)`,
								bottom:
									obstaclePos === "BOTTOM" ? `${obstacleHeight + 2}px` : "auto",
								top: obstaclePos === "TOP" ? `${obstacleHeight + 2}px` : "auto",
							}}
						>
							<span className="font-mono text-[7px] text-brand-pink/60 uppercase tracking-widest">
								{obstacleSizeClass}
							</span>
						</div>
					)}

					{!isPlaying && (
						<div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-[2px] p-4">
							<p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
								SHRIMPRUN &nbsp;·&nbsp; 144 FPS PHYSICS ENGINE
							</p>
							<h3 className="font-mono text-lg font-extrabold uppercase text-white mb-4">
								{hasCollision
									? "COLLISION DETECTED"
									: "CLICK OR PRESS SPACE TO SWIM"}
							</h3>
							<button
								type="button"
								onClick={onStartSimulation}
								className="border border-brand-pink bg-brand-pink px-6 py-2.5 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-black transition-colors cursor-pointer active:scale-95"
							>
								{hasCollision ? "RETRY SIMULATION" : "START SIMULATION"}
							</button>
						</div>
					)}
				</div>

				{/* Controls */}
				<div className="flex items-center justify-between bg-zinc-950 p-3 font-mono text-[10px] text-gray-400 border-x border-b border-surface-stroke">
					<span>SIMULATION SPEED:</span>
					<div className="flex items-center gap-2">
						{(["NORMAL", "FAST", "TURBO"] as const).map((speed) => (
							<button
								key={speed}
								type="button"
								onClick={() => onSpeedChange(speed)}
								className={`px-2 py-0.5 uppercase cursor-pointer border transition-colors ${
									simSpeed === speed
										? "border-brand-pink text-brand-pink font-bold bg-rose-950/20"
										: "border-zinc-800 text-gray-500 hover:text-white hover:border-zinc-600"
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
