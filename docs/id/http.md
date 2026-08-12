# HTTP Client - PanturaFetch

**PanturaFetch** adalah HTTP client bawaan Rakta.js berbasis fetch - typed, kecil, dengan kemudahan request/response yang biasa orang dapatkan dari Axios, tanpa menambah dependency.

---

## Kapan Dipakai

Pakai PanturaFetch untuk panggilan REST ke backend apapun yang tidak berbicara CarubanWire - API pihak ketiga, backend non-Rakta.js, atau fetch sederhana di mana setup router RPC penuh tidak sepadan.

---

## Contoh Kode

```ts
import { createRaktaHttp } from "rakta/http";

const http = createRaktaHttp({
  baseUrl: "https://api.example.com",
  timeout: 8000,
});

interface User {
  id: string;
  name: string;
}

const users = await http.get<User[]>("/users", {
  params: { active: true },
});

const created = await http.post<User>("/users", { name: "Ada" });
```

Menambahkan header auth lewat interceptor:
```ts
http.addRequestInterceptor((url, requestInit) => {
  return [
    url,
    {
      ...requestInit,
      headers: {
        ...requestInit.headers,
        Authorization: `Bearer ${getToken()}`,
      },
    },
  ];
});
```

---

## Kesalahan Umum

- Tidak menangkap `HttpResponseError` secara terpisah dari `HttpNetworkError` - yang pertama berarti server merespons (misalnya 404 atau 500), yang kedua berarti request tidak pernah selesai.
- Mengatur `timeout` yang sangat singkat secara global dibanding per-request - kirim `{ timeout: ... }` di panggilan spesifik yang membutuhkannya.
- Lupa bahwa PanturaFetch untuk REST biasa - kalau kedua sisi panggilan sama-sama Rakta.js, [CarubanWire](./rpc.md) memberi inferensi tipe penuh.

---

## Dokumen Terkait

- [`rpc.md`](./rpc.md) - CarubanWire, kalau kedua sisi Rakta.js