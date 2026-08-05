// biome-ignore-all lint: Template welcome starter Rakta.js
// Layout for [...slug] catch-all route with metadata

export const metadata: Metadata = {
	title: "Catch-All Route · Rakta.js Router",
	description: "Dynamic catch-all pattern matching in Rakta.js file-based router.",
};

export default function CatchAllLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
