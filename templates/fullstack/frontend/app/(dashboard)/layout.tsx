// biome-ignore-all lint: Template welcome starter Rakta.js
// Dashboard layout with sidebar - Rakta.js: gsap, <photo>, <click>, react-icons, toast

export default function DashboardLayout({ children }: { children: ReactNode }) {
	const sidebarRef = useRef<HTMLElement>(null);

	useEffect(() => {
		if (!sidebarRef.current) return;
		gsap.fromTo(
			sidebarRef.current,
			{ x: -40, opacity: 0 },
			{ x: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
		);
	}, []);

	return (
		<div className="min-h-screen bg-black font-sans text-white antialiased flex flex-col md:flex-row">
			{/* Sidebar Navigation */}
			<aside
				ref={sidebarRef}
				className="w-full md:w-64 border-b md:border-b-0 md:border-r border-surface-stroke bg-[#080808] p-6 flex flex-col justify-between flex-shrink-0"
			>
				<div>
					{/* Brand */}
					<div className="flex items-center gap-3 mb-8">
						<photo
							path="/rakta-logo.svg"
							alt="Rakta Logo"
							className="h-7 w-7"
						/>
						<div className="flex flex-col">
							<span className="font-mono text-base font-bold text-white tracking-wider">
								Rakta<span className="text-brand-pink">.js</span>
							</span>
							<span className="font-mono text-[9px] uppercase text-gray-500">
								FULLSTACK DASHBOARD
							</span>
						</div>
					</div>

					{/* Nav Links using <click> */}
					<nav className="flex flex-col gap-2 font-mono text-xs uppercase tracking-wider">
						<click
							to="/dashboard"
							className="flex items-center gap-2 border border-brand-pink/50 bg-rose-950/20 px-3 py-2.5 text-brand-pink font-bold transition-colors hover:bg-rose-950/40"
						>
							<Terminal className="h-3.5 w-3.5" /> Overview
						</click>
						<click
							to="/dashboard/1"
							className="flex items-center gap-2 border border-surface-stroke bg-black px-3 py-2.5 text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
						>
							<Info className="h-3.5 w-3.5" /> User #1 Detail
						</click>
						<click
							to="/dashboard/2"
							className="flex items-center gap-2 border border-surface-stroke bg-black px-3 py-2.5 text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
						>
							<Globe className="h-3.5 w-3.5" /> User #2 Detail
						</click>
						<click
							to="/"
							className="flex items-center gap-2 border border-surface-stroke bg-black px-3 py-2.5 text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
						>
							<ArrowRight className="h-3.5 w-3.5" /> Main Landing
						</click>
					</nav>
				</div>

				{/* Footer Status */}
				<div className="mt-8 border-t border-surface-stroke pt-4 font-mono text-[10px] text-gray-500 uppercase">
					<div className="flex items-center gap-2 mb-1">
						<span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
						<span>CONNECTED TO GAMAN SERVER</span>
					</div>
					<p className="text-gray-600">v1.1.8 · Cirebon &amp; Jakarta 🇮🇩</p>
				</div>
			</aside>

			{/* Main Dashboard Area */}
			<div className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</div>
		</div>
	);
}
