import { database } from "../client";

export function seedCmsPosts(): void {
	if (database.cmsPosts.all().length > 0) {
		return;
	}

	const now = new Date().toISOString();

	database.cmsPosts.create({
		id: "post_welcome",
		title: "Selamat Datang di Rakta.js + Gaman.js",
		slug: "welcome-rakta-gaman",
		content:
			"Rakta.js memberikan kecepatan luar biasa dan arsitektur modular Gaman.js yang rapi.",
		authorId: "user_demo",
		status: "published",
		createdAt: now,
		updatedAt: now,
	});
}
