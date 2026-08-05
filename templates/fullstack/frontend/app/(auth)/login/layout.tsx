// biome-ignore-all lint: Template welcome starter Rakta.js
// Layout for (auth)/login route with metadata

export const metadata: Metadata = {
	title: "Sign In · Rakta.js Monolith",
	description: "Authenticate into your Rakta.js developer account with JWT and HTTP-only session cookie mode.",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
