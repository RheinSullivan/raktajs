

export default function HeroSection({
	onOpenDocs,
	onOpenComponents,
	onOpenDeploy,
}: HeroSectionProps) {
	return (
		<section className="relative border-b border-surface-stroke bg-black py-16 px-4 sm:px-6 lg:py-24">
			<div className="mx-auto max-w-5xl text-center">
				<div className="inline-flex items-center gap-2 border border-brand-pink/30 bg-rose-950/20 px-3 py-1 font-mono text-xs text-brand-pink mb-6">
					<span className="w-2 h-2 bg-brand-pink animate-ping rounded-full"></span>
					CIREBON & JAKARTA SELATAN HERITAGE • RAKTA.JS ECOSYSTEM
				</div>

				<h1 className="font-mono text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
					Small in Size. <br />
					<span className="text-brand-pink">Fierce in Speed.</span> <br />
					Alive in Every Route.
				</h1>

				<p className="mx-auto mt-6 max-w-3xl font-mono text-sm text-gray-300 leading-relaxed">
					Diciptakan oleh <strong className="text-white font-bold">Muhammad Rizky Ramadhan (Rhein Sullivan / Vyagra Nexus)</strong>,
					Rakta.js menyatukan kekuatan File-based App Routing, Auto Import otomatis, Type-Safe RPC, dan Monolith Frontend-Backend dengan Autentikasi terpadu ke dalam satu framework ultra-ringan & super cepat.
				</p>

				<div className="mt-8 flex flex-wrap items-center justify-center gap-4">
					<button
						type="button"
						onClick={onOpenDocs}
						className="border-2 border-brand-pink bg-brand-pink px-6 py-3 font-mono text-xs font-bold uppercase text-white shadow-[4px_4px_0px_0px_rgba(244,63,94,0.4)] hover:bg-white hover:text-black transition-all cursor-pointer"
					>
						System Manual
					</button>

					<button
						type="button"
						onClick={onOpenComponents}
						className="border-2 border-white bg-black px-6 py-3 font-mono text-xs font-bold uppercase text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:bg-white hover:text-black transition-all cursor-pointer"
					>
						Component Library
					</button>

					<button
						type="button"
						onClick={onOpenDeploy}
						className="border border-emerald-500 bg-emerald-950/20 px-6 py-3 font-mono text-xs font-bold uppercase text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer"
					>
						Edge Deployment
					</button>
				</div>
			</div>
		</section>
	);
}
