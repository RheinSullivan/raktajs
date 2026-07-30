# Panduan Upgrade

Panduan ini membantu kamu mengupgrade Rakta.js dari versi lama ke versi terbaru tanpa merusak aplikasi yang sudah ada.

Kalau kamu adalah RAUL atau developer lain yang pakai Rakta.js versi lama untuk bikin aplikasi laporan atau proyek lain, halaman ini untukmu.

---

## Cara upgrade

```bash
# Bun (direkomendasikan)
bun update raktajs

# npm
npm update raktajs

# pnpm
pnpm update raktajs

# yarn
yarn upgrade raktajs
```

Setelah update, jalankan:

```bash
bun run typecheck
bun run dev
```

Kalau ada error TypeScript atau masalah runtime, cek bagian yang relevan di bawah.

---

## v1.0.7 → v1.0.9

Rilis ini memperbaiki konflik versi npm, menaikkan semua versi package, dan menghasilkan build yang bersih dari lint.

### Breaking changes

Tidak ada. Semua API yang sudah ada tetap kompatibel.

### Apa yang berubah

#### Konflik versi diselesaikan

v1.0.7 sudah di-publish ke npm. v1.0.9 adalah rilis lanjutan. Upgrade dengan:

```bash
bun update raktajs
bun update create-rakta-app
```

#### Generator bersih dari lint

Fungsi `personalizeGamanTemplate` di generator fullstack sekarang menggunakan template literal untuk injeksi env OAuth (sebelumnya string concatenation). Tidak ada perubahan fungsional - output identik.

#### Backend `.env.example` diperluas

Project fullstack yang di-generate sekarang menyertakan semua env var auth di `.env.example`:

```env
AUTH_SECRET=change-this-development-secret-32-chars
AUTH_STRATEGY=jwt
SESSION_MODE=multiple

# Google OAuth (uncomment untuk mengaktifkan)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/callback/google
```

---

## v1.0.6 → v1.0.7

Rilis ini memperbaiki Gaman.js backend dan menambah auth generator.

### Breaking changes

Tidak ada. Semua API yang sudah ada tetap kompatibel.

### Generated backend - Gaman.js v2.x API

Jika kamu membuat fullstack project di v1.0.6 atau sebelumnya, backend-mu menggunakan `app.get()` / `app.post()` yang sudah tidak ada di Gaman.js v2.x.

Buat project baru dengan v1.0.7, atau migrasi manual:

```ts
// Sebelum (v1.0.6 dan lebih lama - rusak di Gaman.js v2.x)
import { Gaman, type GamanContext, type HTTP } from "gaman";
const app = new Gaman<HTTP>();
app.get("/api/hello", handle);

// Sesudah (v1.0.7 - bekerja dengan Gaman.js v2.x)
import { Gaman, composeRouter } from "gaman";
import type { Context } from "gaman";

const router = composeRouter((r) => {
  r.get("/api/hello", (c: Context) => { /* ... */ });
});
const app = new Gaman();
await app.mount(router);
app.mountServer({ http: 4000 });
```

Handler signature juga berubah - dari `(context: GamanContext)` menjadi `(c: Context)`.

### Baru: Authentication Generator

Saat generate fullstack project, kamu akan ditanya:

- Auth strategy: None / JWT / Session / JWT+Session
- Session policy: single-session, multiple-sessions, single-device, revoke-previous, dll.
- OAuth providers: Google, GitHub, Apple, Microsoft, Discord, GitLab (opsional)

Auth sepenuhnya self-hosted. Tidak ada Clerk, NextAuth, Supabase, atau Firebase.

### Baru: `postcss.config.ts` (sebelumnya `.js`)

Project yang di-generate sekarang pakai `postcss.config.ts`.

### Baru: 1-command fullstack dev

```bash
cd my-project
bun run dev  # menjalankan frontend + backend sekaligus
```

### CLI next steps - path yang benar

v1.0.7 sekarang menampilkan path yang benar termasuk nama folder project:

```
cd my-project/frontend && bun install && bun run dev
```

---

## v1.0.5 → v1.0.6

Ini adalah rilis yang paling berdampak untuk performa aplikasi. Kalau aplikasimu mengalami UI lambat setelah response API (seperti yang RAUL laporkan - "response sudah muncul di Network tapi UI butuh 10 detik"), upgrade ke v1.0.6 langsung mengatasi masalah ini.

### Breaking changes

Tidak ada. Semua API yang sudah ada tetap kompatibel.

### Apa yang berubah dan apa yang perlu kamu update

#### HTTP client - PanturaFetch

Default timeout berkurang dari 30.000ms menjadi 10.000ms. Kalau API kamu memang butuh lebih dari 10 detik, set custom timeout:

```ts
const http = createRaktaHttp({
  baseUrl: "http://localhost:4000",
  timeout: 30_000, // kembalikan ke behavior lama kalau perlu
});
```

Opsi baru tersedia:

```ts
// Retry untuk network error sementara (default: off)
const data = await http.get("/api/laporan", { retries: 2 });
```

#### Smooth scroll - nama komponen berubah

Nama lama masih bisa dipakai tapi sudah dihapus dari dokumentasi. Pakai nama baru:

| Lama | Baru |
|---|---|
| `<scroll to="">` | `<pantura to="">` |
| `<anchor id="">` | `<reborns id="">` |
| `useSintren()` | `usePantura()` |

Kalau kodeму pakai nama lama, update seperti ini:

```tsx
// Sebelum
<scroll to="kontak">Hubungi Kami</scroll>
<anchor id="kontak"><h2>Hubungi Kami</h2></anchor>

// Sesudah
<pantura to="kontak">Hubungi Kami</pantura>
<reborns id="kontak"><h2>Hubungi Kami</h2></reborns>
```

