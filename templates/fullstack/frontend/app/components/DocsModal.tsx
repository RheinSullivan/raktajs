// biome-ignore-all lint: Generated Rakta.js welcome starter mirrors the source design.
// biome-ignore-all assist: Generated Rakta.js welcome starter mirrors the source design.
// NOTE: React hooks (useState) are auto-imported by Rakta.js.

interface DocsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const ARTICLES = [
	{
		id: "intro",
		title: "1. Welcome to Rakta.js",
		category: "Getting Started",
		content: `Rakta.js is a zero-dependency, ultra-fast structural core designed for creating high-performance, single-page web experiences. 

It completely discards heavy runtime hydration models in favor of a raw, compiled server-first layout stream.

### Core Architecture
- **Instant Engine Boot**: Sub-1ms load time in cold-start server containers.
- **Pure-HTML Entry**: Eliminates runtime polyfills for maximum security.
- **Direct I/O Binding**: Port-3000 mapping enables local sandboxes to route assets with sub-millisecond local latency.

### Command Line Startup
\`\`\`bash
# Install Rakta core tooling
npm install -g @rakta/cli

# Run in development mode
rakta dev --port 3000 --latency low
\`\`\``,
	},
	{
		id: "opt",
		title: "2. High-FPS Performance Tuning",
		category: "Optimization",
		content: `To achieve 144.00 FPS physics simulations, Rakta bypasses typical React re-render triggers.

### Shrimprun Optimization Secrets
- **RequestAnimationFrame Sync**: Core physics updates are tied to hardware monitor refreshes, avoiding browser layout thrashing.
- **Zero-Allocation Physics Loop**: Obstacles and game states are managed through fixed-size structural buffers. No garbage collector runs during active play.
- **Low Latency Mode**: This switches the renderer from rich gradients and canvas shadows to direct structural SVG layout sweeps. This saves up to 40% CPU cycles on low-end devices.

### Code Sample: Zero-Garbage Loop
\`\`\`typescript
// Efficient frame ticking
function tick(timestamp: number) {
  const delta = timestamp - lastFrame;
  updatePhysics(delta); // Mutates inline ref buffer
  renderCanvas();        // Directly writes DOM coordinates
  requestAnimationFrame(tick);
}
\`\`\``,
	},
	{
		id: "styling",
		title: "3. Brutalist Aesthetic styling",
		category: "Design & Style",
		content: `The Rakta ecosystem uses a design philosophy called **Neo-Brutalism**-high-contrast, razor-sharp borders, zero rounded corners, and raw typographic hierarchies.

### Aesthetic Principles
1. **Desktop-First Integrity**: Design for precision monitor grids, then collapse cleanly into mobile stacks.
2. **True Black (#000000)**: Avoid muddy slate tones unless highlighting state grids.
3. **Primary Accent (Rose-600)**: Used strictly for actions, highlights, and critical states.
4. **JetBrains Mono**: Used for numerical readouts, state reports, and logs.

### Tailwind Recipe for Cards
\`\`\`html
<div class="border border-white hover:bg-white hover:text-black transition-colors p-8">
  <span class="font-mono text-xs text-rose-500">01</span>
  <h3 class="text-2xl font-bold uppercase">MODULE</h3>
</div>
\`\`\``,
	},
	{
		id: "cli",
		title: "4. CLI & Edge Deployments",
		category: "Deployment",
		content: `Rakta applications are built and packaged into single-module server assets. 

### Bundle & Packaging
Our build script bundles Node.js endpoints with esbuild using target \`node22\`, generating a compiled CJS file at \`dist/server.cjs\` with zero external imports.

### Deploying to Edge Nodes
Deploying pushes your compiled package to regional serverless containers, routing immediately through low-latency edge caches.

### Deploy Commands
\`\`\`bash
# Compile and build production assets
npm run build

# Start production server
npm start
\`\`\``,
	},
];

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
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 15 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 15 }}
				transition={{ duration: 0.2 }}
				className="w-full max-w-5xl h-[80vh] bg-black border-2 border-white flex flex-col relative"
			>
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
										className={`w-full text-left p-4 flex items-center gap-3 transition-colors cursor-pointer ${isSelected
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
								{activeArticle.content.split("\n\n").map((paragraph, idx) => {
									if (paragraph.startsWith("###")) {
										return (
											<h3
												key={idx}
												className="text-lg font-bold font-mono text-white pt-4 border-b border-surface-stroke pb-1 uppercase"
											>
												{paragraph.replace("###", "").trim()}
											</h3>
										);
									}
									if (paragraph.startsWith("-")) {
										return (
											<ul
												key={idx}
												className="list-disc pl-5 space-y-2 text-gray-300 font-sans my-2"
											>
												{paragraph.split("\n").map((li, liIdx) => (
													<li key={liIdx}>{li.replace("-", "").trim()}</li>
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
												key={idx}
												className="list-decimal pl-5 space-y-2 text-gray-300 font-sans my-2"
											>
												{paragraph.split("\n").map((li, liIdx) => (
													<li key={liIdx}>
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
												key={idx}
												className="bg-surface-card border border-surface-stroke p-4 font-mono text-xs text-brand-green overflow-x-auto whitespace-pre-wrap leading-5"
											>
												<code>{code}</code>
											</pre>
										);
									}
									return <p key={idx}>{paragraph}</p>;
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
			</motion.div>
		</div>
	);
}
