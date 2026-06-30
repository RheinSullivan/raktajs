# Templates

## Overview

`create-rakta-app` generates a project from one of two templates,
depending on the project mode you choose: `frontendOnly` or `fullstack`.

## When to use this

Read this after running `create-rakta-app` to understand what was
generated and why, or before contributing a change to the templates
themselves under `templates/`.

## Frontend-only template

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

No backend, database, schema, or shared files exist in this mode — the
project root *is* the frontend.

The default `app/page.tsx` is the Rakta.js welcome screen, including the
**ShrimpRun** mini-game (see `shrimpRunGame.tsx`) and the Rakta shrimp
mascot, both built with plain JSX/SVG/CSS and no external image assets.

## Fullstack template

```txt
my-app/
├─ frontend/
│  ├─ app/
│  │  ├─ layout.tsx                       public marketing layout (navbar + footer)
│  │  ├─ page.tsx                         home
│  │  ├─ about/page.tsx
│  │  ├─ features/page.tsx
│  │  ├─ pricing/page.tsx
│  │  ├─ contact/page.tsx
│  │  ├─ offline/page.tsx                 ShrimpHarbor offline fallback
│  │  ├─ (auth)/
│  │  │  ├─ layout.tsx                    auth-only layout, no public navbar
│  │  │  ├─ login/page.tsx
│  │  │  ├─ register/page.tsx
│  │  │  ├─ forgot-password/page.tsx
│  │  │  └─ reset-password/page.tsx
│  │  └─ dashboard/
│  │     ├─ layout.tsx                    dashboard sidebar, no marketing footer
│  │     ├─ page.tsx
│  │     ├─ profile/page.tsx
│  │     └─ settings/page.tsx
│  ├─ components/layout/
│  │  ├─ PublicNavbar.tsx
│  │  ├─ PublicFooter.tsx
│  │  └─ DashboardSidebar.tsx
│  ├─ lib/
│  │  ├─ http.ts                          PanturaFetch client instance
│  │  └─ routes.ts                        typed route path constants
│  ├─ styles/globals.css
│  ├─ rakta-env.d.ts
│  ├─ rakta.config.ts
│  ├─ package.json
│  └─ tsconfig.json
├─ backend/                                 structure depends on chosen framework — see backendFrameworks.md
├─ shared/
│  ├─ types/index.ts
│  └─ constants/index.ts
├─ docs/README.md
├─ package.json
└─ tsconfig.base.json
```

The public layout (navbar + footer) wraps marketing pages only. The
`(auth)` route group has its own layout with no public navbar or footer.
The `dashboard` route has its own layout with a sidebar and no marketing
footer. This separation is intentional — see [`routing.md`](./routing.md)
for how route groups achieve it.

## Common mistakes

- Expecting `backend/` to look the same regardless of framework choice —
  it does not. See [`backendFrameworks.md`](./backendFrameworks.md).
- Adding new public pages directly under `app/` instead of inside the
  scope that already has the public layout — make sure the page is not
  accidentally placed under `(auth)/` or `dashboard/`.
- Treating `shared/` as a place for backend-only logic — it should only
  contain types and constants both `frontend/` and `backend/` need.

## Related docs

- [`routing.md`](./routing.md)
- [`backendFrameworks.md`](./backendFrameworks.md)
- [`pwa.md`](./pwa.md) — the `offline/page.tsx` referenced above