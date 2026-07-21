# Deployment

## Gambaran umum

Project Rakta berbasis Bun dan bisa dideploy sebagai frontend statis,
server Bun, atau build platform untuk Vercel, Netlify, dan Cloudflare.

## Frontend statis

Gunakan static export untuk deployment SSG atau SPA:

```bash
bun run build
```

Upload output frontend yang dihasilkan ke host statis mana pun.

## Vercel

Gunakan build command level project:

```bash
bun run build
```

Untuk aplikasi fullstack, deploy `frontend/` sebagai project web dan
deploy `backend/` secara terpisah sebagai service yang kompatibel dengan
Bun.

## Netlify

Atur build command menjadi:

```bash
bun run build
```

Atur publish directory ke output build frontend yang dikonfigurasi di
`rakta.config.ts`.

## Cloudflare

Untuk situs statis, deploy output build frontend ke Cloudflare Pages.
Untuk Workers, jaga handler tetap kompatibel dengan Fetch API dan hindari
API khusus Node di dalam request handler.

## Docker

Aplikasi fullstack bisa berjalan dengan Bun di container kecil:

```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build
CMD ["bun", "run", "start"]
```

## Environment variable

Variable umum untuk fullstack:

| Variable | Kegunaan |
| --- | --- |
| `PORT` | Port server backend |
| `CORS_ORIGIN` | Origin frontend yang diizinkan oleh API |
| `DATABASE_URL` | Connection string database |
| `AUTH_SECRET` | Secret untuk signing JWT, minimal 32 karakter |
| `SESSION_MODE` | Perilaku session `single` atau `multi` |

## Dokumen terkait

- [`templates.md`](./templates.md)
- [`kernel.md`](./kernel.md)
- [`middleware.md`](./middleware.md)
