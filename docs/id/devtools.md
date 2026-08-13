# Rakta DevTools

Rakta DevTools adalah alat browser khusus development yang muncul saat menjalankan Forge dev server Rakta.js. Production build tidak memasang indicator, tidak menyertakan modul browser DevTools, dan tidak membuka endpoint kontrol DevTools.

## Dev Indicator

Rakta Dev Indicator adalah tombol floating kecil yang memakai logo asli `public/Rakta.js.svg`. Tekan tombol dengan mouse, `Enter`, atau `Space` untuk membuka Rakta DevTools. Tekan `Escape` atau klik area luar panel untuk menutupnya.

Panel menampilkan:

- pathname route saat ini
- status route berdasarkan render mode Rakta yang aktif
- bundler aktif, saat ini `Bun.build (CherbonsEngine)`
- Route Info
- Preferences
- Restart Dev Server
- Reset Bundler Cache

## Route Info

Route Info berasal dari Forge route manifest dan konfigurasi render yang sedang aktif. Browser meminta metadata ke development server melalui endpoint route DevTools; browser tidak melakukan scan filesystem.

Panel menampilkan matched pattern, tipe route, sumber render mode, file sumber route, file layout, file page, segment route, dan nama parameter dinamis.

## Preferences

Preferences disimpan di browser storage untuk browser development lokal.

Preferences yang didukung:

- Theme: System, Light, Dark
- Position: Bottom Left, Bottom Right, Top Left, Top Right
- Size: Small, Medium, Large
- Hide DevTools shortcut

Shortcut default adalah `Alt+Shift+D`. Recording shortcut membutuhkan minimal satu modifier key, menghindari shortcut umum milik browser, dan tidak aktif saat developer sedang mengetik di input, textarea, select, atau editable content.

Gunakan "Hide DevTools for this session" untuk menyembunyikan indicator sampai sesi browser development dimulai ulang. Ini tidak mengubah konfigurasi project.

## Konfigurasi Project

Nonaktifkan Rakta DevTools untuk sebuah project dengan:

```ts
import { defineConfig } from "raktajs/config";

export default defineConfig({
  devTools: false,
});
```

Saat dinonaktifkan, Forge dev server tidak memasang browser indicator dan tidak membuka endpoint kontrol DevTools.

## Perintah Dev Server

"Restart Dev Server" meminta Forge development server aktif untuk membuat ulang route manifest, membangun ulang client bundle, dan memberi tahu browser yang terhubung melalui channel live-reload yang sudah ada.

"Reset Bundler Cache" hanya menghapus cache generated `.rakta/dev`, lalu membangun ulang client bundle. Perintah ini tidak menghapus source files, `node_modules`, `.git`, atau konfigurasi project.

Kedua perintah mencegah request duplikat selama perintah sebelumnya masih berjalan dan menampilkan feedback berhasil atau gagal di panel.

## Rakta Dev Terminal

Rakta Dev Terminal adalah output sisi server yang dicetak oleh `bun run dev`. Output ini menampilkan versi Rakta.js, Local URL, LAN URL jika tersedia, nama file environment yang terdeteksi, startup time, dan timing request.
