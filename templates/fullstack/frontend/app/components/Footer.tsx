

export default function Footer() {
	return (
		<footer className="border-t border-surface-stroke bg-black py-8 px-4 sm:px-6">
			<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row font-mono text-xs text-gray-500">
				<div>
					<span className="font-bold text-white uppercase">RAKTA.JS</span> — Created by{" "}
					<strong className="text-white">Muhammad Rizky Ramadhan (Rhein Sullivan / Vyagra Nexus)</strong>
					<span className="block sm:inline text-[10px] text-gray-600 sm:ml-2">
						(Cirebon &amp; Jakarta Selatan, Indonesia)
					</span>
				</div>
				<div className="flex items-center gap-4 text-[10px] uppercase">
					<span>OPERATIONAL :: 100%</span>
					<span>•</span>
					<a
						href="https://github.com/RheinSullivan/raktajs"
						target="_blank"
						rel="noreferrer"
						className="hover:text-brand-pink transition-colors"
					>
						GitHub Repository
					</a>
				</div>
			</div>
		</footer>
	);
}
