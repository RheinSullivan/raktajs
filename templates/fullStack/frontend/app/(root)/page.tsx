// biome-ignore-all lint: Template welcome starter Rakta.js , cerminan desain resmi.
// biome-ignore-all assist: Template welcome starter Rakta.js , cerminan desain resmi.
// Halaman utama Rakta.js - first-run welcome experience.

export default function App() {
	// State bahasa dan audio
	const [lang, setLang] = useState<"ID" | "EN">("ID");
	const [isMuted, setIsMuted] = useState(false);

	// State tampilan visual
	const [aestheticUnit, setAestheticUnit] =
		useState<AestheticUnit>("LENIS-MODERN");
	const [lowLatencyMode, setLowLatencyMode] = useState(true);

	// State modal overlay
	const [isDocsOpen, setIsDocsOpen] = useState(false);
	const [isComponentsOpen, setIsComponentsOpen] = useState(false);
	const [isDeployOpen, setIsDeployOpen] = useState(false);

	// State dan logic game ShrimpRun (144 FPS physics loop berbasis ref)
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

	const onLangToggle = () =>
		setLang((previous) => (previous === "ID" ? "EN" : "ID"));

	// Data status grid: ENGINE / STATUS / PORT / REGION
	const statusGrid = [
		{ label: "ENGINE", value: "v1.2.2-STABLE", pulse: false },
		{ label: "STATUS", value: "OPERATIONAL", pulse: true },
		{ label: "PORT", value: "3000", pulse: false },
		{ label: "REGION", value: "LOCAL", pulse: false },
	] as const;

	return (
		<div className="min-h-screen bg-black font-sans text-white antialiased selection:bg-brand-pink selection:text-white">
			{/* Navigasi utama */}
			<Header
				lang={lang}
				onLangToggle={onLangToggle}
				isMuted={isMuted}
				onMuteToggle={() => setIsMuted((previous) => !previous)}
				aestheticUnit={aestheticUnit}
				onAestheticChange={(unit: AestheticUnit) => setAestheticUnit(unit)}
				lowLatencyMode={lowLatencyMode}
				onLowLatencyToggle={() => setLowLatencyMode((previous) => !previous)}
			/>

			{/* Hero section: identitas framework + CTA utama */}
			<HeroSection
				lang={lang}
				onOpenDocs={() => setIsDocsOpen(true)}
				onOpenComponents={() => setIsComponentsOpen(true)}
				onOpenDeploy={() => setIsDeployOpen(true)}
			/>

			{/* Status grid 4-kolom: ENGINE / STATUS / PORT / REGION */}
			<section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 border-t border-surface-stroke divide-y md:divide-y-0 md:divide-x divide-surface-stroke bg-zinc-950/20">
				{statusGrid.map((item) => (
					<div
						key={item.label}
						className="p-6 md:p-8 flex flex-col gap-2 group hover:bg-white/5 transition-colors"
					>
						<span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
							{item.label}
						</span>
						{item.pulse ? (
							<div className="flex items-center gap-2.5">
								<div className="w-2.5 h-2.5 bg-brand-green animate-pulse flex-shrink-0" />
								<span className="font-mono text-xl text-white font-semibold">
									{item.value}
								</span>
							</div>
						) : (
							<span className="font-mono text-xl text-white font-semibold">
								{item.value}
							</span>
						)}
					</div>
				))}
			</section>

			{/* Strip statistik paket npm */}
			<PackageStatsStrip lang={lang} />

			{/* ShrimpRun - arena fisika interaktif */}
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

			{/* Kartu aksi: Docs, Components, Deploy */}
			<section className="grid grid-cols-1 md:grid-cols-3 border-t border-surface-stroke">
				{/* 01 - Docs */}
				<div
					role="button"
					tabIndex={0}
					onClick={() => setIsDocsOpen(true)}
					onKeyDown={(event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							setIsDocsOpen(true);
						}
					}}
					className="group border-b border-surface-stroke md:border-b-0 md:border-r border-surface-stroke p-8 md:p-12 transition-all duration-300 hover:bg-white hover:text-black cursor-pointer flex flex-col justify-between min-h-[280px]"
				>
					<div>
						<span className="font-mono text-[10px] text-brand-pink group-hover:text-black mb-10 block tracking-widest font-bold">
							01
						</span>
						<h3 className="font-mono text-2xl font-extrabold mb-4 uppercase tracking-tight">
							DOCS
						</h3>
						<p className="font-mono text-xs text-zinc-500 group-hover:text-black/70 leading-relaxed mb-6">
							Technical specifications and API references for the Rakta
							ecosystem.
						</p>
					</div>
					<div className="flex items-center gap-2 font-mono text-[10px] font-extrabold tracking-wider group-hover:translate-x-1.5 transition-transform">
						<span>READ SYSTEM MANUAL</span>
						<FaArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
					</div>
				</div>

				{/* 02 - Components */}
				<div
					role="button"
					tabIndex={0}
					onClick={() => setIsComponentsOpen(true)}
					onKeyDown={(event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							setIsComponentsOpen(true);
						}
					}}
					className="group border-b border-surface-stroke md:border-b-0 md:border-r border-surface-stroke p-8 md:p-12 transition-all duration-300 hover:bg-white hover:text-black cursor-pointer flex flex-col justify-between min-h-[280px]"
				>
					<div>
						<span className="font-mono text-[10px] text-brand-pink group-hover:text-black mb-10 block tracking-widest font-bold">
							02
						</span>
						<h3 className="font-mono text-2xl font-extrabold mb-4 uppercase tracking-tight">
							COMPONENTS
						</h3>
						<p className="font-mono text-xs text-zinc-500 group-hover:text-black/70 leading-relaxed mb-6">
							Browse the library of pre-built brutalist modules and patterns.
						</p>
					</div>
					<div className="flex items-center gap-2 font-mono text-[10px] font-extrabold tracking-wider group-hover:translate-x-1.5 transition-transform">
						<span>EXPLORE LIBRARY</span>
						<FaArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
					</div>
				</div>

				{/* 03 - Deploy */}
				<div
					role="button"
					tabIndex={0}
					onClick={() => setIsDeployOpen(true)}
					onKeyDown={(event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							setIsDeployOpen(true);
						}
					}}
					className="group p-8 md:p-12 transition-all duration-300 hover:bg-white hover:text-black cursor-pointer flex flex-col justify-between min-h-[280px]"
				>
					<div>
						<span className="font-mono text-[10px] text-brand-pink group-hover:text-black mb-10 block tracking-widest font-bold">
							03
						</span>
						<h3 className="font-mono text-2xl font-extrabold mb-4 uppercase tracking-tight">
							DEPLOY
						</h3>
						<p className="font-mono text-xs text-zinc-500 group-hover:text-black/70 leading-relaxed mb-6">
							Push your high-performance application to production edge nodes.
						</p>
					</div>
					<div className="flex items-center gap-2 font-mono text-[10px] font-extrabold tracking-wider group-hover:translate-x-1.5 transition-transform">
						<span>INITIATE LAUNCH</span>
						<FaArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
					</div>
				</div>
			</section>

			{/* Grid modul inti framework */}
			<FeatureGrid lang={lang} />

			{/* Area donasi dan dukungan open source */}
			<DonationSection lang={lang} />

			{/* Footer */}
			<Footer lang={lang} />

			{/* Modal overlay: Docs, Components, Deploy */}
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
