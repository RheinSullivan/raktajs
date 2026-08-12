# Autentikasi

Autentikasi self-hosted yang di-generate oleh Rakta.js fullstack generator. Tidak ada Clerk, NextAuth, Supabase, atau Firebase.

---

## Arsitektur Autentikasi JWT + Session

```mermaid
sequenceDiagram
    actor Client as Browser / API Client
    participant AuthAPI as Auth API Handler
    participant Validator as Schema Validator
    participant DB as Database (Users / Sessions)
    participant JWT as JWT Engine (HMAC-SHA256)
    participant Cookie as Cookie Manager

    Client->>AuthAPI: POST /api/auth/login { email, password, rememberMe }
    AuthAPI->>Validator: Validate request body shape
    Validator-->>AuthAPI: Input valid
    AuthAPI->>DB: Lookup user by email
    DB-->>AuthAPI: User record { id, email, passwordHash, role }
    AuthAPI->>AuthAPI: bcrypt.compare(password, passwordHash)
    AuthAPI->>DB: Create session record
    DB-->>AuthAPI: sessionId
    AuthAPI->>JWT: Sign accessToken { sub, email, sessionId, type: "access" }
    JWT-->>AuthAPI: accessToken (1h)
    AuthAPI->>JWT: Sign refreshToken { sub, email, sessionId, type: "refresh" }
    JWT-->>AuthAPI: refreshToken (7d / 30d)
    AuthAPI->>Cookie: Set rakta_session (HttpOnly, SameSite=Lax)
    AuthAPI->>Cookie: Set rakta_refresh (HttpOnly, SameSite=Strict)
    AuthAPI-->>Client: 200 { user, accessToken, sessionId }
```

---

## Alur Refresh Token Rotation

```mermaid
sequenceDiagram
    actor Client
    participant AuthAPI as Auth API Handler
    participant JWT as JWT Engine
    participant DB as Session Store

    Client->>AuthAPI: POST /api/auth/refresh (cookie: rakta_refresh)
    AuthAPI->>JWT: Verify refresh token signature & expiry
    JWT-->>AuthAPI: Decoded { sub, sessionId, type: "refresh" }
    AuthAPI->>DB: Validate sessionId still active
    DB-->>AuthAPI: Session valid
    AuthAPI->>DB: Revoke old session record
    AuthAPI->>DB: Create new session record
    AuthAPI->>JWT: Sign new accessToken
    AuthAPI->>JWT: Sign new refreshToken
    JWT-->>AuthAPI: New token pair
    AuthAPI-->>Client: 200 { accessToken } + set new cookies
```

---

## Strategi Autentikasi

Saat generate fullstack project, pilih dari:

| Strategi | Deskripsi |
|---|---|
| **None** | Tidak ada autentikasi yang di-generate |
| **JWT** | Pasangan access + refresh token stateless |
| **Session** | Session server-side dengan cookie |
| **JWT + Session** | Kedua strategi sekaligus |

---

## Endpoint yang Di-generate

| Endpoint | Method | Auth Diperlukan | Deskripsi |
|---|---|---|---|
| `/api/auth/register` | POST | Tidak | Buat akun |
| `/api/auth/login` | POST | Tidak | Mengembalikan `accessToken` + set cookies |
| `/api/auth/refresh` | POST | Tidak (refresh token) | Rotasi pasangan token |
| `/api/auth/me` | GET | Ya | User saat ini |
| `/api/auth/logout` | POST | Ya | Cabut session saat ini |
| `/api/auth/logout-all` | POST | Ya | Cabut semua session |
| `/api/auth/forgot-password` | POST | Tidak | Minta OTP |
| `/api/auth/reset-password` | POST | Tidak | Reset dengan OTP |

---

## Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password-kamu",
    "rememberMe": true
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "admin@example.com", "role": "ADMIN" },
    "accessToken": "<JWT berumur pendek>",
    "sessionId": "<session-id>"
  }
}
```

Dua cookie otomatis di-set:
- `rakta_session` - session ID (HttpOnly, SameSite=Lax)
- `rakta_refresh` - refresh token (HttpOnly, SameSite=Strict)

---

## Menggunakan Access Token

```bash
# Bearer token (API client)
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"

# Cookie (browser - otomatis setelah login)
curl http://localhost:4000/api/auth/me --cookie "rakta_session=<sessionId>"
```

---

## Melindungi Route

```ts
import { requireAuth, requireRole, optionalAuth } from "../middlewares/auth.middleware";

// Require user yang sudah login
const rejected = await requireAuth(request);
if (rejected) return rejected;

// Require role tertentu
const rejected = await requireRole(request, "ADMIN");
if (rejected) return rejected;

// Opsional - dapatkan user jika sudah login
const user = await optionalAuth(request);
```

---

## Session Policy

| Policy | SESSION_MODE | Perilaku |
|---|---|---|
| Multiple Sessions | `multiple` | Default - login dari banyak device diizinkan |
| Single Session | `single` | Login baru mencabut semua session sebelumnya |

---

## Keamanan Token

- JWT ditandatangani dengan HMAC-SHA256 menggunakan `AUTH_SECRET`
- Access token berisi: `{ sub, email, sessionId, type: "access", exp }`
- Refresh token berisi: `{ sub, email, sessionId, type: "refresh", exp }`
- Token dengan `type: "refresh"` ditolak oleh `authenticate()`

---

## Environment Variables

```env
AUTH_SECRET=ganti-dengan-secret-acak-32-karakter
SESSION_MODE=multiple
AUTH_STRATEGY=jwt
CORS_ORIGIN=http://localhost:3000
```

---

## OAuth Providers (Opsional)

Saat generate project, kamu bisa memilih OAuth providers (Google, GitHub, Apple, dll.) secara opsional. Ini memperluas autentikasi Rakta.js - tidak menggantikannya.

Konfigurasi OAuth dilakukan secara manual - tidak ada platform auth pihak ketiga yang digunakan.

---

## Terkait

- [Panduan Upgrade](./migrationGuide.md)
- [Performa](./performance.md)
- [Dev Tools](./devtools.md)
