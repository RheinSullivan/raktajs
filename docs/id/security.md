# Security - Lapisan Keamanan Produksi

`rakta/security` menyediakan helper siap produksi untuk secure headers, CSP, token CSRF, rate limiter, dan secret manager - tanpa dependency tambahan, kompatibel dengan edge runtime.

---

## Arsitektur Lapisan Keamanan

```mermaid
flowchart TD
    Mulai((Mulai))
    Mulai --> Req[HTTP Request Diterima]
    Req --> SecHeaders[createSecureHeaders\nCSP, HSTS, X-Frame-Options]
    SecHeaders --> RateCheck{RateLimiter.check\nMelebihi Batas?}

    RateCheck -->|Ya| Blocked[429 Too Many Requests]
    RateCheck -->|Tidak| CSRFCheck{Token CSRF\nValid?}

    CSRFCheck -->|Tidak| Forbidden[403 Forbidden]
    CSRFCheck -->|Ya| Handler[Eksekusi Route Handler]

    Blocked --> Selesai((Selesai))
    Forbidden --> Selesai

    Handler --> Vault[(Vault SecretManager\nTerkripsi di Memori)]
    Vault --> Resp[Response Aman Akhir]
    Resp --> Selesai

    classDef startEnd fill:#e63946,stroke:#c1121f,color:#ffffff,font-weight:bold
    class Mulai,Selesai startEnd
```

---

## Komponen Keamanan

### Secure Headers

```ts
import { createSecureHeaders } from "rakta/security";

const headers = createSecureHeaders();
// Content-Security-Policy, X-Frame-Options, X-Content-Type-Options,
// Strict-Transport-Security, Permissions-Policy
```

### CSRF Protection

```ts
import { createCsrfToken, verifyCsrfToken } from "rakta/security";

const token = createCsrfToken("csrf-secret");
verifyCsrfToken(token, "csrf-secret"); // throws on invalid
```

### Rate Limiter

```ts
import { RateLimiter } from "rakta/security";

const limiter = new RateLimiter();
const state = limiter.check("user:1", 100, 60_000);
// { allowed: boolean, remaining: number, resetAt: number }
```

### Secret Manager

```ts
import { SecretManager } from "rakta/security";

const secrets = new SecretManager();
secrets.set({ name: "jwt", value: "secret" });
const jwt = secrets.get("jwt");
```

---

## Terkait

- [`middleware.md`](./middleware.md) - integrasi lapisan keamanan ke middleware pipeline
- [`authentication.md`](./authentication.md) - autentikasi JWT dan session
