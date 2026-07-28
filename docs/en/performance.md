# Performance

## "Network response is done but UI takes 10 seconds to update"

This is the most common Rakta.js performance complaint. The server shows 200 in 18ms. The browser Network tab shows the response. But the UI does not update for several seconds.

**This is NOT a server problem.** The bottleneck is in the browser pipeline.

### Timeline breakdown

```
T0  request sent
T1  server receives request
T2  server sends response          ← terminal shows this as "200 in 18ms"
T3  browser receives response
T4  JavaScript parses response body
T5  state update called
T6  React render starts
T7  React commit (DOM update)
T8  browser paints
```

The 10-second gap is between **T3 and T8** - entirely in the browser.

### Common causes

| Stage | Cause | Fix |
|---|---|---|
| T3→T4 | Large JSON payload (>1MB) | Paginate, server-side filter |
| T4→T5 | Expensive transform/sort on client | Move to server, memoize |
| T5→T6 | State update triggers full tree render | `useMemo`, split context |
| T6→T7 | Large component tree, no virtualization | Virtualize long lists |
| T7→T8 | Heavy layout/paint (large DOM, shadows) | Reduce DOM size |

### Diagnosing with Rakta Dev Indicator

Open the Performance panel in the Dev Indicator (bottom-left logo). It shows:

```
Network      18ms    ← matches terminal
Parse         3ms
State         2ms
Render       21ms
Paint         4ms
Total        48ms
```

If `Response → UI gap` in Diagnostics shows >1s, check **State** and **Render** rows.

### Large report/table applications

For applications that render large datasets:

**Server-side:**
```ts
// Always paginate at the API level
const { data, total } = await db.query({
  limit: req.query.limit ?? 50,
  offset: req.query.offset ?? 0,
});
```

**Client-side:**
```ts
// useRaktaData with loading state
const { data, loading, error, refetch } = useRaktaData(
  (signal) => fetch("/api/report?page=1&limit=50", { signal }).then(r => r.json()),
  [],
  "report-page-1"
);
```

**Avoid rendering >500 DOM rows at once.** Use windowing/virtualization for large tables.

---

## HTTP Client Performance

`PanturaFetch` (v1.0.6+) improvements:

- **Default timeout**: 10s (was 30s) - surfaces slow APIs faster
- **keepalive: true** - reuses TCP connections, eliminates handshake overhead on sequential requests to the same host
- **Retry support**: `{ retries: 2 }` for transient network errors

```ts
const http = createRaktaHttp({
  baseUrl: "http://localhost:4000",
  timeout: 5_000,
});

// With retry
const data = await http.get<Report>("/api/report", { retries: 2 });
```

---

## Render Pipeline Performance

Rakta.js v1.0.6 HTML shell changes:

- `<link rel="modulepreload">` for JS bundle - browser fetches+parses+compiles in parallel with HTML
- `<link rel="preload">` for CSS - stylesheet no longer blocks render
- Inline critical CSS - loading indicator visible immediately, no blank white flash
- Loading overlay removed after first React commit via `rakta:mounted` event

---

## Middleware Timing

`createMiddlewareStack` now tracks per-middleware elapsed time. Total middleware time is attached as `X-Rakta-Middleware-Ms` response header in development for diagnostics.

---

## Performance Benchmarks

All measurements from local development on Windows 11, Bun 1.3.11, React 19.

| Metric | Before v1.0.6 | v1.0.6 |
|---|---|---|
| Time to first byte (dev) | ~50ms | ~50ms |
| JS bundle discovery | After HTML parse | During HTML parse (modulepreload) |
| HTTP client default timeout | 30 000ms | 10 000ms |
| TCP keepalive | No | Yes |
| Loading overlay | None | Immediate via inline CSS |

> These benchmarks are from the development environment. Production performance depends on deployment target, server specs, and application code.
