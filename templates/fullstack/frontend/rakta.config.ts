import { defineRaktaConfig } from "raktajs";

export default defineRaktaConfig({
	appName: "Rakta Fullstack",
	autoImport: {
		enabled: true,
		directories: ["app", "components", "lib", "stores", "schemas"],
		outputDirectory: ".rakta",
		dts: true,
	},
	seo: {
		defaultTitle: "Rakta.js - 🇵🇸 Free Palestine",
		defaultDescription:
			"Fullstack Rakta.js app with auth, API, and deployment-ready structure.",
	},
	render: {
		defaultMode: "hybrid",
		routes: {
			"/": "csr",
		},
	},
});
