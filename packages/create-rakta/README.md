# create-rakta-app

The official project generator for **Rakta.js**.

> Small in size. Fierce in speed. Alive in every route.

## Usage

```bash
bun create rakta-app@latest my-app
```

Other package managers:

```bash
bunx create-rakta-app@latest my-app
npm create rakta-app@latest my-app
npm exec create-rakta-app@latest my-app
pnpm create rakta-app@latest my-app
pnpm dlx create-rakta-app@latest my-app
```

> Note: `npm create-rakta-app@latest my-app` (without the space before
> `rakta-app`) is **not** valid npm initializer syntax. The correct form
> is `npm create rakta-app@latest my-app` - npm's `create` command always
> expects the package name as a separate argument after stripping the
> `create-` prefix.

## What it asks you

1. **Project name**
2. **Project mode** - Frontend only, or Fullstack
3. **CSS framework** - Tailwind CSS v4 (default), Bootstrap, SASS, or none
4. **Rendering mode** - CSR, SSR, SSG, CSG, SPA, or Hybrid
5. *(Fullstack only)* **Backend framework** - Gaman.js, Express.js, Nest.js, or Adonis.js
6. *(Fullstack only)* **Database** - PostgreSQL, MySQL, MongoDB, Firebase, SQLite, MariaDB, Redis, PlanetScale, Neon, or Turso

## Frontend-only output

```txt
my-app/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ loading.tsx
│  ├─ error.tsx
│  ├─ notFound.tsx
│  └─ components/
│     ├─ raktaShrimpMascot.tsx
│     └─ shrimpRunGame.tsx
├─ public/
├─ styles/
│  └─ globals.css
├─ rakta.config.ts
├─ rakta-env.d.ts
├─ package.json
└─ tsconfig.json
```

No `backend/`, `database/`, `schema/`, `prisma/`, or shared backend files
are generated in this mode.

## Fullstack output

```txt
my-app/
├─ frontend/
├─ backend/
├─ shared/
├─ docs/
├─ package.json
└─ tsconfig.base.json
```

The contents of `backend/` depend on the backend framework you chose -
Gaman.js, Express.js, Nest.js, and Adonis.js each get a different,
idiomatic folder structure rather than one generic shape forced onto all
four.

## After generation

```bash
cd my-app
bun install
bun run dev
```

For fullstack apps, the frontend and backend run as separate workspace
packages - see the generated root `README.md` for the exact dev commands
for your chosen stack.

## Documentation

See [`docs/en/templates.md`](../../docs/en/templates.md) /
[`docs/id/templates.md`](../../docs/id/templates.md) for a full breakdown
of every template, and [`docs/en/backendFrameworks.md`](../../docs/en/backendFrameworks.md)
for backend-specific architecture notes.

## Support & Donasi Kemanusiaan 🇵🇸

Dukungan Anda membantu pemeliharaan server, domain, infrastruktur, serta disalurkan untuk **kaum dhuafa, anak yatim/piatu, panti asuhan, panti jompo, dan bantuan kemanusiaan 🇵🇸 Free Palestine**.

- **Donasi Resmi:** [buymeacoffee.com/rheinsullivan](https://buymeacoffee.com/rheinsullivan)
- **Panduan Kemitraan Lembaga Penyalur:** Terbuka bagi yayasan/panti asuhan resmi untuk bermitra sebagai penyalur ([`docs/id/donasi.md`](../../docs/id/donasi.md)).

## License

MIT - Rhein Sullivan | Vyagra Nexus™