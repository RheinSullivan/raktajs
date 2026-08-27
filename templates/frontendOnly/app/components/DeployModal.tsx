// biome-ignore-all lint: Template welcome starter Rakta.js , cerminan desain resmi.
// biome-ignore-all assist: Template welcome starter Rakta.js , cerminan desain resmi.
// DeployModal - wizard overlay simulasi deployment edge.
// Menggunakan icon dari react-icons/fa6 yang sudah di-auto-import oleh Rakta.js.

type DeployStatus = "idle" | "building" | "success";

interface DeployLogEntry {
	readonly text: string;
	readonly type: string;
}

interface DeployModalProps {
	readonly isOpen: boolean;
	readonly onClose: () => void;
}

export default function DeployModal({ isOpen, onClose }: DeployModalProps) {
	const [status, setStatus] = useState<DeployStatus>("idle");
	const [logs, setLogs] = useState<ReadonlyArray<DeployLogEntry>>([]);
	const [progress, setProgress] = useState(0);
	const overlayRef = useRef<HTMLDivElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const terminalEndRef = useRef<HTMLDivElement>(null);
	const stepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Animasi masuk dengan GSAP, menghormati prefers-reduced-motion
	useEffect(() => {
		const prefersReduced =
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		if (isOpen && overlayRef.current && panelRef.current) {
			if (prefersReduced) {
				gsap.set(overlayRef.current, { opacity: 1 });
				gsap.set(panelRef.current, { opacity: 1, y: 0, scale: 1 });
			} else {
				gsap.fromTo(
					overlayRef.current,
					{ opacity: 0 },
					{ opacity: 1, duration: 0.18, ease: "power2.out" },
				);
				gsap.fromTo(
					panelRef.current,
					{ opacity: 0, y: 16, scale: 0.97 },
					{ opacity: 1, y: 0, scale: 1, duration: 0.22, ease: "power3.out" },
				);
			}
		}
	}, [isOpen]);

	// Auto-scroll terminal ke baris terbaru
	useEffect(() => {
		terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [logs]);

	// Tutup dengan Escape, bersihkan timeout saat unmount
	useEffect(() => {
		if (!isOpen) return;
		const handleKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKey);
		return () => {
			window.removeEventListener("keydown", handleKey);
			if (stepTimeoutRef.current !== null) {
				clearTimeout(stepTimeoutRef.current);
			}
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const deployLogs: ReadonlyArray<DeployLogEntry> =
		typeof DEPLOY_LOGS !== "undefined" ? DEPLOY_LOGS : [];

	const startDeployment = () => {
		setStatus("building");
		setLogs([]);
		setProgress(0);

		let currentIndex = 0;

		const runStep = () => {
			if (currentIndex < deployLogs.length) {
				const entry = deployLogs[currentIndex];
				if (entry !== undefined) {
					setLogs((previous) => [
						...previous,
						{ text: entry.text, type: entry.type },
					]);
				}
				setProgress(Math.round(((currentIndex + 1) / deployLogs.length) * 100));
				currentIndex++;
				stepTimeoutRef.current = setTimeout(runStep, Math.random() * 250 + 150);
			} else {
				setStatus("success");
			}
		};

		stepTimeoutRef.current = setTimeout(runStep, 400);
	};

	const resetDeployment = () => {
		if (stepTimeoutRef.current !== null) {
			clearTimeout(stepTimeoutRef.current);
			stepTimeoutRef.current = null;
		}
		setStatus("idle");
		setLogs([]);
		setProgress(0);
	};

	const getLogClass = (type: string): string => {
		if (type === "system")
			return "text-brand-pink font-bold border-b border-brand-pink/20 pb-1 mb-2";
		if (type === "success") return "text-brand-green font-bold";
		return "text-gray-300";
	};

	return (
		<div
			ref={overlayRef}
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
			aria-modal="true"
			role="dialog"
			aria-label="Rakta.js Edge Deployment"
			onClick={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
		>
			<div
				ref={panelRef}
				className="w-full max-w-3xl h-[72vh] bg-black border-2 border-white flex flex-col relative"
				onClick={(event) => event.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b border-surface-stroke p-5">
					<div className="flex items-center gap-3">
						<FaCloud className="w-5 h-5 text-brand-pink" aria-hidden="true" />
						<h2 className="text-xl font-bold font-mono tracking-tight uppercase">
							Rakta <span className="text-brand-pink">Edge Deployment</span>
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-2 border border-surface-stroke hover:bg-brand-pink hover:text-white transition-colors cursor-pointer"
						aria-label="Close Edge Deployment"
					>
						<FaXmark className="w-5 h-5" aria-hidden="true" />
					</button>
				</div>

				{/* Status bar */}
				<div className="bg-zinc-950 p-5 border-b border-surface-stroke flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">
							PIPELINE STATUS
						</span>
						<div className="flex items-center gap-2 mt-1">
							{status === "idle" && (
								<span className="font-mono text-sm text-yellow-500 font-bold uppercase flex items-center gap-1.5">
									<span className="w-2 h-2 bg-yellow-500 animate-pulse rounded-full" />
									IDLE - READY TO LAUNCH
								</span>
							)}
							{status === "building" && (
								<span className="font-mono text-sm text-brand-pink font-bold uppercase flex items-center gap-1.5 animate-pulse">
									<span className="w-2 h-2 bg-brand-pink" />
									COMPILING IN PROGRESS ({progress}%)
								</span>
							)}
							{status === "success" && (
								<span className="font-mono text-sm text-brand-green font-bold uppercase flex items-center gap-1.5">
									<span className="w-2 h-2 bg-brand-green rounded-full" />
									LIVE - PRODUCTION DEPLOYED
								</span>
							)}
						</div>
					</div>

					<div className="flex items-center gap-3">
						{status === "idle" && (
							<button
								type="button"
								onClick={startDeployment}
								className="bg-brand-pink hover:bg-white text-white hover:text-black px-6 py-2.5 font-mono text-xs font-bold uppercase transition-all border border-transparent active:scale-95 flex items-center gap-2 cursor-pointer"
							>
								<FaPlay className="w-4 h-4" aria-hidden="true" />
								INITIATE LAUNCH
							</button>
						)}
						{status === "building" && (
							<div className="w-32 bg-zinc-900 border border-zinc-800 p-0.5">
								<div
									className="h-4 bg-brand-pink transition-all duration-150"
									style={{ width: `${progress}%` }}
								/>
							</div>
						)}
						{status === "success" && (
							<button
								type="button"
								onClick={resetDeployment}
								className="border border-white hover:bg-white hover:text-black px-4 py-2.5 font-mono text-xs uppercase transition-all flex items-center gap-1.5 cursor-pointer"
							>
								<RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
								RE-BUILD PIPELINE
							</button>
						)}
					</div>
				</div>

				{/* Terminal log */}
				<div
					className="flex-1 bg-black p-5 font-mono text-xs overflow-y-auto flex flex-col gap-2 select-text"
					aria-live="polite"
					aria-label="Deployment log output"
				>
					{logs.map((log, index) => (
						<div
							key={index}
							className={`leading-relaxed whitespace-pre-wrap ${getLogClass(log.type)}`}
						>
							{log.text}
						</div>
					))}

					{status === "idle" && (
						<div className="text-gray-600 italic mt-4 text-center">
							Terminal is silent. Click INITIATE LAUNCH to begin
							containerization.
						</div>
					)}

					{status === "building" && (
						<div className="text-brand-pink animate-pulse mt-2 flex items-center gap-1">
							<span className="inline-block w-1.5 h-3.5 bg-brand-pink" />
						</div>
					)}

					{status === "success" && (
						<div className="mt-6 p-4 border border-brand-green bg-emerald-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div>
								<span className="font-bold text-brand-green uppercase flex items-center gap-1.5 text-xs mb-1">
									<CheckCircle2 className="w-4 h-4" aria-hidden="true" />
									Edge Application Online
								</span>
								<p className="text-[10px] text-gray-500 leading-normal">
									Serverless environment deployed with Port-3000 routing active.
								</p>
								<p className="text-xs text-white font-mono mt-2 select-all bg-black px-2 py-1 inline-block border border-zinc-800">
									https://rakta-ready.edge.local
								</p>
							</div>
							<div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] text-zinc-500 border-l border-zinc-800 pl-4">
								<div>RESPONSE_TIME</div>
								<div className="text-brand-green font-bold text-right">
									4.5ms
								</div>
								<div>EDGE_LOCS</div>
								<div className="text-white text-right">9 NODES</div>
								<div>COMPRESS</div>
								<div className="text-white text-right">14.12MB</div>
							</div>
						</div>
					)}

					<div ref={terminalEndRef} />
				</div>
			</div>
		</div>
	);
}
