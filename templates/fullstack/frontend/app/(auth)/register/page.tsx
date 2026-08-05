// biome-ignore-all lint: Template welcome starter Rakta.js
// Register Page - (auth)/register/page.tsx

export default function RegisterPage() {
	const [name, setName] = useState("Rhein Sullivan");
	const [email, setEmail] = useState("rheinsullivan@raktajs.dev");
	const [password, setPassword] = useState("rakta-password");
	const [confirmPassword, setConfirmPassword] = useState("rakta-password");
	const [role, setRole] = useState("Super Admin");
	const [status, setStatus] = useState("Fill form to create user.");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (password !== confirmPassword) {
			setStatus("Error: Passwords do not match.");
			return;
		}

		setIsLoading(true);
		setStatus("Registering new Rakta user account...");

		try {
			await new Promise((resolve) => setTimeout(resolve, 800));
			setStatus(`Successfully registered user ${name} (${email}) as ${role}.`);
		} catch (error) {
			setStatus(error instanceof Error ? error.message : "Registration failed.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthShell
			eyebrow="User Registration"
			title="Create Rakta Account"
			description="Register a new developer account with full access to Rakta.js frontend and Gaman.js backend monolith."
		>
			<form
				className="grid w-full gap-5 border border-surface-stroke bg-[#080808] p-6 shadow-2xl shadow-rose-950/20"
				onSubmit={handleSubmit}
			>
				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					Full Name
					<input
						className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
						onChange={(event) => setName(event.target.value)}
						type="text"
						value={name}
						required
					/>
				</label>
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
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
					<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
						Confirm Password
						<input
							className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
							onChange={(event) => setConfirmPassword(event.target.value)}
							type="password"
							value={confirmPassword}
							required
						/>
					</label>
				</div>
				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					Role Assignment
					<select
						className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
						onChange={(event) => setRole(event.target.value)}
						value={role}
					>
						<option value="Super Admin">Super Admin</option>
						<option value="Organization">Organization</option>
						<option value="Administrator">Administrator</option>
						<option value="Developer">Developer</option>
					</select>
				</label>

				<div className="border border-brand-green/30 bg-brand-green/5 p-3 font-mono text-xs text-brand-green">
					<span className="font-bold">STATUS:</span> {status}
				</div>

				<button
					className="border border-brand-pink bg-brand-pink px-4 py-3 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-black transition-colors cursor-pointer disabled:opacity-50"
					type="submit"
					disabled={isLoading}
				>
					{isLoading ? "Creating Account..." : "Create Account"}
				</button>

				<div className="flex items-center justify-between border-t border-surface-stroke pt-4 font-mono text-xs uppercase text-gray-500">
					<span>Already have an account?</span>
					<click to="/login" className="font-bold text-brand-pink hover:underline">
						Sign in
					</click>
				</div>
			</form>
		</AuthShell>
	);
}
