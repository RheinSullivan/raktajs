<p align="center">
  <img src="docs/assets/raktajs_benner.png" alt="Rakta.js banner" width="100%" />
</p>

<h1 align="center">Rakta.js</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/raktajs"><img src="https://img.shields.io/npm/v/raktajs?style=flat&label=raktajs&color=C60005" alt="raktajs npm version" /></a>
  <a href="https://www.npmjs.com/package/create-rakta-app"><img src="https://img.shields.io/npm/v/create-rakta-app?style=flat&label=create-rakta-app&color=C60005" alt="create-rakta-app npm version" /></a>
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/Bun-1.3.11-black?style=flat&logo=bun" alt="Bun" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=111" alt="React" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=flat&logo=typescript&logoColor=fff" alt="TypeScript" /></a>
  <a href="./LICENCE"><img src="https://img.shields.io/badge/license-MIT-16a34a?style=flat" alt="MIT License" /></a>
</p>

<p align="center">
  <strong>Small in size. Fierce in speed. Alive in every route.</strong><br />
  <strong>Kecil ukuran. Ganas kecepatan. Hidup di setiap route.</strong>
</p>

## Quick Links

| English | Bahasa Indonesia |
| --- | --- |
| [Getting Started](docs/en/gettingStarted.md) | [Mulai](docs/id/mulai.md) |
| [Routing](docs/en/routing.md) | [Routing](docs/id/routing.md) |
| [Auto Import](docs/en/autoImport.md) | [Auto Import](docs/id/autoImport.md) |
| [API Reference](docs/en/apiReference.md) | [Referensi API](docs/id/apiReference.md) |
| [Roadmap](docs/en/roadmap.md) | [Roadmap](docs/id/roadmap.md) |

## Introduction

**EN:** Rakta.js is a Bun-first React framework focused on fast scaffolding, file-based routing, zero-import application templates, typed data utilities, and fullstack project generation.

**ID:** Rakta.js adalah framework React berbasis Bun yang fokus pada scaffolding cepat, routing berbasis file, template aplikasi tanpa import manual, utilitas data bertipe, dan generator project fullstack.

## Features

| Feature | EN | ID |
| --- | --- | --- |
| Router | File-based app routing from `app/` | Routing otomatis dari folder `app/` |
| Rendering | CSR, SSR, SSG, hybrid, and edge-ready flow | CSR, SSR, SSG, hybrid, dan alur edge-ready |
| Auto Import | Components, hooks, utilities, and data become available globally | Komponen, hook, utilitas, dan data tersedia global |
| Fullstack | Frontend + Gaman.js backend + database template | Frontend + backend Gaman.js + template database |
| DX | Dev terminal, route manifest, analyzer, CLI helpers | Terminal dev, manifest route, analyzer, helper CLI |
| Core | Kernel, middleware, plugin, schema, store, RPC, SEO, PWA | Kernel, middleware, plugin, schema, store, RPC, SEO, PWA |

## Quick Start

```bash
bun create rakta-app@latest my-app
cd my-app
bun install
bun run dev
```

Fullstack projects:

```bash
cd my-app
bun install
bun run dev
```

Run separately:

```bash
cd my-app/frontend
bun run dev

cd ../backend
bun run dev
```

## Example

```tsx
export default function HomePage() {
	const [count, setCount] = useState(0);

	return (
		<main>
			<RaktaHead metadata={{ title: "Hello Rakta.js" }} />
			<h1>Rakta.js</h1>
			<button type="button" onClick={() => setCount(count + 1)}>
				Clicked {count} times
			</button>
			<click to="/dashboard">Open dashboard</click>
		</main>
	);
}
```

## Project Structure

Frontend-only:

```txt
app/
  components/
  hooks/
  lib/
  page.tsx
  layout.tsx
styles/
public/
rakta.config.ts
```

Fullstack:

```txt
frontend/
  app/
  styles/
  rakta.config.ts
backend/
  src/
    index.ts
    console/
    database/
      models/
      migrations/
      seeders/
    modules/
      app/
      user/
shared/
```

## Rendering Modes

**EN:** Configure routes as `csr`, `ssr`, `ssg`, or `hybrid` in `rakta.config.ts`.

**ID:** Atur route sebagai `csr`, `ssr`, `ssg`, atau `hybrid` di `rakta.config.ts`.

