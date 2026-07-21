import { resetPassword } from "../../../lib/auth";
import AuthShell from "../AuthShell";

export default function ResetPasswordPage() {
	const [email, setEmail] = useState("admin@rakta.local");
	const [otp, setOtp] = useState("");
	const [password, setPassword] = useState("");
	const [status, setStatus] = useState("Enter OTP and new password.");

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setStatus("Resetting password...");

		try {
			await resetPassword(email, otp, password);
			setStatus("Password reset complete.");
		} catch (error) {
			setStatus(error instanceof Error ? error.message : "Reset failed.");
		}
	};

	return (
		<AuthShell
			eyebrow="Credential Reset"
			title="Reset Password"
			description="Verify the OTP code and rotate the user password through the backend auth service."
		>
			<form
				className="grid w-full gap-5 border border-surface-stroke bg-[#080808] p-6"
				onSubmit={handleSubmit}
			>
				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					Email
					<input
						className="border border-surface-stroke bg-black px-4 py-3 text-sm text-white outline-none focus:border-brand-pink"
						onChange={(event) => setEmail(event.target.value)}
						type="email"
						value={email}
					/>
				</label>
				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					OTP Code
					<input
						className="border border-surface-stroke bg-black px-4 py-3 text-sm text-white outline-none focus:border-brand-pink"
						onChange={(event) => setOtp(event.target.value)}
						value={otp}
					/>
				</label>
				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					New Password
					<input
						className="border border-surface-stroke bg-black px-4 py-3 text-sm text-white outline-none focus:border-brand-pink"
						onChange={(event) => setPassword(event.target.value)}
						type="password"
						value={password}
					/>
				</label>
				<p className="border border-brand-green/30 bg-brand-green/5 px-3 py-2 font-mono text-xs text-brand-green">
					{status}
				</p>
				<button
					className="border border-brand-pink bg-brand-pink px-4 py-3 font-mono text-xs font-bold uppercase text-white"
					type="submit"
				>
					Reset password
				</button>
			</form>
		</AuthShell>
	);
}
