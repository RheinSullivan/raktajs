

const RAKTA_FEATURES = [
	{
		id: "megaweave",
		title: "MegaWeave",
		desc: "File-based routing layer compiling routes into streaming zero-overhead HTML nodes.",
		code: "<click to=\"/dashboard\">",
	},
	{
		id: "nagalimanwire",
		title: "NagaLimanWire",
		desc: "Type-safe RPC engine binding backend controllers to frontend callers seamlessly.",
		code: "const data = await rpc.getUsers();",
	},
	{
		id: "trusmithread",
		title: "TrusmiThread",
		desc: "Automatic import scanner generating typed declarations for components, stores, and hooks.",
		code: "const [state, setState] = useState()",
	},
	{
		id: "sintren",
		title: "Sintren",
		desc: "Smooth scroll and section navigation engine inspired by Cirebon folk dance folklore.",
		code: "<sintren to=\"section-id\">",
	},
	{
		id: "sunyaragicrown",
		title: "SunyaragiCrown",
		desc: "Built-in metadata and head manager driving SEO, OpenGraph tags, and canonical URLs.",
		code: "defineSeo({ title, description })",
	},
	{
		id: "shrimpharbor",
		title: "ShrimpHarbor",
		desc: "PWA offline caching, manifest generation, and service worker lifecycle control.",
		code: "registerPwaWorker()",
	},
];

export default function FeatureGrid() {
	return (
		<section className="bg-black py-16 px-4 sm:px-6">
			<div className="mx-auto max-w-6xl">
				<div className="text-center mb-12">
					<h2 className="font-mono text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
						UNIFIED CORE MODULES
					</h2>
					<p className="font-mono text-xs text-gray-400 mt-2">
						Zero fragmentation • Pure efficiency • Built for high performance
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{RAKTA_FEATURES.map((feature) => (
						<div
							key={feature.id}
							className="border border-surface-stroke bg-[#080808] p-6 hover:border-brand-pink transition-colors group"
						>
							<div className="flex items-center justify-between mb-3">
								<span className="font-mono text-xs font-bold uppercase text-brand-pink">
									{feature.title}
								</span>
								<span className="font-mono text-[9px] text-gray-600 uppercase">
									CORE MODULE
								</span>
							</div>
							<p className="font-mono text-xs text-gray-300 leading-relaxed mb-4">
								{feature.desc}
							</p>
							<div className="bg-black border border-surface-stroke p-2 font-mono text-[10px] text-brand-green overflow-x-auto">
								<code>{feature.code}</code>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
