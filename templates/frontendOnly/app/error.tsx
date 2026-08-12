// biome-ignore-all lint: Template welcome starter Rakta.js
// Error Boundary Page - 500 with SVG Error Illustration

interface ErrorPageProps {
	readonly error: Error;
	readonly reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
	return (
		<main className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4 font-sans text-white antialiased">
			<div className="w-full max-w-2xl border border-surface-stroke bg-[#080808] p-8 shadow-2xl shadow-rose-950/20">
				{/* SVG Error Illustration */}
				<div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-2xl border border-red-600/40 bg-red-950/30 p-4">
					<svg
						className="h-full w-full text-red-500"
						viewBox="0 0 100 100"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						{/* Shield alert outline */}
						<path
							d="M50 10 L85 25 V50 C85 70 50 90 50 90 C50 90 15 70 15 50 V25 Z"
							className="stroke-red-600"
							strokeWidth="3"
							fill="#450a0a"
							fillOpacity="0.4"
						/>
						{/* Lightning bolt hazard */}
						<path
							d="M55 25 L35 52 H50 L45 75 L65 48 H50 Z"
							fill="#ef4444"
							stroke="#f8fafc"
							strokeWidth="1.5"
						/>
						{/* Warning pulse dots */}
						<circle
							cx="20"
							cy="20"
							r="3"
							fill="#ef4444"
							className="animate-ping"
						/>
						<circle
							cx="80"
							cy="20"
							r="3"
							fill="#ef4444"
							className="animate-ping"
						/>
					</svg>
				</div>

				<div className="mb-3 text-center">
					<div className="inline-flex items-center gap-2 border border-red-500/40 bg-red-950/30 px-3 py-1 font-mono text-xs uppercase tracking-widest text-red-500">
						<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
						500 · APPLICATION RUNTIME EXCEPTION
					</div>
					<h1 className="mt-2 font-mono text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
						Something Went Wrong
					</h1>
					<p className="font-mono text-xs text-gray-400 mt-1">
						Rakta.js caught an unhandled runtime error during component render
						or route execution.
					</p>
				</div>

				{/* Error message box */}
				<div className="my-6 border border-surface-stroke bg-black p-4 font-mono text-xs text-left">
					<span className="text-red-500 font-bold uppercase block mb-1">
						ERROR MESSAGE:
					</span>
					<p className="text-gray-200 break-words mb-3 font-semibold">
						{error?.message ||
							"An unexpected application exception was thrown."}
					</p>

					{error?.stack && (
						<div>
							<span className="text-gray-500 uppercase block mb-1 text-[10px]">
								STACK TRACE SUMMARY:
							</span>
							<pre className="bg-[#050505] border border-surface-stroke p-3 font-mono text-[10px] text-gray-400 overflow-x-auto max-h-40 rounded">
								{error.stack}
							</pre>
						</div>
					)}
				</div>

				<div className="flex flex-wrap items-center justify-center gap-4">
					<button
						type="button"
						onClick={reset}
						className="border-2 border-red-600 bg-red-600 px-6 py-3 font-mono text-xs font-bold uppercase text-white shadow-[4px_4px_0px_0px_rgba(220,38,38,0.4)] transition-all hover:bg-white hover:text-black cursor-pointer"
					>
						Try Again
					</button>
					<click
						to="/"
						className="border border-surface-stroke bg-black px-6 py-3 font-mono text-xs font-bold uppercase text-gray-300 transition-all hover:border-white hover:text-white"
					>
						Return Home
					</click>
				</div>
			</div>
		</main>
	);
}
