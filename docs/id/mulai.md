# Memulai Aplikasi - Panduan Cepat

## Gambaran Umum

Halaman ini akan membimbing Anda membuat dan menjalankan aplikasi Rakta.js dari awal hanya dalam beberapa menit menggunakan perkakas pembuat resmi, `create-rakta-app`.

## Kapan Membaca Panduan Ini

Baca panduan ini apabila Anda baru pertama kali menggunakan Rakta.js. Apabila Anda sudah memiliki proyek dan ingin memahami struktur foldernya, silakan membaca [`templates.md`](./templates.md).

## Prasyarat System

- [Bun](https://bun.sh) versi 1.3 atau yang lebih baru.
- Node.js tidak diperlukan - Rakta.js berjalan sepenuhnya dan optimal di atas Bun.

## Membuat Proyek Baru

Jalankan perintah berikut pada terminal Anda:

```bash
bun create rakta-app@latest proyek-saya
```

Anda akan diajukan beberapa pertanyaan interaktif:
1. **Nama proyek** (Project Name)
2. **Mode proyek** - **Frontend saja** (Frontend only) atau **Fullstack**
3. **Kerangka kerja CSS** - Tailwind CSS v4 (baku), Bootstrap, SASS, atau Tanpa CSS
4. **Mode rendering** - CSR, SSR, SSG, CSG, SPA, atau Hybrid
5. *(Khusus Fullstack)* **Kerangka kerja Backend** - Gaman.js, Express.js, Nest.js, atau Adonis.js
6. *(Khusus Fullstack)* **Basis Data** - PostgreSQL, MySQL, MongoDB, Firebase, SQLite, MariaDB, Redis, PlanetScale, atau Turso

Anda juga dapat menggunakan manajer paket lainnya:
```bash
bunx create-rakta-app@latest proyek-saya
npm create rakta-app@latest proyek-saya
pnpm create rakta-app@latest proyek-saya
```

## Menjalankan Server Pengembangan

```bash
cd proyek-saya
bun install
bun run dev
```

Buka peramban (browser) dan akses `http://localhost:3000`. Proyek awal mode frontend akan menampilkan halaman selamat datang Rakta.js lengkap dengan gim interaktif **ShrimpRun** - tekan tombol Spasi atau ketuk layar untuk melompat!

## Membuat Rute Pertama Anda

Setiap berkas yang diletakkan di `app/<jalur>/page.tsx` secara otomatis menjadi rute halaman. Buatlah berkas `app/about/page.tsx`:

```tsx
export default function HalamanTentang() {
  return (
    <main>
      <h1>Tentang Saya</h1>
      <p>Proyek ini dibuat menggunakan Rakta.js tanpa impor manual!</p>
      <click to="/">Kembali ke Beranda</click>
    </main>
  );
}
```

Buka rute `/about` pada peramban - rute langsung aktif tanpa perlu mendaftarkannya secara manual. Fitur ini ditenagai oleh **MendungWeave**, sistem routing berbasis berkas Rakta.js. Lihat [`routing.md`](./routing.md) untuk panduan lengkapnya.

## Menggunakan Komponen Tanpa Impor (Auto Import)

Buat komponen di `components/Navbar.tsx`:

```tsx
export default function Navbar() {
  return (
    <nav className="p-4 bg-slate-900 text-white flex justify-between">
      <span className="font-bold">Portofolio Saya</span>
      <click to="/about">Tentang</click>
    </nav>
  );
}
```

Gunakan `<Navbar />` langsung di dalam `app/page.tsx` tanpa menambahkan baris `import Navbar from ...`:

```tsx
export default function HalamanBeranda() {
  return (
    <main>
      <Navbar />
      <h1>Selamat Datang</h1>
    </main>
  );
}
```

## Kekeliruan Umum yang Sering Terjadi

- Menjalankan `bun dev` alih-alih `bun run dev` - skrip `package.json` membutuhkan subperintah `run`.
- Menggunakan sintaksis `npm create-rakta-app@latest` - sintaksis npm yang benar adalah `npm create rakta-app@latest` (dengan spasi).
- Mencari folder `backend/` pada mode frontend saja - mode frontend secara sengaja tidak membuat direktori backend agar proyek tetap ringan.

## Dokumen Terkait

- [`autoImport.md`](./autoImport.md) - Panduan pengimporan otomatis (Auto Import) komponen & helper
- [`routing.md`](./routing.md) - Routing berbasis berkas MendungWeave
- [`templates.md`](./templates.md) - Penjelasan struktur templat proyek
- [`backendFrameworks.md`](./backendFrameworks.md) - Pilihan backend untuk proyek fullstack