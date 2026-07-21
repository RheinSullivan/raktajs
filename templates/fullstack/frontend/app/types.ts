// biome-ignore-all lint: Generated Rakta.js welcome starter mirrors the source design.
// biome-ignore-all assist: Generated Rakta.js welcome starter mirrors the source design.
export interface SystemMetric {
	name: string;
	value: string | number;
	status: "nominal" | "warning" | "critical";
}

export interface GameHighScore {
	name: string;
	score: number;
	date: string;
}

export type AestheticUnit = "LENIS-MODERN" | "RETRO-CYBER" | "NEO-BRUTALIST";

export interface DocArticle {
	id: string;
	title: string;
	category: string;
	content: string;
}
