import React from "react";
import ShrimpRunGame from "./components/shrimpRunGame";

export default function HomePage() {
	return (
		<main className="page-shell">
			<section className="hero-card">
				<p className="eyebrow">THE RED ROUTER FRAMEWORK</p>
				<h1>Welcome to Rakta.js</h1>
				<p>Small in size. Fierce in speed. Alive in every route.</p>
			</section>

			<section className="feature-card">
				<p className="eyebrow">SHRIMPRUN</p>
				<h2>Play ShrimpRun</h2>
				<p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
					Press Space or click the game area to jump. Avoid the red obstacles!
				</p>
				<ShrimpRunGame />
			</section>
		</main>
	);
}
