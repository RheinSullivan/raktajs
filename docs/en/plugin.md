# Plugin System

Rakta.js exposes a stable plugin manifest, capability registry, official adapter manifest list, and community template generator through `rakta/plugin`.

---

## Usage

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

---

## Official Plugins

| Plugin | Capability |
|---|---|
| `@rakta/react` | renderer |
| `@rakta/mdx` | build, renderer |
| `@rakta/pwa` | build, runtime |
| `@rakta/vercel` | deployment |
| `@rakta/netlify` | deployment |
| `@rakta/cloudflare` | deployment |
| `@rakta/node` | runtime |
| `@rakta/bun` | runtime |
| `@rakta/docker` | deployment |

---

## Related

- [`kernel.md`](./kernel.md) - lifecycle hooks and service container
- [`deployment.md`](./deployment.md) - deployment adapter plugins
