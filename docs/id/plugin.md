# Plugin System

Rakta.js menyediakan manifest plugin stabil, registry capability, daftar
manifest adapter resmi, dan generator template komunitas melalui
`rakta/plugin`.

```ts
import {
	createOfficialPlugins,
	createPluginRegistry,
	createPluginTemplate,
} from "rakta/plugin";

const registry = createPluginRegistry(createOfficialPlugins());
const deploymentPlugins = registry.withCapability("deployment");

const template = createPluginTemplate({
	name: "@acme/rakta-plugin",
	version: "0.1.0",
	capabilities: ["build"],
});
```

Manifest resmi saat ini mencakup capability React, MDX, PWA, Vercel, Netlify,
Cloudflare, Node, Bun, dan Docker. Plugin juga bisa mengikuti lifecycle kernel
framework melalui kontrak `RaktaPlugin`.
