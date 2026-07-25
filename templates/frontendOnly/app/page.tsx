export default function App() {
	// Modal visibility states
	const [isDocsOpen, setIsDocsOpen] = useState(false);
	const [isComponentsOpen, setIsComponentsOpen] = useState(false);
	const [isDeployOpen, setIsDeployOpen] = useState(false);

	// Settings states
	const [lang, setLang] = useState<"ID" | "EN">("ID");
	const [isMuted, setIsMuted] = useState(false);
	const [aestheticUnit, setAestheticUnit] = useState<AestheticUnit>("LENIS-MODERN");
	const [lowLatencyMode, setLowLatencyMode] = useState(true);

	// Custom 144 FPS game physics hook
	const {
		isPlaying,
		score,
		highScore,
		hasCollision,
		liveFps,
		simSpeed,
		setSimSpeed,
		playerY,
		obstacleX,
		obstaclePos,
		obstacleHeight,
		obstacleWidth,
		obstaclePalette,
		obstacleVariant,
		obstacleScaleX,
		obstacleSizeClass,
		startSimulation,
		triggerJump,
	} = useShrimpRun();

	return (
		<div className="min-h-screen bg-black font-sans text-white antialiased">
			{/* Sub-component: Navigation Header */}
			<Header
				lang={lang}
				onLangToggle={() => setLang((prev) => (prev === "ID" ? "EN" : "ID"))}
				isMuted={isMuted}
				onMuteToggle={() => setIsMuted((prev) => !prev)}
				aestheticUnit={aestheticUnit}
				onAestheticChange={(unit) => setAestheticUnit(unit)}
				lowLatencyMode={lowLatencyMode}
				onLowLatencyToggle={() => setLowLatencyMode((prev) => !prev)}
			/>

			{/* Sub-component: Hero Banner */}
			<HeroSection
				onOpenDocs={() => setIsDocsOpen(true)}
				onOpenComponents={() => setIsComponentsOpen(true)}
				onOpenDeploy={() => setIsDeployOpen(true)}
			/>

			{/* Sub-component: Interactive Physics Canvas */}
			<ShrimpRunGame
				isPlaying={isPlaying}
				score={score}
				highScore={highScore}
				hasCollision={hasCollision}
				liveFps={liveFps}
				playerY={playerY}
				obstacleX={obstacleX}
				obstaclePos={obstaclePos}
				obstacleHeight={obstacleHeight}
				obstacleWidth={obstacleWidth}
				obstaclePalette={obstaclePalette}
				obstacleVariant={obstacleVariant}
				obstacleScaleX={obstacleScaleX}
				obstacleSizeClass={obstacleSizeClass}
				simSpeed={simSpeed}
				onSpeedChange={setSimSpeed}
				onStartSimulation={startSimulation}
				onTriggerJump={triggerJump}
			/>

			{/* Sub-component: Unified Core Modules Grid */}
			<FeatureGrid />

			{/* Sub-component: Footer */}
			<Footer />

			{/* Modals */}
			<DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
			<ComponentsModal isOpen={isComponentsOpen} onClose={() => setIsComponentsOpen(false)} />
			<DeployModal isOpen={isDeployOpen} onClose={() => setIsDeployOpen(false)} />
		</div>
	);
}
