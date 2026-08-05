// biome-ignore-all lint: Template welcome starter Rakta.js
// Forgot Password Page - (auth)/forgotPassword/page.tsx

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("rheinsullivan@raktajs.dev");
	const [status, setStatus] = useState("Enter your registered email to receive a password reset token.");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsLoading(true);
		setStatus("Generating magic link reset token...");

		try {
			await new Promise((resolve) => setTimeout(resolve, 800));
			setStatus(`Password reset instructions sent to ${email}. Check inbox.`);
		} catch (error) {
			setStatus(error instanceof Error ? error.message : "Reset request failed.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthShell
			eyebrow="Account Recovery"
			title="Forgot Password"
			description="Request a secure password reset magic link or temporary verification token."
		>
			<form
				className="grid w-full gap-5 border border-surface-stroke bg-[#080808] p-6 shadow-2xl shadow-rose-950/20"
				onSubmit={handleSubmit}
			>
				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					Registered Email Address
					<input
						className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
						onChange={(event) => setEmail(event.target.value)}
						type="email"
						value={email}
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
					{isLoading ? "Sending Link..." : "Send Reset Link"}
				</button>

				<div className="flex flex-wrap items-center justify-between border-t border-surface-stroke pt-4 font-mono text-xs uppercase text-gray-500">
					<click to="/login" className="hover:text-brand-pink transition-colors">
						Back to Sign in
					</click>
					<click to="/resetPassword" className="hover:text-brand-pink transition-colors">
						Have a token? Reset password
					</click>
				</div>
			</form>
		</AuthShell>
	);
}
