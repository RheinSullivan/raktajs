// biome-ignore-all lint: Template welcome starter Rakta.js
// Dashboard Overview — Rakta.js: gsap, <click>, react-icons, toast, RaktaAlert

const SEEDED_USERS = [
	{
		id: "1",
		name: "Rhein Sullivan",
		email: "rheinsullivan@raktajs.dev",
		role: "Super Admin",
		status: "ACTIVE",
		joined: "2026-08-01",
	},
	{
		id: "2",
		name: "Vyagra Nexus",
		email: "vyagranexus@raktajs.dev",
		role: "Organization",
		status: "ACTIVE",
		joined: "2026-08-01",
	},
	{
		id: "3",
		name: "Rakta.js Admin",
		email: "developer@raktajs.dev",
		role: "Administrator",
		status: "ACTIVE",
		joined: "2026-08-01",
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
		toast.success("Dashboard metrics refreshed!", { duration: 2000 });
		setAlertMsg("Live data reloaded from Gaman.js backend.");
	}, []);

	return (
		<div className="flex flex-col gap-8 max-w-6xl mx-auto">
			{/* RaktaAlert */}
			{alertMsg && (
				<RaktaAlert type="success" title="SYNC" onClose={() => setAlertMsg(null)}>
					{alertMsg}
				</RaktaAlert>
			)}

			{/* Top Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-stroke pb-6">
				<div>
					<div className="inline-flex items-center gap-2 border border-brand-pink/30 bg-rose-950/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-brand-pink mb-2">
						<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-pink" />
						FULLSTACK MONOLITH COCKPIT
					</div>
					<h1 className="font-mono text-3xl font-black uppercase text-white tracking-tight">
						System Overview &amp; Analytics
					</h1>
					<p className="font-mono text-xs text-gray-400 mt-1">
						Live diagnostics from Rakta.js Frontend and Gaman.js Backend Monolith.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={handleRefresh}
						className="border border-emerald-500/40 bg-emerald-950/20 px-4 py-2 font-mono text-xs uppercase text-emerald-400 hover:bg-emerald-900/40 transition-colors flex items-center gap-1.5 cursor-pointer"
					>
						<FaArrowRotateRight className="h-3 w-3" /> Refresh
					</button>
					<click
						to="/login"
						className="border border-surface-stroke bg-black px-4 py-2 font-mono text-xs uppercase text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
					>
						<FaMagnifyingGlass className="h-3 w-3" /> Switch Session
					</click>
					<click
						to="/"
						className="border border-brand-pink bg-brand-pink px-4 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-black transition-colors flex items-center gap-1.5"
					>
						<ArrowRight className="h-3 w-3" /> View App
					</click>
				</div>
			</div>

			{/* Metrics Grid */}
			<div ref={metricsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{[
					{ label: "TOTAL USERS", value: "3", note: "Seeders Operational", icon: <Globe className="h-4 w-4 text-brand-pink" />, color: "text-white" },
					{ label: "ACTIVE SESSIONS", value: "1", note: "HTTP-Only Cookie", icon: <Server className="h-4 w-4 text-brand-pink" />, color: "text-brand-pink" },
					{ label: "DATABASE STATUS", value: "ONLINE", note: "@gaman/db SQLite", icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />, color: "text-emerald-400" },
					{ label: "SERVER LATENCY", value: "0.42ms", note: "Bun Engine Speed", icon: <FaMicrochip className="h-4 w-4 text-brand-pink" />, color: "text-white" },
				].map((metric) => (
					<div
						key={metric.label}
						className="metric-card border border-surface-stroke bg-[#080808] p-5 hover:border-brand-pink transition-colors"
					>
						<div className="flex items-center justify-between mb-2">
							<span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
								{metric.label}
							</span>
							{metric.icon}
						</div>
						<span className={`font-mono text-2xl font-extrabold ${metric.color}`}>
							{metric.value}
						</span>
						<span className="font-mono text-[10px] text-brand-green block mt-2">
							✓ {metric.note}
						</span>
					</div>
				))}
			</div>

			{/* User Table (Seeders) */}
			<div ref={tableRef} className="border border-surface-stroke bg-[#080808] p-6">
				<div className="flex items-center justify-between mb-4 border-b border-surface-stroke pb-3">
					<h2 className="font-mono text-base font-bold uppercase text-white flex items-center gap-2">
						<Terminal className="h-4 w-4 text-brand-pink" /> Database Seeded Users
					</h2>
					<span className="font-mono text-[10px] uppercase text-gray-500">
						Gaman.js User Module
					</span>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-left font-mono text-xs">
						<thead>
							<tr className="border-b border-surface-stroke text-gray-500 uppercase text-[10px]">
								<th className="pb-3">ID</th>
								<th className="pb-3">Name</th>
								<th className="pb-3">Email</th>
								<th className="pb-3">Role</th>
								<th className="pb-3">Status</th>
								<th className="pb-3 text-right">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-surface-stroke">
							{SEEDED_USERS.map((user) => (
								<tr key={user.id} className="hover:bg-white/5 transition-colors">
									<td className="py-3 text-gray-400">#{user.id}</td>
									<td className="py-3 font-bold text-white">{user.name}</td>
									<td className="py-3 text-gray-300">{user.email}</td>
									<td className="py-3">
										<span className="border border-brand-pink/40 bg-rose-950/20 px-2 py-0.5 text-[10px] uppercase text-brand-pink">
											{user.role}
										</span>
									</td>
									<td className="py-3 text-brand-green flex items-center gap-1">
										<FaCircleCheck className="h-3 w-3" /> {user.status}
									</td>
									<td className="py-3 text-right">
										<click
											to={`/dashboard/${user.id}`}
											className="border border-surface-stroke px-2.5 py-1 text-[10px] uppercase text-gray-300 hover:border-white hover:text-white transition-colors inline-flex items-center gap-1"
										>
											<FaArrowRight className="h-2.5 w-2.5" /> Inspect
										</click>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
