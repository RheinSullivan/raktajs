export default function NotFound() {
	return (
		<main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-16">
			<section className="w-full rounded-3xl border border-white/10 bg-[#0e111a] p-8 shadow-2xl shadow-red-950/20">
				<p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-red-600">
					404
				</p>
				<h1 className="mb-3 text-3xl font-extrabold text-white">
					Page not found
				</h1>
				<p className="mb-6 text-sm leading-6 text-slate-400">
					The page you are looking for does not exist.
				</p>
				<click
					to="/"
					className="font-semibold text-red-500 underline-offset-4 transition hover:text-red-400 hover:underline"
				>
					Return home
				</click>
			</section>
		</main>
	);
}
