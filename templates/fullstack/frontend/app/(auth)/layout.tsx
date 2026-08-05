// biome-ignore-all lint: Template welcome starter Rakta.js
// Layout for (auth) route group

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-black font-sans text-white antialiased">
			{children}
		</div>
	);
}
