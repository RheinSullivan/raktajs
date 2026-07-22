# Plugin System

Rakta.js exposes a stable plugin manifest, capability registry, official
adapter manifest list, and community template generator through `rakta/plugin`.

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

Official manifests currently cover React, MDX, PWA, Vercel, Netlify,
Cloudflare, Node, Bun, and Docker capabilities. Plugins can also participate in
the framework kernel lifecycle through the `RaktaPlugin` contract.
