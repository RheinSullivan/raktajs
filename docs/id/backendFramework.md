# Backend framework

## Overview

Di mode fullstack, `create-rakta-app` menghasilkan struktur folder
`backend/` yang berbeda tergantung framework yang dipilih — tidak ada
satu bentuk generik yang dipaksakan ke semua empat pilihan.

## Kapan dipakai

Baca ini setelah memilih backend framework saat menjalankan
`create-rakta-app`, atau sebelum menambahkan dukungan backend framework
baru ke generator.

## Gaman.js

```txt
backend/
├─ src/
│  ├─ routes/
│  ├─ controllers/
│  ├─ services/
│  ├─ middlewares/
│  └─ app.ts
├─ package.json
└─ tsconfig.json
```

`app.ts` adalah entry point yang menghubungkan route ke controller. Ini
adalah opsi paling ringan dari keempatnya dan cocok secara natural dengan
CarubanWire kalau kalian ingin RPC typed dibanding route REST biasa.

## Express.js

```txt
backend/
├─ src/
│  ├─ routes/
│  ├─ controllers/
│  ├─ services/
│  ├─ middlewares/
│  └─ server.ts
├─ package.json
└─ tsconfig.json
```

Bentuk berlapis yang sama seperti Gaman.js, tapi entry point-nya bernama
`server.ts` sesuai konvensi komunitas Express, dan `package.json` hasil
generate bergantung pada `express` beserta tipenya.

## Nest.js

```txt
backend/
├─ src/
│  ├─ app.module.ts
│  ├─ main.ts
│  ├─ modules/
│  └─ common/
├─ nest-cli.json
├─ package.json
└─ tsconfig.json
```

Nest.js punya konvensinya sendiri — `AppModule` di root, file bootstrap
`main.ts`, `modules/` untuk fitur, dan `common/` untuk decorator, guard,
dan pipe yang dipakai bersama, plus `nest-cli.json` yang dibutuhkan Nest
CLI itu sendiri.

## Adonis.js

```txt
backend/
├─ app/
│  ├─ controllers/
│  ├─ middleware/
│  └─ services/
├─ start/
├─ config/
├─ package.json
└─ tsconfig.json
```

Adonis.js mengikuti layout khasnya sendiri — `app/` untuk kode aplikasi,
`start/` untuk registrasi route/middleware saat boot, dan `config/`
untuk konfigurasi framework, sesuai yang sudah diharapkan developer
Adonis.js.

## Kesalahan umum

- Mengasumsikan keempat backend berbagi `src/app.ts` sebagai entry point
  — hanya Gaman.js yang begitu; Express.js memakai `server.ts`, Nest.js
  memakai `main.ts`, dan Adonis.js tidak punya satu file entry dalam arti
  yang sama.
- Lupa bahwa Nest.js butuh `nest-cli.json` untuk memakai tooling Nest CLI
  sendiri (`nest build`, `nest start`) berdampingan dengan atau sebagai
  pengganti pipeline build Bun.
- Menghubungkan handler HTTP CarubanWire ke signature middleware
  spesifik-framework secara salah — setiap framework punya tipe
  request/response sendiri, jadi kode adapter-nya berbeda meskipun
  definisi router-nya sendiri tidak berubah.

## Dokumen terkait

- [`templates.md`](./templates.md)
- [`rpc.md`](./rpc.md)