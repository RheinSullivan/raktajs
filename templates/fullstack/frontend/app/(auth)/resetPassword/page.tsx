// biome-ignore-all lint: Template welcome starter Rakta.js
// Reset Password Page - (auth)/resetPassword/page.tsx

export default function ResetPasswordPage() {
	const [token, setToken] = useState("rakta_reset_token_sec_9948");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [status, setStatus] = useState("Enter reset token and new password.");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (newPassword !== confirmPassword) {
			setStatus("Error: Passwords do not match.");
			return;
		}

		setIsLoading(true);
		setStatus("Updating password in Rakta database...");

		try {
			await new Promise((resolve) => setTimeout(resolve, 800));
			setStatus("Password updated successfully. You can now sign in.");
		} catch (error) {
			setStatus(error instanceof Error ? error.message : "Password reset failed.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthShell
			eyebrow="Credentials Update"
			title="Reset Password"
			description="Enter your verification token and set a new secure password."
		>
			<form
				className="grid w-full gap-5 border border-surface-stroke bg-[#080808] p-6 shadow-2xl shadow-rose-950/20"
				onSubmit={handleSubmit}
			>
				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					Reset Token
					<input
						className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
						onChange={(event) => setToken(event.target.value)}
						type="text"
						value={token}
						required
					/>
				</label>

				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					New Password
					<input
						className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
						onChange={(event) => setNewPassword(event.target.value)}
						type="password"
						value={newPassword}
						required
					/>
				</label>

				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					Confirm New Password
					<input
						className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
						onChange={(event) => setConfirmPassword(event.target.value)}
						type="password"
						value={confirmPassword}
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
					{isLoading ? "Updating Password..." : "Update Password"}
				</button>

				<div className="flex justify-between font-mono text-xs uppercase text-gray-500">
					<click to="/login" className="hover:text-brand-pink transition-colors">
						Back to Sign in
					</click>
				</div>
			</form>
		</AuthShell>
	);
}
