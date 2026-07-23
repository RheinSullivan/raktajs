# Catatan dari developer utama

Buat temen-temen yang udah mau kontribusi di project ini - sebelumnya saya
selaku developer utama mengucapkan banyak terimakasih sudah mau bergabung
untuk mengembangkan framework Rakta.js. Membangun framework dari nol,
apalagi yang berakar dari identitas budaya tertentu seperti Cirebon, bukan
sesuatu yang seharusnya diselesaikan sendirian, dan setiap orang yang
datang untuk membantu membentuknya membuat project ini jadi lebih kuat.

## Apa yang ingin dicapai project ini

Rakta.js dibuat untuk memberikan developer yang sudah berpikir dalam React
dan JSX sebuah framework yang langsung terasa familiar, sambil diam-diam
meminjam ide-ide terbaik dari ekosistem yang lebih luas - routing berbasis
file yang terinspirasi dari app router modern, auto import berbasis
konvensi yang terinspirasi dari Nuxt, layer RPC type-safe yang terinspirasi
dari tRPC, state store kecil yang terinspirasi dari Zustand, dan HTTP
client berbasis fetch dengan kemudahan pakai ala Axios. Tidak satu pun
tools tersebut sedang digantikan atau dikritik di sini - Rakta.js hanya
mencoba mengemas ide-ide yang familiar ke dalam satu toolkit kecil
berbasis Bun dengan identitasnya sendiri.

## Peta dokumentasi

- [`mulai.md`](./mulai.md) - instal Rakta.js dan buat aplikasi pertama
- [`routing.md`](./routing.md) - routing berbasis file dan konvensi route
- [`layout.md`](./layout.md) - root, nested, special, grouped, dan parallel layout
- [`data.md`](./data.md) - helper cache, revalidation, prefetch, streaming, dan strategi render
- [`kernel.md`](./kernel.md) - service container, environment, dan lifecycle plugin
- [`middleware.md`](./middleware.md) - pipeline request, redirect, rewrite, dan abort
- [`authentication.md`](./authentication.md) - JWT, session, dan single-session auth fullstack
- [`cli.md`](./cli.md) - command untuk generator, pengecekan, deployment, dan diagnostics
- [`deployment.md`](./deployment.md) - deployment Vercel, Netlify, Cloudflare, Docker, dan static
- [`publishing.md`](./publishing.md) - npm provenance dan publishing lewat GitHub Actions
- [`dx.md`](./dx.md) - helper dependency graph, analisis route, dan analisis bundle
- [`plugin.md`](./plugin.md) - manifest plugin, capability, adapter resmi, dan template
- [`testing.md`](./testing.md) - helper unit, integration, component, e2e, snapshot, mock server, dan coverage
- [`performance.md`](./performance.md) - benchmark, laporan bundle, dan cache build
- [`security.md`](./security.md) - secure headers, CSP, CSRF, rate limiter, dan secrets
- [`ops.md`](./ops.md) - request context, job, queue, cron, dan event bus
- [`apiReference.md`](./apiReference.md) - subpath publik yang stabil
- [`migrationGuide.md`](./migrationGuide.md) - catatan migrasi untuk project Rakta.js awal
- [`compatibility.md`](./compatibility.md) - kebijakan kompatibilitas release
- [`docsSystem.md`](./docsSystem.md) - scanner docs Markdown dan bridge VitePress
- [`autoImport.md`](./autoImport.md) - auto import milik framework
- [`hooks.md`](./hooks.md) - hooks bernama khas Rakta untuk project tanpa auto import
- [`rpc.md`](./rpc.md) - RPC type-safe
- [`http.md`](./http.md) - HTTP client PanturaFetch
- [`store.md`](./store.md) - manajemen state
- [`seo.md`](./seo.md) - helper metadata, sitemap, dan robots
- [`templates.md`](./templates.md) - struktur project hasil generator

## Yang kami harapkan dari sebuah kontribusi

Nah, untuk temen-temen yang ingin kontribusi, tolong sertakan dokumen yang
kalian tambahkan, baik itu code sebagai contohnya, halaman dokumentasi,
atau penjelasan fundamentalnya. Pull request yang hanya bilang "udah
diperbaiki" tanpa menunjukkan apa yang diubah dan kenapa, jauh lebih sulit
untuk kami review dan merge dengan percaya diri.

Secara konkret, itu berarti:

- **Kalau menambahkan fitur**, tambahkan atau update halaman dokumentasi
  yang sesuai di `docs/en/` (dan idealnya juga `docs/id/`, terjemahan
  kasar pun sudah sangat membantu).
- **Kalau memperbaiki bug**, jelaskan bug-nya dan perbaikannya di
  deskripsi pull request, dan tambahkan pengecekan regresi kalau
  memungkinkan.
- **Kalau menambahkan example atau template**, pastikan benar-benar bisa
  jalan - `bun install && bun run dev` harus berhasil tanpa langkah
  manual tambahan.

## Cara menambahkan example

Example dan template ada di `templates/`. Jaga konsistensi struktur output
template baru dengan struktur `frontendOnly` dan `fullstack` yang sudah
ada, sesuai dokumentasi di `docs/id/templates.md`. Kalau example butuh
data contoh, buat tetap mandiri - tidak perlu layanan eksternal untuk
melihatnya berjalan.

