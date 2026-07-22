# Security

`rakta/security` menyediakan helper siap produksi untuk secure headers, CSP,
token CSRF, rate limiter, dan secret manager.

```ts
import {
	createCsrfToken,
	createSecureHeaders,
	RateLimiter,
	SecretManager,
	verifyCsrfToken,
} from "rakta/security";

const headers = createSecureHeaders();
const token = createCsrfToken("csrf-secret");
verifyCsrfToken(token, "csrf-secret");

const limiter = new RateLimiter();
const state = limiter.check("user:1", 100, 60_000);

const secrets = new SecretManager();
secrets.set({ name: "jwt", value: "secret" });
```

Helper ini tanpa dependency tambahan dan kompatibel dengan edge runtime.