```ts
// Sebelum
import { useSintren } from "raktajs/components";
const scrollTo = useSintren({ offset: 80 });

// Sesudah
import { usePantura } from "raktajs/components";
const scrollTo = usePantura({ offset: 80 });
```

#### Baru: hook useRaktaData

Kalau sebelumnya kamu mengatur loading/error state secara manual dengan `useState` + `useEffect`, ganti dengan `useRaktaData`:

```ts
// Sebelum - fetch manual
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetch("/api/laporan")
    .then(r => r.json())
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);

// Sesudah - useRaktaData
import { useRaktaData } from "raktajs";

const { data, loading, error, refetch } = useRaktaData(
  (signal) => fetch("/api/laporan", { signal }).then(r => r.json()),
  [],
  "laporan" // kunci deduplikasi
);
```

Manfaat: AbortController otomatis saat unmount, deduplikasi request, refetch manual, loading state yang konsisten.

#### postcss.config.js → postcss.config.ts

Kalau proyekmu punya `postcss.config.js`, ganti namanya:

```bash
# Hapus file lama
rm postcss.config.js
```

```ts
// postcss.config.ts
import type { Config } from "postcss-load-config";

const config: Config = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};

export default config;
```

#### Paket baru opsional: motion, scene, vector

Ini sepenuhnya opsional. Aplikasi yang sudah ada tidak terpengaruh sama sekali. Kalau mau pakai:

```bash
# Motion system - tidak perlu install tambahan
# 3D scene - perlu three.js
bun add three

# Vector animation - tidak perlu install tambahan
```

```ts
import { definePageTransition, useMagnetic } from "raktajs/motion";
import { useMegaScapeScene } from "raktajs/scene"; // perlu: bun add three
import { useTrusmiVector, useImageZoom } from "raktajs/vector";
```

---

## v1.0.4 → v1.0.5

### Breaking changes

Tidak ada.

### Perubahan nama komponen: `<scroll>` → `<pantura>`, `<anchor>` → `<reborns>`

Lihat bagian v1.0.5 → v1.0.6 di atas untuk langkah migrasinya.

---

## v1.0.3 → v1.0.4

### Breaking changes

Tidak ada.

### GSAP menggantikan library animasi sebelumnya

GSAP sekarang menjadi engine animasi. Kalau sebelumnya kamu import dari `motion` atau `framer-motion`:

```bash
# Hapus dependency lama
bun remove motion framer-motion
```

GSAP sudah dikonfigurasi di Rakta.js - kamu tidak perlu melakukan apa-apa.

---

## v1.0.2 → v1.0.3

### Breaking changes

Tidak ada. Ini adalah rilis dokumentasi dan tooling.

---

## Memperbaiki masalah "UI lambat setelah response" (semua versi)

Kalau kamu mengalami: **response sudah muncul di Network browser tapi UI tidak update selama beberapa detik**, ini adalah masalah rendering di browser, bukan masalah server.

Setelah upgrade ke v1.0.6:

- HTML shell sekarang punya `<link rel="modulepreload">` untuk JS bundle - browser mulai loading JavaScript saat parsing HTML bukan setelah selesai
- HTTP client menjaga koneksi TCP tetap aktif (`keepalive: true`)
- Loading overlay muncul langsung sehingga halaman tidak pernah terlihat kosong

Kalau masalah masih ada setelah upgrade, cek ini:

1. **Payload JSON terlalu besar** - paginasi response API kamu (`limit: 50` bukan return 10.000 baris sekaligus)
2. **Transform di client yang berat** - sorting atau filtering 1000+ item di JavaScript memblokir main thread
3. **Terlalu banyak request sekaligus** - `useRaktaData` mendeduplikasi request dengan key yang sama
4. **Tidak ada AbortController** - pola `useEffect` + `fetch` lama mungkin terus berjalan setelah unmount; `useRaktaData` menangani ini otomatis

Lihat [docs/id/performance.md](./performance.md) untuk panduan diagnosis lengkap.

---

## Troubleshooting

**Error TypeScript setelah upgrade: `Cannot find module 'raktajs/motion'`**

Subpath `motion`, `scene`, dan `vector` baru ada di v1.0.6. Pastikan kamu sudah di v1.0.6:

```bash
cat node_modules/raktajs/package.json | grep version
```

**`<pantura>` / `<reborns>` tidak dikenali TypeScript**

Update `rakta-env.d.ts` dengan menjalankan:

```bash
bun run imports:generate
```

atau tambahkan manual ke `rakta-env.d.ts`:

```ts
declare namespace JSX {
  interface IntrinsicElements {
    pantura: React.HTMLAttributes<HTMLElement> & { to: string; offset?: number; duration?: number };
    reborns: React.HTMLAttributes<HTMLElement> & { id: string };
  }
}
```

**Build gagal setelah menambah `raktajs/scene`**

Three.js adalah optional peer dependency:

```bash
bun add three
```

**`useRaktaData` tidak ditemukan**

Pastikan kamu import dari `raktajs` (root) atau `raktajs/data`:

```ts
import { useRaktaData } from "raktajs";
// atau
import { useRaktaData } from "raktajs/data";
```

---

## Butuh bantuan?

- GitHub Issues: [github.com/RheinSullivan/raktajs/issues](https://github.com/RheinSullivan/raktajs/issues)
- Panduan performa: [docs/id/performance.md](./performance.md)
- Panduan dev tools: [docs/id/devtools.md](./devtools.md)
