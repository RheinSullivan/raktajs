# Dev Tools

Rakta.js menyertakan dua alat development-only: **Rakta Dev Indicator** (browser) dan **Rakta Dev Terminal** (server). Keduanya tidak disertakan dalam production build secara otomatis.

---

## Rakta Dev Indicator

Panel floating yang diinjeksikan ke browser saat mode development. Menggunakan logo SVG Rakta.js yang asli.

**Fitur:**

- Tombol circular floating (kiri bawah) dengan logo Rakta.js
- Klik untuk membuka panel: route path, render mode, bundler
- Tab Performance dengan pengukuran nyata dari browser Performance API
- Tab Diagnostics yang menyoroti kasus "response sudah datang tapi UI lambat"
- Accessible dengan keyboard: `Enter`/`Space` untuk buka, `Escape` untuk tutup
- Menghormati `prefers-reduced-motion`
- Zero production cost - dijaga oleh `process.env.NODE_ENV === "development"`

**Yang diukur:**

```
Network    Waktu dari fetch start ke response end (Navigation Timing API)
Parse      Waktu pemrosesan DOM setelah response
State      Waktu update state Rakta (performance.mark)
Render     Waktu render React (performance.mark)
Paint      First Contentful Paint (FCP)
Total      Durasi load event penuh
```

**Mendiagnosis masalah "response selesai tapi UI lambat":**

Panel Diagnostics menghitung `Response → UI gap = FCP - networkMs`. Jika angka ini besar (>1 detik), bottleneck ada di pipeline browser, bukan server. Bandingkan dengan timing terminal server untuk isolasi tahapnya.

**Eksklusi production:**

```ts
// Di generated client entry - hanya berjalan di development
if (process.env.NODE_ENV === "development") {
  const { mountDevIndicator } = await import("./devIndicator");
  mountDevIndicator({ version, logoDataUrl, bundler });
}
```

---

## Rakta Dev Terminal

Output yang dicetak ke terminal server saat menjalankan `bun run dev`.

**Output startup:**

```
  ⩛ Rakta.js 1.1.2 (CherbonsEngine)

  Local:          http://localhost:3000
  Network:        http://192.168.1.8:3000
  Environments:   .env.local
  Mode:           development

  ✓ Ready in 421ms
```

**Request logging:**

```
  ✓ GET    /                              200  24ms
  ✓ GET    /api/report                    200  17ms
  ✓ POST   /api/report                    201  31ms
  ⚠ GET    /api/report                    200  1.4s  [slow]
  ✗ GET    /missing                       404   2ms
```

**Fitur:**

- Local URL nyata dari port server (bukan hardcode)
- IP Network LAN terdeteksi dari interface jaringan aktif (skip Docker, WSL, VPN)
- Nama file environment terdeteksi - nilai tidak pernah ditampilkan
- Ready time diukur dari start server sampai koneksi pertama diterima
- Timing request: total ms sisi server per request
- Flag slow request: threshold dapat dikonfigurasi (default 1000ms)
- Environment variable `NO_COLOR` dihormati

**Simbol terminal `⩛`:**

Digunakan sebagai glyph fallback yang merepresentasikan geometri shield/trident Vyagra Nexus. Bekerja di Windows Terminal, PowerShell, Git Bash, Linux, macOS. Tidak membutuhkan Nerd Font.

> Jika Vyagra Nexus mendefinisikan glyph terminal resmi, update `RAKTA_TERMINAL_GLYPH` di `packages/rakta/src/developerExperience/terminal.ts`.

---

## Status

| Fitur | Status |
|---|---|
| Rakta Dev Terminal | Experimental |
| Rakta Dev Indicator | Experimental |
| Error Overlay | Planned |
| Status HMR di indicator | Planned |
| Request ID cross-reference | Planned |
