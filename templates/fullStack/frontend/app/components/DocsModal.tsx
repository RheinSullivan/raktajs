// biome-ignore-all lint: Template welcome starter Rakta.js , cerminan desain resmi.
// biome-ignore-all assist: Template welcome starter Rakta.js , cerminan desain resmi.
// DocsModal - overlay System Manual dokumentasi Rakta.js.
// Menggunakan icon dari react-icons/fa6 dan react-icons/lu yang sudah di-auto-import oleh Rakta.js.

interface DocsModalProps {
	readonly isOpen: boolean;
	readonly onClose: () => void;
}

export default function DocsModal({ isOpen, onClose }: DocsModalProps) {
	const [activeArticleId, setActiveArticleId] = useState("intro");
	const [searchQuery, setSearchQuery] = useState("");
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

	const allArticles: ReadonlyArray<Article> =
		typeof ARTICLES !== "undefined" ? ARTICLES : [];

	const filteredArticles = allArticles.filter(
		(article) =>
			article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			article.content.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const activeArticle =
		allArticles.find((article) => article.id === activeArticleId) ??
		allArticles[0] ??
		null;

	return (
		<div
			ref={overlayRef}
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
			aria-modal="true"
			role="dialog"
			aria-label="Rakta.js System Manual"
			onClick={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
		>
			<div
				ref={panelRef}
				className="w-full max-w-5xl h-[82vh] bg-black border-2 border-white flex flex-col relative"
				onClick={(event) => event.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b border-surface-stroke p-5">
					<div className="flex items-center gap-3">
						<FaBook className="w-5 h-5 text-brand-pink" aria-hidden="true" />
						<h2 className="text-xl font-bold font-mono tracking-tight uppercase">
							Rakta.js <span className="text-brand-pink">System Manual</span>
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-2 border border-surface-stroke hover:bg-brand-pink hover:text-white transition-colors cursor-pointer"
						aria-label="Close System Manual"
					>
						<FaXmark className="w-5 h-5" aria-hidden="true" />
					</button>
				</div>

				{/* Search */}
				<div className="p-3 bg-zinc-950 border-b border-surface-stroke flex items-center gap-2">
					<FaMagnifyingGlass
						className="w-4 h-4 text-gray-500 ml-2 flex-shrink-0"
						aria-hidden="true"
					/>
					<input
						type="search"
						placeholder="Search system manual..."
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.target.value)}
						className="bg-transparent border-0 text-sm font-mono text-white placeholder-gray-600 focus:outline-none w-full"
						aria-label="Search documentation"
					/>
				</div>

				{/* Body */}
				<div className="flex-1 flex flex-col md:flex-row overflow-hidden">
					{/* Sidebar daftar artikel */}
					<div className="w-full md:w-64 border-r border-surface-stroke overflow-y-auto bg-[#080808] flex-shrink-0">
						<div className="p-3 font-mono text-[10px] font-bold text-gray-500 tracking-wider uppercase border-b border-surface-stroke">
							Manual Sections
						</div>
						<div className="divide-y divide-surface-stroke">
							{filteredArticles.map((article) => {
								const isSelected = article.id === activeArticleId;
								return (
									<button
										key={article.id}
										type="button"
										onClick={() => setActiveArticleId(article.id)}
										className={`w-full text-left p-4 flex items-center gap-3 transition-colors cursor-pointer ${
											isSelected
												? "bg-brand-pink text-white font-bold"
												: "text-gray-400 hover:bg-white/5 hover:text-white"
										}`}
									>
										<FaBook
											className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-white" : "text-brand-pink"}`}
											aria-hidden="true"
										/>
										<div className="flex-1 min-w-0">
											<p className="text-xs font-mono font-semibold truncate uppercase">
												{article.title}
											</p>
											<p
												className={`text-[10px] ${isSelected ? "text-white/80" : "text-gray-500"}`}
											>
												{article.category}
											</p>
										</div>
									</button>
								);
							})}
							{filteredArticles.length === 0 && (
								<div className="p-6 text-center text-xs font-mono text-gray-500">
									No articles found.
								</div>
							)}
						</div>
					</div>

					{/* Viewer artikel aktif */}
					{activeArticle && (
						<div className="flex-1 overflow-y-auto p-6 md:p-8 bg-black">
							<div className="max-w-3xl">
								<span className="text-[10px] font-bold font-mono text-brand-pink border border-brand-pink/30 px-2 py-0.5 uppercase tracking-widest">
									{activeArticle.category}
								</span>
								<h1 className="text-2xl font-extrabold text-white mt-3 mb-6 uppercase tracking-tight">
									{activeArticle.title}
								</h1>
								<div className="font-mono text-sm text-gray-300 leading-relaxed space-y-4">
									{activeArticle.content
										.split("\n\n")
										.map((paragraph, index) => {
											if (paragraph.startsWith("###")) {
												return (
													<h3
														key={index}
														className="text-base font-bold text-white pt-4 border-b border-surface-stroke pb-1 uppercase"
													>
														{paragraph.replace("###", "").trim()}
													</h3>
												);
											}
											if (paragraph.startsWith("-")) {
												return (
													<ul
														key={index}
														className="list-disc pl-5 space-y-1 text-gray-300"
													>
														{paragraph.split("\n").map((line, lineIndex) => (
															<li key={lineIndex}>
																{line.replace(/^-\s*/, "").trim()}
															</li>
														))}
													</ul>
												);
											}
											if (
												paragraph.startsWith("1.") ||
												paragraph.startsWith("2.")
											) {
												return (
													<ol
														key={index}
														className="list-decimal pl-5 space-y-1 text-gray-300"
													>
														{paragraph.split("\n").map((line, lineIndex) => (
															<li key={lineIndex}>
																{line.replace(/^\d+\.\s*/, "").trim()}
															</li>
														))}
													</ol>
												);
											}
											if (paragraph.startsWith("```")) {
												const lines = paragraph.split("\n");
												const code = lines.slice(1, -1).join("\n");
												return (
													<pre
														key={index}
														className="bg-zinc-950 border border-surface-stroke p-4 font-mono text-xs text-brand-green overflow-x-auto whitespace-pre-wrap leading-5"
													>
														<code>{code}</code>
													</pre>
												);
											}
											return <p key={index}>{paragraph}</p>;
										})}
								</div>

								{/* Navigasi ke chapter berikutnya */}
								<div className="mt-12 pt-6 border-t border-surface-stroke flex justify-end">
									<button
										type="button"
										onClick={() => {
											const currentIndex = allArticles.findIndex(
												(article) => article.id === activeArticleId,
											);
											const nextIndex = (currentIndex + 1) % allArticles.length;
											const nextArticle = allArticles[nextIndex];
											if (nextArticle !== undefined) {
												setActiveArticleId(nextArticle.id);
											}
										}}
										className="flex items-center gap-2 border border-white hover:bg-white hover:text-black transition-colors px-4 py-2 font-mono text-xs uppercase cursor-pointer"
									>
										Next Chapter{" "}
										<FaArrowRight className="w-4 h-4" aria-hidden="true" />
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
