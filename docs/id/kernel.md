# Kernel dan sistem plugin

## Gambaran umum

Kernel Rakta adalah fondasi production untuk service framework, akses
environment, registrasi fitur, dan lifecycle plugin. Kernel tersedia dari
`rakta/kernel` dan juga diekspor dari `rakta`.

Gunakan kernel ketika project atau integrasi membutuhkan service bersama,
konfigurasi yang type-safe, proses startup, proses teardown, atau tempat
yang rapi untuk mendaftarkan kapabilitas framework.

## Instalasi

Kernel sudah termasuk di package inti:

```bash
bun add raktajs
```

## Mulai cepat

```ts
import { createRaktaKernel } from "rakta/kernel";

const kernel = createRaktaKernel({
  environmentName: "production",
  env: {
    API_URL: "https://api.example.com",
  },
});

kernel.services.singleton("apiUrl", () =>
  kernel.environment.require("API_URL")
);

await kernel.start();

const apiUrl = await kernel.services.resolve<string>("apiUrl");
```

## Arsitektur project

Kernel sengaja dibuat kecil:

| Layer | Tanggung jawab |
| --- | --- |
| Service container | Mendaftarkan value dan factory dengan lifetime singleton atau transient |
| Environment | Membaca `RAKTA_ENV`, `NODE_ENV`, dan record environment eksplisit |
| Feature registry | Membantu plugin mengumumkan kapabilitas framework |
| Lifecycle plugin | Menjalankan hook `configure`, `start`, `ready`, dan `shutdown` |

## Sistem plugin

Plugin adalah object TypeScript biasa. Plugin bisa mendaftarkan service,
mengekspos fitur, dan menjalankan pekerjaan startup atau shutdown.

```ts
import type { RaktaPlugin } from "rakta/kernel";

export const authPlugin: RaktaPlugin = {
  name: "auth",
  configure(context) {
    context.registerFeature({
      name: "auth",
      options: {
        strategy: "session",
      },
    });
  },
  start(context) {
    context.services.value("auth.ready", true);
  },
};
```

Daftarkan plugin sebelum kernel berjalan:

```ts
const kernel = createRaktaKernel({
  plugins: [authPlugin],
});

await kernel.start();
```

## Environment variable

Gunakan helper environment daripada membaca global runtime secara langsung.
Dengan begitu test, Bun, tooling yang kompatibel dengan Node, dan runtime
bergaya edge tetap lebih mudah diprediksi.

```ts
const environment = kernel.environment;

const port = environment.number("PORT", 3000);
const debug = environment.boolean("DEBUG", false);
const databaseUrl = environment.require("DATABASE_URL");
```

## Referensi API

| API | Deskripsi |
| --- | --- |
| `createRaktaKernel(options)` | Membuat kernel dengan service, environment, plugin, dan fitur |
| `createServiceContainer()` | Membuat service container type-safe secara mandiri |
| `createRaktaEnvironment(name, env)` | Membuat pembaca environment secara mandiri |
| `kernel.use(plugin)` | Mendaftarkan plugin sebelum startup |
| `kernel.start()` | Menjalankan hook `configure`, `start`, lalu `ready` |
| `kernel.shutdown()` | Menjalankan hook shutdown dengan urutan plugin terbalik |
| `kernel.snapshot()` | Mengembalikan diagnostik runtime read-only |
| `services.singleton(key, factory)` | Mendaftarkan factory service yang di-cache |
| `services.value(key, value)` | Mendaftarkan service berupa nilai tetap |
| `services.resolve(key)` | Mengambil service atau melempar error yang jelas |
| `services.tryResolve(key)` | Mengambil service atau mengembalikan `undefined` |

## Testing

Kirim object `env` eksplisit di test agar test suite tidak bergantung pada
environment mesin lokal.

```ts
const kernel = createRaktaKernel({
  environmentName: "test",
  env: {
    FEATURE_ON: "true",
  },
});
```

## Praktik terbaik

- Daftarkan plugin sebelum `kernel.start()`.
- Gunakan service key berupa string stabil atau symbol yang diekspor.
- Simpan secret di layer environment, bukan di source code plugin.
- Gunakan `shutdown()` untuk koneksi, timer, dan subscription yang terbuka.
- Pilih plugin kecil yang memiliki satu kapabilitas jelas.

## Troubleshooting

| Masalah | Perbaikan |
| --- | --- |
| Service belum terdaftar | Daftarkan sebelum resolve atau gunakan `tryResolve()` |
| Error plugin duplikat | Pastikan nama plugin unik |
| Error circular dependency | Pecah salah satu service menjadi factory atau kirim value eksplisit |
| Environment variable hilang | Gunakan `environment.get()` untuk nilai opsional atau definisikan variabelnya |

## Dokumen terkait

- [`mulai.md`](./mulai.md)
- [`templates.md`](./templates.md)
- [`autoImport.md`](./autoImport.md)
- [`routing.md`](./routing.md)
