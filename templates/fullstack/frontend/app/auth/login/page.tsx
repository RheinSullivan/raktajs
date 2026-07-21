import { loginUser } from "../../../lib/auth";
import AuthShell from "../AuthShell";

export default function LoginPage() {
	const [email, setEmail] = useState("admin@rakta.local");
	const [password, setPassword] = useState("rakta-password");
	const [status, setStatus] = useState("Ready.");

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setStatus("Authenticating...");

		try {
			const result = await loginUser(email, password);
			setStatus(`Authenticated as ${result.user.name}. Token issued.`);
		} catch (error) {
			setStatus(error instanceof Error ? error.message : "Login failed.");
		}
	};

	return (
		<AuthShell
			eyebrow="Session Gate"
			title="Login"
			description="Authenticate with JWT, HTTP-only sessions, or single-session mode from the Rakta backend."
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
					Password
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
					Sign in
				</button>
				<div className="flex justify-between font-mono text-xs uppercase text-gray-500">
					<click to="/auth/register">Create account</click>
					<click to="/auth/forgot-password">Forgot password</click>
				</div>
			</form>
		</AuthShell>
	);
}
