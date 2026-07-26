export default function Footer() {
	return (
		<footer className="border-t border-surface-stroke bg-black px-4 py-8 sm:px-6">
			<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 font-mono text-xs text-gray-500 sm:flex-row">
				<div className="text-center sm:text-left">
					<span className="font-bold uppercase text-white">RAKTA.JS</span> ,{" "}
					<span className="text-gray-400">
						Framework React fullstack karya{" "}
						<strong className="text-white">
							Muhammad Rizky Ramadhan (Rhein Sullivan / Vyagra Nexus™)
						</strong>
					</span>
					<span className="mt-1 block text-[10px] text-gray-600">
						Cirebon & Jakarta Selatan, Nusantara · Indonesia
					</span>
				</div>
				<div className="flex items-center gap-4 text-[10px] uppercase">
					<span>OPERATIONAL :: 100%</span>
					<span>•</span>
					<a
						href="https://github.com/RheinSullivan/raktajs"
						target="_blank"
						rel="noreferrer"
						className="transition-colors hover:text-brand-pink"
					>
						GitHub Repository
					</a>
				</div>
			</div>
		</footer>
	);
}
