// biome-ignore-all lint: Template welcome starter Rakta.js
// FeatureGrid — Rakta.js: gsap, <reborns>, react-icons, toast, useMemo

export default function FeatureGrid({ lang }: { lang: "ID" | "EN" }) {
	const copy = {
		ID: {
			heading: "MODUL INTI TERPADU",
			sub: "Nol fragmentasi • Efisiensi murni • Dirancang untuk performa tinggi",
			badge: "MODUL INTI",
		},
		EN: {
			heading: "UNIFIED CORE MODULES",
			sub: "Zero fragmentation • Pure efficiency • Built for high performance",
			badge: "CORE MODULE",
		},
	}[lang];

	const langKey = lang.toLowerCase() as "id" | "en";
	const gridRef = useRef<HTMLDivElement>(null);

	const featureIcons = useMemo(
		() => [
			<Terminal key="terminal" className="h-4 w-4" />,
			<Server key="server" className="h-4 w-4" />,
			<FaArrowRotateRight key="rotate" className="h-4 w-4" />,
			<Globe key="globe" className="h-4 w-4" />,
			<Search key="search" className="h-4 w-4" />,
			<FaCloud key="cloud" className="h-4 w-4" />,
		],
		[],
	);

	useEffect(() => {
		const cards = gridRef.current?.querySelectorAll(".feature-card");
		if (!cards || cards.length === 0) return;

		gsap.fromTo(
			Array.from(cards),
			{ opacity: 0, y: 40 },
			{
				opacity: 1,
				y: 0,
				duration: 0.5,
				stagger: 0.1,
				ease: "power2.out",
				scrollTrigger: {
					trigger: gridRef.current,
					start: "top 80%",
				},
			},
		);
	}, []);

	const handleCopyCode = useCallback((code: string, title: string) => {
		navigator.clipboard
			.writeText(code)
			.then(() => {
				toast.success(`Copied ${title} snippet!`, { duration: 2000 });
			})
			.catch(() => {
				toast.error("Failed to copy to clipboard.", { duration: 2000 });
			});
	}, []);

	const featuresList = (
		typeof RAKTA_FEATURES !== "undefined" ? RAKTA_FEATURES : raktaFeatures
	) as readonly RaktaFeature[];

	return (
		<section className="bg-black py-16 px-4 sm:px-6" id="features">
			<reborns id="features" />
			<div className="mx-auto max-w-6xl">
				<div className="text-center mb-12">
					<h2 className="font-mono text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
						{copy.heading}
					</h2>
					<p className="font-mono text-xs text-gray-400 mt-2">{copy.sub}</p>
				</div>

				<div
					ref={gridRef}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					{featuresList.map((feature: RaktaFeature, index: number) => {
						const descText =
							typeof feature.desc === "string"
								? feature.desc
								: typeof feature.desc === "object" && feature.desc !== null
									? ((feature.desc as Record<string, string>)[langKey] ??
										(feature.desc as Record<string, string>).id ??
										(feature.desc as Record<string, string>).en ??
										"")
									: String(feature.desc ?? "");

						return (
							<div
								key={feature.id}
								className="feature-card border border-surface-stroke bg-[#080808] p-6 hover:border-brand-pink transition-colors group"
							>
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center gap-2">
										<span className="text-brand-pink">
											{featureIcons[index] ?? <FaCode className="h-4 w-4" />}
										</span>
										<span className="font-mono text-xs font-bold uppercase text-brand-pink">
											{feature.title}
										</span>
									</div>
									<span className="font-mono text-[9px] text-gray-600 uppercase">
										{copy.badge}
									</span>
								</div>
								<p className="font-mono text-xs text-gray-300 leading-relaxed mb-4">
									{descText}
								</p>
								<div className="relative bg-black border border-surface-stroke p-2 font-mono text-[10px] text-brand-green overflow-x-auto group/code">
									<code>{feature.code}</code>
									<button
										type="button"
										onClick={() => handleCopyCode(feature.code, feature.title)}
										className="absolute top-1.5 right-1.5 opacity-0 group-hover/code:opacity-100 transition-opacity border border-surface-stroke bg-zinc-900 p-1 text-gray-400 hover:text-white"
										aria-label="Copy code"
									>
										<FaCopy className="h-2.5 w-2.5" />
									</button>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
