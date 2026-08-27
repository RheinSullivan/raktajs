// biome-ignore-all lint: Template welcome starter Rakta.js , cerminan desain resmi.
// biome-ignore-all assist: Template welcome starter Rakta.js , cerminan desain resmi.
// ComponentsModal - overlay galeri komponen UI.
// Menggunakan icon dari react-icons/fa6 dan react-icons/lu yang sudah di-auto-import oleh Rakta.js.

interface ComponentsModalProps {
	readonly isOpen: boolean;
	readonly onClose: () => void;
}

export default function ComponentsModal({
	isOpen,
	onClose,
}: ComponentsModalProps) {
	const [activeCompId, setActiveCompId] = useState<ComponentId>("button");
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const overlayRef = useRef<HTMLDivElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);

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

	// Tutup dengan Escape
	useEffect(() => {
		if (!isOpen) return;
		const handleKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const activeMetadata =
		typeof COMPONENT_METADATA !== "undefined"
			? COMPONENT_METADATA[activeCompId]
			: null;

	const handleCopyCode = (code: string, compId: string) => {
		navigator.clipboard
			.writeText(code)
			.then(() => {
				setCopiedId(compId);
				setTimeout(() => setCopiedId(null), 2000);
			})
			.catch(() => {});
	};

	// Preview langsung tanpa dependensi eksternal
	const renderPreview = (compId: ComponentId): ReactNode => {
		if (compId === "button") {
			return (
				<button
					type="button"
					className="bg-brand-pink hover:bg-white text-white hover:text-black px-6 py-3 font-mono text-xs font-bold uppercase transition-all duration-150 border border-transparent hover:border-black active:scale-95 shadow-[4px_4px_0px_0px_rgba(244,63,94,0.4)] cursor-pointer"
				>
					TRIGGER PIPELINE
				</button>
			);
		}
		if (compId === "badge") {
			return (
				<div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-950/20 px-3 py-1.5 font-mono text-xs text-emerald-400">
					<span className="relative flex h-2 w-2">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
						<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
					</span>
					OPERATIONAL :: 100%
				</div>
			);
		}
		if (compId === "switch") {
			return (
				<div className="flex items-center gap-4">
					<div className="flex items-center border-2 border-white p-0.5 w-16 h-8 bg-brand-pink cursor-pointer">
						<div className="w-6 h-6 bg-white translate-x-8" />
					</div>
					<span className="font-mono text-xs uppercase text-gray-400">
						STATE: <span className="text-white font-bold">ENABLED</span>
					</span>
				</div>
			);
		}
		if (compId === "slider") {
			return (
				<div className="w-full max-w-sm font-mono text-xs">
					<div className="flex justify-between mb-2">
						<span className="text-gray-400 uppercase">SYS_SPEED</span>
						<span className="text-brand-green font-bold">60 MHz</span>
					</div>
					<input
						type="range"
						min="10"
						max="200"
						defaultValue="60"
						className="accent-brand-pink bg-zinc-900 h-2 w-full border border-zinc-700 appearance-none cursor-pointer"
					/>
					<div className="flex justify-between mt-1 text-[9px] text-gray-600">
						<span>MIN</span>
						<span>MID_GRID</span>
						<span>MAX</span>
					</div>
				</div>
			);
		}
		if (compId === "input") {
			return (
				<div className="w-full max-w-xs font-mono text-xs">
					<label className="block text-gray-500 uppercase mb-1.5">
						Node Configuration
					</label>
					<input
						type="text"
						placeholder="ENTER NODE NAME..."
						className="bg-black border border-zinc-700 focus:border-brand-pink text-white px-4 py-2 w-full outline-none"
					/>
				</div>
			);
		}
		return null;
	};

	const componentIds =
		typeof COMPONENT_IDS !== "undefined" ? [...COMPONENT_IDS] : [];

	return (
		<div
			ref={overlayRef}
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
			aria-modal="true"
			role="dialog"
			aria-label="Rakta.js Component Library"
			onClick={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
		>
			<div
				ref={panelRef}
				className="w-full max-w-4xl h-[78vh] bg-black border-2 border-white flex flex-col relative"
				onClick={(event) => event.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b border-surface-stroke p-5">
					<div className="flex items-center gap-3">
						<Cpu className="w-5 h-5 text-brand-pink" aria-hidden="true" />
						<h2 className="text-xl font-bold font-mono tracking-tight uppercase">
							Rakta <span className="text-brand-pink">Component Library</span>
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-2 border border-surface-stroke hover:bg-brand-pink hover:text-white transition-colors cursor-pointer"
						aria-label="Close Component Library"
					>
						<FaXmark className="w-5 h-5" aria-hidden="true" />
					</button>
				</div>

				{/* Layout */}
				<div className="flex-1 flex flex-col md:flex-row overflow-hidden">
					{/* Sidebar daftar komponen */}
					<div className="w-full md:w-56 border-r border-surface-stroke overflow-y-auto bg-[#080808] divide-y divide-surface-stroke flex-shrink-0">
						{componentIds.map((compId) => {
							const metadata =
								typeof COMPONENT_METADATA !== "undefined"
									? COMPONENT_METADATA[compId as ComponentId]
									: null;
							const isSelected = compId === activeCompId;
							return (
								<button
									key={compId}
									type="button"
									onClick={() => setActiveCompId(compId as ComponentId)}
									className={`w-full text-left p-4 transition-colors font-mono text-xs uppercase cursor-pointer ${
										isSelected
											? "bg-brand-pink text-white font-bold"
											: "text-gray-400 hover:bg-white/5 hover:text-white"
									}`}
								>
									{metadata?.name ?? compId}
								</button>
							);
						})}
					</div>

					{/* Area preview dan kode */}
					{activeMetadata && (
						<div className="flex-1 flex flex-col overflow-y-auto bg-black p-6 md:p-8">
							<div className="mb-6">
								<h3 className="text-xl font-bold text-white uppercase font-mono tracking-tight">
									{activeMetadata.name}
								</h3>
								<p className="text-sm text-gray-400 mt-1">
									{activeMetadata.description}
								</p>
							</div>

							{/* Preview langsung */}
							<div className="border border-surface-stroke bg-[#050505] p-12 flex items-center justify-center min-h-[160px] relative">
								<span className="absolute top-2 left-2 text-[8px] font-mono text-gray-600 uppercase tracking-widest">
									LIVE PLAYGROUND
								</span>
								{renderPreview(activeCompId)}
							</div>

							{/* Blok kode dengan tombol salin */}
							<div className="mt-8 flex-1 flex flex-col min-h-[150px]">
								<div className="flex items-center justify-between bg-zinc-950 border-t border-x border-surface-stroke px-4 py-2">
									<span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
										<Code className="w-3.5 h-3.5" aria-hidden="true" /> HTML /
										Tailwind Markup
									</span>
									<button
										type="button"
										onClick={() =>
											handleCopyCode(activeMetadata.code, activeCompId)
										}
										className="flex items-center gap-1.5 text-[10px] font-mono text-brand-pink hover:text-white transition-colors cursor-pointer"
										aria-label="Copy code to clipboard"
									>
										{copiedId === activeCompId ? (
											<>
												<Check
													className="w-3.5 h-3.5 text-brand-green"
													aria-hidden="true"
												/>{" "}
												COPIED!
											</>
										) : (
											<>
												<Copy className="w-3.5 h-3.5" aria-hidden="true" /> COPY
												TO CLIPBOARD
											</>
										)}
									</button>
								</div>
								<pre className="flex-1 bg-zinc-950 border border-surface-stroke p-4 font-mono text-xs text-brand-green overflow-x-auto whitespace-pre leading-5 select-all">
									<code>{activeMetadata.code}</code>
								</pre>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