```ts
export default defineRaktaConfig({
	render: {
		defaultMode: "csr",
		routes: {
			"/": "ssg",
			"/dashboard": "csr",
		},
	},
});
```

## Components

Rakta.js ships app primitives and starter components:

| Component | Use |
| --- | --- |
| `<click to="/path">` | Client navigation |
| `<photo path="/image.png">` | Image primitive |
| `RaktaHead` | Metadata rendering |
| `RaktaToast` | Toast notifications |
| `Pantura` / `Reborns` | Smooth scroll targets |

## RPC

**EN:** Rakta RPC provides typed procedure-style communication between app layers.

**ID:** Rakta RPC menyediakan komunikasi bertipe berbasis procedure antar layer aplikasi.

```ts
const router = createRpcRouter({
	hello: procedure.query(() => ({ message: "Hello" })),
});
```

## Schema

```ts
const userSchema = object({
	name: string().min(1),
	email: string().min(5),
	age: number().min(0),
});
```

**EN:** Schema helpers keep validation small, typed, and dependency-light.

**ID:** Helper schema menjaga validasi tetap kecil, bertipe, dan minim dependency.

## State

```ts
export const useCounterStore = createRaktaStore((setState, getState) => ({
	count: 0,
	increment: () => setState({ count: getState().count + 1 }),
}));
```

## Middleware

**EN:** Middleware supports ordered `before`, `after`, `next`, `redirect`, `rewrite`, and `abort` flows.

**ID:** Middleware mendukung urutan `before`, `after`, `next`, `redirect`, `rewrite`, dan `abort`.

## SEO

```tsx
<RaktaHead
	metadata={{
		title: "Rakta.js",
		description: "Fast Bun-first React framework",
	}}
/>
```

## PWA

**EN:** Rakta includes manifest and service worker utilities for installable offline apps.

**ID:** Rakta menyertakan utilitas manifest dan service worker untuk aplikasi offline yang bisa di-install.

## Auto Import

**EN:** Auto Import scans configured directories and injects runtime globals for components, hooks, utility functions, and data modules. Template app files are intentionally written without manual imports.

**ID:** Auto Import memindai direktori yang dikonfigurasi dan menyuntikkan global runtime untuk komponen, hook, fungsi utilitas, dan modul data. File template app sengaja ditulis tanpa import manual.

```ts
export default defineRaktaConfig({
	autoImport: {
		enabled: true,
		directories: ["app", "components", "lib", "stores", "schemas"],
		outputDirectory: ".rakta",
		dts: true,
	},
});
```

## Kernel

**EN:** The framework kernel coordinates service container, lifecycle hooks, environment, runtime registry, module loading, startup, and shutdown.

**ID:** Kernel framework mengoordinasikan service container, lifecycle hook, environment, runtime registry, module loader, startup, dan shutdown.

## Roadmap

| Priority | Focus |
| --- | --- |
| Core | Kernel, lifecycle, DI, plugin registry |
| Middleware | Global, route, layout, API, edge middleware |
| Layout | Nested, persistent, loading, error, not-found layouts |
| Data | Streaming, defer, cache, revalidate, ISR |
| Deployment | Node, Bun, Deno, Cloudflare, Vercel, Netlify, Docker |
| DX | HMR, overlay, analyzer, devtools, type generator |

## Contributing

**EN:** Contributions are welcome. Keep changes focused, typed, tested, and aligned with Rakta.js goals: performance, simplicity, DX, tree shaking, edge runtime compatibility, and production readiness.

**ID:** Kontribusi terbuka. Jaga perubahan tetap fokus, bertipe, dites, dan selaras dengan tujuan Rakta.js: performa, kesederhanaan, DX, tree shaking, kompatibilitas edge runtime, dan kesiapan produksi.

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Donation

**EN:** If Rakta.js helps your work, sponsorship helps the project keep moving.

**ID:** Jika Rakta.js membantu pekerjaanmu, dukungan sponsor membantu project ini terus jalan.

See [docs/en/donations.md](docs/en/donations.md) and [docs/id/donasi.md](docs/id/donasi.md).

## Author

Built by **Muhammad Rizky Ramadhan**, also known as **Rhein Sullivan**, from Cirebon and South Jakarta, Indonesia.

Dibuat oleh **Muhammad Rizky Ramadhan**, dikenal juga sebagai **Rhein Sullivan**, dari Cirebon dan Jakarta Selatan, Indonesia.

## License

MIT. See [LICENCE](LICENCE).
