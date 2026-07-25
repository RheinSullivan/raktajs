export const metadata: Metadata = {
	title: "Dashboard | Rakta.js Administration & System Core",
	description:
		"Rakta.js Dashboard portal - Manage system resources, CMS posts, active users, and real-time framework metrics.",
	keywords: ["Rakta.js Dashboard", "System Core", "Rhein Sullivan", "Cirebon Developer"],
};

export interface DashboardLayoutProps {
	children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	return (
		<div className="min-h-screen bg-black text-white">
			<div className="border-b border-surface-stroke bg-zinc-950 px-6 py-4 font-mono text-xs text-gray-400 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="text-brand-pink font-bold">RAKTA::DASHBOARD</span>
					<span>/ ADMIN PORTAL</span>
				</div>
				<click to="/" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
					← Return to App
				</click>
			</div>
			<main className="p-6">{children}</main>
		</div>
	);
}
