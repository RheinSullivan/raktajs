export function helloController() {
	return {
		success: true,
		message: "Hello from Rakta fullstack backend.",
		framework: "Rakta.js",
		timestamp: new Date().toISOString(),
	};
}
