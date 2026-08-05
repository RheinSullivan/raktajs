// biome-ignore-all lint: Template welcome starter Rakta.js
// Layout for (dashboard)/dashboard route with metadata

export const metadata: Metadata = {
	title: "Cockpit Overview · Rakta.js Dashboard",
	description: "System analytics, seeders user database, latency telemetry, and server status cockpit.",
};

export default function DashboardOverviewLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
