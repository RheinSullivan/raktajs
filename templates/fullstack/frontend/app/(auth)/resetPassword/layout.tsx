// biome-ignore-all lint: Template welcome starter Rakta.js
// Layout for (auth)/resetPassword route with metadata

export const metadata: Metadata = {
	title: "Reset Password · Rakta.js Monolith",
	description: "Set a new password for your Rakta.js developer account.",
};

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
