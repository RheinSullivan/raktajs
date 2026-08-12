// biome-ignore-all lint: Template welcome starter Rakta.js
// Reset Password Page - Rakta.js: gsap, <click>, react-icons, toast, RaktaAlert

export default function ResetPasswordPage() {
	const [token, setToken] = useState("rakta_reset_token_sec_9948");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
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
			if (newPassword !== confirmPassword) {
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
				toast.success("Password updated. You can now sign in.", {
					title: "PASSWORD RESET",
					duration: 3000,
				});
			} catch {
				setStatus("error");
				toast.error("Password reset failed.", { duration: 3000 });
			}
		},
		[newPassword, confirmPassword],
	);

	return (
		<AuthShell
			eyebrow="Credentials Update"
			title="Reset Password"
			description="Enter your verification token and set a new secure password."
		>
			<form
				ref={formRef}
				className="grid w-full gap-5 border border-surface-stroke bg-[#080808] p-6 shadow-2xl shadow-rose-950/20"
				onSubmit={handleSubmit}
			>
				{status === "success" && (
					<RaktaAlert
						type="success"
						title="PASSWORD UPDATED"
						onClose={() => setStatus("idle")}
					>
						Your password was updated. Redirecting to sign in...
					</RaktaAlert>
				)}
				{status === "error" && (
					<RaktaAlert
						type="error"
						title="ERROR"
						onClose={() => setStatus("idle")}
					>
						Reset failed. Check your token or passwords.
					</RaktaAlert>
				)}

				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					<span className="flex items-center gap-1.5">
						<FaMicrochip className="h-3 w-3 text-brand-pink" /> Reset Token
					</span>
					<input
						className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
						onChange={(e) => setToken(e.target.value)}
						type="text"
						value={token}
						required
					/>
				</label>

				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					New Password
					<input
						className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
						onChange={(e) => setNewPassword(e.target.value)}
						type="password"
						value={newPassword}
						required
					/>
				</label>

				<label className="grid gap-2 font-mono text-xs uppercase text-gray-400">
					Confirm New Password
					<input
						className="border border-surface-stroke bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-pink transition-colors"
						onChange={(e) => setConfirmPassword(e.target.value)}
						type="password"
						value={confirmPassword}
						required
					/>
				</label>

				<div className="border border-brand-green/30 bg-brand-green/5 p-3 font-mono text-xs text-brand-green flex items-center gap-2">
					<FaCircleCheck className="h-3 w-3 flex-shrink-0" />
					<span>
						{status === "loading"
							? "Updating password in Rakta database..."
							: status === "success"
								? "Password updated. You can now sign in."
								: "Enter reset token and new password."}
					</span>
				</div>

				<button
					className="border border-brand-pink bg-brand-pink px-4 py-3 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-black transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
					type="submit"
					disabled={status === "loading"}
				>
					<FaCheck className="h-3 w-3" />
					{status === "loading" ? "Updating Password..." : "Update Password"}
				</button>

				<div className="flex justify-between font-mono text-xs uppercase text-gray-500">
					<click
						to="/login"
						className="hover:text-brand-pink transition-colors flex items-center gap-1"
					>
						<FaArrowRight className="h-2.5 w-2.5 rotate-180" /> Back to Sign in
					</click>
				</div>
			</form>
		</AuthShell>
	);
}
