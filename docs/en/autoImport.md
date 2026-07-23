# Auto Import - TrusmiThread

## Overview

**TrusmiThread** is the automatic import system of Rakta.js, inspired by Vue.js and Nuxt.js. It allows you to build applications without writing repetitive `import` statements at the top of every file.

When you create UI components (like `<Navbar />`, `<Footer />`, `<Button />`), helper functions, state stores, or validation schemas in your project, Rakta.js automatically detects and registers them in both the global TypeScript scope and the browser runtime.

## How It Works

1. **Zero Explicit Imports**: Place any component inside `components/` (e.g., `components/Navbar.tsx` or `components/ui/Button.tsx`). You can immediately use `<Navbar />` or `<Button />` inside any page or layout without adding an `import` line.
2. **Global Runtime Registration**: During development and production builds, Rakta.js mounts discovered exports to the global execution scope (`globalThis`), so React resolves components seamlessly when rendering JSX.
3. **TypeScript Autocomplete**: Rakta.js generates `.rakta/auto-imports.d.ts` with global type declarations so VS Code and other IDEs provide instant autocompletion and type checking without red squiggly lines.

## Code Example

Create a navigation component in `components/Navbar.tsx`:

```tsx
// components/Navbar.tsx
export default function Navbar() {
  return (
    <nav className="navbar">
      <h2>My Portfolio</h2>
      <div className="links">
        <click to="/">Home</click>
        <click to="/about">About</click>
        <click to="/projects">Projects</click>
      </div>
    </nav>
  );
}
```

Use it inside `app/page.tsx` directly - **no import required**:

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <main>
      <Navbar />
      <section className="hero">
        <h1>Welcome to My Portfolio</h1>
        <p>Built with Rakta.js - no manual component imports required!</p>
      </section>
    </main>
  );
}
```

## Configured Directories

By default, Rakta.js scans the following directories for auto-imports:

```ts
// rakta.config.ts
import { defineRaktaConfig } from "raktajs";

export default defineRaktaConfig({
  autoImport: {
    enabled: true,
    directories: ["app", "components", "lib", "stores", "schemas", "utils"],
    outputDirectory: ".rakta",
    dts: true,
  },
});
```

| Folder | What Gets Auto-Imported | Global Identifier Example |
| --- | --- | --- |
| `components/` | React components (`.tsx`, `.jsx`) | `<Navbar />`, `<Button />` |
| `lib/` / `utils/` | Utility functions & helpers | `slugify()`, `cn()` |
| `stores/` | State management stores | `useCounterStore()` |
| `schemas/` | Validation schemas | `userSchema` |

## Regenerating Auto Imports Manually

To manually trigger a rescan of auto-imported files, run:

```bash
bun rakta imports:generate
```

## Disabling Auto Import

If your team prefers explicit dependencies in every file, disable auto-import in `rakta.config.ts`:

```ts
export default defineRaktaConfig({
  autoImport: {
    enabled: false,
  },
});
```

When disabled, import hooks from `raktajs/hooks` explicitly:

```tsx
import { lengkoState, empalEffect } from "raktajs/hooks";
```

## Best Practices

- Keep `autoImport.enabled: true` for a fast, modern developer experience similar to Nuxt.js.
- Group reusable UI primitives in `components/` or `components/ui/`.
- Do not manually edit files inside the `.rakta/` directory.

## Related Docs

- [`gettingStarted.md`](./gettingStarted.md) - Create your first Rakta.js app
- [`routing.md`](./routing.md) - File-based routing guide
- [`hooks.md`](./hooks.md) - Framework hooks guide
