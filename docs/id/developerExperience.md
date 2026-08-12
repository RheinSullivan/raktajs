# Developer Experience (DX) di Rakta.js

Rakta.js dirancang dengan filosofi **Developer Experience (DX) Utama**. Setiap aspek mulai dari terminal CLI, pesan error, hingga pembaruan browser dioptimalkan untuk memberikan feedback yang super cepat, presisi, dan indah.

---

## Fast Refresh & Hot Module Replacement (HMR)

Rakta.js menyertakan mesin Fast Refresh & HMR bawaan yang aktif secara otomatis di dev server (`rakta dev` / Forge Dev Server).

### 1. Fast Refresh
- **Pengertian**: Fitur bawaan yang secara otomatis memperbarui perubahan kode di browser setiap kali Anda menyimpan (*save*) file, **tanpa menghilangkan status (*state*) komponen yang sedang berjalan**.
- **Preservasi State**: State lokal React (`useState`, `useReducer`), nilai input form, scroll position, dan status UI tetap bertahan tanpa reset saat file disimpan.
- **Auto Error Recovery**: Jika terjadi error sintaksis/runtime, Error Overlay akan muncul. Setelah file diperbaiki dan disimpan, Error Overlay otomatis tertutup dan state komponen kembali normal.

### 2. Hot Module Replacement (HMR)
- **Pengertian**: Teknologi dasar di balik layar (yang berjalan di atas WebSocket channel `/__livereload`) untuk menukar modul JavaScript/CSS secara langsung di browser tanpa melakukan `window.location.reload()`.

---

## Alat Developer Experience Terpadu

### 1. Rakta Dev Terminal
Terminal bawaan yang menampilkan log HTTP request, estimasi latensi, status HMR, dan status environment dalam format visual yang bersih.

```
  ⩛ Rakta.js 1.1.4 (CherbonsEngine)

    Local:        http://localhost:3000
    Network:      http://192.168.1.5:3000
    Environments: .env.local
    Mode:         development

  PASS Ready in 240ms

  PASS GET  /                  200  12ms
  PASS GET  /api/stats         200   8ms
```

### 2. Rakta Dev Indicator
Floating widget interaktif di pojok kanan bawah browser (hanya pada mode development) yang menampilkan versi Rakta.js, info bundler, serta indicator status HMR.

### 3. Error Overlay & Stack Mapping
Jika terjadi error runtime saat pengkodean, Rakta.js menampilkan Error Overlay modal yang dilengkapi dengan stack trace visual, source mapping, dan tombol reload.

### 4. Code & Bundle Inspector
Utilitas analisis bawaan untuk memeriksa dependency graph, rute aplikasi, dan estimasi ukuran bundle:

```ts
import { analyzeBundle, analyzeRoutes, createDependencyGraph } from "raktajs/developerExperience";

const graph = createDependencyGraph([
  { id: "app/page.tsx", imports: ["lib/http.ts"], routePattern: "/", size: 42 },
  { id: "lib/http.ts", size: 12 },
]);

const routes = analyzeRoutes(graph);
const bundle = analyzeBundle(graph.modules);
```
