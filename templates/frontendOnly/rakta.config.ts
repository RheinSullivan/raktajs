import { defineRaktaConfig } from "raktajs";

export default defineRaktaConfig({
	appName: "Rakta Frontend",
	autoImport: {
		enabled: true,
		directories: ["app", "components", "lib", "stores", "schemas"],
		outputDirectory: ".rakta",
		dts: true,
	},
	seo: {
		defaultTitle: "Rakta.js - 🇵🇸 Free Palestine",
		defaultDescription:
			"Frontend-only Rakta.js app with zero-import components and ShrimpRun.",
	},
	render: {
		defaultMode: "hybrid",
		routes: {
			"/": "csr",
		},
	},
});
