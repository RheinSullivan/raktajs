# Auto import - TrusmiThread

## Overview

TrusmiThread is the Rakta.js auto import system. It keeps generated apps
clean by making framework primitives and starter hooks available without
manual imports when Auto Import is enabled.

The project generator asks whether Auto Import should be enabled. The
default is **enabled**.

## Generator behavior

When Auto Import is enabled, generated starter components can use Rakta
framework globals and React-compatible hooks without importing them in
every file.

When Auto Import is disabled, generated files import Rakta-named hooks
from `raktajs/hooks` instead of importing React hooks directly:

```tsx
import { raktaEffect, raktaRef, raktaState } from "raktajs/hooks";
```

This keeps the code explicit while preserving Rakta.js identity.

## Configuration

```ts
import { defineRaktaConfig } from "raktajs";

export default defineRaktaConfig({
  autoImport: {
    enabled: true,
    directories: ["app", "components", "lib", "stores", "schemas"],
    outputDirectory: ".rakta",
    dts: true,
  },
});
```

## CLI

Generate the auto import manifest manually:

```bash
bun rakta imports:generate
```

## Generated manifest

TrusmiThread also writes a generated barrel file at
`.rakta/auto-imports.ts`. This file is useful for explicit imports,
editor tooling, and future compiler/runtime integration.

```ts
// .rakta/auto-imports.ts
export { Click } from "../app/components/clickButton";
export { useCounterStore } from "../stores/counter.store";
```

## Best practices

- Keep Auto Import enabled for the simplest Rakta.js starter experience.
- Disable Auto Import only when your team wants every dependency to be
  explicit.
- Use `raktajs/hooks` when Auto Import is disabled.
- Do not edit `.rakta/auto-imports.ts` by hand.

## Related docs

- [`hooks.md`](./hooks.md)
- [`templates.md`](./templates.md)
- [`gettingStarted.md`](./gettingStarted.md)
