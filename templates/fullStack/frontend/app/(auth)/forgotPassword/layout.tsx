// biome-ignore-all lint: Template welcome starter Rakta.js
// Layout for (auth)/forgotPassword route with metadata

export const metadata: Metadata = {
	title: "Forgot Password · Rakta.js Monolith",
	description:
		"Request a secure password reset magic link or temporary verification token.",
};

export default function ForgotPasswordLayout({
	children,
}: {
	children: ReactNode;
}) {
	return <>{children}</>;
}
