import { requestPasswordOtp } from "../../../lib/auth";
import AuthShell from "../AuthShell";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("admin@rakta.local");
	const [status, setStatus] = useState("Request a reset code.");

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setStatus("Sending OTP...");

		try {
			const result = await requestPasswordOtp(email);
			setStatus(`OTP issued: ${result.otp}`);
		} catch (error) {
			setStatus(error instanceof Error ? error.message : "OTP request failed.");
		}
	};

	return (
		<AuthShell
			eyebrow="OTP Recovery"
			title="Forgot Password"
			description="Request a one-time password code, then continue to the reset password flow."
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
				<p className="border border-brand-green/30 bg-brand-green/5 px-3 py-2 font-mono text-xs text-brand-green">
					{status}
				</p>
				<button
					className="border border-brand-pink bg-brand-pink px-4 py-3 font-mono text-xs font-bold uppercase text-white"
					type="submit"
				>
					Send OTP
				</button>
				<click
					to="/auth/reset-password"
					className="font-mono text-xs uppercase text-gray-500"
				>
					I already have an OTP
				</click>
			</form>
		</AuthShell>
	);
}
