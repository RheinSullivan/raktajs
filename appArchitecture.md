my-app/
├─ frontend/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ loading.tsx
│  │  ├─ notFound.tsx
│  │  ├─ error.tsx
│  │  ├─ about/
│  │  │  └─ page.tsx
│  │  ├─ blog/
│  │  │  ├─ page.tsx
│  │  │  └─ [slug]/
│  │  │     └─ page.tsx
│  │  └─ api/
│  │     └─ hidupJokoUI/
│  │        └─ route.ts
│  ├─ components/
│  │  ├─ auth/
│  │  ├─ button/
│  │  ├─ form/
│  │  ├─ ui/
│  │  └─ layout/
│  ├─ lib/
│  │  ├─ http.ts
│  │  ├─ seo.ts
│  │  ├─ routes.ts
│  │  ├─ env.ts
│  │  └─ utils.ts
│  ├─ stores/
│  │  └─ counter.store.ts
│  ├─ schemas/
│  │  └─ user.schema.ts
│  ├─ .rakta/
│  │  ├─ auto-imports.ts
│  │  └─ auto-imports.d.ts
│  ├─ public/
│  ├─ styles/
│  │  └─ globals.css
│  ├─ rakta.config.ts
│  ├─ package.json
│  └─ tsconfig.json
├─ backend/
│  ├─ src/
│  │  ├─ app.ts
│  │  ├─ env.ts
│  │  ├─ rpc/
│  │  │  └─ router.ts
│  │  ├─ routes/
│  │  │  ├─ hello.ts
│  │  │  └─ rpc.ts
│  │  ├─ controllers/
│  │  │  └─ hello.controller.ts
│  │  ├─ config/
│  │  │  ├─ app.config.ts
│  │  │  └─ database.config.ts
│  │  └─ database/
│  │     ├─ client.ts
│  │     └─ schema/
│  ├─ .env.example
│  ├─ package.json
│  └─ tsconfig.json
├─ shared/
│  ├─ types/
│  │  ├─ index.ts
│  │  └─ rpc.ts
│  └─ constants/
│     └─ index.ts
├─ docs/
│  ├─ getting-started.md
│  ├─ installation.md
│  ├─ running.md
│  ├─ publishing.md
│  ├─ routing.md
│  ├─ seo.md
│  ├─ components.md
│  ├─ rpc.md
│  ├─ store.md
│  ├─ schema.md
│  ├─ http.md
│  ├─ auto-import.md
│  ├─ backend-framework.md
│  ├─ database.md
│  └─ philosophy.md
├─ .env.example
├─ package.json
├─ bunfig.toml
├─ tsconfig.base.json
└─ README.md