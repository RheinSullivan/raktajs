// biome-ignore-all lint: Template welcome starter Rakta.js
// NotFound Page - 404 with SVG Construction Illustration

export default function NotFound() {
	return (
		<main className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4 font-sans text-white antialiased">
			<div className="w-full max-w-xl border border-surface-stroke bg-[#080808] p-8 text-center shadow-2xl shadow-rose-950/20">
				{/* SVG Construction Illustration */}
				<div className="mx-auto mb-6 flex h-36 w-36 items-center justify-center rounded-2xl border border-brand-pink/30 bg-rose-950/20 p-4">
					<svg
						className="h-full w-full text-brand-pink"
						viewBox="0 0 100 100"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						{/* Crane arm */}
						<path
							d="M10 90 L30 10 L80 10"
							className="stroke-brand-pink"
							strokeWidth="3"
						/>
						<path d="M30 10 L50 90" strokeDasharray="3 3" />
						{/* Cable & Load */}
						<line
							x1="70"
							y1="10"
							x2="70"
							y2="40"
							stroke="#f43f5e"
							strokeWidth="2"
						/>
						<rect
							x="60"
							y="40"
							width="20"
							height="20"
							fill="#e11d48"
							fillOpacity="0.3"
							stroke="#e11d48"
						/>
						<text
							x="70"
							y="54"
							fontSize="10"
							textAnchor="middle"
							fill="#fff"
							fontWeight="bold"
						>
							404
						</text>
						{/* Ground barrier */}
						<path d="M10 90 L90 90" stroke="#3f3f46" strokeWidth="4" />
						{/* Caution stripes */}
						<line
							x1="20"
							y1="90"
							x2="25"
							y2="80"
							stroke="#eab308"
							strokeWidth="2"
						/>
						<line
							x1="35"
							y1="90"
							x2="40"
							y2="80"
							stroke="#eab308"
							strokeWidth="2"
						/>
						<line
							x1="50"
							y1="90"
							x2="55"
							y2="80"
							stroke="#eab308"
							strokeWidth="2"
						/>
						{/* Gear icon */}
						<circle
							cx="30"
							cy="50"
							r="10"
							stroke="#10b981"
							strokeWidth="2"
							strokeDasharray="4 2"
						/>
						<circle cx="30" cy="50" r="4" fill="#10b981" />
					</svg>
				</div>

				<div className="mb-2 inline-flex items-center gap-2 border border-brand-pink/40 bg-rose-950/30 px-3 py-1 font-mono text-xs uppercase tracking-widest text-brand-pink">
					<span className="h-1.5 w-1.5 animate-ping rounded-full bg-brand-pink" />
					404 · ROUTE UNDER CONSTRUCTION
				</div>

				<h1 className="font-mono text-3xl font-black uppercase tracking-tight text-white mb-2 sm:text-4xl">
					Page Not Found
				</h1>

				<p className="mx-auto mb-6 max-w-md font-mono text-xs leading-relaxed text-gray-400">
					The requested route node does not exist or is currently undergoing
					structural maintenance. Check your URL pattern or return to main
					navigation.
				</p>

				<div className="flex flex-wrap items-center justify-center gap-4">
					<Click
						to="/"
						className="border-2 border-brand-pink bg-brand-pink px-6 py-3 font-mono text-xs font-bold uppercase text-white shadow-[4px_4px_0px_0px_rgba(244,63,94,0.4)] transition-all hover:bg-white hover:text-black"
					>
						Return to Homepage
					</Click>
					<Click
						to="/dashboard"
						className="border border-surface-stroke bg-black px-6 py-3 font-mono text-xs font-bold uppercase text-gray-300 transition-all hover:border-white hover:text-white"
					>
						Open Dashboard
					</Click>
				</div>
			</div>
		</main>
	);
}
