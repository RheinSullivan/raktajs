export default function HomePage() {
	return (
		<main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
			<section className="rounded-3xl border border-white/10 bg-[#0e111a] p-8 shadow-2xl shadow-red-950/20">
				<p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-red-600">
					THE RED ROUTER FRAMEWORK
				</p>
				<h1 className="mb-3 text-4xl font-extrabold leading-tight text-white md:text-6xl">
					Welcome to Rakta.js
				</h1>
				<p className="max-w-2xl text-base leading-7 text-slate-400">
					Small in size. Fierce in speed. Alive in every route.
				</p>

				<div className="mt-6 flex flex-wrap gap-3">
					<click
						to="/offline"
						className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 transition hover:border-red-400 hover:text-red-300"
					>
						Open offline page
					</click>
					<click
						to="/dashboard"
						className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
					>
						View dashboard
					</click>
				</div>
			</section>

			<section className="rounded-3xl border border-white/10 bg-[#0e111a] p-8 shadow-2xl shadow-red-950/20">
				<p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-red-600">
					SHRIMPRUN
				</p>
				<h2 className="mb-1 text-2xl font-bold text-white">Play ShrimpRun</h2>
				<p className="mb-6 text-sm leading-6 text-slate-400">
					Press Space or click the game area to jump. Avoid the red obstacles!
				</p>

				<ShrimpRunGame />
			</section>
		</main>
	);
}
