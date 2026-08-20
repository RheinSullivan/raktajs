// biome-ignore-all lint: Template welcome starter Rakta.js
// Login Page - Rakta.js: react-icons, RaktaAlert, Auto Import

export default function LoginPage() {
	const [email, setEmail] = useState("rheinsullivan@raktajs.dev");
	const [password, setPassword] = useState("rakta-password");
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(true);
	const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
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
			setStatus("loading");
			try {
				await new Promise<void>((resolve) => setTimeout(resolve, 800));
				setStatus("success");
				toast.success(`Authenticated as ${email}. Token issued.`, {
					title: "AUTH",
					duration: 3000,
				});
			} catch {
				setStatus("error");
				toast.error("Authentication failed. Check credentials.", {
					duration: 3000,
				});
			}
		},
		[email],
	);

	return (
		<AuthShell
			eyebrow="Session Gate"
			title="Sign In to Rakta.js"
			description="Authenticate with JWT sessions, HTTP-only cookies, or single-session mode from the Rakta Gaman backend."
		>
			<form
				ref={formRef}
				className="grid w-full gap-5 border border-surface-stroke bg-[#080808] p-6 shadow-2xl shadow-rose-950/20"
				onSubmit={handleSubmit}
			>
				{status === "success" && (
					<RaktaAlert
						type="success"
						title="AUTHENTICATED"
						onClose={() => setStatus("idle")}
					>
						Token issued. Session active via HTTP-only cookie.
					</RaktaAlert>
				)}
				{status === "error" && (
					<RaktaAlert
						type="error"
						title="AUTH FAILED"
						onClose={() => setStatus("idle")}
					>
						Check credentials and try again.
					</RaktaAlert>
				)}

				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					<span className="flex items-center gap-1.5">
						<FaCode className="h-3 w-3 text-brand-pink" /> Email Address / Username
					</span>
					<input
						className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
						onChange={(e) => setEmail(e.target.value)}
						type="email"
						value={email}
						required
					/>
				</label>

				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					<span className="flex items-center gap-1.5">
						<FaMicrochip className="h-3 w-3 text-brand-pink" /> Password
					</span>
					<div className="relative flex items-center">
						<input
							className="w-full border border-surface-stroke bg-black px-4 py-3 pr-10 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
							onChange={(e) => setPassword(e.target.value)}
							type={showPassword ? "text" : "password"}
							value={password}
							required
						/>
						<button
							type="button"
							onClick={() => setShowPassword((prev) => !prev)}
							className="absolute right-3 text-gray-400 hover:text-white cursor-pointer"
						>
							{showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
						</button>
					</div>
				</label>

				<div className="flex items-center justify-between font-mono text-xs text-gray-400">
					<label className="flex items-center gap-2 cursor-pointer select-none">
						<input
							type="checkbox"
							checked={rememberMe}
							onChange={(e) => setRememberMe(e.target.checked)}
							className="accent-brand-pink"
						/>
						<span>Remember Me</span>
					</label>
					<click to="/auth/forgot-password" className="text-brand-pink hover:underline">
						Forgot Password?
					</click>
				</div>

				<button
					type="submit"
					disabled={status === "loading"}
					className="cursor-pointer border-2 border-brand-pink bg-brand-pink px-6 py-3 font-mono text-xs font-bold uppercase text-white shadow-[4px_4px_0px_0px_rgba(244,63,94,0.4)] transition-all hover:bg-white hover:text-black flex items-center justify-center gap-2"
				>
					{status === "loading" ? "Authenticating..." : "Sign In to Account"}
				</button>

				<div className="flex items-center justify-between font-mono text-xs text-gray-400 border-t border-surface-stroke pt-4">
					<span>Need 2FA OTP Code?</span>
					<click to="/auth/otp" className="text-brand-pink hover:underline font-bold">
						Verify OTP →
					</click>
				</div>

				<div className="text-center font-mono text-xs text-gray-400">
					Don't have an account?{" "}
					<click to="/auth/sign-up" className="text-brand-pink hover:underline font-bold">
						Sign Up
					</click>
				</div>
			</form>
		</AuthShell>
	);
}
