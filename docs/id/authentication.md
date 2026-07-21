# Authentication

## Gambaran umum

Generator fullstack menyertakan starter authentication yang berjalan
dengan JWT, cookie session HTTP-only, dan mode single session.

Starter memakai password hashing Bun, signature HMAC dari Web Crypto, dan
middleware request yang bisa melindungi API route.

## Endpoint yang dihasilkan

| Endpoint | Method | Kegunaan |
| --- | --- | --- |
| `/api/auth/register` | `POST` | Membuat user |
| `/api/auth/login` | `POST` | Mengembalikan JWT dan memasang `rakta_session` |
| `/api/auth/me` | `GET` | Mengembalikan user yang sedang login |
| `/api/auth/logout` | `POST` | Mencabut session saat ini |
| `/api/auth/forgot-password` | `POST` | Membuat OTP reset password |
| `/api/auth/reset-password` | `POST` | Reset password memakai OTP |
| `/api/users` | `GET` / `POST` | Melihat daftar user atau membuat user |
| `/api/users/:id` | `PATCH` / `DELETE` | Mengubah atau menghapus user |
| `/api/cms/posts` | `GET` / `POST` | Melihat atau membuat post CMS |
| `/api/cms/posts/:id` | `PATCH` / `DELETE` | Mengubah atau menghapus post CMS |

## Contoh login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rakta.local","password":"rakta-password"}'
```

## Mode session

Atur `SESSION_MODE=single` untuk mencabut session lama setiap kali user
yang sama login lagi. Atur `SESSION_MODE=multi` untuk mengizinkan banyak
session aktif.

## Catatan keamanan

- Gunakan `AUTH_SECRET` unik di setiap environment deployment.
- Gunakan HTTPS di production agar cookie session aman saat dikirim.
- Ganti demo user yang digenerate dengan tabel user dari database kalian.

## Template fullstack

Starter fisik `templates/fullStack` memakai sistem visual yang sama dengan
`templates/frontendOnly`, lalu ditambah login, register, forgot password
OTP, reset password, dashboard, route auth, dan controller user bergaya
CRUD. Backend default-nya memakai Gaman.js dengan struktur seperti
Laravel/Adonis: routes, controllers, services, models, middleware,
validation, CRUD user berbasis role, dan CRUD post CMS.

## Dokumen terkait

- [`templates.md`](./templates.md)
- [`middleware.md`](./middleware.md)
- [`deployment.md`](./deployment.md)
