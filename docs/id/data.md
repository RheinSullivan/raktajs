# Pengambilan Data (Data Fetching)

## Gambaran Umum

Modul `rakta/data` menyediakan templat cache data ringan, kontrak strategi data rute, serta fungsi pembantu untuk mengidentifikasi rute ISR, streaming, dan prefetch. Primitif ini digunakan oleh mesin build Forge, runtime Tide, dan renderer kustom untuk menentukan bagaimana setiap rute diambil, disimpan di cache, dan dirender ulang.

## Kapan Menggunakannya

Gunakan modul ini ketika Anda membutuhkan:
- Cache berlingkup permintaan (request-scoped) yang menduplikasi panggilan paralel ke pemuat yang sama.
- Anotasi strategi rendering per rute (server vs. client, prerender vs. dynamic, streaming, prefetch).
- Logika ISR / revalidasi yang menentukan apakah halaman dalam cache sudah kadaluwarsa.

## API Cache

`createDataCache()` mengembalikan instans cache untuk satu siklus hidup permintaan. Entri disimpan dengan kata kunci string dan dapat dibatalkan berdasarkan tag.

```ts
import { createDataCache } from "raktajs/data";

const cache = createDataCache();

// Simpan hasil pemuat ke dalam cache selama 60 detik dengan tag "cms"
const posts = await cache.cache("cms:posts", () => fetchPostsFromDB(), {
  ttl: 60_000,
  tags: ["cms"],
});

// Batalkan semua cache dengan tag "cms"
cache.revalidate("cms");

// Batalkan kunci tunggal
cache.revalidate("cms:posts");
```

### Opsi Cache

| Opsi | Tipe | Default | Deskripsi |
| --- | --- | --- | --- |
| `ttl` | `number` | `0` (tidak pernah kadaluwarsa) | Masa berlaku dalam milidetik |
| `tags` | `string[]` | `[]` | Tag untuk pembatalan kelompok |

## Strategi Data Rute

`defineRouteDataStrategy` mengelompokkan rute dengan strategi rendering dan kontrak datanya:

```ts
import { defineRouteDataStrategy, isIncrementalRoute, shouldStreamRoute, shouldPrefetchRoute } from "raktajs/data";

const dashboardStrategy = defineRouteDataStrategy({
  routePattern: "/dashboard",
  runtime: "server",     // "server" | "client" | "edge"
  prerender: false,       // true = SSG / ISR saat build
  stream: true,           // true = aktifkan respon streaming
  prefetch: true,         // true = prefetch saat hover
  revalidate: 60,         // interval revalidasi ISR dalam detik
});

const blogStrategy = defineRouteDataStrategy({
  routePattern: "/blog/:slug",
  runtime: "server",
  prerender: true,        // pra-render saat build
  stream: false,
  prefetch: true,
  revalidate: 3600,       // buat ulang setiap jam
});

// Fungsi Pengecekan
isIncrementalRoute(dashboardStrategy); // false - prerender bernilai false
isIncrementalRoute(blogStrategy);      // true  - prerender + revalidate
shouldStreamRoute(dashboardStrategy);  // true
shouldPrefetchRoute(dashboardStrategy); // true
```

## Kesalahan Umum

- Berbagi instans cache di seluruh permintaan dalam handler server - setiap permintaan harus membuat instans `createDataCache()` tersendiri.
- Mengatur `revalidate` tanpa mengatur `prerender: true` - ISR hanya berlaku untuk rute yang dipra-render.
- Menggunakan `stream: true` pada rute dengan kueri basis data yang lambat tanpa pembatas `<Suspense>`.

## Dokumentasi Terkait

- [`routing.md`](./routing.md) - routing berbasis berkas MendungWeave
- [`layout.md`](./layout.md) - sistem layout dan status pemuatan
- [`rpc.md`](./rpc.md) - panggilan API bertipe presisi
