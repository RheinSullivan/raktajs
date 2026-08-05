// biome-ignore-all lint: Template welcome starter Rakta.js
// Layout for (dashboard)/dashboard/[id] route with metadata

export const metadata: Metadata = {
	title: "User Record Detail · Rakta.js Dashboard",
	description: "Dynamic route param inspection for database user records in Rakta.js.",
};

export default function UserDetailLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
