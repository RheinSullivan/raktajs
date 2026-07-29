// biome-ignore-all lint: Template welcome starter Rakta.js , cerminan desain resmi.
// biome-ignore-all assist: Template welcome starter Rakta.js , cerminan desain resmi.
// NOTE: Rakta.js Auto Import mengimpor useState, ARTICLES, dan ikon secara otomatis.

interface DocsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function DocsModal({ isOpen, onClose }: DocsModalProps) {
	const [activeArticleId, setActiveArticleId] = useState("intro");
	const [searchQuery, setSearchQuery] = useState("");

	if (!isOpen) return null;

	const filteredArticles = ARTICLES.filter(
		(article) =>
			article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			article.content.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const activeArticle = (ARTICLES.find((a) => a.id === activeArticleId) ??
		ARTICLES[0])!;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
			id="docs-modal-container"
		>
			<div className="w-full max-w-5xl h-[80vh] bg-black border-2 border-white flex flex-col relative transition-all duration-200 animate-in fade-in zoom-in-95">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-surface-stroke p-5">
					<div className="flex items-center gap-3">
						<Book className="w-5 h-5 text-brand-pink" />
						<h2 className="text-xl font-bold font-mono tracking-tight uppercase">
							Rakta.js <span className="text-brand-pink">System Manual</span>
						</h2>
					</div>
					<button
						onClick={onClose}
						className="p-2 border border-surface-stroke hover:bg-brand-pink hover:text-white transition-colors cursor-pointer"
						id="close-docs-btn"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Search */}
				<div className="p-3 bg-surface-card border-b border-surface-stroke flex items-center gap-2">
					<Search className="w-4 h-4 text-gray-500 ml-2" />
					<input
						type="text"
						placeholder="Search system manual..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="bg-transparent border-0 text-sm font-mono text-white placeholder-gray-600 focus:outline-none w-full focus:ring-0"
					/>
				</div>

				{/* Content Body */}
				<div className="flex-1 flex flex-col md:flex-row overflow-hidden">
					{/* Sidebar */}
					<div className="w-full md:w-64 border-r border-surface-stroke overflow-y-auto bg-[#080808]">
						<div className="p-3 text-[10px] font-bold font-mono text-gray-500 tracking-wider uppercase border-b border-surface-stroke">
							Manual Sections
						</div>
						<div className="divide-y divide-surface-stroke">
							{filteredArticles.map((article) => {
								const isSelected = article.id === activeArticleId;
								return (
									<button
										key={article.id}
										onClick={() => setActiveArticleId(article.id)}
										className={`w-full text-left p-4 flex items-center gap-3 transition-colors cursor-pointer ${
											isSelected
												? "bg-brand-pink text-white font-bold"
												: "text-gray-400 hover:bg-white/5 hover:text-white"
										}`}
									>
										<Book
											className={`w-4 h-4 ${isSelected ? "text-white" : "text-brand-pink"}`}
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
									No articles found matching search query.
								</div>
							)}
						</div>
					</div>

					{/* Article Viewer */}
					<div className="flex-1 overflow-y-auto p-6 md:p-8 bg-black">
						<div className="max-w-3xl">
							<span className="text-[10px] font-bold font-mono text-brand-pink border border-brand-pink/30 px-2 py-0.5 uppercase tracking-widest">
								{activeArticle.category}
							</span>
							<h1 className="text-3xl font-extrabold text-white mt-3 mb-6 uppercase tracking-tight">
								{activeArticle.title}
							</h1>

							<div className="prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed font-sans space-y-4">
								{activeArticle.content
									.split("\n\n")
									.map((paragraph, paragraphIndex) => {
										if (paragraph.startsWith("###")) {
											return (
												<h3
													key={paragraphIndex}
													className="text-lg font-bold font-mono text-white pt-4 border-b border-surface-stroke pb-1 uppercase"
												>
													{paragraph.replace("###", "").trim()}
												</h3>
											);
										}
										if (paragraph.startsWith("-")) {
											return (
												<ul
													key={paragraphIndex}
													className="list-disc pl-5 space-y-2 text-gray-300 font-sans my-2"
												>
													{paragraph.split("\n").map((li, listItemIndex) => (
														<li key={listItemIndex}>
															{li.replace("-", "").trim()}
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
													key={paragraphIndex}
													className="list-decimal pl-5 space-y-2 text-gray-300 font-sans my-2"
												>
													{paragraph.split("\n").map((li, listItemIndex) => (
														<li key={listItemIndex}>
															{li.replace(/^\d+\.\s*/, "").trim()}
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
													key={paragraphIndex}
													className="bg-surface-card border border-surface-stroke p-4 font-mono text-xs text-brand-green overflow-x-auto whitespace-pre-wrap leading-5"
												>
													<code>{code}</code>
												</pre>
											);
										}
										return <p key={paragraphIndex}>{paragraph}</p>;
									})}
							</div>

							{/* Bottom manual navigation */}
							<div className="mt-12 pt-6 border-t border-surface-stroke flex justify-end">
								<button
									onClick={() => {
										const currentIndex = ARTICLES.findIndex(
											(a) => a.id === activeArticleId,
										);
										const nextIndex = (currentIndex + 1) % ARTICLES.length;
										setActiveArticleId(ARTICLES[nextIndex]!.id);
									}}
									className="flex items-center gap-2 border border-white hover:bg-white hover:text-black transition-colors px-4 py-2 font-mono text-xs uppercase cursor-pointer"
								>
									Next Chapter <ArrowRight className="w-4 h-4" />
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
