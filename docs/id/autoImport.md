# Auto import — TrusmiThread

## Overview

**TrusmiThread** memindai folder `app/`, `components/`, dan `lib/` di
project kalian, lalu menulis satu file barrel hasil generate,
`.rakta/auto-imports.ts`, yang me-re-export semua yang ditemukannya.

## Kapan dipakai

Jalankan setiap kali kalian menambah, mengganti nama, atau menghapus
komponen atau utility, dan ingin satu permukaan import untuk
me-re-export, dibanding menulis relative import path secara manual di
semua tempat.

## Perilaku saat ini (tolong dibaca sebelum mengandalkan ini)

TrusmiThread saat ini adalah **file barrel hasil generate**, bukan
transform di level compiler. Ia menulis statement `export` sungguhan ke
`.rakta/auto-imports.ts` — kalian tetap perlu `import` dari file hasil
generate tersebut (atau dari module aslinya) di file yang memakai
simbolnya. Saat ini belum ada build step yang mendeteksi
`<ShrimpRunGame />` di JSX dan menyuntikkan import secara otomatis tanpa
statement `import` apapun di source kalian.

Kalau template starter kalian terlihat memakai komponen tanpa `import`
yang terlihat, periksa apakah file tersebut sebenarnya sudah punya
import-nya, atau apakah ia mengimpor dari `.rakta/auto-imports.ts`. Kami
sengaja belum mendokumentasikan pengalaman zero-import yang benar-benar
implisit sampai transform compiler tersebut benar-benar ada — halaman ini
akan diperbarui begitu itu tersedia.

## Arsitektur

Scanner menyusuri folder yang dikonfigurasi, melewati `node_modules`,
`.git`, `dist`, `.next`, `coverage`, dan `.rakta` itu sendiri, mengumpulkan
setiap named dan default export, lalu menuliskannya ke file hasil
generate dengan aliasing yang aman dari duplikat. Menjalankannya bersifat
idempotent — dijalankan dua kali berturut-turut menghasilkan output yang
sama.

## Contoh kode

```bash
bun rakta imports:generate
```

```ts
// .rakta/auto-imports.ts (hasil generate — jangan edit manual)
export { Click } from "../app/components/clickButton";
export { useCounterStore } from "../lib/stores/counterStore";
```

```ts
// di mana saja di aplikasi kalian
import { useCounterStore } from "../../.rakta/auto-imports";
```

## Kesalahan umum

- Mengedit `.rakta/auto-imports.ts` secara manual — file ini di-generate
  ulang dan perubahan kalian akan hilang.
- Lupa menjalankan ulang `bun rakta imports:generate` setelah menambah
  simbol export baru, lalu bingung kenapa simbol itu "tidak ada" di file
  hasil generate.
- Mengasumsikan pemakaian JSX saja sudah memicu import — lihat "Perilaku
  saat ini" di atas.

## Dokumen terkait

- [`templates.md`](./templates.md) — bagaimana aplikasi hasil generate menghubungkan `.rakta/`