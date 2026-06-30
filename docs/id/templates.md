# Template

## Overview

`create-rakta-app` membuat project dari salah satu dari dua template,
tergantung mode project yang dipilih: `frontendOnly` atau `fullstack`.

## Kapan dipakai

Baca ini setelah menjalankan `create-rakta-app` untuk memahami apa yang
dihasilkan dan alasannya, atau sebelum berkontribusi mengubah template
itu sendiri di `templates/`.

## Template frontend-only

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

Tidak ada backend, database, schema, atau file shared di mode ini —
root project *adalah* frontend-nya.

`app/page.tsx` default adalah halaman selamat datang Rakta.js, termasuk
mini-game **ShrimpRun** (lihat `shrimpRunGame.tsx`) dan maskot udang
Rakta, keduanya dibangun dengan JSX/SVG/CSS biasa tanpa aset gambar
eksternal.

## Template fullstack

```txt
my-app/
├─ frontend/
│  ├─ app/
│  │  ├─ layout.tsx                       layout marketing publik (navbar + footer)
│  │  ├─ page.tsx                         beranda
│  │  ├─ about/page.tsx
│  │  ├─ features/page.tsx
│  │  ├─ pricing/page.tsx
│  │  ├─ contact/page.tsx
│  │  ├─ offline/page.tsx                 fallback offline ShrimpHarbor
│  │  ├─ (auth)/
│  │  │  ├─ layout.tsx                    layout khusus auth, tanpa navbar publik
│  │  │  ├─ login/page.tsx
│  │  │  ├─ register/page.tsx
│  │  │  ├─ forgot-password/page.tsx
│  │  │  └─ reset-password/page.tsx
│  │  └─ dashboard/
│  │     ├─ layout.tsx                    sidebar dashboard, tanpa footer marketing
│  │     ├─ page.tsx
│  │     ├─ profile/page.tsx
│  │     └─ settings/page.tsx
│  ├─ components/layout/
│  │  ├─ PublicNavbar.tsx
│  │  ├─ PublicFooter.tsx
│  │  └─ DashboardSidebar.tsx
│  ├─ lib/
│  │  ├─ http.ts                          instance client PanturaFetch
│  │  └─ routes.ts                        konstanta path route yang typed
│  ├─ styles/globals.css
│  ├─ rakta-env.d.ts
│  ├─ rakta.config.ts
│  ├─ package.json
│  └─ tsconfig.json
├─ backend/                                 struktur tergantung framework yang dipilih — lihat backendFrameworks.md
├─ shared/
│  ├─ types/index.ts
│  └─ constants/index.ts
├─ docs/README.md
├─ package.json
└─ tsconfig.base.json
```

Layout publik (navbar + footer) hanya membungkus halaman marketing.
Route group `(auth)` punya layout sendiri tanpa navbar atau footer
publik. Route `dashboard` punya layout sendiri dengan sidebar dan tanpa
footer marketing. Pemisahan ini disengaja — lihat
[`routing.md`](./routing.md) untuk cara route group mencapainya.

## Kesalahan umum

- Mengharapkan `backend/` terlihat sama terlepas dari framework yang
  dipilih — tidak demikian. Lihat
  [`backendFrameworks.md`](./backendFrameworks.md).
- Menambah halaman publik baru langsung di bawah `app/` dibanding di
  dalam scope yang sudah punya layout publik — pastikan halaman tidak
  tidak sengaja ditaruh di bawah `(auth)/` atau `dashboard/`.
- Memperlakukan `shared/` sebagai tempat logika khusus backend —
  seharusnya hanya berisi tipe dan konstanta yang dibutuhkan `frontend/`
  dan `backend/` keduanya.

## Dokumen terkait

- [`routing.md`](./routing.md)
- [`backendFrameworks.md`](./backendFrameworks.md)
- [`pwa.md`](./pwa.md) — `offline/page.tsx` yang disebutkan di atas