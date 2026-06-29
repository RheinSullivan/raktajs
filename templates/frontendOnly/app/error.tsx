interface ErrorPageProps {
	readonly error: Error;
	readonly reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
	return (
		<main className="page-shell">
			<section className="hero-card">
				<p className="eyebrow" style={{ color: "#dc2626" }}>
					ERROR
				</p>
				<h1>Something went wrong</h1>
				<p style={{ color: "#94a3b8" }}>{error.message}</p>
				<div className="button-row">
					<button
						type="button"
						onClick={reset}
						style={{
							background: "#dc2626",
							color: "white",
							border: "none",
							borderRadius: "8px",
							padding: "0.5rem 1.5rem",
							fontWeight: 600,
							cursor: "pointer",
						}}
					>
						Try again
					</button>
				</div>
			</section>
		</main>
	);
}
