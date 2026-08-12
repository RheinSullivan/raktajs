// biome-ignore-all lint: Template welcome starter Rakta.js
// Forgot Password Page - Rakta.js: gsap, <Click>, react-icons, toast, RaktaAlert

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("rheinsullivan@raktajs.dev");
	const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
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
				setStatus("sent");
				toast.success(`Magic link sent to ${email}. Check your inbox.`, {
					title: "MAGIC LINK",
					duration: 4000,
				});
			} catch {
				setStatus("idle");
				toast.error("Reset request failed.", { duration: 3000 });
			}
		},
		[email],
	);

	return (
		<AuthShell
			eyebrow="Account Recovery"
			title="Forgot Password"
			description="Request a secure password reset magic link or temporary verification token."
		>
			<form
				ref={formRef}
				className="grid w-full gap-5 border border-surface-stroke bg-[#080808] p-6 shadow-2xl shadow-rose-950/20"
				onSubmit={handleSubmit}
			>
				{status === "sent" && (
					<RaktaAlert
						type="success"
						title="MAGIC LINK SENT"
						onClose={() => setStatus("idle")}
					>
						Password reset instructions have been sent to{" "}
						<strong>{email}</strong>.
					</RaktaAlert>
				)}

				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					<span className="flex items-center gap-1.5">
						<FaCode className="h-3 w-3 text-brand-pink" /> Registered Email
						Address
					</span>
					<input
						className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
						onChange={(e) => setEmail(e.target.value)}
						type="email"
						value={email}
						required
					/>
				</label>

				<div className="border border-brand-green/30 bg-brand-green/5 p-3 font-mono text-xs text-brand-green flex items-center gap-2">
					<FaCircleCheck className="h-3 w-3 flex-shrink-0" />
					<span>
						{status === "loading"
							? "Generating magic link reset token..."
							: status === "sent"
								? `Reset instructions sent to ${email}`
								: "Enter your registered email to receive a password reset token."}
					</span>
				</div>

				<button
					className="border border-brand-pink bg-brand-pink px-4 py-3 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-black transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
					type="submit"
					disabled={status === "loading"}
				>
					<FaArrowRight className="h-3 w-3" />
					{status === "loading" ? "Sending Link..." : "Send Reset Link"}
				</button>

				<div className="flex flex-wrap items-center justify-between border-t border-surface-stroke pt-4 font-mono text-xs uppercase text-gray-500">
					<Click
						to="/login"
						className="hover:text-brand-pink transition-colors flex items-center gap-1"
					>
						<FaArrowRight className="h-2.5 w-2.5 rotate-180" /> Back to Sign in
					</Click>
					<Click
						to="/resetPassword"
						className="hover:text-brand-pink transition-colors"
					>
						Have a token? Reset
					</Click>
				</div>
			</form>
		</AuthShell>
	);
}
