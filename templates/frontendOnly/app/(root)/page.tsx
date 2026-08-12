export default function App() {
	// Modal visibility states
	const [isDocsOpen, setIsDocsOpen] = useState(false);
	const [isComponentsOpen, setIsComponentsOpen] = useState(false);
	const [isDeployOpen, setIsDeployOpen] = useState(false);

	// Settings states
	const [lang, setLang] = useState<"ID" | "EN">("ID");
	const [isMuted, setIsMuted] = useState(false);
	const [aestheticUnit, setAestheticUnit] =
		useState<AestheticUnit>("LENIS-MODERN");
	const [lowLatencyMode, setLowLatencyMode] = useState(true);

	// Game physics hook (144 FPS ref-based physics loop)
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

	const onLangToggle = () => setLang((prev) => (prev === "ID" ? "EN" : "ID"));

	return (
		<div className="min-h-screen bg-black font-sans text-white antialiased">
			{/* Navigation Header - contains lang toggle */}
			<Header
				lang={lang}
				onLangToggle={onLangToggle}
				isMuted={isMuted}
				onMuteToggle={() => setIsMuted((prev) => !prev)}
				aestheticUnit={aestheticUnit}
				onAestheticChange={(unit: AestheticUnit) => setAestheticUnit(unit)}
				lowLatencyMode={lowLatencyMode}
				onLowLatencyToggle={() => setLowLatencyMode((prev) => !prev)}
			/>

			{/* Hero Banner - bilingual */}
			<HeroSection
				lang={lang}
				onOpenDocs={() => setIsDocsOpen(true)}
				onOpenComponents={() => setIsComponentsOpen(true)}
				onOpenDeploy={() => setIsDeployOpen(true)}
			/>

			{/* Interactive Physics Canvas */}
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

			{/* Unified Core Modules - bilingual */}
			<FeatureGrid lang={lang} />

			{/* Donations & Humanitarian Support - bilingual */}
			<DonationSection lang={lang} />

			{/* Footer - bilingual */}
			<Footer lang={lang} />

			{/* Modals */}
			<DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
			<ComponentsModal
				isOpen={isComponentsOpen}
				onClose={() => setIsComponentsOpen(false)}
			/>
			<DeployModal
				isOpen={isDeployOpen}
				onClose={() => setIsDeployOpen(false)}
			/>
		</div>
	);
}
