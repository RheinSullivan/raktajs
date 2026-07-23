# Rakta.js

Rakta.js is a lightweight React framework for Bun and TypeScript.

**Small in size. Fierce in speed. Alive in every route.**

## Features

- File-based routing from the `app/` directory
- Bun-powered dev server, production build, and start command
- React 19 client rendering with generated client entrypoints
- Route manifest generation and route inspection
- Rendering mode configuration: `csr`, `spa`, `ssr`, `ssg`, `csg`, and `hybrid`
- SEO config for default title and description
- Public `favicon.ico` support through `public/favicon.ico`
- Rakta navigation with `<click to="/path">`
- Schema validation utilities
- Type-safe RPC primitives
- Lightweight store utilities
- Typed HTTP client helpers
- PWA helpers for manifest, cache, and service worker building blocks
- Auto-import scanner and generator

## Create A Project

```bash
bun create rakta-app@latest my-app
cd my-app
bun install
bun run dev
```

The default starter includes a Rakta welcome screen and ShrimpRun, an offline-browser-game-style starter built with React state and SVG animation.

## CLI

```bash
rakta dev
rakta build
rakta start
rakta routes
rakta make page about
rakta make layout dashboard
rakta make api users
rakta imports:generate
rakta rpc:types
rakta seo:generate
rakta doctor
```

## Config

```ts
import { defineRaktaConfig } from "raktajs";

export default defineRaktaConfig({
  appName: "My Rakta App",
  seo: {
    defaultTitle:
      "Rakta.js | Small in size. Fierce in speed. Alive in every route",
    defaultDescription:
      "Built with Rakta.js - Small in size. Fierce in speed. Alive in every route.",
  },
  render: {
    defaultMode: "csr",
    routes: {
      "/": "csr",
      "/docs": "ssg",
      "/dashboard": "csr",
    },
  },
});
```

## App Routes

```txt
app/
  layout.tsx
  page.tsx
  about/
    page.tsx
  api/
    hello/
      route.ts
```

## Public Assets

Put static files in `public/`.

```txt
public/
  favicon.ico
```

Rakta.js automatically emits:

```html
<link rel="icon" href="/favicon.ico" sizes="any" />
```

## Package Exports

```txt
raktajs
raktajs/components
raktajs/router
raktajs/render
raktajs/config
raktajs/seo
raktajs/pwa
raktajs/rpc
raktajs/schema
raktajs/http
raktajs/store
raktajs/auto-import
raktajs/forge
raktajs/tide
```

## Support & Donasi Kemanusiaan 🇵🇸

Dukungan Anda membantu pemeliharaan server, domain, infrastruktur, serta disalurkan untuk **kaum dhuafa, anak yatim/piatu, panti asuhan, panti jompo, dan bantuan kemanusiaan 🇵🇸 Free Palestine**.

- **Donasi Resmi:** [buymeacoffee.com/rheinsullivan](https://buymeacoffee.com/rheinsullivan)
- **Panduan Kemitraan Lembaga Penyalur:** Terbuka bagi yayasan/panti asuhan resmi untuk bermitra sebagai penyalur.

## License

MIT - Rhein Sullivan | Vyagra Nexus