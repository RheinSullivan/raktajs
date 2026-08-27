import { database } from "../client";

export function seedCmsPosts(): void {
	if (database.cmsPosts.all().length > 0) {
		return;
	}

	const now = new Date().toISOString();

	const posts = [
		{
			id: "post_welcome",
			title: "Selamat Datang di Rakta.js + Gaman.js",
			slug: "welcome-rakta-gaman",
			content:
				"Rakta.js memberikan kecepatan luar biasa dan arsitektur modular Gaman.js yang rapi.",
			authorId: "user_super_admin",
			status: "published" as const,
			createdAt: now,
			updatedAt: now,
		},
		{
			id: "post_architecture",
			title: "Panduan Arsitektur Monolith Gaman.js",
			slug: "gaman-monolith-architecture",
			content:
				"Struktur modular Gaman.js memisahkan controller, service, model, router per modul domain.",
			authorId: "user_organization",
			status: "published" as const,
			createdAt: now,
			updatedAt: now,
		},
		{
			id: "post_testing",
			title: "Pengujian Data Seeder Rakta.js",
			slug: "testing-data-seeder",
			content:
				"Data seeder otomatis mempopulasi database lokal saat pengujian dan pengambangan.",
			authorId: "user_admin",
			status: "published" as const,
			createdAt: now,
			updatedAt: now,
		},
	];

	for (const post of posts) {
		database.cmsPosts.create(post);
	}
}
