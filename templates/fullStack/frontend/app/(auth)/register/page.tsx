// biome-ignore-all lint: Template welcome starter Rakta.js
// Register Page - Rakta.js: gsap, <click>, react-icons, toast, RaktaAlert

export default function RegisterPage() {
	const [name, setName] = useState("Rhein Sullivan");
	const [email, setEmail] = useState("rheinsullivan@raktajs.dev");
	const [password, setPassword] = useState("rakta-password");
	const [confirmPassword, setConfirmPassword] = useState("rakta-password");
	const [role, setRole] = useState("Super Admin");
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (!formRef.current) return;
		gsap.fromTo(
			formRef.current,
			{ opacity: 0, y: 20 },
			{ opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
		);
	}, []);

	const handleSubmit = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			if (password !== confirmPassword) {
				toast.error("Passwords do not match.", {
					title: "VALIDATION",
					duration: 3000,
				});
				setStatus("error");
				return;
			}
			setStatus("loading");
			try {
				await new Promise<void>((resolve) => setTimeout(resolve, 800));
				setStatus("success");
				toast.success(`Registered ${name} (${email}) as ${role}.`, {
					title: "REGISTERED",
					duration: 3000,
				});
			} catch {
				setStatus("error");
				toast.error("Registration failed.", { duration: 3000 });
			}
		},
		[name, email, password, confirmPassword, role],
	);

	return (
		<AuthShell
			eyebrow="User Registration"
			title="Create Rakta Account"
			description="Register a new developer account with full access to Rakta.js frontend and Gaman.js backend monolith."
		>
			<form
				ref={formRef}
				className="grid w-full gap-5 border border-surface-stroke bg-[#080808] p-6 shadow-2xl shadow-rose-950/20"
				onSubmit={handleSubmit}
			>
				{status === "success" && (
					<RaktaAlert
						type="success"
						title="REGISTERED"
						onClose={() => setStatus("idle")}
					>
						Account created. You can now sign in.
					</RaktaAlert>
				)}
				{status === "error" && (
					<RaktaAlert
						type="error"
						title="ERROR"
						onClose={() => setStatus("idle")}
					>
						Registration failed. Check inputs.
					</RaktaAlert>
				)}

				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					<span className="flex items-center gap-1.5">
						<FaCode className="h-3 w-3 text-brand-pink" /> Full Name
					</span>
					<input
						className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
						onChange={(e) => setName(e.target.value)}
						type="text"
						value={name}
						required
					/>
				</label>

				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					<span className="flex items-center gap-1.5">
						<FaMicrochip className="h-3 w-3 text-brand-pink" /> Email Address
					</span>
					<input
						className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
						onChange={(e) => setEmail(e.target.value)}
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
							onChange={(e) => setPassword(e.target.value)}
							type="password"
							value={password}
							required
						/>
					</label>
					<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
						Confirm Password
						<input
							className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
							onChange={(e) => setConfirmPassword(e.target.value)}
							type="password"
							value={confirmPassword}
							required
						/>
					</label>
				</div>

				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					<span className="flex items-center gap-1.5">
						<Globe className="h-3 w-3 text-brand-pink" /> Role Assignment
					</span>
					<select
						className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
						onChange={(e) => setRole(e.target.value)}
						value={role}
					>
						<option value="Super Admin">Super Admin</option>
						<option value="Organization">Organization</option>
						<option value="Administrator">Administrator</option>
						<option value="Developer">Developer</option>
					</select>
				</label>

				<button
					className="border border-brand-pink bg-brand-pink px-4 py-3 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-black transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
					type="submit"
					disabled={status === "loading"}
				>
					<FaCircleCheck className="h-3 w-3" />
					{status === "loading" ? "Creating Account..." : "Create Account"}
				</button>

				<div className="flex items-center justify-between border-t border-surface-stroke pt-4 font-mono text-xs uppercase text-gray-500">
					<span>Already have an account?</span>
					<click
						to="/login"
						className="font-bold text-brand-pink hover:underline flex items-center gap-1"
					>
						<FaArrowRight className="h-2.5 w-2.5" /> Sign in
					</click>
				</div>
			</form>
		</AuthShell>
	);
}
