type FeatureGridLanguage = "ID" | "EN";

const featureGridCopy: Record<
	FeatureGridLanguage,
	{ heading: string; sub: string; badge: string }
> = {
	ID: {
		heading: "MODUL INTI TERPADU",
		sub: "Nol fragmentasi. Efisiensi murni. Dirancang untuk performa tinggi.",
		badge: "MODUL INTI",
	},
	EN: {
		heading: "UNIFIED CORE MODULES",
		sub: "Zero fragmentation. Pure efficiency. Built for high performance.",
		badge: "CORE MODULE",
	},
};

export default function FeatureGrid({ lang }: { lang: FeatureGridLanguage }) {
	const copy = featureGridCopy[lang];
	const languageKey = lang === "ID" ? "id" : "en";

	return (
		<section className="bg-black px-4 py-16 sm:px-6" id="features">
			<div className="mx-auto max-w-6xl">
				<div className="mb-12 text-center">
					<h2 className="font-mono text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
						{copy.heading}
					</h2>
					<p className="mt-2 font-mono text-xs text-gray-400">{copy.sub}</p>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{raktaFeatures.map((feature) => {
						const descriptionText =
							typeof feature.desc === "string"
								? feature.desc
								: feature.desc[languageKey];

						return (
							<div
								key={feature.id}
								className="group border border-surface-stroke bg-[#080808] p-6 transition-colors hover:border-brand-pink"
							>
								<div className="mb-3 flex items-center justify-between gap-4">
									<span className="font-mono text-xs font-bold uppercase text-brand-pink">
										{feature.title}
									</span>
									<span className="font-mono text-[9px] uppercase text-gray-600">
										{copy.badge}
									</span>
								</div>
								<p className="mb-4 font-mono text-xs leading-relaxed text-gray-300">
									{descriptionText}
								</p>
								<div className="overflow-x-auto border border-surface-stroke bg-black p-2 font-mono text-[10px] text-brand-green">
									<code>{feature.code}</code>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
