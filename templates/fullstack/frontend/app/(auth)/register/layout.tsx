// biome-ignore-all lint: Template welcome starter Rakta.js
// Layout for (auth)/register route with metadata

export const metadata: Metadata = {
	title: "Create Account · Rakta.js Monolith",
	description: "Register a new developer account on the Rakta.js fullstack React platform.",
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
