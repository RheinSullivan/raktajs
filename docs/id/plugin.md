# Plugin System

Rakta.js menyediakan manifest plugin stabil, registry capability, daftar manifest adapter resmi, dan generator template komunitas melalui `rakta/plugin`.

---

## Kode Dasar

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

## Plugin Resmi

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

## Terkait

- [`kernel.md`](./kernel.md) - lifecycle hooks dan service container
- [`deployment.md`](./deployment.md) - deployment adapter plugin
