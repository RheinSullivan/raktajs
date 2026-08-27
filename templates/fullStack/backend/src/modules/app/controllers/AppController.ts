import { ok } from "../../../http/response";

export class AppController {
	index(): Response {
		return ok({
			name: "Rakta.js Backend (Gaman.js Profile)",
			version: "0.1.3",
			status: "online",
		});
	}

	health(): Response {
		return ok({
			status: "ok",
			uptime: process.uptime(),
			timestamp: new Date().toISOString(),
		});
	}
}
