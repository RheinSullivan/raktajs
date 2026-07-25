const COPY = {
	ID: {
		badge: "WARISAN CIREBON & JAKARTA SELATAN • EKOSISTEM RAKTA.JS",
		headline: ["Kecil Ukuran.", "Ganas Kecepatan.", "Hidup di Setiap Route."],
		body: (
			<>
				Dirancang oleh{" "}
				<strong className="font-bold text-white">
					Muhammad Rizky Ramadhan
				</strong>{" "}
				(<strong className="text-white">Rhein Sullivan</strong> /{" "}
				<strong className="text-white">Vyagra Nexus™</strong>) — pengembang
				perangkat lunak asal Cirebon & Jakarta Selatan — Rakta.js hadir sebagai
				solusi terpadu yang menyatukan{" "}
				<em className="text-brand-pink not-italic">File-based App Routing</em>,{" "}
				<em className="text-brand-pink not-italic">
					Auto Import tanpa satu pun pernyataan import
				</em>
				, <em className="text-brand-pink not-italic">Type-Safe RPC</em>,
				arsitektur monolith frontend-backend, dan autentikasi bawaan ke dalam
				satu framework ringan, cepat, dan siap produksi.
			</>
		),
		ctaDocs: "Manual Sistem",
		ctaComponents: "Pustaka Komponen",
		ctaDeploy: "Deploy Edge",
	},
	EN: {
		badge: "CIREBON & SOUTH JAKARTA HERITAGE • RAKTA.JS ECOSYSTEM",
		headline: ["Small in Size.", "Fierce in Speed.", "Alive in Every Route."],
		body: (
			<>
				Crafted by{" "}
				<strong className="font-bold text-white">
					Muhammad Rizky Ramadhan
				</strong>{" "}
				(<strong className="text-white">Rhein Sullivan</strong> /{" "}
				<strong className="text-white">Vyagra Nexus™</strong>) — a software
				developer from Cirebon & South Jakarta — Rakta.js is a unified solution
				bringing{" "}
				<em className="text-brand-pink not-italic">file-based App Routing</em>,{" "}
				<em className="text-brand-pink not-italic">
					Auto Import with zero import statements
				</em>
				, <em className="text-brand-pink not-italic">type-safe RPC</em>,
				integrated frontend-backend monolith architecture, and built-in
				authentication into one lightweight, fast, production-ready framework.
			</>
		),
		ctaDocs: "System Manual",
		ctaComponents: "Component Library",
		ctaDeploy: "Edge Deployment",
	},
} as const;

export default function HeroSection({
	lang,
	onOpenDocs,
	onOpenComponents,
	onOpenDeploy,
}: HeroSectionProps) {
	const copy = COPY[lang];

	return (
		<section className="relative border-b border-surface-stroke bg-black px-4 py-16 sm:px-6 lg:py-24">
			<div className="mx-auto max-w-5xl text-center">
				<div className="mb-6 inline-flex items-center gap-2 border border-brand-pink/30 bg-rose-950/20 px-3 py-1 font-mono text-xs text-brand-pink">
					<span className="h-2 w-2 animate-ping rounded-full bg-brand-pink" />
					{copy.badge}
				</div>

				<h1 className="font-mono text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-6xl">
					{copy.headline[0]} <br />
					<span className="text-brand-pink">{copy.headline[1]}</span> <br />
					{copy.headline[2]}
				</h1>

				<p className="mx-auto mt-6 max-w-3xl font-mono text-sm leading-relaxed text-gray-300">
					{copy.body}
				</p>

				<div className="mt-8 flex flex-wrap items-center justify-center gap-4">
					<button
						type="button"
						onClick={onOpenDocs}
						className="cursor-pointer border-2 border-brand-pink bg-brand-pink px-6 py-3 font-mono text-xs font-bold uppercase text-white shadow-[4px_4px_0px_0px_rgba(244,63,94,0.4)] transition-all hover:bg-white hover:text-black"
					>
						{copy.ctaDocs}
					</button>

					<button
						type="button"
						onClick={onOpenComponents}
						className="cursor-pointer border-2 border-white bg-black px-6 py-3 font-mono text-xs font-bold uppercase text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] transition-all hover:bg-white hover:text-black"
					>
						{copy.ctaComponents}
					</button>

					<button
						type="button"
						onClick={onOpenDeploy}
						className="cursor-pointer border border-emerald-500 bg-emerald-950/20 px-6 py-3 font-mono text-xs font-bold uppercase text-emerald-400 transition-all hover:bg-emerald-500 hover:text-black"
					>
						{copy.ctaDeploy}
					</button>
				</div>
			</div>
		</section>
	);
}
