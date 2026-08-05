// biome-ignore-all lint: Template welcome starter Rakta.js
// Layout for (dashboard) route group

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-black font-sans text-white antialiased flex flex-col md:flex-row">
			{/* Sidebar Navigation */}
			<aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-surface-stroke bg-[#080808] p-6 flex flex-col justify-between flex-shrink-0">
				<div>
					<div className="flex items-center gap-3 mb-8">
						<photo path="/rakta-logo.svg" alt="Rakta Logo" className="h-7 w-7" />
						<div className="flex flex-col">
							<span className="font-mono text-base font-bold text-white tracking-wider">
								Rakta<span className="text-brand-pink">.js</span>
							</span>
							<span className="font-mono text-[9px] uppercase text-gray-500">
								FULLSTACK DASHBOARD
							</span>
						</div>
					</div>

					<nav className="flex flex-col gap-2 font-mono text-xs uppercase tracking-wider">
						<click to="/dashboard" className="flex items-center gap-2 border border-brand-pink/50 bg-rose-950/20 px-3 py-2.5 text-brand-pink font-bold">
							<span>📊</span> Overview
						</click>
						<click to="/dashboard/1" className="flex items-center gap-2 border border-surface-stroke bg-black px-3 py-2.5 text-gray-400 hover:text-white hover:border-gray-700 transition-colors">
							<span>👤</span> User #1 Detail
						</click>
						<click to="/dashboard/2" className="flex items-center gap-2 border border-surface-stroke bg-black px-3 py-2.5 text-gray-400 hover:text-white hover:border-gray-700 transition-colors">
							<span>🏢</span> User #2 Detail
						</click>
						<click to="/" className="flex items-center gap-2 border border-surface-stroke bg-black px-3 py-2.5 text-gray-400 hover:text-white hover:border-gray-700 transition-colors">
							<span>🏠</span> Main Landing
						</click>
					</nav>
				</div>

				<div className="mt-8 border-t border-surface-stroke pt-4 font-mono text-[10px] text-gray-500 uppercase">
					<div className="flex items-center gap-2 mb-1">
						<span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
						<span>CONNECTED TO GAMAN SERVER</span>
					</div>
					<p className="text-gray-600">v1.1.1 · Cirebon &amp; Jakarta 🇮🇩</p>
				</div>
			</aside>

			{/* Main Dashboard Area */}
			<div className="flex-1 p-6 md:p-10 overflow-y-auto">
				{children}
			</div>
		</div>
	);
}
