# rakta

The core framework package of **Rakta.js** — a lightweight, composable
frontend framework on Bun, React, and TypeScript.

> Small in size. Fierce in speed. Alive in every route.
> Bun in the engine. React at the core. Cirebon in the soul. Garuda in the heart.

This package is rarely installed directly — most people get it through
[`create-rakta-app`](https://www.npmjs.com/package/create-rakta-app). It is
documented here for contributors and for people building custom tooling on
top of Rakta.js.

## What's inside

| Module | Import | Feature name | Purpose |
| --- | --- | --- | --- |
| Router | `rakta/router` | MendungWeave | File-based route scanning, matching, and manifest generation |
| Components | `rakta/components` | ShrimpStep / TrusmiFrame | `<click to="">` navigation and `<picture path="">` images |
| RPC | `rakta/rpc` | CarubanWire | Type-safe procedure router and client, inspired by tRPC |
| Store | `rakta/store` | — | Lightweight, Zustand-inspired state store using `useSyncExternalStore` |
| Schema | `rakta/schema` | — | Runtime validation with static type inference |
| HTTP | `rakta/http` | PanturaFetch | A small, typed `fetch`-based HTTP client with interceptors |
| SEO | `rakta/seo` | WaliSignal / SunyaragiCrown | Metadata, `<head>` rendering, sitemap, and robots.txt helpers |
| Auto import | `rakta/auto-import` | TrusmiThread | Scans `app/`, `components/`, `lib/` and writes `.rakta/auto-imports.ts` |
| Render | `rakta/render` | NorthCoastFlow | Render mode resolution (CSR / SSR / SSG / CSG / SPA / Hybrid) |
| Forge | `rakta/forge` | CherbonsEngine | Dev server, build, and project inspection |
| Tide | `rakta/tide` | — | Request/response runtime context helpers |
| Config | `rakta/config` | — | `defineConfig` / `loadConfig` for `rakta.config.ts` |

## Installation

```bash
bun add rakta
```

`rakta` declares `react` and `react-dom` (`>=19.0.0`) as peer dependencies.

## Quick example

```ts
import { defineConfig } from "rakta/config";

export default defineConfig({
  appName: "My App",
  render: { defaultMode: "csr" },
});
```

```tsx
// app/page.tsx
import { Click } from "rakta/components";

export default function HomePage() {
  return (
    <main>
      <h1>Welcome</h1>
      <click to="/about">About</click>
    </main>
  );
}
```

## CLI

The `rakta` package also exposes a CLI binary:

```bash
bun rakta dev
bun rakta build
bun rakta start
bun rakta routes
bun rakta make page about
bun rakta make layout dashboard
bun rakta make api users
bun rakta seo:generate
bun rakta imports:generate
bun rakta rpc:types
bun rakta doctor
```

## Documentation

Full documentation lives in the repository root under
[`docs/en`](../../docs/en) (English) and [`docs/id`](../../docs/id)
(Bahasa Indonesia).

## License

MIT — Rhein Sullivan | Vyagra Nexus™