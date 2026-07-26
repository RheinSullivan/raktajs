// biome-ignore-all lint: Template welcome starter Rakta.js , cerminan desain resmi.
// biome-ignore-all assist: Template welcome starter Rakta.js , cerminan desain resmi.
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
