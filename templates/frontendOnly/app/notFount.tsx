export default function NotFound() {
	return (
		<main className="page-shell">
			<section className="hero-card">
				<p className="eyebrow">404</p>
				<h1>Page not found</h1>
				<p style={{ color: "#94a3b8" }}>
					The page you are looking for does not exist.
				</p>
				<div className="button-row">
					<a href="/">Return home</a>
				</div>
			</section>
		</main>
	);
}
