// biome-ignore-all lint: Template welcome starter Rakta.js
// HeroSection - Rakta.js: gsap, <pantura>, <reborns>, <click>, react-icons

const heroCopyData = {
	id: {
		badge: "WARISAN CIREBON & JAKARTA SELATAN • EKOSISTEM RAKTA.JS",
		headline: ["Kecil Ukuran.", "Ganas Kecepatan.", "Hidup di Setiap Route."],
		body: (
			<>
				Dirancang oleh{" "}
				<strong className="font-bold text-white">
					Muhammad Rizky Ramadhan
				</strong>{" "}
				(<strong className="text-white">Rhein Sullivan</strong> /{" "}
				<strong className="text-white">Vyagra Nexus™</strong>), pengembang
				perangkat lunak asal Cirebon & Jakarta Selatan, Rakta.js hadir sebagai
				solusi terpadu yang menyatukan{" "}
				<em className="text-brand-pink not-italic">File-based App Routing</em>,{" "}
				<em className="text-brand-pink not-italic">
					Auto Import tanpa satu pun pernyataan import
				</em>
				, <em className="text-brand-pink not-italic">Type-Safe RPC</em>,
				arsitektur monolith frontend-backend, dan autentikasi bawaan ke dalam
				satu framework ringan, cepat, dan siap produksi.
			</>
		),
		ctaDocs: "Manual Sistem",
		ctaComponents: "Pustaka Komponen",
		ctaDeploy: "Deploy Edge",
		ctaScroll: "Jelajahi Fitur ↓",
	},
	en: {
		badge: "CIREBON & SOUTH JAKARTA HERITAGE • RAKTA.JS ECOSYSTEM",
		headline: ["Small in Size.", "Fierce in Speed.", "Alive in Every Route."],
		body: (
			<>
				Crafted by{" "}
				<strong className="font-bold text-white">
					Muhammad Rizky Ramadhan
				</strong>{" "}
				(<strong className="text-white">Rhein Sullivan</strong> /{" "}
				<strong className="text-white">Vyagra Nexus™</strong>), a software
				developer from Cirebon & South Jakarta, Rakta.js is a unified solution
				bringing{" "}
				<em className="text-brand-pink not-italic">file-based App Routing</em>,{" "}
				<em className="text-brand-pink not-italic">
					Auto Import with zero import statements
				</em>
				, <em className="text-brand-pink not-italic">type-safe RPC</em>,
				integrated frontend-backend monolith architecture, and built-in
				authentication into one lightweight, fast, production-ready framework.
			</>
		),
		ctaDocs: "System Manual",
		ctaComponents: "Component Library",
		ctaDeploy: "Edge Deployment",
		ctaScroll: "Explore Features ↓",
	},
} as const;

export default function HeroSection({ lang }: { lang: "ID" | "EN" }) {
	const langKey = lang.toLowerCase() as "id" | "en";
	const currentCopy = heroCopyData[langKey];
	const heroRef = useRef<HTMLElement>(null);
	const headlineRef = useRef<HTMLHeadingElement>(null);
	const bodyRef = useRef<HTMLParagraphElement>(null);
	const ctaRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
		if (heroRef.current) {
			tl.fromTo(
				heroRef.current.querySelector(".hero-badge"),
				{ opacity: 0, y: -10 },
				{ opacity: 1, y: 0, duration: 0.4 },
			)
				.fromTo(
					headlineRef.current,
					{ opacity: 0, y: 30 },
					{ opacity: 1, y: 0, duration: 0.6 },
					"-=0.1",
				)
				.fromTo(
					bodyRef.current,
					{ opacity: 0, y: 20 },
					{ opacity: 1, y: 0, duration: 0.5 },
					"-=0.2",
				)
				.fromTo(
					ctaRef.current,
					{ opacity: 0, y: 15 },
					{ opacity: 1, y: 0, duration: 0.4 },
					"-=0.1",
				);
		}
	}, []);

	return (
		<section
			ref={heroRef}
			className="relative border-b border-surface-stroke bg-black px-4 py-16 sm:px-6 lg:py-24"
		>
			<reborns id="hero" />
			<div className="mx-auto max-w-5xl text-center">
				<div className="hero-badge mb-6 inline-flex items-center gap-2 border border-brand-pink/30 bg-rose-950/20 px-3 py-1 font-mono text-xs text-brand-pink">
					<span className="h-2 w-2 animate-ping rounded-full bg-brand-pink" />
					{currentCopy.badge}
				</div>

				<h1
					ref={headlineRef}
					className="font-mono text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-6xl"
				>
					{currentCopy.headline[0]} <br />
					<span className="text-brand-pink">{currentCopy.headline[1]}</span>{" "}
					<br />
					{currentCopy.headline[2]}
				</h1>

				<p
					ref={bodyRef}
					className="mx-auto mt-6 max-w-3xl font-mono text-sm leading-relaxed text-gray-300"
				>
					{currentCopy.body}
				</p>

				<div
					ref={ctaRef}
					className="mt-8 flex flex-wrap items-center justify-center gap-4"
				>
					<click
						to="/docs"
						className="cursor-pointer border-2 border-brand-pink bg-brand-pink px-6 py-3 font-mono text-xs font-bold uppercase text-white shadow-[4px_4px_0px_0px_rgba(244,63,94,0.4)] transition-all hover:bg-white hover:text-black flex items-center gap-2"
					>
						<FaBook className="h-3 w-3" />
						{currentCopy.ctaDocs}
					</click>

					<click
						to="/components"
						className="cursor-pointer border-2 border-white bg-black px-6 py-3 font-mono text-xs font-bold uppercase text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] transition-all hover:bg-white hover:text-black flex items-center gap-2"
					>
						<FaCode className="h-3 w-3" />
						{currentCopy.ctaComponents}
					</click>

					<click
						to="/deploy"
						className="cursor-pointer border border-emerald-500 bg-emerald-950/20 px-6 py-3 font-mono text-xs font-bold uppercase text-emerald-400 transition-all hover:bg-emerald-500 hover:text-black flex items-center gap-2"
					>
						<FaCloud className="h-3 w-3" />
						{currentCopy.ctaDeploy}
					</click>

					<pantura
						to="features"
						className="cursor-pointer border border-surface-stroke bg-black px-6 py-3 font-mono text-xs font-bold uppercase text-gray-400 transition-all hover:border-white hover:text-white flex items-center gap-2"
					>
						<FaArrowRight className="h-3 w-3" />
						{currentCopy.ctaScroll}
					</pantura>
				</div>

				{/* Quick stats row */}
				<div className="mt-10 grid grid-cols-3 gap-4 border-t border-surface-stroke pt-8">
					{[
						{
							label: "Bundle Size",
							value: "< 12KB",
							icon: <FaMicrochip className="h-4 w-4 text-brand-pink" />,
						},
						{
							label: "Core Modules",
							value: "6 Built-in",
							icon: <FaCode className="h-4 w-4 text-brand-pink" />,
						},
						{
							label: "Zero Imports",
							value: "Auto Import",
							icon: <FaCheck className="h-4 w-4 text-brand-pink" />,
						},
					].map((stat) => (
						<div key={stat.label} className="flex flex-col items-center gap-1">
							{stat.icon}
							<span className="font-mono text-sm font-bold text-white">
								{stat.value}
							</span>
							<span className="font-mono text-[10px] uppercase text-gray-500">
								{stat.label}
							</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
