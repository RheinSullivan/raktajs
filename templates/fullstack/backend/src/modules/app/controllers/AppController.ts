export class AppController {
	index(): Response {
		return Response.json({
			success: true,
			data: {
				name: "Rakta.js Backend",
				runtime: "Bun",
				framework: "Gaman.js profile",
			},
		});
	}

	health(): Response {
		return Response.json({
			success: true,
			data: {
				status: "ok",
				timestamp: new Date().toISOString(),
			},
		});
	}
}
