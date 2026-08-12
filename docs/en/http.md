# HTTP Client - PanturaFetch

**PanturaFetch** is Rakta.js's built-in, fetch-based HTTP client - typed, small, and with the request/response ergonomics people expect from Axios, without adding a dependency.

---

## When to Use This

Use PanturaFetch for any REST call to a backend that does not speak CarubanWire - third-party APIs, a non-Rakta.js backend, or simple fetches where setting up a full RPC router is not worth it.

---

## Code Example

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

Adding an auth header via an interceptor:

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

## Common Mistakes

- Not catching `HttpResponseError` separately from `HttpNetworkError` - the former means the server responded (e.g. a 404 or 500), the latter means the request never completed.
- Setting an extremely short `timeout` globally instead of per-request - pass `{ timeout: ... }` on the specific call that needs it.
- Forgetting that PanturaFetch is for plain REST - if both ends of the call are Rakta.js, [CarubanWire](./rpc.md) gives you full type inference instead.

---

## Related Docs

- [`rpc.md`](./rpc.md) - CarubanWire, when both sides are Rakta.js