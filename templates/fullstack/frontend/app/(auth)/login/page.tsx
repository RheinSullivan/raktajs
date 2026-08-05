// biome-ignore-all lint: Template welcome starter Rakta.js
// Login Page - (auth)/login/page.tsx

export default function LoginPage() {
	const [email, setEmail] = useState("rheinsullivan@raktajs.dev");
	const [password, setPassword] = useState("rakta-password");
	const [status, setStatus] = useState("Ready to authenticate.");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsLoading(true);
		setStatus("Authenticating with Rakta backend...");

		try {
			// Simulate authentication
			await new Promise((resolve) => setTimeout(resolve, 800));
			setStatus(`Successfully authenticated as Super Admin (${email}). Token issued.`);
		} catch (error) {
			setStatus(error instanceof Error ? error.message : "Authentication failed.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthShell
			eyebrow="Session Gate"
			title="Login to Rakta.js"
			description="Authenticate with JWT sessions, HTTP-only cookies, or single-session mode from the Rakta Gaman backend."
		>
			<form
				className="grid w-full gap-5 border border-surface-stroke bg-[#080808] p-6 shadow-2xl shadow-rose-950/20"
				onSubmit={handleSubmit}
			>
				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					Email Address
					<input
						className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
						onChange={(event) => setEmail(event.target.value)}
						type="email"
						value={email}
						required
					/>
				</label>
				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					Password
					<input
						className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
						onChange={(event) => setPassword(event.target.value)}
						type="password"
						value={password}
						required
					/>
				</label>

				<div className="border border-brand-green/30 bg-brand-green/5 p-3 font-mono text-xs text-brand-green">
					<span className="font-bold">STATUS:</span> {status}
				</div>

				<button
					className="border border-brand-pink bg-brand-pink px-4 py-3 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-black transition-colors cursor-pointer disabled:opacity-50"
					type="submit"
					disabled={isLoading}
				>
					{isLoading ? "Authenticating..." : "Sign In"}
				</button>

				<div className="flex flex-wrap items-center justify-between border-t border-surface-stroke pt-4 font-mono text-xs uppercase text-gray-500">
					<click to="/register" className="hover:text-brand-pink transition-colors">
						Create account
					</click>
					<click to="/forgotPassword" className="hover:text-brand-pink transition-colors">
						Forgot password?
					</click>
				</div>
			</form>
		</AuthShell>
	);
}
