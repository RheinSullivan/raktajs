# Dev Tools

Rakta.js ships two development-only tools: **Rakta Dev Indicator** (browser) and **Rakta Dev Terminal** (server). Both are excluded from production builds automatically.

---

## Rakta Dev Indicator

A floating panel injected into the browser in development mode. Powered by the actual Rakta.js SVG logo.

**Features:**

- Floating circular button (bottom-left) with the Rakta.js logo
- Click to open panel showing: route path, render mode, bundler
- Performance tab with real measurements from the browser Performance API
- Diagnostics tab highlighting the "response arrived but UI is slow" case
- Keyboard accessible: `Enter`/`Space` to open, `Escape` to close
- Respects `prefers-reduced-motion`
- Zero production cost - guarded by `process.env.NODE_ENV === "development"`

**What it measures:**

```
Network    Time from fetch start to response end (Navigation Timing API)
Parse      DOM processing time after response
State      Rakta state update time (performance.mark)
Render     React render time (performance.mark)
Paint      First Contentful Paint (FCP)
Total      Full load event duration
```

**Diagnosing "response is done but UI is slow":**

The Diagnostics panel calculates `Response - UI gap = FCP - networkMs`. If this number is large (>1s), the bottleneck is in the browser pipeline, not the server.

**Production exclusion:**

```ts
// In generated client entry - only runs in development
if (process.env.NODE_ENV === "development") {
  const { mountDevIndicator } = await import("./devIndicator");
  mountDevIndicator({ version, logoDataUrl, bundler });
}
```

---

## Rakta Dev Terminal

Output printed to the server terminal when running `bun run dev`.

**Startup output:**

```
  ⩛ Rakta.js 1.1.2 (CherbonsEngine)

  Local:          http://localhost:3000
  Network:        http://192.168.1.8:3000
  Environments:   .env.local
  Mode:           development

  Ready in 421ms
```

**Request logging:**

```
  GET    /                              200  24ms
  GET    /api/report                    200  17ms
  POST   /api/report                    201  31ms
  GET    /api/report                    200  1.4s  [slow]
  GET    /missing                       404   2ms
```

**Features:**

- Real Local URL from server port (not hardcoded)
- LAN Network IP detected from active network interfaces (skips Docker, WSL, VPN)
- Environment filenames detected - values never exposed
- Ready time measured from server start to first accepted connection
- Request timing: total server-side ms per request
- Slow request flag: configurable threshold (default 1000ms)
- `NO_COLOR` env variable respected

---

## Status

| Feature | Status |
|---|---|
| Rakta Dev Terminal | Experimental |
| Rakta Dev Indicator | Experimental |
| Error Overlay | Planned |
| HMR status in indicator | Planned |
| Request ID cross-reference | Planned |
