# Pengimporan Otomatis (Auto Import) - TrusmiThread

**TrusmiThread** adalah sistem pengimporan otomatis (Auto Import) pada Rakta.js yang terinspirasi oleh Vue.js dan Nuxt.js. Fitur ini memungkinkan Anda membangun aplikasi tanpa perlu menulis pernyataan `import` yang berulang-ulang di bagian atas setiap berkas.

---

## Gambaran Umum

Ketika Anda membuat komponen antarmuka pengguna, fungsi bantuan, toko data, atau skema validasi di dalam proyek Anda, Rakta.js secara otomatis mendeteksi dan mendaftarkannya ke dalam cakupan TypeScript global serta lingkungan runtime peramban.

---

## Contoh Kode

Buat komponen navigasi di dalam berkas `components/Navbar.tsx`:

```tsx
// components/Navbar.tsx
export default function Navbar() {
  return (
    <nav className="navbar">
      <h2>Portofolio Saya</h2>
      <div className="links">
        <a href="/">Beranda</a>
        <a href="/tentang">Tentang</a>
        <a href="/proyek">Proyek</a>
      </div>
    </nav>
  );
}
```

Gunakan langsung di dalam berkas `app/page.tsx` - **tanpa perlu menulis perintah import**:

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <main>
      <Navbar />
      <section className="hero">
        <h1>Selamat Datang di Portofolio Saya</h1>
        <p>Dibuat dengan Rakta.js - komponen langsung dapat digunakan tanpa pengimporan manual!</p>
      </section>
    </main>
  );
}
```

---

## Direktori Terkonfigurasi

Secara baku, Rakta.js memindai direktori berikut untuk fitur pengimporan otomatis:

```ts
// rakta.config.ts
import { defineRaktaConfig } from "raktajs";

export default defineRaktaConfig({
  autoImport: {
    enabled: true,
    directories: ["app", "components", "lib", "stores", "schemas", "utils"],
    outputDirectory: ".rakta",
    dts: true,
  },
});
```

| Folder | Barang yang Diimpor Otomatis | Contoh Pengenal Global |
| --- | --- | --- |
| `components/` | Komponen React (`.tsx`, `.jsx`) | `<Navbar />`, `<Button />` |
| `lib/` / `utils/` | Fungsi pustaka & pembantu | `slugify()`, `cn()` |
| `stores/` | Pengelola kondisi (state store) | `useCounterStore()` |
| `schemas/` | Skema validasi data | `userSchema` |

---

## Memperbarui Pengimporan Otomatis Secara Manual

Untuk memicu pemindaian ulang berkas pengimporan otomatis secara manual, jalankan perintah:

```bash
bun rakta imports:generate
```

---

## Mematikan Pengimporan Otomatis

Jika tim Anda lebih menyukai pengimporan dependensi secara eksplisit di setiap berkas, matikan fitur ini pada `rakta.config.ts`:

```ts
export default defineRaktaConfig({
  autoImport: {
    enabled: false,
  },
});
```

Saat dimatikan, impor hooks dari `raktajs/hooks` secara eksplisit:

```tsx
import { lengkoState, empalEffect } from "raktajs/hooks";
```

---

## Praktik Terbaik

- Biarkan `autoImport.enabled: true` untuk pengalaman pengembangan yang cepat dan modern seperti Nuxt.js.
- Kelompokkan komponen UI di dalam `components/` atau `components/ui/`.
- Jangan mengubah berkas di dalam direktori `.rakta/` secara manual.

---

## Dokumen Terkait

- [`mulai.md`](./mulai.md) - Panduan memulai aplikasi Rakta.js
- [`routing.md`](./routing.md) - Panduan routing berbasis berkas
- [`hooks.md`](./hooks.md) - Panduan kait (hooks) framework
