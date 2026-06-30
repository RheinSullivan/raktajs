# RPC — CarubanWire

## Overview

**CarubanWire** adalah layer RPC type-safe di Rakta.js, terinspirasi dari
tRPC tapi diimplementasikan secara native untuk Rakta.js tanpa bergantung
padanya. Kalian mendefinisikan procedure sekali di server; client
mendapat inferensi tipe penuh tanpa proses code generation.

## Kapan dipakai

Pakai CarubanWire kalau kalian ingin panggilan fungsi yang typed antara
frontend dan backend, dibanding menulis manual panggilan `fetch` dan
mengetik response secara manual. Untuk REST API yang tidak typed atau
milik pihak ketiga, pakai [PanturaFetch](./http.md) saja.

## Arsitektur

- **Router** adalah object biasa yang nilainya adalah procedure yang
  dibuat dengan `publicProcedure`.
- **Procedure** dibangun secara fluent: `.input(schema)` melekatkan
  validator Rakta Schema yang opsional, lalu `.query(handler)` atau
  `.mutation(handler)` menyelesaikannya.
- **Client**, dibuat dengan `createRaktaClient<AppRouter>()`, adalah
  sebuah `Proxy` — memanggil `client.namaProcedure.query(input)` mengirim
  request yang typed dan mengembalikan response yang typed, sepenuhnya
  diinferensi dari tipe router server.
- Error muncul sebagai `RaktaRpcError`, membawa `code` dan `details`
  opsional untuk kegagalan validasi.

## Contoh kode

Server:
```ts
// backend/src/rpc/router.ts
import { publicProcedure } from "rakta/rpc";
import { object, string } from "rakta/schema";

export const appRouter = {
  greet: publicProcedure
    .input(object({ name: string().min(1) }))
    .query(async ({ input }) => ({ message: `Halo, ${input.name}!` })),
};

export type AppRouter = typeof appRouter;
```

Client:
```ts
// frontend/lib/rpc.ts
import { createRaktaClient } from "rakta/rpc";
import type { AppRouter } from "../../backend/src/rpc/router";

export const rpc = createRaktaClient<AppRouter>({
  baseUrl: "http://localhost:4000/rpc",
});

const result = await rpc.greet.query({ name: "Rakta" });
// result.message: string — sudah typed, tanpa anotasi manual
```

## Kesalahan umum

- Lupa `await` di `.query()` / `.mutate()` — keduanya mengembalikan
  `Promise`.
- Membagikan tipe router dengan re-export seluruh module backend ke
  bundle frontend — sebaiknya export hanya `type AppRouter`, yang
  ter-erase saat build dan tidak menambah beban runtime ke client.
- Menangkap error dengan blok `catch` generik dan mengabaikan
  `error.code` — `RaktaRpcError.code` membantu membedakan kegagalan
  validasi dari error server lainnya.

## Dokumen terkait

- [`http.md`](./http.md) — PanturaFetch, untuk panggilan HTTP non-RPC
- [`backendFrameworks.md`](./backendFrameworks.md) — menghubungkan CarubanWire ke Gaman.js, Express.js, Nest.js, atau Adonis.js