## Cara menambahkan dokumentasi

Halaman dokumentasi menggunakan nama file camelCase (`mulai.md`, bukan
`mulai-cepat.md`), dan berada di `docs/en/` untuk Bahasa Inggris dan
`docs/id/` untuk Bahasa Indonesia. Setiap halaman sebaiknya punya:
overview, kapan fitur ini dipakai, catatan arsitektur singkat kalau
relevan, contoh kode yang benar-benar jalan, kesalahan umum, dan tautan ke
halaman terkait. Tulis untuk seseorang yang belum pernah pakai Rakta.js -
anggap dia paham React, tapi belum familiar dengan nama-nama layer khas
kita (MendungWeave, ShrimpStep, TrusmiFrame, CarubanWire, PanturaFetch,
dan seterusnya).

## Cara menambahkan kode

Ikuti aturan TypeScript yang strict di `CONTRIBUTING.md` - tidak ada
`any`, tidak ada `null`, tidak ada error yang dibungkam, nama yang jelas,
dan return type eksplisit di setiap fungsi yang di-export. Kalau kalian
menyentuh `packages/create-rakta/src/generator.ts`, baca dulu bagian
"Generator safety" di `CONTRIBUTING.md` - file itu besar memang karena
desain, dan jangan sampai mengecil tanpa sengaja.

## Cara menambahkan test

Test yang spesifik untuk satu package atau fitur sebaiknya ditaruh
bersebelahan dengan kode yang diuji, dengan suffix `*.test.ts`, dan
dijalankan lewat `bun test`. Tolong jangan membuat file workspace test
kedua di root - hanya ada satu, `workspace.test.ts`, di root repository.

## Menghindari import yang rusak

Sebelum membuka pull request, jalankan:

```bash
bun run typecheck
bun run build
```

Keduanya harus selesai tanpa error. Kalau kalian menambahkan module baru,
pastikan sudah di-export dari barrel package yang benar (misalnya, helper
SEO baru harus bisa diakses lewat `rakta/seo`, bukan hanya dari path
internal yang dalam).

## Menulis penjelasan yang mudah dipahami pemula

Aturan sederhananya: kalau kalian harus mencari sesuatu untuk menulis
kode, tuliskan apa yang kalian pelajari di dokumentasi, dengan bahasa yang
sederhana. Orang yang membacanya nanti bisa jadi pemula total, mahasiswa,
atau developer berpengalaman yang sedang mengevaluasi Rakta.js untuk
project nyata - tulis untuk ketiganya.

## Mencantumkan GitHub profile atau portfolio

Jangan lupa juga temen-temen sertakan GitHub Profile kalian atau Web
Portofolio kalian di deskripsi pull request, sebagai tanda bukti
kontribusi kalian di project ini. Kami dengan senang hati akan mengkredit
orang-orang yang membantu membangun Rakta.js, di `CHANGELOG.md` dan di
catatan rilis.

## Commit message

Gunakan gaya yang jelas dan terstruktur:

```bash
git commit -m "feat(router): dukung segmen catch-all opsional"
git commit -m "fix(http): hormati timeout custom di retry PanturaFetch"
git commit -m "docs(id): terjemahkan panduan routing"
```

## Membuka pull request

1. Fork repository, buat branch dari `main`.
2. Jaga perubahan tetap fokus - satu concern per pull request kalau bisa.
3. Jalankan validasi lengkap (`bun run typecheck`, `bun run build`,
   `bun test`, `bun run lint`, `bun run check:workspace`).
4. Isi template pull request secara lengkap.
5. Siap untuk satu atau dua ronde review - itu bagian normal dan sehat
   dari membangun sesuatu yang akan dipakai orang lain.

## Melaporkan issue

Gunakan template issue di `.github/ISSUE_TEMPLATE/`. Semakin spesifik
reproduksinya, semakin cepat kami bisa membantu.

## Menjaga clean code dan TypeScript yang strict

Tolong hindari `any`, `null` sebagai domain value, unsafe cast, dan nama
variabel yang tidak jelas seperti `data`, `res`, atau `temp`.
`CONTRIBUTING.md` punya daftar lengkap dengan contoh pola yang benar untuk
menangani optional property di bawah `exactOptionalPropertyTypes`.

## Mendokumentasikan fitur baru

Kalau kalian memperkenalkan kapabilitas baru, beri tempat di tabel fitur
di `README.md` root, dan tulis halaman dokumentasi lengkap untuknya -
sekecil apapun, itu lebih baik daripada tidak ada sama sekali. Kalau
fitur tersebut layak punya nama identitas Rakta.js sendiri seperti
MendungWeave, ShrimpStep, atau CarubanWire, usulkan di deskripsi pull
request supaya kita bisa sepakat soal penamaan sebelum merge.

## Penutup

Sekali lagi, terimakasih banyak sudah mau meluangkan waktu dan
kemampuannya untuk membantu project ini bertumbuh. Seberapapun ukuran
kontribusi kalian - satu perbaikan typo atau satu module baru - itu
berarti, dan sangat dihargai.

Rhein Sullivan
Leader dari Vyagra Nexus™ <3
