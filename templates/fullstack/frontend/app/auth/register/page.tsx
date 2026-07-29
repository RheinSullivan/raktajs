export default function RegisterPage() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState<UserRole>("USER");
	const [gender, setGender] = useState<Gender>("MALE");
	const [status, setStatus] = useState("Create a member account.");

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setStatus("Registering...");

		try {
			await registerUser({
				firstName,
				lastName,
				email,
				password,
				role,
				gender,
			});
			setStatus("Account created successfully. You can login now.");
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
			description="Starter registration screen with first name, last name, role enum, and gender selections."
		>
			<form
				className="grid w-full gap-4 border border-surface-stroke bg-[#080808] p-6"
				onSubmit={handleSubmit}
			>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<label className="grid gap-1.5 font-mono text-xs uppercase text-gray-400">
						First Name
						<input
							className="border border-surface-stroke bg-black px-4 py-2.5 text-sm text-white outline-none focus:border-brand-pink"
							onChange={(event) => setFirstName(event.target.value)}
							required
							value={firstName}
						/>
					</label>
					<label className="grid gap-1.5 font-mono text-xs uppercase text-gray-400">
						Last Name
						<input
							className="border border-surface-stroke bg-black px-4 py-2.5 text-sm text-white outline-none focus:border-brand-pink"
							onChange={(event) => setLastName(event.target.value)}
							required
							value={lastName}
						/>
					</label>
				</div>

				<label className="grid gap-1.5 font-mono text-xs uppercase text-gray-400">
					Email
					<input
						className="border border-surface-stroke bg-black px-4 py-2.5 text-sm text-white outline-none focus:border-brand-pink"
						onChange={(event) => setEmail(event.target.value)}
						required
						type="email"
						value={email}
					/>
				</label>

				<label className="grid gap-1.5 font-mono text-xs uppercase text-gray-400">
					Password
					<input
						className="border border-surface-stroke bg-black px-4 py-2.5 text-sm text-white outline-none focus:border-brand-pink"
						onChange={(event) => setPassword(event.target.value)}
						required
						type="password"
						value={password}
					/>
				</label>

				<label className="grid gap-1.5 font-mono text-xs uppercase text-gray-400">
					Role (Enum)
					<select
						className="border border-surface-stroke bg-black px-4 py-2.5 text-sm text-white outline-none focus:border-brand-pink"
						onChange={(event) => setRole(event.target.value as UserRole)}
						value={role}
					>
						<option value="USER">USER</option>
						<option value="ADMIN">ADMIN</option>
						<option value="GUEST">GUEST</option>
					</select>
				</label>

				<div className="grid gap-1.5 font-mono text-xs uppercase text-gray-400">
					Gender (Checkbox / Radio)
					<div className="flex items-center gap-6 mt-1 border border-surface-stroke bg-black p-3">
						{(["MALE", "FEMALE", "OTHER"] as const).map((g) => (
							<label
								key={g}
								className="flex items-center gap-2 cursor-pointer text-xs text-white"
							>
								<input
									type="radio"
									name="gender"
									checked={gender === g}
									onChange={() => setGender(g)}
									className="accent-brand-pink"
								/>
								{g}
							</label>
						))}
					</div>
				</div>

				<p className="border border-brand-green/30 bg-brand-green/5 px-3 py-2 font-mono text-xs text-brand-green">
					{status}
				</p>

				<button
					className="border border-brand-pink bg-brand-pink px-4 py-3 font-mono text-xs font-bold uppercase text-white cursor-pointer hover:bg-white hover:text-black transition-colors"
					type="submit"
				>
					Create Account
				</button>
			</form>
		</AuthShell>
	);
}
