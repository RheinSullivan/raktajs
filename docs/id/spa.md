# Mode Single Page Application (SPA) di Rakta.js

Single Page Application (SPA) adalah mode rendering resmi tingkat pertama (first-class) di Rakta.js.

---

## Arsitektur Lifecycle SPA & Navigasi Klien

```mermaid
flowchart TD
    Mulai((Mulai))
    Mulai --> HTMLShell[Shell HTML Statis\nTitik Mount #rakta-root]
    HTMLShell --> AppMount[Mount RaktaAppShell\nHidrasi React / Inisialisasi CSR]
    AppMount --> AutoLoad[Pemuat Global\nAuto-Import & Aset]
    AutoLoad --> UserAction[Aksi Pengguna\nKlik link / panggil useNavigation]
    UserAction --> RouteGuard{Pemeriksaan\nGuard Rute?}

    RouteGuard -->|Diblokir| Redirect[Redirect ke Auth / Login]
    RouteGuard -->|Diizinkan| ChunkLoad[Impor Malas Chunk\nRute Dinamis]

    Redirect --> Selesai((Selesai))

    ChunkLoad --> ScrollRestore[Pemulihan Posisi Scroll\n& Preservasi State Input]
    ScrollRestore --> ReactRender[Render Klien React\n& Sinkronisasi Fast Refresh]
    ReactRender --> SplashDismiss[Hapus Splash Screen\nEvent rakta:mounted]
    SplashDismiss --> PageReady[Halaman Siap\nInteraktif Penuh]
    PageReady --> UserAction

    classDef startEnd fill:#e63946,stroke:#c1121f,color:#ffffff,font-weight:bold
    class Mulai,Selesai startEnd
```

---

## Fitur Utama Mode SPA

- Navigasi instan client-side menggunakan `<click to="...">` atau `useNavigation()`
- Code splitting otomatis dan route lazy loading
- Pemulihan posisi Scroll bawaan (`<ScrollRestoration />`)
- Proteksi Halaman & Route Guards (`useRouteGuard()`)
- Penanganan Error SPA (`<SpaErrorBoundary />`)

---

## Mengaktifkan Mode SPA

Di `rakta.config.ts`:

```ts
import { defineConfig } from "raktajs/config";

export default defineConfig({
  mode: "spa",
  spa: true,
  autoImport: {
    enabled: true,
  },
});
```

Flag CLI:

```bash
rakta create aplikasi-saya --spa
```

---

## Contoh Proteksi Rute (Route Guard)

```tsx
import { useRouteGuard } from "raktajs/spa";

export default function DashboardTerproteksi() {
  useRouteGuard(({ pathname }) => {
    const terautentikasi = Boolean(localStorage.getItem("token"));
    if (!terautentikasi) {
      return "/login";
    }
    return true;
  });

  return <div>Selamat Datang di Cockpit Terproteksi</div>;
}
```
