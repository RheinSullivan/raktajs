// biome-ignore-all lint: Template welcome starter Rakta.js
// Dashboard Overview - Portfolio Dashboard - Rakta.js: gsap, <click>, react-icons, toast, RaktaAlert
// Styled like a shadcn/Tailadmin admin panel.

const PORTFOLIO_STATS = [
	{
		label: "TOTAL PROJECTS",
		value: "12",
		note: "+2 this quarter",
		trend: "UP",
		icon: <FaLayerGroup className="h-4 w-4 text-brand-pink" />,
	},
	{
		label: "TECHNOLOGIES",
		value: "16",
		note: "Bun · React · Go",
		trend: "STEADY",
		icon: <FaMicrochip className="h-4 w-4 text-brand-pink" />,
	},
	{
		label: "YEARS EXPERIENCE",
		value: "5+",
		note: "Fullstack Engineer",
		trend: "ONGOING",
		icon: <FaChartLine className="h-4 w-4 text-emerald-400" />,
	},
	{
		label: "CERTIFICATIONS",
		value: "4",
		note: "Cloud & Security",
		trend: "VERIFIED",
		icon: <FaRibbon className="h-4 w-4 text-brand-pink" />,
	},
] as const;

const PORTFOLIO_PROJECTS = [
	{
		id: "1",
		name: "Rakta.js Framework",
		stack: "Bun · React · TypeScript",
		status: "LIVE",
		year: "2026",
		progress: "100%",
	},
	{
		id: "2",
		name: "ShrimpRun Arcade",
		stack: "JSX · SVG · GSAP",
		status: "LIVE",
		year: "2026",
		progress: "100%",
	},
	{
		id: "3",
		name: "Gaman.js Backend",
		stack: "Bun · SQLite · JWT",
		status: "DEPLOYED",
		year: "2025",
		progress: "100%",
	},
	{
		id: "4",
		name: "Pantura Commerce",
		stack: "Rakta · Edge · Redis",
		status: "STAGING",
		year: "2025",
		progress: "78%",
	},
] as const;

const SKILL_BARS = [
	{ name: "TypeScript / React", value: "95%" },
	{ name: "Bun / Node.js", value: "92%" },
	{ name: "Go & Concurrency", value: "85%" },
	{ name: "UI Engineering", value: "90%" },
] as const;

const ACTIVITIES = [
	{ label: "Deployed Rakta.js v1.2.6", meta: "2 hours ago", icon: "deploy" },
	{
		label: "CMS Parity passed — 15 backends",
		meta: "Yesterday",
		icon: "check",
	},
	{
		label: "Added ShrimpRun accessibility labels",
		meta: "2 days ago",
		icon: "code",
	},
] as const;

