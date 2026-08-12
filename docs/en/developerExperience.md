# Developer Experience (DX) in Rakta.js

Rakta.js is built with a **Developer Experience First** philosophy. Every layer from CLI terminal logging, error overlays, to browser refresh is engineered to provide sub-millisecond, precise feedback.

---

## Fast Refresh & Hot Module Replacement (HMR)

Rakta.js features a built-in Fast Refresh & HMR engine active automatically during development (`rakta dev` / Forge Dev Server).

### 1. Fast Refresh
- **Definition**: A built-in feature that automatically updates React components in the browser whenever you save code changes, **without losing running component state**.
- **State Preservation**: Local React component state (`useState`, `useReducer`), active form input values, scroll positions, and UI toggle states remain intact when saving files.
- **Auto Error Recovery**: When syntax or runtime errors occur, the Error Overlay displays immediately. Upon saving a fix, the overlay auto-dismisses and component state recovers.

### 2. Hot Module Replacement (HMR)
- **Definition**: The underlying low-level technology (operating via WebSocket channel `/__livereload`) that swaps modified JavaScript/CSS modules directly in browser memory without triggering full page reloads (`window.location.reload()`).

---

## Integrated DX Suite

### 1. Rakta Dev Terminal
Built-in dev terminal rendering clean HTTP request logs, timing breakdowns, HMR status, and environment variables.

```
  ⩛ Rakta.js 1.1.5 (CherbonsEngine)

    Local:        http://localhost:3000
    Network:      http://192.168.1.5:3000
    Environments: .env.local
    Mode:         development

  PASS Ready in 240ms

  PASS GET  /                  200  12ms
  PASS GET  /api/stats         200   8ms
```

### 2. Rakta Dev Indicator
An interactive floating widget mounted in the bottom corner of the browser (development mode only) displaying Rakta.js version, bundler info, and HMR connection state.

### 3. Error Overlay & Stack Trace Mapping
On runtime or compilation failure, Rakta.js renders a modal overlay with clean stack traces, source map mapping, and quick reload options.

### 4. Code & Bundle Inspector
Built-in inspection API to audit project dependency graphs, routes, and bundle sizes:

```ts
import { analyzeBundle, analyzeRoutes, createDependencyGraph } from "raktajs/developerExperience";

const graph = createDependencyGraph([
  { id: "app/page.tsx", imports: ["lib/http.ts"], routePattern: "/", size: 42 },
  { id: "lib/http.ts", size: 12 },
]);

const routes = analyzeRoutes(graph);
const bundle = analyzeBundle(graph.modules);
```

---

## Rakta.js and Wappalyzer Detection

Rakta.js applications expose stable public fingerprints that technology scanners can verify without relying on generic text matches:

- `<meta name="generator" content="Rakta.js">`
- `<html data-framework="raktajs">`
- `#rakta-root[data-rakta]`
- `window.__RAKTA__.version`
- `X-Rakta-Version`

The `public/wappalyzer.json` file is a reference definition for Wappalyzer-style technology rules. It is not automatically loaded by the browser extension from a Rakta.js application. Official recognition still requires submitting Rakta.js through Wappalyzer's technology suggestion process and providing at least two or three real public Rakta.js websites as evidence.

Only framework identity and version are exposed. Secrets, environment variables, filesystem paths, and private configuration are never included in these fingerprints.
