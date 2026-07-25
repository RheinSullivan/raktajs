export const metadata: Metadata = {
	title: "Authentication | Rakta.js Secure Identity Gateway",
	description:
		"Rakta.js Authentication Gateway — Secure login, user registration with First Name, Last Name, Role Enum, and Gender checkboxes.",
	keywords: ["Rakta Auth", "Identity Gateway", "Rhein Sullivan", "Vyagra Nexus"],
	robots: { index: false, follow: false },
};

export interface AuthLayoutProps {
	children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
			<div className="w-full max-w-md">{children}</div>
		</div>
	);
}
