// biome-ignore-all lint: Template welcome starter Rakta.js
// Dynamic Bracket Route - (dashboard)/dashboard/[id]/page.tsx

export default function UserDetailPage() {
	const [idParam, setIdParam] = useState("1");

	useEffect(() => {
		if (typeof window !== "undefined") {
			const segments = window.location.pathname.split("/");
			const lastSegment = segments.at(-1);
			if (lastSegment && lastSegment !== "[id]") {
				setIdParam(lastSegment);
			}
		}
	}, []);

	return (
		<div className="flex flex-col gap-6 max-w-4xl mx-auto font-sans antialiased">
			{/* Breadcrumb */}
			<div className="flex items-center gap-2 font-mono text-xs text-gray-500 uppercase">
				<click to="/dashboard" className="hover:text-brand-pink transition-colors">
					Dashboard
				</click>
				<span>/</span>
				<span className="text-white">User Record #{idParam}</span>
			</div>

			{/* Title */}
			<div className="border-b border-surface-stroke pb-6">
				<div className="inline-flex items-center gap-2 border border-brand-pink/30 bg-rose-950/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-brand-pink mb-2">
					<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-pink" />
					DYNAMIC ROUTE MATCHED: /dashboard/[id]
				</div>
				<h1 className="font-mono text-3xl font-black uppercase text-white tracking-tight">
					User Record Details
				</h1>
				<p className="font-mono text-xs text-gray-400 mt-1">
					Inspecting dynamic parameters resolved by Rakta.js router scanner.
				</p>
			</div>

			{/* Record Box */}
			<div className="border border-surface-stroke bg-[#080808] p-6 grid gap-4 font-mono text-xs">
				<div className="flex justify-between border-b border-surface-stroke pb-3">
					<span className="text-gray-500 uppercase">PARAM KEY</span>
					<span className="text-brand-pink font-bold">:id</span>
				</div>
				<div className="flex justify-between border-b border-surface-stroke pb-3">
					<span className="text-gray-500 uppercase">RESOLVED VALUE</span>
					<span className="text-white font-bold">{idParam}</span>
				</div>
				<div className="flex justify-between border-b border-surface-stroke pb-3">
					<span className="text-gray-500 uppercase">ROUTER PATTERN</span>
					<span className="text-brand-green font-bold">/dashboard/:id</span>
				</div>

				<div className="mt-4">
					<span className="text-gray-500 uppercase block mb-2">SIMULATED JSON PAYLOAD</span>
					<pre className="bg-black border border-surface-stroke p-4 text-brand-green text-[11px] overflow-x-auto">
{JSON.stringify(
	{
		id: idParam,
		matchedPattern: "/dashboard/:id",
		timestamp: new Date().toISOString(),
		status: "SUCCESS",
		resolvedBy: "Rakta.js Route Scanner",
	},
	null,
	2
)}
					</pre>
				</div>
			</div>

			{/* Action button */}
			<div>
				<click to="/dashboard" className="inline-block border border-brand-pink bg-brand-pink px-6 py-3 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-black transition-colors">
					← Back to Dashboard Overview
				</click>
			</div>
		</div>
	);
}
