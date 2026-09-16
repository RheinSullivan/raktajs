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

## Menggunakan Auto Import sebagai Pustaka Mandiri

Generator TrusmiThread **tidak terkunci di dalam Rakta.js**. Ia adalah API Node.js kecil yang tidak bergantung pada framework (framework-agnostic) dan bisa dipanggil langsung oleh proyek apa pun yang berbasis React — tanpa runtime Rakta, tanpa `rakta.config.ts`, dan tanpa server Rakta. Seluruh mesinnya hanya bergantung pada modul `fs` dan `path` milik Node.

### Pemasangan

```bash
bun add raktajs
# atau: npm install raktajs
```

### API Pustaka

Impor dari subpath `raktajs/autoImport`:

| Ekspor | Deskripsi |
| --- | --- |
| `generateAutoImports(options)` | Memindai direktori yang dikonfigurasi lalu menulis berkas re-ekspor (barrel) yang bertipe, plus deklarasi tipe global opsional. Mengembalikan `AutoImportManifest`. |
| `scanForExports(options)` | Memindai direktori dan mengembalikan `DiscoveredExport[]` mentah tanpa menulis apa pun ke disk. |
| `printAutoImportSummary(manifest)` | Mencetak ringkasan rapi dari semua ekspor yang ditemukan. |

`AutoImportGeneratorOptions`:

| Opsi | Tipe | Catatan |
| --- | --- | --- |
| `frontendRoot` | `string` | Jalur absolut menuju akar proyek Anda. |
| `directories` | `string[]` | Daftar direktori (relatif terhadap `frontendRoot`) yang dipindai. |
| `outputDirectory` | `string` | Lokasi berkas-berkas hasil pembuatan (relatif terhadap `frontendRoot`). |
| `extensions` | `string[]` | Opsional, ekstensi berkas yang dipindai. Baku: `.ts`, `.tsx`, `.js`, `.jsx`. |
| `generateDts` | `boolean` | Ikut menulis `autoImports.d.ts` berisi deklarasi tipe `declare global`. |

### Apa yang Dihasilkan

Menjalankan generator dengan `frontendRoot: process.cwd()`, `directories: ["components", "lib"]`, `outputDirectory: ".autoimports"`, dan `generateDts: true` akan menghasilkan:

- `.autoimports/autoImports.ts` — barrel bertipe yang mengekspor ulang setiap modul yang ditemukan:

  ```ts
  export * from "../src/components/Navbar";
  export { default as Navbar } from "../src/components/Navbar";
  ```

- `.autoimports/autoImports.d.ts` — barrel yang sama ditambah blok `declare global`, sehingga simbol-simbol yang ditemukan muncul di IntelliSense di seluruh proyek Anda bahkan sebelum Anda menulis satu pun `import`.

### Contoh Integrasi per Framework

Gagasannya sama di semua tempat: jalankan generator di awal siklus dev/build, lalu impor dari barrel yang dihasilkan.

#### React + Vite

`package.json`:

```json
{
  "scripts": {
    "predev": "node ./scripts/autoimport.mjs",
    "prebuild": "node ./scripts/autoimport.mjs"
  }
}
```

`scripts/autoimport.mjs`:

```js
import { generateAutoImports, printAutoImportSummary } from "raktajs/autoImport";

const manifest = generateAutoImports({
  frontendRoot: process.cwd(),
  directories: ["src/components", "src/lib", "src/stores", "src/schemas"],
  outputDirectory: ".autoimports",
  generateDts: true,
});

printAutoImportSummary(manifest);
```

Lalu gunakan di komponen mana pun:

```tsx
import { Navbar, useCartStore, slugify } from "../../.autoimports/autoImports";
```

#### Next.js (App Router)

Jalankan skrip yang sama lewat `predev` / `prebuild` (atau `postinstall` untuk klon baru), lalu impor dari barrel di server component, client component, layout, dan route handler:

```tsx
import { userSchema, http } from "@/components/.autoimports/autoImports";
```

Utilitas khusus server (misalnya pembantu basis data) bisa disalurkan lewat barrel Next.js Anda tanpa bocor ke bundel klien — terapkan konvensi `"server-only"` seperti modul lain biasa.

#### Remix

Pasang `predev` / `prebuild` ke generator lalu impor helper, store, dan skema dari barrel di dalam `loaders`, `actions`, dan komponen — ekspornya netral terhadap framework.

#### Gatsby

Jalankan generator saat bootstrap dari `gatsby-node.js` agar barrel sudah ada sebelum typegen GraphQL dan kompilasi halaman:

```js
// gatsby-node.js
const { generateAutoImports } = require("raktajs/autoImport");

exports.onPreBootstrap = () => {
  generateAutoImports({
    frontendRoot: process.cwd(),
    directories: ["src/components", "src/lib"],
    outputDirectory: ".autoimports",
    generateDts: true,
  });
};
```

Lalu impor dari barrel di halaman dan component shadowing.

#### Expo / React Native

Mesinnya bebas-DOM dan hanya Node, sehingga bekerja dengan baik di perkakas React Native. Panggil dari skrip `prestart` / `preexport` lalu gunakan barrel untuk helper, store, skema, dan data bersama. Utamakan impor eksplisit dari barrel di React Native — JSX global bukan fitur resolve-time bundler native seperti halnya di web.

### Barrel Bertipe vs. Zero-Import Sungguhan

Ada dua tingkat pengalaman pengembang:

- **Barrel bertipe (universal).** Impor dari `autoImports.ts` yang dihasilkan. Ini bekerja di semua framework berbasis React dan memberikan IntelliSense penuh. Semua contoh di atas memakai cara ini.
- **JSX zero-import sungguhan** (`<Navbar />` tanpa baris import). Ini membutuhkan langkah waktu-kompilasi yang menyuntikkan impor ke setiap berkas. Rakta.js menyediakan transformer itu di dalam build server dan dev server-nya sendiri. Di framework lain, DX yang sama memerlukan plugin bundler atau Babel yang mengonsumsi keluaran `generateAutoImports`. `autoImports.d.ts` yang dihasilkan tetap memberi deklarasi tipe *global* di mana-mana, tetapi resolusi runtime harus disuntikkan oleh bundler Anda.

### Catatan

- Jalankan ulang generator setiap kali menambah, mengganti nama, atau menghapus berkas. Pasang juga di `postinstall`.
- Jangan pernah mengedit berkas hasil — setiap run akan menimpanya.
- Jaga `directories` hanya pada folder yang benar-benar ingin diimpor otomatis; barrel yang ramping lebih cepat dikompilasi.

---

## Dokumen Terkait

- [`mulai.md`](./mulai.md) - Panduan memulai aplikasi Rakta.js
- [`routing.md`](./routing.md) - Panduan routing berbasis berkas
- [`hooks.md`](./hooks.md) - Panduan kait (hooks) framework
