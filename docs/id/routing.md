# Routing — MendungWeave

## Overview

**MendungWeave** adalah layer routing berbasis file di Rakta.js. Struktur
folder di bawah `app/` itulah router-nya — tidak ada file konfigurasi
route terpusat yang harus dijaga sinkron.

## Kapan dipakai

Setiap kali kalian butuh halaman baru, API endpoint, layout, loading
state, atau error boundary di aplikasi Rakta.js.

## Konvensi file

| File | Menjadi |
| --- | --- |
| `app/page.tsx` | `/` |
| `app/about/page.tsx` | `/about` |
| `app/blog/[slug]/page.tsx` | `/blog/:slug` (segmen dinamis) |
| `app/blog/[...slug]/page.tsx` | `/blog/*` (catch-all) |
| `app/(auth)/login/page.tsx` | `/login` — segmen `(auth)` adalah route group dan tidak muncul di URL |
| `app/layout.tsx` | Layout yang membungkus semua route di bawahnya |
| `app/loading.tsx` | Ditampilkan saat segmen route sedang loading |
| `app/error.tsx` | Error boundary untuk segmen route |
| `app/notFound.tsx` | Dirender kalau tidak ada route yang cocok |
| `app/api/users/route.ts` | Endpoint API (KasepuhanGate) di `/api/users` |

## Arsitektur

MendungWeave punya tiga tahap:

1. **Scanner** (`scanRoutes` dari `rakta/router`) menyusuri folder `app/`
   dan menghasilkan daftar entri route beserta jenisnya (`page`, `layout`,
   `loading`, `error`, `notFound`, `api`) dan segmen mentahnya.
2. **Manifest** mengubah daftar itu menjadi `RouteManifestEntry[]`,
   menghitung pola URL dan nama parameter dinamis untuk setiap entri.
3. **Matcher** (`matchRoute`) menerima pathname yang masuk dan manifest,
   lalu mengembalikan entri yang cocok beserta parameter yang diekstrak,
   atau `null` kalau tidak ada yang cocok.

Layout diselesaikan secara terpisah dengan `findLayoutsForPathname`, yang
mengembalikan setiap layout yang pola-nya merupakan prefix dari pathname
saat ini, sehingga nested layout bisa tersusun secara natural.

## Contoh kode

```tsx
// app/blog/[slug]/page.tsx
interface BlogPostPageProps {
  params: { slug: string };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return <h1>Post: {params.slug}</h1>;
}
```

```ts
// app/api/users/route.ts — endpoint KasepuhanGate
export async function GET(): Promise<Response> {
  return Response.json({ users: [] });
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  return Response.json({ created: body }, { status: 201 });
}
```

## Route group untuk isolasi layout

Bungkus nama folder dengan tanda kurung untuk mengelompokkan route di
bawah layout bersama tanpa menambah segmen URL:

```txt
app/
├─ (auth)/
│  ├─ layout.tsx        ← hanya membungkus login/register/dll, tanpa navbar/footer
│  ├─ login/page.tsx     → /login
│  └─ register/page.tsx  → /register
├─ dashboard/
│  ├─ layout.tsx        ← sidebar dashboard, tanpa footer marketing
│  └─ page.tsx           → /dashboard
└─ layout.tsx            ← layout marketing publik (navbar + footer)
```

Begini cara template fullstack menyusun halaman marketing publik, halaman
auth, dan dashboard — lihat [`templates.md`](./templates.md).

## Navigasi dengan ShrimpStep

Gunakan custom element `<click to="">` untuk navigasi dalam aplikasi,
bukan `<a href="">` biasa:

```tsx
import { Click } from "rakta/components";

<click to="/dashboard">Ke dashboard</click>
```

`Click` otomatis memahami tujuan internal vs eksternal, mendukung
aktivasi via keyboard, dan menandai route aktif dengan
`aria-current="page"`.

## Kesalahan umum

- Menamai file `Page.tsx` padahal seharusnya `page.tsx` — scanner mencocokkan
  nama file lowercase secara persis.
- Lupa bahwa folder `(group)` tidak menambah segmen URL — `app/(auth)/login/page.tsx`
  adalah `/login`, bukan `/auth/login`.
- Memakai `<a href="">` untuk navigasi internal, yang menyebabkan full
  page reload bukan transisi client-side.

## Dokumen terkait

- [`templates.md`](./templates.md) — bagaimana routing disusun di aplikasi yang di-generate
- [`seo.md`](./seo.md) — metadata per-route dengan SunyaragiCrown
- [`rpc.md`](./rpc.md) — CarubanWire, untuk panggilan typed dibanding handler `route.ts` mentah