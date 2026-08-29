// biome-ignore-all lint: Template welcome starter Rakta.js
// DonationSection - Rakta.js Auto Import: gsap, react-icons, toast, audio

export default function DonationSection({
	lang: _lang,
}: {
	lang?: "ID" | "EN";
}) {
	const solidaritySectionRef = useRef<HTMLElement | null>(null);
	const [isCopiedDonation, setIsCopiedDonation] = useState(false);

	useEffect(() => {
		if (!solidaritySectionRef.current) return;
		const ctx = gsap.context(() => {
			gsap.fromTo(
				".gsap-solidarity-item",
				{ opacity: 0, y: 24 },
				{
					opacity: 1,
					y: 0,
					duration: 0.7,
					stagger: 0.12,
					ease: "power2.out",
				},
			);
		}, solidaritySectionRef);

		return () => ctx.revert();
	}, []);

	const handleCopyDonationLink = (e?: { stopPropagation?: () => void }) => {
		if (e) e.stopPropagation();
		if (typeof navigator !== "undefined" && navigator.clipboard) {
			navigator.clipboard.writeText("https://buymeacoffee.com/rheinsullivan");
		}
		setIsCopiedDonation(true);
		playJumpSound();
		setTimeout(() => setIsCopiedDonation(false), 2500);
	};

	return (
		<section
			id="humanitarian"
			ref={solidaritySectionRef}
			className="border-t border-surface-stroke my-10 flex flex-col"
		>
			{/* Header Bar matching Rakta Neo-Brutalist Layout */}
			<div className="p-8 md:p-12 border-b border-surface-stroke flex flex-col md:flex-row md:items-end justify-between gap-8 bg-black">
				<div className="flex flex-col gap-4 max-w-2xl">
					<div className="flex items-center gap-3">
						<span className="font-mono text-[10px] text-brand-pink tracking-widest font-bold uppercase flex items-center gap-1.5">
							<span className="inline-flex items-center">
								<RiHandHeartFill size={14} />
							</span>
							04 / SOLIDARITY
						</span>
						<span className="text-zinc-700">|</span>
						<div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-2.5 py-1">
							{/* Indonesia Flag SVG */}
							<svg
								viewBox="0 0 30 20"
								className="w-4 h-3 border border-white/20 shrink-0"
								aria-hidden="true"
							>
								<rect width="30" height="10" fill="#E11D48" />
								<rect y="10" width="30" height="10" fill="#FFFFFF" />
							</svg>
							<span className="font-mono text-[11px] font-bold text-white tracking-wider">
								INDONESIA
							</span>
							<span className="text-zinc-600 font-mono text-xs">⇄</span>
							{/* Palestine Flag SVG */}
							<svg
								viewBox="0 0 30 20"
								className="w-4 h-3 border border-white/20 shrink-0"
								aria-hidden="true"
							>
								<rect width="30" height="6.66" fill="#000000" />
								<rect y="6.66" width="30" height="6.66" fill="#FFFFFF" />
								<rect y="13.33" width="30" height="6.66" fill="#009736" />
								<polygon points="0,0 12,10 0,20" fill="#E4312B" />
							</svg>
							<span className="font-mono text-[11px] font-bold text-white tracking-wider">
								PALESTINE
							</span>
						</div>
					</div>

					<h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-white uppercase tracking-tight leading-[0.9]">
						HUMANITARIAN RELIEF
					</h2>

					<p className="font-sans text-xs sm:text-sm text-zinc-500 leading-relaxed">
						Direct humanitarian solidarity by the Indonesian developer ecosystem
						to provide emergency medical relief, clean water, and food aid in
						Palestine.
					</p>
				</div>

				{/* Direct Action Buttons */}
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
					<button
						onClick={handleCopyDonationLink}
						type="button"
						className="flex items-center justify-center gap-2 font-mono text-[11px] font-bold px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white uppercase tracking-wider transition-all cursor-pointer active:scale-95 border border-zinc-800"
					>
						{isCopiedDonation ? (
							<>
								<span className="text-emerald-400 inline-flex items-center">
									<RiCheckFill size={16} />
								</span>
								<span className="text-emerald-400">COPIED</span>
							</>
						) : (
							<>
								<span className="text-zinc-400 inline-flex items-center">
									<RiFileCopyFill size={14} />
								</span>
								<span>COPY LINK</span>
							</>
						)}
					</button>

					<click
						to="https://buymeacoffee.com/rheinsullivan"
						target="_blank"
						rel="noopener noreferrer"
						onClick={() => playJumpSound()}
						className="flex items-center justify-center gap-2 font-mono text-[11px] font-extrabold px-6 py-3.5 bg-brand-pink text-white hover:bg-white hover:text-black uppercase tracking-wider transition-all active:scale-95 no-underline"
					>
						<span className="inline-flex items-center">
							<RiCupFill size={16} />
						</span>
						<span>DONATE NOW</span>
						<span className="inline-flex items-center">
							<RiArrowRightLine size={14} />
						</span>
					</click>
				</div>
			</div>

			{/* 3-Column Grid Matching Next Steps Section */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-0">
				{/* Card 1: Channel & Allocation Notice */}
				<div className="gsap-solidarity-item border-b border-surface-stroke md:border-b-0 md:border-r border-surface-stroke p-8 md:p-12 flex flex-col justify-between min-h-[260px] bg-black hover:bg-white hover:text-black group transition-all duration-300">
					<div>
						<span className="font-mono text-[10px] text-brand-pink group-hover:text-black mb-8 block tracking-widest font-bold uppercase flex items-center gap-1.5">
							<span className="inline-flex items-center">
								<RiCupFill size={12} />
							</span>
							OFFICIAL CHANNEL
						</span>
						<h3 className="font-sans text-2xl font-extrabold mb-3 uppercase tracking-tight">
							BUYMEACOFFEE
						</h3>
						<p className="font-sans text-xs text-zinc-500 group-hover:text-black/70 leading-relaxed mb-4">
							buymeacoffee.com/rheinsullivan · Max. 30% framework operational
							cost, the rest goes entirely to humanitarian relief.
						</p>
					</div>
					<div className="font-mono text-[10px] font-extrabold tracking-wider flex items-center gap-2 text-zinc-400 group-hover:text-black">
						<span className="text-emerald-400 group-hover:text-black inline-flex items-center">
							<RiShieldCheckFill size={14} />
						</span>
						<span>VERIFIED REPOSITORY CHANNEL</span>
					</div>
				</div>

				{/* Card 2: Relief Allocation */}
				<div className="gsap-solidarity-item border-b border-surface-stroke md:border-b-0 md:border-r border-surface-stroke p-8 md:p-12 flex flex-col justify-between min-h-[260px] bg-black hover:bg-white hover:text-black group transition-all duration-300">
					<div>
						<span className="font-mono text-[10px] text-brand-pink group-hover:text-black mb-8 block tracking-widest font-bold uppercase flex items-center gap-1.5">
							<span className="inline-flex items-center">
								<RiHeartFill size={12} />
							</span>
							DIRECT ALLOCATION
						</span>
						<h3 className="font-sans text-2xl font-extrabold mb-3 uppercase tracking-tight">
							≥ 70% PALESTINE
						</h3>
						<p className="font-sans text-xs text-zinc-500 group-hover:text-black/70 leading-relaxed mb-4">
							Emergency medical supply shipments, trauma care units, clean water
							filtration, and food rations.
						</p>
					</div>
					<div className="font-mono text-[10px] font-extrabold tracking-wider flex items-center gap-2 text-zinc-400 group-hover:text-black">
						<span className="text-brand-pink group-hover:text-black inline-flex items-center">
							<RiHeartFill size={14} />
						</span>
						<span>PRIORITY HUMANITARIAN AID</span>
					</div>
				</div>

				{/* Card 3: Framework Operational Overhead */}
				<div className="gsap-solidarity-item p-8 md:p-12 flex flex-col justify-between min-h-[260px] bg-black hover:bg-white hover:text-black group transition-all duration-300">
					<div>
						<span className="font-mono text-[10px] text-brand-pink group-hover:text-black mb-8 block tracking-widest font-bold uppercase flex items-center gap-1.5">
							<span className="inline-flex items-center">
								<RiGlobalFill size={12} />
							</span>
							INFRASTRUCTURE
						</span>
						<h3 className="font-sans text-2xl font-extrabold mb-3 uppercase tracking-tight">
							≤ 30% OPERATIONS
						</h3>
						<p className="font-sans text-xs text-zinc-500 group-hover:text-black/70 leading-relaxed mb-4">
							Dedicated strictly to edge distribution nodes, repository
							bandwidth, and continuous integration server costs.
						</p>
					</div>
					<div className="font-mono text-[10px] font-extrabold tracking-wider flex items-center gap-2 text-zinc-400 group-hover:text-black">
						<span className="text-zinc-400 group-hover:text-black inline-flex items-center">
							<RiSparklingFill size={14} />
						</span>
						<span>NO PERSONAL PROFIT</span>
					</div>
				</div>
			</div>
		</section>
	);
}
