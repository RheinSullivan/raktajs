// biome-ignore-all lint: Template welcome starter Rakta.js
// Dashboard Overview Page - (dashboard)/dashboard/page.tsx

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
	return (
		<div className="flex flex-col gap-8 max-w-6xl mx-auto">
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
					<click to="/login" className="border border-surface-stroke bg-black px-4 py-2 font-mono text-xs uppercase text-gray-300 hover:text-white transition-colors">
						Switch Session
					</click>
					<click to="/" className="border border-brand-pink bg-brand-pink px-4 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-black transition-colors">
						View App
					</click>
				</div>
			</div>

			{/* Metrics Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="border border-surface-stroke bg-[#080808] p-5 hover:border-brand-pink transition-colors">
					<span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-1">
						TOTAL USERS
					</span>
					<span className="font-mono text-3xl font-extrabold text-white">3</span>
					<span className="font-mono text-[10px] text-brand-green block mt-2">
						✓ Seeders Operational
					</span>
				</div>
				<div className="border border-surface-stroke bg-[#080808] p-5 hover:border-brand-pink transition-colors">
					<span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-1">
						ACTIVE SESSIONS
					</span>
					<span className="font-mono text-3xl font-extrabold text-brand-pink">1</span>
					<span className="font-mono text-[10px] text-gray-400 block mt-2">
						HTTP-Only Cookie
					</span>
				</div>
				<div className="border border-surface-stroke bg-[#080808] p-5 hover:border-brand-pink transition-colors">
					<span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-1">
						DATABASE STATUS
					</span>
					<span className="font-mono text-xl font-extrabold text-emerald-400">ONLINE</span>
					<span className="font-mono text-[10px] text-gray-400 block mt-2">
						@gaman/db SQLite
					</span>
				</div>
				<div className="border border-surface-stroke bg-[#080808] p-5 hover:border-brand-pink transition-colors">
					<span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-1">
						SERVER LATENCY
					</span>
					<span className="font-mono text-3xl font-extrabold text-white">0.42ms</span>
					<span className="font-mono text-[10px] text-brand-green block mt-2">
						Bun Engine Speed
					</span>
				</div>
			</div>

			{/* User Table (Seeders) */}
			<div className="border border-surface-stroke bg-[#080808] p-6">
				<div className="flex items-center justify-between mb-4 border-b border-surface-stroke pb-3">
					<h2 className="font-mono text-base font-bold uppercase text-white">
						Database Seeded Users
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
									<td className="py-3 text-brand-green">{user.status}</td>
									<td className="py-3 text-right">
										<click to={`/dashboard/${user.id}`} className="border border-surface-stroke px-2.5 py-1 text-[10px] uppercase text-gray-300 hover:border-white hover:text-white transition-colors">
											Inspect →
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
