// biome-ignore-all lint: Template welcome starter Rakta.js
// AuthShell component for authentication layouts.

export interface AuthShellProps {
	readonly eyebrow: string;
	readonly title: string;
	readonly description: string;
	readonly children: React.ReactNode;
}

export default function AuthShell({
	eyebrow,
	title,
	description,
	children,
}: AuthShellProps) {
	return (
		<main className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4 font-sans antialiased">
			<div className="w-full max-w-md">
				{/* Top Logo & Title */}
				<div className="mb-6 flex flex-col items-center text-center">
					<Photo
						path="/rakta-logo.svg"
						alt="Rakta.js Logo"
						className="mb-3 h-10 w-10"
					/>
					<div className="mb-1 inline-flex items-center gap-2 border border-brand-pink/30 bg-rose-950/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-brand-pink">
						<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-pink" />
						{eyebrow}
					</div>
					<h1 className="font-mono text-2xl font-black uppercase text-white tracking-tight">
						{title}
					</h1>
					<p className="mt-1 font-mono text-xs text-gray-400">{description}</p>
				</div>

				{/* Card Body */}
				{children}

				{/* Footer Copyright */}
				<div className="mt-6 text-center font-mono text-[10px] uppercase text-gray-600">
					Rakta.js Fullstack Engine · Cirebon &amp; Jakarta Selatan 🇮🇩
				</div>
			</div>
		</main>
	);
}
