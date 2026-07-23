# HTTP client - PanturaFetch

## Overview

**PanturaFetch** is Rakta.js's built-in, fetch-based HTTP client - typed,
small, and with the request/response ergonomics people expect from Axios,
without adding a dependency.

## When to use this

Use PanturaFetch for any REST call to a backend that doesn't speak
CarubanWire - third-party APIs, a non-Rakta.js backend, or simple fetches
where setting up a full RPC router isn't worth it.

## Architecture

`createRaktaHttp({ baseUrl, headers?, timeout? })` returns a client with
`get`, `post`, `put`, `patch`, and `delete` methods, all generic over the
expected response type. Internally:

- Query params passed via `{ params }` are appended to the URL safely.
- JSON bodies are stringified automatically; `GET`/`HEAD` never attach a
  body.
- A per-request or client-wide `timeout` aborts the request with a
  dedicated `HttpTimeoutError`.
- Failed network calls throw `HttpNetworkError`; non-2xx responses throw
  `HttpResponseError` with the original `Response` attached.
- `addRequestInterceptor` / `addResponseInterceptor` let you transform the
  outgoing URL/`RequestInit` or the parsed response before it reaches your
  code - useful for attaching auth tokens or unwrapping an envelope shape.

## Code example

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

## Common mistakes

- Not catching `HttpResponseError` separately from `HttpNetworkError` -
  the former means the server responded (e.g. a 404 or 500), the latter
  means the request never completed.
- Setting an extremely short `timeout` globally instead of per-request -
  pass `{ timeout: ... }` on the specific call that needs it.
- Forgetting that PanturaFetch is for plain REST - if both ends of the
  call are Rakta.js, [CarubanWire](./rpc.md) gives you full type
  inference instead.

## Related docs

- [`rpc.md`](./rpc.md) - CarubanWire, when both sides are Rakta.js
- [`schema.md`](./rpc.md) - validating responses with Rakta Schema before trusting them