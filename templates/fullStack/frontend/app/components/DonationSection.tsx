// biome-ignore-all lint: Template welcome starter Rakta.js , cerminan desain resmi.
// biome-ignore-all assist: Template welcome starter Rakta.js , cerminan desain resmi.
// DonationSection - Humanitarian solidarity section. Uses GSAP for entrance animation.
// All icons use inline SVGs to avoid react-icons import overhead for this section.

export default function DonationSection({
	lang: _lang,
}: {
	lang?: "ID" | "EN";
}) {
	const solidaritySectionRef = useRef<HTMLElement | null>(null);
	const [isCopiedDonation, setIsCopiedDonation] = useState(false);

	useEffect(() => {
		if (!solidaritySectionRef.current) return;
		const animationContext = gsap.context(() => {
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

		return () => animationContext.revert();
	}, []);

	const handleCopyDonationLink = (clickEvent?: {
		stopPropagation?: () => void;
	}) => {
		clickEvent?.stopPropagation?.();
		if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
			void navigator.clipboard.writeText(
				"https://buymeacoffee.com/rheinsullivan",
			);
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
			{/* Top info bar */}
			<div className="p-8 md:p-12 border-b border-surface-stroke flex flex-col md:flex-row md:items-end justify-between gap-8 bg-black">
				<div className="flex flex-col gap-4 max-w-2xl">
					<div className="flex items-center gap-3">
						{/* 04 / SOLIDARITY label with hand-heart SVG */}
						<span className="font-mono text-[10px] text-brand-pink tracking-widest font-bold uppercase flex items-center gap-1.5">
							<span className="inline-flex items-center">
								<svg
									stroke="currentColor"
									fill="currentColor"
									strokeWidth="0"
									viewBox="0 0 24 24"
									height="14"
									width="14"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M9.3349 11.5022L11.5049 11.5027C13.9902 11.5027 16.0049 13.5174 16.0049 16.0027L9.00388 16.0018L9.00488 17.0027L17.0049 17.0019V16.0027C17.0049 14.9202 16.6867 13.8996 16.1188 13.0019L19.0049 13.0027C20.9972 13.0027 22.7173 14.1679 23.521 15.8541C21.1562 18.9747 17.3268 21.0027 13.0049 21.0027C10.2436 21.0027 7.90437 20.4121 6.00447 19.3779L6.00592 10.0737C7.25147 10.2521 8.39122 10.7583 9.3349 11.5022ZM4.00488 9.00268C4.51772 9.00268 4.94039 9.38872 4.99816 9.88606L5.00488 10.0018V19.0027C5.00488 19.555 4.55717 20.0027 4.00488 20.0027H2.00488C1.4526 20.0027 1.00488 19.555 1.00488 19.0027V10.0027C1.00488 9.45039 1.4526 9.00268 2.00488 9.00268H4.00488ZM13.6513 3.57806L14.0046 3.93183L14.3584 3.57806C15.3347 2.60175 16.9177 2.60175 17.894 3.57806C18.8703 4.55437 18.8703 6.13728 17.894 7.11359L14.0049 11.0027L10.1158 7.11359C9.13948 6.13728 9.13948 4.55437 10.1158 3.57806C11.0921 2.60175 12.675 2.60175 13.6513 3.57806Z" />
								</svg>
							</span>
							04 / SOLIDARITY
						</span>
						<span className="text-zinc-700">|</span>
						{/* Indonesia ⇄ Palestine flag strip */}
						<div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-2.5 py-1">
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

				{/* Action buttons */}
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
					{/* Copy link button */}
					<button
						onClick={handleCopyDonationLink}
						type="button"
						className="flex items-center justify-center gap-2 font-mono text-[11px] font-bold px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white uppercase tracking-wider transition-all cursor-pointer active:scale-95 border border-zinc-800"
					>
						{isCopiedDonation ? (
							<>
								<span className="text-emerald-400 inline-flex items-center">
									<svg
										stroke="currentColor"
										fill="currentColor"
										strokeWidth="0"
										viewBox="0 0 24 24"
										height="14"
										width="14"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M16.4524 8.22183L11.5019 13.1709L8.67421 10.3431L7.25999 11.7574L11.5026 16L17.8666 9.63604L16.4524 8.22183Z" />
									</svg>
								</span>
								<span className="text-emerald-400">COPIED</span>
							</>
						) : (
							<>
								<span className="text-zinc-400 inline-flex items-center">
									<svg
										stroke="currentColor"
										fill="currentColor"
										strokeWidth="0"
										viewBox="0 0 24 24"
										height="14"
										width="14"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M6.9998 6V3C6.9998 2.44772 7.44752 2 7.9998 2H19.9998C20.5521 2 20.9998 2.44772 20.9998 3V17C20.9998 17.5523 20.5521 18 19.9998 18H16.9998V20.9991C16.9998 21.5519 16.5499 22 15.993 22H4.00666C3.45059 22 3 21.5554 3 20.9991L3.0026 7.00087C3.0027 6.44811 3.45264 6 4.00942 6H6.9998ZM8.9998 6H16.9998V16H18.9998V4H8.9998V6Z" />
									</svg>
								</span>
								<span>COPY LINK</span>
							</>
						)}
					</button>

					{/* Donate Now - native <a> tag, not <click>, because it opens external URL */}
					<a
						href="https://buymeacoffee.com/rheinsullivan"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center justify-center gap-2 font-mono text-[11px] font-extrabold px-6 py-3.5 bg-brand-pink text-white hover:bg-white hover:text-black uppercase tracking-wider transition-all active:scale-95"
					>
						<span className="inline-flex items-center">
							<svg
								stroke="currentColor"
								fill="currentColor"
								strokeWidth="0"
								viewBox="0 0 24 24"
								height="16"
								width="16"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M5 3H20C21.1046 3 22 3.89543 22 5V8C22 9.10457 21.1046 10 20 10H18V13C18 15.2091 16.2091 17 14 17H8C5.79086 17 4 15.2091 4 13V4C4 3.44772 4.44772 3 5 3ZM18 5V8H20V5H18ZM2 19H20V21H2V19Z" />
							</svg>
						</span>
						<span>DONATE NOW</span>
						<span className="inline-flex items-center">
							<svg
								stroke="currentColor"
								fill="currentColor"
								strokeWidth="0"
								viewBox="0 0 24 24"
								height="14"
								width="14"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
							</svg>
						</span>
					</a>
				</div>
			</div>

			{/* 3-column grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-0">
				{/* Card 1: Official Channel */}
				<div className="gsap-solidarity-item border-b border-surface-stroke md:border-b-0 md:border-r border-surface-stroke p-8 md:p-12 flex flex-col justify-between min-h-[260px] bg-black hover:bg-white hover:text-black group transition-all duration-300">
					<div>
						<span className="font-mono text-[10px] text-brand-pink group-hover:text-black mb-8 block tracking-widest font-bold uppercase flex items-center gap-1.5">
							<span className="inline-flex items-center">
								<svg
									stroke="currentColor"
									fill="currentColor"
									strokeWidth="0"
									viewBox="0 0 24 24"
									height="12"
									width="12"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M5 3H20C21.1046 3 22 3.89543 22 5V8C22 9.10457 21.1046 10 20 10H18V13C18 15.2091 16.2091 17 14 17H8C5.79086 17 4 15.2091 4 13V4C4 3.44772 4.44772 3 5 3ZM18 5V8H20V5H18ZM2 19H20V21H2V19Z" />
								</svg>
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
							<svg
								stroke="currentColor"
								fill="currentColor"
								strokeWidth="0"
								viewBox="0 0 24 24"
								height="14"
								width="14"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M12 1L20.2169 2.82598C20.6745 2.92766 21 3.33347 21 3.80217V13.7889C21 15.795 19.9974 17.6684 18.3282 18.7812L12 23L5.6718 18.7812C4.00261 17.6684 3 15.795 3 13.7889V3.80217C3 3.33347 3.32553 2.92766 3.78307 2.82598L12 1ZM16.4524 8.22183L11.5019 13.1709L8.67421 10.3431L7.25999 11.7574L11.5026 16L17.8666 9.63604L16.4524 8.22183Z" />
							</svg>
						</span>
						<span>VERIFIED REPOSITORY CHANNEL</span>
					</div>
				</div>

				{/* Card 2: Direct Allocation */}
				<div className="gsap-solidarity-item border-b border-surface-stroke md:border-b-0 md:border-r border-surface-stroke p-8 md:p-12 flex flex-col justify-between min-h-[260px] bg-black hover:bg-white hover:text-black group transition-all duration-300">
					<div>
						<span className="font-mono text-[10px] text-brand-pink group-hover:text-black mb-8 block tracking-widest font-bold uppercase flex items-center gap-1.5">
							<span className="inline-flex items-center">
								<svg
									stroke="currentColor"
									fill="currentColor"
									strokeWidth="0"
									viewBox="0 0 24 24"
									height="12"
									width="12"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853Z" />
								</svg>
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
							<svg
								stroke="currentColor"
								fill="currentColor"
								strokeWidth="0"
								viewBox="0 0 24 24"
								height="14"
								width="14"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853Z" />
							</svg>
						</span>
						<span>PRIORITY HUMANITARIAN AID</span>
					</div>
				</div>

				{/* Card 3: Infrastructure */}
				<div className="gsap-solidarity-item p-8 md:p-12 flex flex-col justify-between min-h-[260px] bg-black hover:bg-white hover:text-black group transition-all duration-300">
					<div>
						<span className="font-mono text-[10px] text-brand-pink group-hover:text-black mb-8 block tracking-widest font-bold uppercase flex items-center gap-1.5">
							<span className="inline-flex items-center">
								<svg
									stroke="currentColor"
									fill="currentColor"
									strokeWidth="0"
									viewBox="0 0 24 24"
									height="12"
									width="12"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M2.04932 12.9999H7.52725C7.70624 16.2688 8.7574 19.3053 10.452 21.8809C5.98761 21.1871 2.5001 17.5402 2.04932 12.9999ZM2.04932 10.9999C2.5001 6.45968 5.98761 2.81276 10.452 2.11902C8.7574 4.69456 7.70624 7.73111 7.52725 10.9999H2.04932ZM21.9506 10.9999H16.4726C16.2936 7.73111 15.2425 4.69456 13.5479 2.11902C18.0123 2.81276 21.4998 6.45968 21.9506 10.9999ZM21.9506 12.9999C21.4998 17.5402 18.0123 21.1871 13.5479 21.8809C15.2425 19.3053 16.2936 16.2688 16.4726 12.9999H21.9506ZM9.53068 12.9999H14.4692C14.2976 15.7828 13.4146 18.3732 11.9999 20.5915C10.5852 18.3732 9.70229 15.7828 9.53068 12.9999ZM9.53068 10.9999C9.70229 8.21709 10.5852 5.62672 11.9999 3.40841C13.4146 5.62672 14.2976 8.21709 14.4692 10.9999H9.53068Z" />
								</svg>
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
							<svg
								stroke="currentColor"
								fill="currentColor"
								strokeWidth="0"
								viewBox="0 0 24 24"
								height="14"
								width="14"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M14 4.4375C15.3462 4.4375 16.4375 3.34619 16.4375 2H17.5625C17.5625 3.34619 18.6538 4.4375 20 4.4375V5.5625C18.6538 5.5625 17.5625 6.65381 17.5625 8H16.4375C16.4375 6.65381 15.3462 5.5625 14 5.5625V4.4375ZM1 11C4.31371 11 7 8.31371 7 5H9C9 8.31371 11.6863 11 15 11V13C11.6863 13 9 15.6863 9 19H7C7 15.6863 4.31371 13 1 13V11ZM17.25 14C17.25 15.7949 15.7949 17.25 14 17.25V18.75C15.7949 18.75 17.25 20.2051 17.25 22H18.75C18.75 20.2051 20.2051 18.75 22 18.75V17.25C20.2051 17.25 18.75 15.7949 18.75 14H17.25Z" />
							</svg>
						</span>
						<span>NO PERSONAL PROFIT</span>
					</div>
				</div>
			</div>
		</section>
	);
}
