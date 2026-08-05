// biome-ignore-all lint: Template welcome starter Rakta.js
// Footer bilingual ID/EN dengan variabel camelCase.

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

	return (
		<footer className="border-t border-surface-stroke bg-black px-4 py-10 sm:px-6">
			<div className="mx-auto max-w-6xl">
				{/* Main Footer Row */}
				<div className="flex flex-col items-center justify-between gap-6 font-mono text-xs text-gray-500 sm:flex-row">
					{/* Brand */}
					<div className="flex items-center gap-3 text-center sm:text-left">
						<photo
							path="/rakta-logo.svg"
							alt="Rakta.js Logo"
							className="h-6 w-6 flex-shrink-0"
						/>
						<div>
							<div className="flex items-center gap-2">
								<span className="font-bold text-white text-sm">Rakta.js</span>
								<span className="border border-surface-stroke px-1.5 py-0.5 text-[9px] uppercase text-gray-600">
									v1.1.2
								</span>
							</div>
							<span className="text-gray-400 text-[11px]">
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

					{/* Links */}
					<div className="flex flex-col items-center gap-2 text-[10px] sm:items-end">
						<div className="flex items-center gap-4 uppercase">
							<span className="text-emerald-500">{currentCopy.status}</span>
							<span className="text-gray-700">|</span>
							<a
								href="https://github.com/RheinSullivan/raktajs"
								target="_blank"
								rel="noreferrer"
								className="transition-colors hover:text-brand-pink"
							>
								{currentCopy.github}
							</a>
							<span className="text-gray-700">|</span>
							<a
								href="https://github.com/RheinSullivan/raktajs/blob/main/LICENSE"
								target="_blank"
								rel="noreferrer"
								className="transition-colors hover:text-brand-pink"
							>
								{currentCopy.license}
							</a>
						</div>
						<p className="text-gray-700 text-[9px]">{currentCopy.rights}</p>
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
