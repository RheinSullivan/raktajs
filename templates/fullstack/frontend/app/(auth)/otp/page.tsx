// biome-ignore-all lint: Template welcome starter Rakta.js
// OTP Verification Page - Rakta.js: react-icons, RaktaAlert, useState/useEffect

export default function OtpPage() {
	const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [countdown, setCountdown] = useState(60);
	const [isResendDisabled, setIsResendDisabled] = useState(true);
	const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

	useEffect(() => {
		let timer: ReturnType<typeof setInterval>;
		if (countdown > 0 && isResendDisabled) {
			timer = setInterval(() => {
				setCountdown((prev) => prev - 1);
			}, 1000);
		} else {
			setIsResendDisabled(false);
		}
		return () => clearInterval(timer);
	}, [countdown, isResendDisabled]);

	const handleChange = (index: number, value: string) => {
		if (value.length > 1) value = value[value.length - 1] ?? "";
		const updated = [...otpValues];
		updated[index] = value;
		setOtpValues(updated);

		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (
		index: number,
		event: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (event.key === "Backspace" && !otpValues[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleResend = () => {
		setCountdown(60);
		setIsResendDisabled(true);
		toast.info("A new OTP code has been sent to your email.", {
			title: "OTP SENT",
		});
	};

	const handleSubmit = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			const code = otpValues.join("");
			if (code.length < 6) {
				setStatus("error");
				toast.error("Please enter complete 6-digit OTP code.");
				return;
			}

			setStatus("loading");
			try {
				await new Promise<void>((resolve) => setTimeout(resolve, 800));
				if (code === "123456" || code === "999999") {
					setStatus("success");
					toast.success(
						"OTP verified successfully. Redirecting to dashboard...",
					);
				} else {
					setStatus("error");
					toast.error("Invalid OTP code. Use 123456 or 999999 for demo.");
				}
			} catch {
				setStatus("error");
			}
		},
		[otpValues],
	);

	return (
		<AuthShell
			eyebrow="Two-Factor Gate"
			title="Enter Security OTP Code"
			description="Verify your identity by entering the 6-digit verification code sent to your email address."
		>
			<form
				className="grid w-full gap-5 border border-surface-stroke bg-[#080808] p-6 shadow-2xl shadow-rose-950/20"
				onSubmit={handleSubmit}
			>
				{status === "success" && (
					<RaktaAlert
						type="success"
						title="OTP VERIFIED"
						onClose={() => setStatus("idle")}
					>
						Security check passed. Access granted.
					</RaktaAlert>
				)}
				{status === "error" && (
					<RaktaAlert
						type="error"
						title="VERIFICATION FAILED"
						onClose={() => setStatus("idle")}
					>
						Invalid OTP code. Try 123456 for testing.
					</RaktaAlert>
				)}

				<div className="grid gap-2">
					<label className="font-mono text-xs uppercase text-gray-400">
						6-Digit Verification Code
					</label>
					<div className="flex justify-between gap-2">
						{otpValues.map((val, idx) => (
							<input
								key={idx}
								ref={(el) => {
									inputRefs.current[idx] = el;
								}}
								type="text"
								inputMode="numeric"
								maxLength={1}
								value={val}
								onChange={(e) => handleChange(idx, e.target.value)}
								onKeyDown={(e) => handleKeyDown(idx, e)}
								className="h-12 w-12 border border-surface-stroke bg-black text-center font-mono text-lg font-bold text-white outline-none focus:border-brand-pink transition-colors"
							/>
						))}
					</div>
				</div>

				<div className="flex items-center justify-between font-mono text-xs text-gray-400">
					<span>
						{isResendDisabled
							? `Resend code in ${countdown}s`
							: "Didn't receive code?"}
					</span>
					<button
						type="button"
						onClick={handleResend}
						disabled={isResendDisabled}
						className="text-brand-pink hover:underline disabled:text-gray-600 disabled:no-underline cursor-pointer"
					>
						Resend OTP
					</button>
				</div>

				<button
					type="submit"
					disabled={status === "loading"}
					className="cursor-pointer border-2 border-brand-pink bg-brand-pink px-6 py-3 font-mono text-xs font-bold uppercase text-white shadow-[4px_4px_0px_0px_rgba(244,63,94,0.4)] transition-all hover:bg-white hover:text-black flex items-center justify-center gap-2"
				>
					{status === "loading" ? "Verifying OTP..." : "Verify OTP Code"}
				</button>

				<div className="text-center font-mono text-xs text-gray-400">
					Return to{" "}
					<click to="/auth/login" className="text-brand-pink hover:underline">
						Sign In
					</click>
				</div>
			</form>
		</AuthShell>
	);
}
