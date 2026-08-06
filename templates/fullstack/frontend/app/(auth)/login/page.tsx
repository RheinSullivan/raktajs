// biome-ignore-all lint: Template welcome starter Rakta.js
// Login Page — Rakta.js: gsap, <click>, react-icons, toast, RaktaAlert, useRef/useEffect

export default function LoginPage() {
	const [email, setEmail] = useState("rheinsullivan@raktajs.dev");
	const [password, setPassword] = useState("rakta-password");
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
				toast.error("Authentication failed. Check credentials.", { duration: 3000 });
			}
		},
		[email],
	);

	return (
		<AuthShell
			eyebrow="Session Gate"
			title="Login to Rakta.js"
			description="Authenticate with JWT sessions, HTTP-only cookies, or single-session mode from the Rakta Gaman backend."
		>
			<form
				ref={formRef}
				className="grid w-full gap-5 border border-surface-stroke bg-[#080808] p-6 shadow-2xl shadow-rose-950/20"
				onSubmit={handleSubmit}
			>
				{status === "success" && (
					<RaktaAlert type="success" title="AUTHENTICATED" onClose={() => setStatus("idle")}>
						Token issued. Session active via HTTP-only cookie.
					</RaktaAlert>
				)}
				{status === "error" && (
					<RaktaAlert type="error" title="AUTH FAILED" onClose={() => setStatus("idle")}>
						Check credentials and try again.
					</RaktaAlert>
				)}

				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					<span className="flex items-center gap-1.5">
						<FaCode className="h-3 w-3 text-brand-pink" /> Email Address
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
					<input
						className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
						onChange={(e) => setPassword(e.target.value)}
						type="password"
						value={password}
						required
					/>
				</label>

				<div className="border border-brand-green/30 bg-brand-green/5 p-3 font-mono text-xs text-brand-green flex items-center gap-2">
					<FaCircleCheck className="h-3 w-3 flex-shrink-0" />
					<span>
						<span className="font-bold">STATUS:</span>{" "}
						{status === "loading" ? "Authenticating..." : status === "success" ? "Authenticated." : status === "error" ? "Auth failed." : "Ready to authenticate."}
					</span>
				</div>

				<button
					className="border border-brand-pink bg-brand-pink px-4 py-3 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-black transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
					type="submit"
					disabled={status === "loading"}
				>
					<FaPlay className="h-3 w-3 fill-current" />
					{status === "loading" ? "Authenticating..." : "Sign In"}
				</button>

				<div className="flex flex-wrap items-center justify-between border-t border-surface-stroke pt-4 font-mono text-xs uppercase text-gray-500">
					<click to="/register" className="hover:text-brand-pink transition-colors flex items-center gap-1">
						<FaArrowRight className="h-2.5 w-2.5" /> Create account
					</click>
					<click to="/forgotPassword" className="hover:text-brand-pink transition-colors">
						Forgot password?
					</click>
				</div>
			</form>
		</AuthShell>
	);
}
