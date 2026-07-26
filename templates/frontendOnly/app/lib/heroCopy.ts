// Teks konten HeroSection dalam dua bahasa (ID dan EN)
// Dipisah dari komponen supaya HeroSection.tsx fokus pada render saja.
// Kalau mau ubah teks, cukup edit file ini.

import type { ReactNode } from "react";

export type Lang = "ID" | "EN";

export interface HeroCopy {
	badge: string;
	headline: readonly [string, string, string];
	body: ReactNode;
	ctaDocs: string;
	ctaComponents: string;
	ctaDeploy: string;
}

export const HERO_COPY: Record<Lang, HeroCopy> = {
	ID: {
		badge: "WARISAN CIREBON & JAKARTA SELATAN • EKOSISTEM RAKTA.JS",
		headline: ["Kecil Ukuran.", "Ganas Kecepatan.", "Hidup di Setiap Route."],
		body: null, // diisi di komponen karena butuh JSX
		ctaDocs: "Manual Sistem",
		ctaComponents: "Pustaka Komponen",
		ctaDeploy: "Deploy Edge",
	},
	EN: {
		badge: "CIREBON & SOUTH JAKARTA HERITAGE • RAKTA.JS ECOSYSTEM",
		headline: ["Small in Size.", "Fierce in Speed.", "Alive in Every Route."],
		body: null, // diisi di komponen karena butuh JSX
		ctaDocs: "System Manual",
		ctaComponents: "Component Library",
		ctaDeploy: "Edge Deployment",
	},
} as const;
