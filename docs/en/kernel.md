# Kernel and plugin system

## Overview

The Rakta kernel is the production foundation for framework services,
environment access, feature registration, and plugin lifecycle hooks. It
is available from `rakta/kernel` and is also exported from `rakta`.

Use it when a project or integration needs shared services, typed
configuration, startup work, teardown work, or a clean place to register
framework capabilities.

## Installation

The kernel ships with the core package:

```bash
bun add raktajs
```

## Quick start

```ts
import { createRaktaKernel } from "rakta/kernel";

const kernel = createRaktaKernel({
  environmentName: "production",
  env: {
    API_URL: "https://api.example.com",
  },
});

kernel.services.singleton("apiUrl", () =>
  kernel.environment.require("API_URL")
);

await kernel.start();

const apiUrl = await kernel.services.resolve<string>("apiUrl");
```

## Project architecture

The kernel is intentionally small:

| Layer | Responsibility |
| --- | --- |
| Service container | Registers values and factories with singleton or transient lifetime |
| Environment | Reads `RAKTA_ENV`, `NODE_ENV`, and explicit environment records |
| Feature registry | Lets plugins announce framework capabilities |
| Plugin lifecycle | Runs `configure`, `start`, `ready`, and `shutdown` hooks |

## Plugin system

Plugins are plain TypeScript objects. They can register services, expose
features, and perform startup or shutdown work.

```ts
import type { RaktaPlugin } from "rakta/kernel";

export const authPlugin: RaktaPlugin = {
  name: "auth",
  configure(context) {
    context.registerFeature({
      name: "auth",
      options: {
        strategy: "session",
      },
    });
  },
  start(context) {
    context.services.value("auth.ready", true);
  },
};
```

Register plugins before the kernel starts:

```ts
const kernel = createRaktaKernel({
  plugins: [authPlugin],
});

await kernel.start();
```

## Environment variables

Use the environment helper instead of reading runtime globals directly.
This keeps tests, Bun, Node-compatible tooling, and edge-like runtimes
predictable.

```ts
const environment = kernel.environment;

const port = environment.number("PORT", 3000);
const debug = environment.boolean("DEBUG", false);
const databaseUrl = environment.require("DATABASE_URL");
```

## API reference

| API | Description |
| --- | --- |
| `createRaktaKernel(options)` | Creates a kernel with services, environment, plugins, and features |
| `createServiceContainer()` | Creates a standalone typed service container |
| `createRaktaEnvironment(name, env)` | Creates a standalone environment reader |
| `kernel.use(plugin)` | Registers a plugin before startup |
| `kernel.start()` | Runs `configure`, `start`, then `ready` hooks |
| `kernel.shutdown()` | Runs shutdown hooks in reverse plugin order |
| `kernel.snapshot()` | Returns read-only runtime diagnostics |
| `services.singleton(key, factory)` | Registers a cached service factory |
| `services.value(key, value)` | Registers a constant service |
| `services.resolve(key)` | Resolves a service or throws a clear error |
| `services.tryResolve(key)` | Resolves a service or returns `undefined` |

## Testing

Pass an explicit `env` object in tests so your test suite does not depend
on the host machine.

```ts
const kernel = createRaktaKernel({
  environmentName: "test",
  env: {
    FEATURE_ON: "true",
  },
});
```

## Best practices

- Register plugins before `kernel.start()`.
- Keep service keys stable strings or exported symbols.
- Store secrets in the environment layer, not in plugin source code.
- Use `shutdown()` for open connections, timers, and subscriptions.
- Prefer small plugins that own one capability.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Service is not registered | Register it before resolving or use `tryResolve()` |
| Duplicate plugin error | Make plugin names unique |
| Circular dependency error | Split one service into a factory or pass a value explicitly |
| Missing environment variable | Use `environment.get()` for optional values or define the variable |

## Related docs

- [`gettingStarted.md`](./gettingStarted.md)
- [`templates.md`](./templates.md)
- [`autoImport.md`](./autoImport.md)
- [`routing.md`](./routing.md)
