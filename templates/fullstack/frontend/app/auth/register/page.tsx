import { registerUser } from "../../../lib/auth";
import AuthShell from "../AuthShell";

export default function RegisterPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [status, setStatus] = useState("Create a member account.");

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setStatus("Registering...");

		try {
			await registerUser({ name, email, password });
			setStatus("Account created. You can login now.");
		} catch (error) {
			setStatus(
				error instanceof Error ? error.message : "Registration failed.",
			);
		}
	};

	return (
		<AuthShell
			eyebrow="Identity Forge"
			title="Register"
			description="Starter registration screen wired for a backend user resource, validation, and session creation."
		>
			<form
				className="grid w-full gap-5 border border-surface-stroke bg-[#080808] p-6"
				onSubmit={handleSubmit}
			>
				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					Name
					<input
						className="border border-surface-stroke bg-black px-4 py-3 text-sm text-white outline-none focus:border-brand-pink"
						onChange={(event) => setName(event.target.value)}
						value={name}
					/>
				</label>
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
					Create account
				</button>
				<click
					to="/auth/login"
					className="font-mono text-xs uppercase text-gray-500"
				>
					Already registered
				</click>
			</form>
		</AuthShell>
	);
}