export default function DashboardOverviewPage() {
	const metricsRef = useRef<HTMLDivElement>(null);
	const tableRef = useRef<HTMLDivElement>(null);
	const [alertMsg, setAlertMsg] = useState<string | null>(null);

	useEffect(() => {
		if (metricsRef.current) {
			gsap.fromTo(
				metricsRef.current.querySelectorAll(".metric-card"),
				{ opacity: 0, y: 20 },
				{ opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" },
			);
		}
		if (tableRef.current) {
			gsap.fromTo(
				tableRef.current,
				{ opacity: 0, y: 30 },
				{ opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.35 },
			);
		}
	}, []);

	const handleRefresh = useCallback(() => {
		toast.success("Portfolio metrics refreshed!", { duration: 2000 });
		setAlertMsg("Portfolio data synced from Rakta.js + Gaman.js backend.");
	}, []);

	return (
		<div className="flex flex-col gap-8 max-w-6xl mx-auto">
			{alertMsg && (
				<RaktaAlert
					type="success"
					title="SYNC"
					onClose={() => setAlertMsg(null)}
				>
					{alertMsg}
				</RaktaAlert>
			)}

			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-stroke pb-6">
				<div>
					<div className="inline-flex items-center gap-2 border border-brand-pink/30 bg-rose-950/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-brand-pink mb-2 rounded-md">
						<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-pink" />
						FULLSTACK PORTFOLIO ADMIN
					</div>
					<h1 className="font-mono text-3xl font-black uppercase text-white tracking-tight">
						Portfolio Dashboard
					</h1>
					<p className="font-mono text-xs text-zinc-400 mt-1">
						Welcome back, Rhein. Here is your creative overview.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={handleRefresh}
						className="rounded-md border border-emerald-500/40 bg-emerald-950/20 px-4 py-2 font-mono text-xs uppercase text-emerald-400 hover:bg-emerald-900/40 transition-colors flex items-center gap-1.5 cursor-pointer"
					>
						<FaArrowRotateRight className="h-3 w-3" /> Refresh
					</button>
					<click
						to="/dashboard/1"
						className="rounded-md border border-surface-stroke bg-black px-4 py-2 font-mono text-xs uppercase text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
					>
						<FaUserTie className="h-3 w-3" /> My Profile
					</click>
					<click
						to="/"
						className="rounded-md border border-brand-pink bg-brand-pink px-4 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-black transition-colors flex items-center gap-1.5"
					>
						<FaArrowRight className="h-3 w-3" /> View App
					</click>
				</div>
			</div>

			{/* Stat Cards */}
			<div
				ref={metricsRef}
				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
			>
				{PORTFOLIO_STATS.map((metric) => (
					<div
						key={metric.label}
						className="metric-card rounded-xl border border-zinc-800 bg-[#100f12] p-5 hover:border-brand-pink transition-colors shadow-lg shadow-black/40"
					>
						<div className="flex items-center justify-between mb-2">
							<span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
								{metric.label}
							</span>
							{metric.icon}
						</div>
						<span className="font-mono text-2xl font-extrabold text-white">
							{metric.value}
						</span>
						<div className="flex items-center justify-between mt-2">
							<span className="font-mono text-[10px] text-brand-green">
								✓ {metric.note}
							</span>
							<span className="font-mono text-[9px] text-zinc-500 uppercase">
								{metric.trend}
							</span>
						</div>
					</div>
				))}
			</div>

			{/* Projects Table */}
			<div
				ref={tableRef}
				className="rounded-xl border border-zinc-800 bg-[#100f12] p-6 shadow-lg shadow-black/40"
			>
				<div className="flex items-center justify-between mb-4 border-b border-surface-stroke pb-3">
					<h2 className="font-mono text-base font-bold uppercase text-white flex items-center gap-2">
						<FaTerminal className="h-4 w-4 text-brand-pink" /> Featured Projects
					</h2>
					<span className="font-mono text-[10px] uppercase text-zinc-500">
						Portfolio Showcase
					</span>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-left font-mono text-xs">
						<thead>
							<tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
								<th className="pb-3">Project</th>
								<th className="pb-3">Stack</th>
								<th className="pb-3">Status</th>
								<th className="pb-3">Year</th>
								<th className="pb-3">Progress</th>
								<th className="pb-3 text-right">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-800">
							{PORTFOLIO_PROJECTS.map((project) => (
								<tr
									key={project.id}
									className="hover:bg-white/5 transition-colors"
								>
									<td className="py-3 font-bold text-white">{project.name}</td>
									<td className="py-3 text-zinc-400">{project.stack}</td>
									<td className="py-3">
										<span
											className={`rounded-md px-2 py-0.5 text-[10px] uppercase font-bold ${
												project.status === "LIVE"
													? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
													: project.status === "STAGING"
														? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
														: "bg-brand-pink/10 text-brand-pink border border-brand-pink/30"
											}`}
										>
											{project.status}
										</span>
									</td>
									<td className="py-3 text-zinc-400">{project.year}</td>
									<td className="py-3">
										<div className="flex items-center gap-2">
											<div className="h-1.5 w-20 rounded-full bg-zinc-800 overflow-hidden">
												<div
													className="h-full rounded-full bg-gradient-to-r from-brand-pink to-rose-500"
													style={{ width: project.progress }}
												/>
											</div>
											<span className="text-[10px] text-zinc-500">
												{project.progress}
											</span>
										</div>
									</td>
									<td className="py-3 text-right">
										<click
											to={`/dashboard/${project.id}`}
											className="rounded-md border border-zinc-700 px-2.5 py-1 text-[10px] uppercase text-zinc-300 hover:border-white hover:text-white transition-colors inline-flex items-center gap-1"
										>
											<FaArrowRight className="h-2.5 w-2.5" /> Details
										</click>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Skills + Activity */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{/* Skills */}
				<div className="rounded-xl border border-zinc-800 bg-[#100f12] p-6 shadow-lg shadow-black/40">
					<div className="flex items-center justify-between mb-4 border-b border-surface-stroke pb-3">
						<h2 className="font-mono text-base font-bold uppercase text-white flex items-center gap-2">
							<FaCode className="h-4 w-4 text-brand-pink" /> Core Skills
						</h2>
						<span className="font-mono text-[10px] uppercase text-zinc-500">
							Proficiency
						</span>
					</div>
					<div className="flex flex-col gap-4">
						{SKILL_BARS.map((skill) => (
							<div key={skill.name} className="flex flex-col gap-1.5">
								<div className="flex items-center justify-between font-mono text-xs">
									<span className="text-zinc-300">{skill.name}</span>
									<span className="text-brand-pink font-bold">
										{skill.value}
									</span>
								</div>
								<div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
									<div
										className="h-full rounded-full bg-gradient-to-r from-brand-pink to-rose-500"
										style={{ width: skill.value }}
									/>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Recent Activity */}
				<div className="rounded-xl border border-zinc-800 bg-[#100f12] p-6 shadow-lg shadow-black/40">
					<div className="flex items-center justify-between mb-4 border-b border-surface-stroke pb-3">
						<h2 className="font-mono text-base font-bold uppercase text-white flex items-center gap-2">
							<FaChartLine className="h-4 w-4 text-brand-pink" /> Recent
							Activity
						</h2>
						<span className="font-mono text-[10px] uppercase text-zinc-500">
							Live Feed
						</span>
					</div>
					<div className="flex flex-col gap-3">
						{ACTIVITIES.map((activity) => (
							<div
								key={activity.label}
								className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-black p-3"
							>
								<div className="h-8 w-8 rounded-lg bg-brand-pink/10 border border-brand-pink/30 flex items-center justify-center flex-shrink-0">
									{activity.icon === "deploy" ? (
										<FaServer className="h-3.5 w-3.5 text-brand-pink" />
									) : activity.icon === "check" ? (
										<FaCircleCheck className="h-3.5 w-3.5 text-emerald-400" />
									) : (
										<FaCode className="h-3.5 w-3.5 text-brand-pink" />
									)}
								</div>
								<div className="flex flex-col gap-0.5">
									<span className="font-mono text-xs text-white">
										{activity.label}
									</span>
									<span className="font-mono text-[10px] text-zinc-500">
										{activity.meta}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
