# Auto Import - TrusmiThread

**TrusmiThread** is the automatic import system of Rakta.js, inspired by Vue.js and Nuxt.js. It allows you to build applications without writing repetitive `import` statements at the top of every file.

---

## How It Works

1. **Zero Explicit Imports**: Place any component inside `components/` (e.g., `components/Navbar.tsx` or `components/ui/Button.tsx`). You can immediately use `<Navbar />` or `<Button />` inside any page or layout without adding an `import` line.
2. **Global Runtime Registration**: During dev and production builds, Rakta.js mounts discovered exports to the global scope (`globalThis`), so React can find components when rendering JSX.
3. **TypeScript Autocomplete**: Rakta.js generates `.rakta/auto-imports.d.ts` with global type declarations so VS Code and other IDEs provide instant autocompletion and type checking without red squiggly lines.

---

## Code Example

Create a navigation component in `components/Navbar.tsx`:

```tsx
// components/Navbar.tsx
export default function Navbar() {
  return (
    <nav className="navbar">
      <h2>My Portfolio</h2>
      <div className="links">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/projects">Projects</a>
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

---

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

---

## Regenerating Auto Imports Manually

To manually trigger a rescan of auto-imported files, run:

```bash
bun rakta imports:generate
```

---

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

---

## Best Practices

- Keep `autoImport.enabled: true` for a fast, modern developer experience similar to Nuxt.js.
- Group reusable UI primitives in `components/` or `components/ui/`.
- Do not manually edit files inside the `.rakta/` directory.

---

## Using Auto Import as a Standalone Library

TrusmiThread's generator is **not locked inside Rakta.js**. It is a small, framework-agnostic Node.js API that any React-based project can call directly — no Rakta runtime, no `rakta.config.ts`, and no Rakta server required. The whole engine depends only on Node's `fs` and `path` modules.

### Install

```bash
bun add raktajs
# or: npm install raktajs
```

### Library API

Import from the `raktajs/autoImport` subpath:

| Export | Description |
| --- | --- |
| `generateAutoImports(options)` | Scans your configured directories and writes a typed re-export barrel (plus optional global type declarations). Returns an `AutoImportManifest`. |
| `scanForExports(options)` | Scans directories and returns raw `DiscoveredExport[]` without writing anything to disk. |
| `printAutoImportSummary(manifest)` | Prints a formatted summary of the discovered exports. |

`AutoImportGeneratorOptions`:

| Option | Type | Notes |
| --- | --- | --- |
| `frontendRoot` | `string` | Absolute path to your project root. |
| `directories` | `string[]` | Directories (relative to `frontendRoot`) to scan. |
| `outputDirectory` | `string` | Where the generated files are written (relative to `frontendRoot`). |
| `extensions` | `string[]` | Optional file extensions to scan. Defaults to `.ts`, `.tsx`, `.js`, `.jsx`. |
| `generateDts` | `boolean` | Also write `autoImports.d.ts` with `declare global` type declarations. |

### What Gets Generated

Running the generator with `frontendRoot: process.cwd()`, `directories: ["components", "lib"]`, `outputDirectory: ".autoimports"`, and `generateDts: true` produces:

- `.autoimports/autoImports.ts` — a typed barrel that re-exports every discovered module:

  ```ts
  export * from "../src/components/Navbar";
  export { default as Navbar } from "../src/components/Navbar";
  ```

- `.autoimports/autoImports.d.ts` — the same barrel plus a `declare global` block, so the discovered symbols light up in IntelliSense across your entire project, even before you write an import.

### Framework Integration Examples

The idea is the same everywhere: run generation at the start of your dev/build lifecycle, then import from the generated barrel.

#### React + Vite

`package.json`:

```json
{
  "scripts": {
    "predev": "node ./scripts/autoimport.mjs",
    "prebuild": "node ./scripts/autoimport.mjs"
  }
}
```

`scripts/autoimport.mjs`:

```js
import { generateAutoImports, printAutoImportSummary } from "raktajs/autoImport";

const manifest = generateAutoImports({
  frontendRoot: process.cwd(),
  directories: ["src/components", "src/lib", "src/stores", "src/schemas"],
  outputDirectory: ".autoimports",
  generateDts: true,
});

printAutoImportSummary(manifest);
```

Then use it in any component:

```tsx
import { Navbar, useCartStore, slugify } from "../../.autoimports/autoImports";
```

#### Next.js (App Router)

Run the same script via `predev` / `prebuild` (or `postinstall` for fresh clones), then import from the barrel in server components, client components, layouts, and route handlers:

```tsx
import { userSchema, http } from "@/components/.autoimports/autoImports";
```

Server-only utilities (e.g. database helpers) can flow through your Next.js barrel without leaking into the client bundle — apply the usual `"server-only"` convention just like any other module.

#### Remix

Wire `predev` / `prebuild` to the generator and import helpers, stores, and schemas from the barrel inside `loaders`, `actions`, and components — the exports are framework-agnostic.

#### Gatsby

Run generation during bootstrap from `gatsby-node.js` so the barrel exists before GraphQL typegen and page compilation:

```js
// gatsby-node.js
const { generateAutoImports } = require("raktajs/autoImport");

exports.onPreBootstrap = () => {
  generateAutoImports({
    frontendRoot: process.cwd(),
    directories: ["src/components", "src/lib"],
    outputDirectory: ".autoimports",
    generateDts: true,
  });
};
```

Then import from the barrel in pages and component shadowing.

#### Expo / React Native

The engine is DOM-free and Node-only, so it works fine in React Native tooling. Call it from a `prestart` / `preexport` script and use the barrel for helpers, stores, schemas, and shared data. Prefer explicit barrel imports on React Native — JSX globals are not a resolve-time feature of native bundlers the way they are on the web.

### Typed Barrel vs. True Zero-Import

Two developer-experience levels:

- **Typed barrel (universal).** Import from the generated `autoImports.ts`. This works in every React-based framework and gives full IntelliSense. All examples above use this.
- **True zero-import JSX** (`<Navbar />` with no import line). This requires a compile-time step that injects imports into every file. Rakta.js ships that transformer inside its own build and dev server. In other frameworks the same DX needs a bundler or Babel plugin that consumes `generateAutoImports` output. The generated `autoImports.d.ts` gives you global *type* declarations everywhere, but runtime resolution must be injected by your bundler.

### Notes

- Re-run generation whenever you add, rename, or delete files. Hook it into `postinstall` as well.
- Never edit the generated files — every run overwrites them.
- Keep `directories` focused on the folders you actually auto-import; a lean barrel compiles faster.

---

## Related Docs

- [`gettingStarted.md`](./gettingStarted.md) - Create your first Rakta.js app
- [`routing.md`](./routing.md) - File-based routing guide
- [`hooks.md`](./hooks.md) - Framework hooks guide
