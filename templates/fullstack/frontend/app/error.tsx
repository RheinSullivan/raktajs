interface ErrorPageProps {
	readonly error: Error;
	readonly reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
	return (
		<main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-16">
			<section className="w-full rounded-3xl border border-white/10 bg-[#0e111a] p-8 shadow-2xl shadow-red-950/20">
				<p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-red-600">
					ERROR
				</p>
				<h1 className="mb-3 text-3xl font-extrabold text-white">
					Something went wrong
				</h1>
				<p className="mb-6 wrap-break-word text-sm leading-6 text-slate-400">
					{error.message}
				</p>
				<button
					type="button"
					onClick={reset}
					className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-700 active:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
				>
					Try again
				</button>
			</section>
		</main>
	);
}
