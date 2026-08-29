// biome-ignore-all lint: Template welcome starter Rakta.js
// Footer - Rakta.js: <photo>, <click>, <pantura>, react-icons, gsap

const footerCopyData = {
	id: {
		tagline: "Framework React fullstack karya",
		location: "Cirebon & Jakarta Selatan, Indonesia",
		status: "OPERASIONAL :: 100%",
		github: "Repositori GitHub",
		license: "Lisensi MIT",
		rights: "Hak cipta dilindungi. Dibuat dengan ❤️ dari Indonesia untuk dunia.",
	},
	en: {
		tagline: "Fullstack React framework crafted by",
		location: "Cirebon & South Jakarta, Indonesia",
		status: "OPERATIONAL :: 100%",
		github: "GitHub Repository",
		license: "MIT License",
		rights: "All rights reserved. Built with ❤️ from Indonesia for the world.",
	},
} as const;

export default function Footer({ lang }: { lang: "ID" | "EN" }) {
	const langKey = lang.toLowerCase() as "id" | "en";
	const currentCopy = footerCopyData[langKey];
	const footerRef = useRef<HTMLElement>(null);

	useEffect(() => {
		if (!footerRef.current) return;
		gsap.fromTo(
			footerRef.current,
			{ opacity: 0, y: 20 },
			{
				opacity: 1,
				y: 0,
				duration: 0.6,
				ease: "power2.out",
				scrollTrigger: {
					trigger: footerRef.current,
					start: "top 95%",
				},
			},
		);
	}, []);

	return (
		<footer
			ref={footerRef}
			className="border-t border-surface-stroke bg-black px-4 py-10 sm:px-6"
		>
			<div className="mx-auto max-w-6xl">
				{/* Main Footer Row */}
				<div className="flex flex-col items-center justify-between gap-6 font-mono text-xs text-gray-500 sm:flex-row">
					{/* Brand: [LOGO] Rakta.js */}
					<div className="flex items-center gap-3 text-center sm:text-left">
						<photo
							path="/rakta-logo.svg"
							alt="Rakta.js Logo"
							width={28}
							height={28}
							className="h-7 w-7 flex-shrink-0 select-none"
						/>
						<div>
							<div className="flex items-center gap-2">
								<pantura
									to="hero"
									className="font-bold text-white text-sm leading-none hover:text-brand-pink transition-colors"
								>
									Rakta<span className="text-brand-pink">.js</span>
								</pantura>
								<span className="border border-surface-stroke px-1.5 py-0.5 text-[9px] uppercase text-gray-600">
									v1.2.2
								</span>
							</div>
							<span className="text-gray-400 text-[11px] mt-0.5 block">
								{currentCopy.tagline}{" "}
								<strong className="text-white">
									Muhammad Rizky Ramadhan (Rhein Sullivan / Vyagra Nexus™)
								</strong>
							</span>
							<span className="mt-0.5 block text-[10px] text-gray-600">
								{currentCopy.location} · 🇮🇩 🇵🇸
							</span>
						</div>
					</div>

					{/* Nav Links */}
					<div className="flex flex-col items-center gap-3 text-[10px] sm:items-end">
						{/* Scroll-to-section links */}
						<div className="flex items-center gap-4 uppercase">
							<pantura
								to="hero"
								className="hover:text-brand-pink transition-colors"
							>
								Top
							</pantura>
							<pantura
								to="features"
								className="hover:text-brand-pink transition-colors"
							>
								Features
							</pantura>
							<pantura
								to="donation"
								className="hover:text-brand-pink transition-colors"
							>
								Donate
							</pantura>
						</div>

						{/* External links */}
						<div className="flex items-center gap-4 uppercase">
							<span className="text-emerald-500 flex items-center gap-1">
								<FaCircleCheck className="h-2.5 w-2.5" />
								{currentCopy.status}
							</span>
							<span className="text-gray-700">|</span>
							<click
								to="https://github.com/RheinSullivan/raktajs"
								target="_blank"
								rel="noreferrer"
								className="flex items-center gap-1 transition-colors hover:text-brand-pink"
							>
								<FaGithub className="h-3 w-3" />
								{currentCopy.github}
							</click>
							<span className="text-gray-700">|</span>
							<click
								to="https://github.com/RheinSullivan/raktajs/blob/main/LICENSE"
								target="_blank"
								rel="noreferrer"
								className="flex items-center gap-1 transition-colors hover:text-brand-pink"
							>
								<FaBook className="h-2.5 w-2.5" />
								{currentCopy.license}
							</click>
						</div>
						<p className="text-gray-700 text-[9px] flex items-center gap-1">
							<FaHeart className="h-2.5 w-2.5 text-brand-pink" />
							{currentCopy.rights}
						</p>
					</div>
				</div>

				{/* Palestine Row */}
				<div className="mt-6 border-t border-surface-stroke pt-5 flex items-center justify-center gap-2 font-mono text-[9px] text-gray-700 uppercase tracking-wider">
					<span>🇵🇸</span>
					<span>Free Palestine · Technology with Conscience · Rakta.js</span>
					<span>🇮🇩</span>
				</div>
			</div>
		</footer>
	);
}
