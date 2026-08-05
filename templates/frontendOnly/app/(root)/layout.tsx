// biome-ignore-all lint: Template welcome starter Rakta.js
// Layout for (root) landing page route with metadata

export const metadata: Metadata = {
	title:
		"Rakta.js - A lightweight, composable frontend framework built on Bun, React, and TypeScript",
	description:
		"Rakta.js is a lightweight fullstack React framework by Muhammad Rizky Ramadhan (Rhein Sullivan / Vyagra Nexus™) from Cirebon & South Jakarta, Indonesia.",
};

export default function RootPageLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
