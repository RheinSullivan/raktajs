// biome-ignore-all lint: Template welcome starter Rakta.js
// PackageStatsStrip - real npm metadata with honest unavailable states.

interface PackageStatsStripProps {
	readonly lang: "ID" | "EN";
}

const packageStatsCopy = {
	ID: {
		dependencies: "DEPENDENCIES",
		dependents: "DEPENDENTS",
		error: "Data npm belum tersedia",
		inspect: "Lihat dependencies runtime",
		loading: "Loading",
		npmLink: "Buka ekosistem npm",
		peerNote:
			"Runtime dependencies dihitung dari metadata package terbaru. Peer dependencies tidak dicampur.",
		unavailable: "Unavailable",
		updated: "Updated recently",
		version: "Version",
	},
	EN: {
		dependencies: "DEPENDENCIES",
		dependents: "DEPENDENTS",
		error: "npm data is unavailable",
		inspect: "Inspect runtime dependencies",
		loading: "Loading",
		npmLink: "Open npm ecosystem",
		peerNote:
			"Runtime dependencies come from the latest package metadata. Peer dependencies are not mixed in.",
		unavailable: "Unavailable",
		updated: "Updated recently",
		version: "Version",
	},
} as const;

function formatPackageNumber(value: number | null | undefined): string {
	if (value === null || value === undefined) return "Unavailable";
	return new Intl.NumberFormat("en-US").format(value);
}

export default function PackageStatsStrip({ lang }: PackageStatsStripProps) {
	const copy = packageStatsCopy[lang];
	const [stats, setStats] = useState<PackageStats | null>(() =>
		getCachedPackageStats(),
	);
	const [status, setStatus] = useState<"loading" | "ready" | "error">(
		stats === null ? "loading" : "ready",
	);

	useEffect(() => {
		let isCurrent = true;

		fetchPackageStats().then(
			(nextStats) => {
				if (!isCurrent) return;
				setStats(nextStats);
				setStatus("ready");
			},
			() => {
				if (!isCurrent) return;
				setStatus(stats === null ? "error" : "ready");
			},
		);

		return () => {
			isCurrent = false;
		};
	}, []);

	const dependencyValue =
		status === "loading" && stats === null
			? copy.loading
			: formatPackageNumber(stats?.dependencies);
	const dependentValue =
		status === "loading" && stats === null
			? copy.loading
			: stats?.dependents === null || stats?.dependents === undefined
				? copy.unavailable
				: formatPackageNumber(stats.dependents);

	return (
		<section
			className="border-y border-surface-stroke bg-[#050505] px-4 py-5 sm:px-6"
			aria-label="Rakta.js package ecosystem statistics"
		>
			<div className="mx-auto grid max-w-5xl gap-3 md:grid-cols-[1fr_1fr_auto] md:items-stretch">
				<details className="group border border-surface-stroke bg-black transition-colors hover:border-brand-pink">
					<summary className="flex cursor-pointer list-none items-center gap-4 p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink">
						<span className="grid h-9 w-9 place-items-center border border-brand-pink/40 text-brand-pink">
							<Server className="h-4 w-4" aria-hidden="true" />
						</span>
						<span className="min-w-0">
							<span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
								{copy.dependencies}
							</span>
							<span className="block font-mono text-base font-black text-white">
								{dependencyValue} Dependencies
							</span>
						</span>
					</summary>
					<div className="border-t border-surface-stroke px-4 pb-4 font-mono text-[11px] text-gray-400">
						<p className="mb-3 leading-relaxed">{copy.peerNote}</p>
						{stats?.dependencyNames.length ? (
							<ul className="grid gap-2 sm:grid-cols-2">
								{stats.dependencyNames.map((dependencyName) => (
									<li
										key={dependencyName}
										className="border border-zinc-800 bg-[#070707] px-3 py-2 text-white"
									>
										{dependencyName}
									</li>
								))}
							</ul>
						) : (
							<p>{status === "error" ? copy.error : copy.loading}</p>
						)}
					</div>
				</details>

				<a
					href="https://www.npmjs.com/package/raktajs?activeTab=dependents"
					target="_blank"
					rel="noreferrer"
					className="flex items-center gap-4 border border-surface-stroke bg-black p-4 transition-colors hover:border-brand-pink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
					aria-label={copy.npmLink}
				>
					<span className="grid h-9 w-9 place-items-center border border-brand-pink/40 text-brand-pink">
						<Globe className="h-4 w-4" aria-hidden="true" />
					</span>
					<span className="min-w-0">
						<span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
							{copy.dependents}
						</span>
						<span className="block font-mono text-base font-black text-white">
							{dependentValue} Dependents
						</span>
					</span>
				</a>

				<div className="border border-surface-stroke bg-black p-4 font-mono text-[11px] text-gray-500">
					<div className="font-bold uppercase tracking-widest">{copy.version}</div>
					<div className="mt-1 text-sm font-black text-white">
						{stats?.version ?? (status === "loading" ? copy.loading : copy.unavailable)}
					</div>
					<div className="mt-2 text-[10px] uppercase text-gray-600">
						{stats?.updatedAt ? copy.updated : copy.error}
					</div>
				</div>
			</div>
		</section>
	);
}
