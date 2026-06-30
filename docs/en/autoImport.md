# Auto import — TrusmiThread

## Overview

**TrusmiThread** scans your project's `app/`, `components/`, and `lib/`
directories and writes a single generated barrel file,
`.rakta/auto-imports.ts`, re-exporting everything it finds.

## When to use this

Run it whenever you add, rename, or remove a component or utility and
want a single import surface to re-export from, instead of writing
relative import paths everywhere by hand.

## Current behavior (please read before relying on this)

TrusmiThread today is a **generated barrel file**, not a compiler-level
transform. It writes real `export` statements into
`.rakta/auto-imports.ts` — you still need to `import` from that generated
file (or from the original module) in the files that use the symbol.
There is currently no build step that detects `<ShrimpRunGame />` in JSX
and injects the import automatically without any `import` statement
anywhere in your source.

If your starter template appears to use a component with no visible
`import`, check whether that file already has the import and it was just
collapsed visually, or whether it is importing from
`.rakta/auto-imports.ts`. We are deliberately not documenting a fully
implicit, zero-import experience until that compiler transform actually
exists — this page will be updated the moment it does.

## Architecture

The scanner walks the configured directories, skipping `node_modules`,
`.git`, `dist`, `.next`, `coverage`, and `.rakta` itself, collects every
named and default export, and writes them into the generated file with
duplicate-safe aliasing. Running it is idempotent — running it twice in a
row produces the same output.

## Code example

```bash
bun rakta imports:generate
```

```ts
// .rakta/auto-imports.ts (generated — do not edit by hand)
export { Click } from "../app/components/clickButton";
export { useCounterStore } from "../lib/stores/counterStore";
```

```ts
// anywhere in your app
import { useCounterStore } from "../../.rakta/auto-imports";
```

## Common mistakes

- Editing `.rakta/auto-imports.ts` by hand — it is regenerated and your
  changes will be lost.
- Forgetting to re-run `bun rakta imports:generate` after adding a new
  exported symbol, then wondering why it's "missing" from the generated
  file.
- Assuming JSX usage alone triggers an import — see "Current behavior"
  above.

## Related docs

- [`templates.md`](./templates.md) — how generated apps wire up `.rakta/`