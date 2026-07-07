# Mulai cepat

## Overview

Halaman ini membantu kalian dari nol sampai punya aplikasi Rakta.js yang
berjalan dalam beberapa menit, menggunakan generator resmi,
`create-rakta-app`.

## Kapan dipakai

Baca ini duluan kalau belum pernah menjalankan Rakta.js sama sekali. Kalau
sudah punya project dan ingin paham struktur foldernya, baca
[`templates.md`](./templates.md) saja.

## Kebutuhan

- [Bun](https://bun.sh) versi 1.3 atau lebih baru
- Node.js tidak diperlukan — Rakta.js berjalan sepenuhnya di atas Bun

## Membuat project

```bash
bun create rakta-app@latest my-app
```

Kalian akan ditanya:
1. Nama project
2. Mode project — **Frontend only** atau **Fullstack**
3. CSS framework — Tailwind CSS v4 (default), Bootstrap, SASS, atau tanpa CSS framework
4. Mode rendering — CSR, SSR, SSG, CSG, SPA, atau Hybrid
5. *(Khusus Fullstack)* Backend framework — Gaman.js, Express.js, Nest.js, atau Adonis.js
6. *(Khusus Fullstack)* Database — PostgreSQL, MySQL, MongoDB, Firebase, SQLite, MariaDB, Redis, PlanetScale, atau Turso

Package manager lain juga bisa:
```bash
bunx create-rakta-app@latest my-app
npm create rakta-app@latest my-app
pnpm create rakta-app@latest my-app
```

## Jalankan dev server

```bash
cd my-app
bun install
bun run dev
```

Buka `http://localhost:3000`. Starter frontend-only menampilkan halaman
selamat datang Rakta.js dengan mini-game **ShrimpRun** — klik, tap, atau
tekan Space untuk lompat.

## Route pertama kalian

Setiap file di `app/<path>/page.tsx` otomatis jadi route. Buat
`app/about/page.tsx`:
```tsx
import { Click } from "rakta/components";

export default function AboutPage() {
  return (
    <main>
      <h1>Tentang</h1>
      <click to="/">Kembali ke beranda</click>
    </main>
  );
}
```

Kunjungi `/about` — tidak perlu registrasi route manual. Ini adalah
**MendungWeave**, router berbasis file. Lihat [`routing.md`](./routing.md)
untuk panduan lengkapnya.

## Kesalahan umum

- Menjalankan `bun dev` padahal seharusnya `bun run dev` — `package.json`
  yang di-generate mendefinisikan `dev` sebagai script, bukan subcommand
  Bun langsung.
- Mencoba `npm create-rakta-app@latest my-app` — ini bukan syntax npm yang
  valid. Gunakan `npm create rakta-app@latest my-app` (dengan spasi).
- Mengharapkan folder `backend/` di mode frontend-only — secara desain,
  memang tidak ada.

## Dokumen terkait

- [`routing.md`](./routing.md) — routing berbasis file MendungWeave
- [`templates.md`](./templates.md) — isi setiap template yang di-generate
- [`backendFrameworks.md`](./backendFrameworks.md) — pilihan backend untuk fullstack