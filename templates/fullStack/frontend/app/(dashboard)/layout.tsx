// biome-ignore-all lint: Template welcome starter Rakta.js
// Dashboard layout with sidebar - Rakta.js: gsap, <photo>, <click>, react-icons, toast
// Portfolio dashboard styled like a shadcn/Tailadmin admin panel.

const NAV_SECTIONS = [
	{
		label: "MAIN",
		links: [
			{ to: "/dashboard", label: "Overview", icon: "FaChartLine" },
			{ to: "/dashboard/1", label: "Profile", icon: "FaUserTie" },
			{ to: "/dashboard/2", label: "Projects", icon: "FaLayerGroup" },
		],
	},
	{
		label: "WORKSPACE",
		links: [
			{ to: "/login", label: "Sign In", icon: "FaLock" },
			{ to: "/", label: "Main Landing", icon: "FaArrowRight" },
		],
	},
] as const;

function NavIcon({
	name,
}: {
	name:
		| "FaChartLine"
		| "FaUserTie"
		| "FaLayerGroup"
		| "FaLock"
		| "FaArrowRight";
}) {
	const className = "h-3.5 w-3.5";
	if (name === "FaChartLine") return <FaChartLine className={className} />;
	if (name === "FaUserTie") return <FaUserTie className={className} />;
	if (name === "FaLayerGroup") return <FaLayerGroup className={className} />;
	if (name === "FaLock") return <FaLock className={className} />;
	return <FaArrowRight className={className} />;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
	const sidebarRef = useRef<HTMLElement>(null);
	const [activePath, setActivePath] = useState("/dashboard");

	useEffect(() => {
		if (!sidebarRef.current) return;
		gsap.fromTo(
			sidebarRef.current,
			{ x: -40, opacity: 0 },
			{ x: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
		);
		if (typeof window !== "undefined") {
			setActivePath(window.location.pathname);
		}
	}, []);

	return (
		<div className="min-h-screen bg-[#0a0a0b] font-sans text-zinc-200 antialiased flex flex-col md:flex-row">
			{/* Sidebar */}
			<aside
				ref={sidebarRef}
				className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800 bg-[#0d0d0f] p-5 flex flex-col justify-between flex-shrink-0 gap-6"
			>
				<div className="flex flex-col gap-6">
					{/* Brand */}
					<div className="flex items-center gap-3">
						<div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-pink to-rose-900 flex items-center justify-center">
							<photo
								path="/rakta-logo.svg"
								alt="Rakta Logo"
								className="h-5 w-5 object-contain"
							/>
						</div>
						<div className="flex flex-col">
							<span className="font-mono text-sm font-bold text-white tracking-wider">
								Rakta<span className="text-brand-pink">.js</span>
							</span>
							<span className="font-mono text-[9px] uppercase text-zinc-500">
								Portfolio Admin
							</span>
						</div>
					</div>

					{/* Nav Sections */}
					<nav className="flex flex-col gap-6">
						{NAV_SECTIONS.map((section) => (
							<div key={section.label} className="flex flex-col gap-2">
								<span className="px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
									{section.label}
								</span>
								{section.links.map((link) => {
									const isActive = activePath === link.to;
									return (
										<click
											key={link.to}
											to={link.to}
											onClick={() => setActivePath(link.to)}
											className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-mono text-xs tracking-wide transition-colors ${
												isActive
													? "bg-brand-pink/10 text-brand-pink border border-brand-pink/30 font-bold"
													: "border border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900"
											}`}
										>
											<NavIcon name={link.icon} />
											{link.label}
										</click>
									);
								})}
							</div>
						))}
					</nav>
				</div>

				{/* Profile / Status */}
				<div className="rounded-xl border border-zinc-800 bg-black p-4 flex flex-col gap-3">
					<div className="flex items-center gap-3">
						<div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-[11px] font-bold text-black">
							RS
						</div>
						<div className="flex flex-col">
							<span className="font-mono text-[11px] font-semibold text-white">
								Rhein Sullivan
							</span>
							<span className="font-mono text-[9px] text-emerald-400 flex items-center gap-1">
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
								CONNECTED · GAMAN
							</span>
						</div>
					</div>
					<p className="font-mono text-[9px] uppercase text-zinc-600">
						v1.2.6 · Cirebon &amp; Jakarta 🇮🇩
					</p>
				</div>
			</aside>

			{/* Main Dashboard Area */}
			<div className="flex-1 p-5 md:p-8 lg:p-10 overflow-y-auto bg-[#0a0a0b]">
				{children}
			</div>
		</div>
	);
}
