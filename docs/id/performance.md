# Performance

## Browser Render Pipeline Breakdown

Penyebab paling umum keluhan "server sudah 200 tapi UI lambat" adalah bottleneck di **browser pipeline**, bukan di server.

```mermaid
sequenceDiagram
    participant App as Application Code
    participant Browser as Browser Runtime
    participant React as React Reconciler
    participant DOM as DOM / Paint Engine

    App->>Browser: fetch() - Request dikirim (T0)
    Browser->>Browser: Network transit (T1 - T2)
    Note over Browser: Server response: 200 in 18ms (T2)
    Browser->>Browser: Receive & buffer response body (T3)
    Browser->>App: Response body parsed (T4) - JSON.parse()
    App->>React: setState() triggered (T5)
    React->>React: Component re-render & reconcile (T6)
    React->>DOM: Commit changes to DOM (T7)
    DOM->>Browser: Layout + Paint (T8)
    Note over App,DOM: Gap T3-T8 = "response done, UI lagging" zone
```

---

## Titik Bottleneck Umum

| Tahap | Penyebab | Solusi |
|---|---|---|
| T3 ke T4 | Payload JSON besar (>1MB) | Paginasi, filter di server |
| T4 ke T5 | Transform/sort mahal di client | Pindah ke server, gunakan memoize |
| T5 ke T6 | State update memicu render seluruh tree | `useMemo`, pisah context |
| T6 ke T7 | Component tree besar, tanpa virtualisasi | Virtualisasi list panjang |
| T7 ke T8 | Layout/paint berat (DOM besar, shadow) | Kurangi ukuran DOM |

---

## Pipeline Optimasi HTML Shell

```mermaid
flowchart TD
    Mulai((Mulai))
    Mulai --> HTMLShell[Generasi Shell HTML\nMesin Forge]
    HTMLShell --> JSPreload[link rel=modulepreload\nBrowser paralel fetch, parse, & kompilasi JS]
    HTMLShell --> CSSPreload[link rel=preload CSS\nStylesheet tidak memblokir render]
    HTMLShell --> CriticalCSS[Inline CSS Kritis\nIndikator loading langsung tampil tanpa blank flash]
    CriticalCSS --> MountEvent[Event rakta:mounted\nHapus overlay loading setelah commit React pertama]
    JSPreload --> Selesai((Selesai))
    CSSPreload --> Selesai
    MountEvent --> Selesai

    classDef startEnd fill:#e63946,stroke:#c1121f,color:#ffffff,font-weight:bold
    class Mulai,Selesai startEnd
```

---

## Diagnosis dengan Rakta Dev Indicator

Buka panel Performance di Dev Indicator (logo kiri bawah). Panel menampilkan:

```
Network      18ms    <- sesuai terminal
Parse         3ms
State         2ms
Render       21ms
Paint         4ms
Total        48ms
```

Jika `Response -> UI gap` di Diagnostics menunjukkan >1 detik, periksa baris **State** dan **Render**.

---

## Aplikasi Laporan/Tabel Besar

**Sisi server:**
```ts
// Selalu paginasi di level API
const { data, total } = await db.query({
  limit: req.query.limit ?? 50,
  offset: req.query.offset ?? 0,
});
```

**Sisi client:**
```ts
// useRaktaData dengan loading state
const { data, loading, error, refetch } = useRaktaData(
  (signal) => fetch("/api/laporan?page=1&limit=50", { signal }).then(r => r.json()),
  [],
  "laporan-page-1"
);
```

**Hindari merender lebih dari 500 DOM row sekaligus.** Gunakan windowing/virtualisasi untuk tabel besar.

---

## HTTP Client Performance

Peningkatan `PanturaFetch` (v1.0.7+):

- **Default timeout**: 10 detik (sebelumnya 30 detik) - API lambat terdeteksi lebih cepat
- **keepalive: true** - reuse koneksi TCP, eliminasi overhead handshake pada request sekuensial ke host yang sama
- **Dukungan retry**: `{ retries: 2 }` untuk network error sementara

```ts
const http = createRaktaHttp({
  baseUrl: "http://localhost:4000",
  timeout: 5_000,
});

// Dengan retry
const data = await http.get<Laporan>("/api/laporan", { retries: 2 });
```

---

## Middleware Timing

`createMiddlewareStack` kini melacak elapsed time per-middleware. Total waktu middleware dilampirkan sebagai header `X-Rakta-Middleware-Ms` pada response di development untuk diagnostik.

---

## Benchmark Performance

Semua pengukuran dari development lokal di Windows 11, Bun 1.3.11, React 19.

| Metrik | Sebelum v1.0.7 | v1.0.7 |
|---|---|---|
| Time to first byte (dev) | ~50ms | ~50ms |
| Penemuan JS bundle | Setelah parse HTML | Saat parse HTML (modulepreload) |
| Default timeout HTTP client | 30 000ms | 10 000ms |
| TCP keepalive | Tidak | Ya |
| Loading overlay | Tidak ada | Langsung via inline CSS |

> Benchmark ini dari environment development. Performance production bergantung pada deployment target, spesifikasi server, dan kode aplikasi.
