# Security

`rakta/security` provides production-oriented helpers for secure headers, CSP,
CSRF tokens, rate limiting, and secret management.

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

These helpers are dependency-free and edge-compatible.
