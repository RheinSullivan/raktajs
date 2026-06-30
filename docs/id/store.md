# Store

## Overview

Rakta.js menyediakan state store kecil yang terinspirasi dari Zustand,
dibangun langsung di atas `useSyncExternalStore` milik React. Tidak ada
dependency state management eksternal yang dibutuhkan.

## Kapan dipakai

Pakai store untuk state UI yang dipakai bersama oleh beberapa komponen
dan tidak cocok disimpan di URL atau data server — toggle tema, visibility
modal, state form multi-step, keranjang belanja, dan sejenisnya. Untuk
data server, lebih baik fetch langsung di tempat yang membutuhkannya
dengan [PanturaFetch](./http.md) atau [CarubanWire](./rpc.md), bukan
menduplikasinya ke dalam store.

## Arsitektur

`createRaktaStore` menerima fungsi creator `(set, get) => initialState`
dan mengembalikan sebuah hook. Hook ini bisa dipanggil tanpa argumen untuk
subscribe ke seluruh state, atau dengan fungsi selector untuk subscribe ke
bagian tertentu saja — React hanya re-render kalau nilai yang dipilih
benar-benar berubah, karena subscription-nya dihubungkan lewat
`useSyncExternalStore`.

Hook yang dikembalikan juga punya properti `getState`, `setState`,
`subscribe`, dan `reset`, sehingga store bisa dibaca atau diupdate di luar
React (di dalam event handler, procedure CarubanWire, atau test) tanpa
perlu komponen.

## Contoh kode

```ts
// lib/stores/counterStore.ts
import { createRaktaStore } from "rakta/store";

interface CounterState {
  count: number;
  increment: () => void;
  reset: () => void;
}

export const useCounterStore = createRaktaStore<CounterState>((set, get) => ({
  count: 0,
  increment: () => set({ count: get().count + 1 }),
  reset: () => set({ count: 0 }),
}));
```

```tsx
function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return <button onClick={increment}>Hitungan: {count}</button>;
}
```

Membaca di luar React:

```ts
const currentCount = useCounterStore.getState().count;
useCounterStore.setState({ count: 0 });
```

## Kesalahan umum

- Memanggil hook store secara kondisional (di dalam `if`) — seperti hook
  React lainnya, harus dipanggil tanpa kondisi di bagian atas komponen.
- Menyimpan payload response server yang besar langsung ke store, bukan
  fetch di tempat yang dibutuhkan — ini cenderung membuat store jadi
  sumber kebenaran untuk data yang seharusnya bukan tanggung jawabnya.
- Lupa bahwa `set({ ... })` melakukan merge dangkal ke state yang ada —
  bukan mengganti seluruh object state.

## Dokumen terkait

- [`http.md`](./http.md) — fetch data yang mungkin akan dimasukkan ke store
- [`rpc.md`](./rpc.md) — CarubanWire, sumber data umum lainnya