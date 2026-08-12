// biome-ignore-all lint: Template welcome starter Rakta.js
// Dynamic Bracket Route - Rakta.js: gsap, <Click>, react-icons, toast, useRef/useEffect/useCallback

export default function UserDetailPage() {
	const [idParam, setIdParam] = useState("1");
	const cardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const segments = window.location.pathname.split("/");
			const lastSegment = segments.at(-1);
			if (lastSegment && lastSegment !== "[id]") {
				setIdParam(lastSegment);
			}
		}
	}, []);

	useEffect(() => {
		if (!cardRef.current) return;
		gsap.fromTo(
			cardRef.current,
			{ opacity: 0, y: 24 },
			{ opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
		);
	}, [idParam]);

	const handleCopyPayload = useCallback(() => {
		const payload = JSON.stringify(
			{
				id: idParam,
				matchedPattern: "/dashboard/:id",
				timestamp: new Date().toISOString(),
				status: "SUCCESS",
				resolvedBy: "Rakta.js Route Scanner",
			},
			null,
			2,
		);
		navigator.clipboard
			.writeText(payload)
			.then(() => toast.success("JSON payload copied!", { duration: 2000 }))
			.catch(() => toast.error("Failed to copy.", { duration: 2000 }));
	}, [idParam]);

	return (
		<div className="flex flex-col gap-6 max-w-4xl mx-auto font-sans antialiased">
			{/* Breadcrumb */}
			<div className="flex items-center gap-2 font-mono text-xs text-gray-500 uppercase">
				<Click
					to="/dashboard"
					className="hover:text-brand-pink transition-colors flex items-center gap-1"
				>
					<Terminal className="h-3 w-3" /> Dashboard
				</Click>
				<ArrowRight className="h-3 w-3" />
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
			<div
				ref={cardRef}
				className="border border-surface-stroke bg-[#080808] p-6 grid gap-4 font-mono text-xs"
			>
				{[
					{ label: "PARAM KEY", value: ":id", color: "text-brand-pink" },
					{ label: "RESOLVED VALUE", value: idParam, color: "text-white" },
					{
						label: "ROUTER PATTERN",
						value: "/dashboard/:id",
						color: "text-brand-green",
					},
				].map((row) => (
					<div
						key={row.label}
						className="flex justify-between border-b border-surface-stroke pb-3"
					>
						<span className="text-gray-500 uppercase">{row.label}</span>
						<span className={`font-bold ${row.color}`}>{row.value}</span>
					</div>
				))}

				<div className="mt-4">
					<div className="flex items-center justify-between mb-2">
						<span className="text-gray-500 uppercase">
							SIMULATED JSON PAYLOAD
						</span>
						<button
							type="button"
							onClick={handleCopyPayload}
							className="flex items-center gap-1 border border-surface-stroke bg-zinc-900 px-2 py-1 text-[10px] uppercase text-gray-400 hover:text-white transition-colors cursor-pointer"
						>
							<FaCopy className="h-2.5 w-2.5" /> Copy
						</button>
					</div>
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
							2,
						)}
					</pre>
				</div>
			</div>

			{/* Action button */}
			<div>
				<Click
					to="/dashboard"
					className="inline-flex items-center gap-2 border border-brand-pink bg-brand-pink px-6 py-3 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-black transition-colors"
				>
					<ArrowRight className="h-3 w-3 rotate-180" /> Back to Dashboard
				</Click>
			</div>
		</div>
	);
}
