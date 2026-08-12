// biome-ignore-all lint: Template welcome starter Rakta.js
// Catch-All Bracket Route - [...slug]/page.tsx

export default function CatchAllPage() {
	const [slugPath, setSlugPath] = useState("/fallback");

	useEffect(() => {
		if (typeof window !== "undefined") {
			setSlugPath(window.location.pathname);
		}
	}, []);

	return (
		<main className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-6 font-sans text-white antialiased">
			<div className="w-full max-w-xl border border-surface-stroke bg-[#080808] p-8 text-center shadow-2xl shadow-rose-950/20">
				<div className="mb-4 inline-flex items-center gap-2 border border-brand-pink/30 bg-rose-950/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-brand-pink">
					<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-pink" />
					CATCH-ALL ROUTE MATCHED: /[...slug]
				</div>

				<h1 className="font-mono text-3xl font-black uppercase tracking-tight text-white mb-2">
					Dynamic Catch-All Route
				</h1>
				<p className="font-mono text-xs text-gray-400 mb-6">
					This route was matched by Rakta.js catch-all pattern scanner (
					<code className="text-brand-pink">/:slug*</code>).
				</p>

				<div className="bg-black border border-surface-stroke p-4 font-mono text-xs text-left mb-6">
					<div className="flex justify-between border-b border-surface-stroke pb-2 mb-2">
						<span className="text-gray-500 uppercase">REQUESTED PATH:</span>
						<span className="text-brand-pink font-bold">{slugPath}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-gray-500 uppercase">ROUTER PATTERN:</span>
						<span className="text-brand-green font-bold">/:slug*</span>
					</div>
				</div>

				<Click
					to="/"
					className="inline-block border border-brand-pink bg-brand-pink px-6 py-3 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-black transition-colors"
				>
					Return to Main Landing
				</Click>
			</div>
		</main>
	);
}
