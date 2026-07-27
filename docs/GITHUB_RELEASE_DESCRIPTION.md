# GitHub Repository Description & Release Tag Descriptions

## Repository Description (About section)

```
⩛ Rakta.js — A lightweight, composable fullstack React framework powered by Bun. File-based routing, CSR/SSR/SSG/SPA/Hybrid rendering, type-safe RPC, schema validation, HTTP client, PWA, middleware, kernel, and a professional dev experience — all in one package. Built from Cirebon, Indonesia 🇮🇩
```

---

## Release Tag Descriptions

### v1.0.3 — Creative Frontend: NusantaraMotion

```
NusantaraMotion — Page transitions, interactive motion, and kinetic typography.

Beyond Barba.js: Native View Transitions API first, GSAP fallback, MegaWeave router integration, prefetch-aware, JatiLens performance marks.

New:
- definePageTransition() — declarative page transitions with View Transitions API
- usePageTransition() — programmatic navigation with GSAP fallback
- defineSharedElement() / useSharedElement() — matched-element transitions
- createMotionTimeline() — composable GSAP-backed animation timeline
- useMagnetic() — magnetic button effect with reduced-motion support
- useTilt() — GPU-accelerated 3D tilt on hover
- useSpotlight() — CSS radial gradient spotlight following cursor
- useCursorFollower() — custom cursor with lerp lag
- useDrag() — drag with momentum physics, no deps
- useParallax() — scroll-driven parallax
- splitText() / animateText() / useKineticText() — kinetic typography primitives

Install: bun add raktajs
```

---

### v1.0.4 — 3D Scene System: MegaScape

```
MegaScape — Optional 3D scene layer built on Three.js. Beyond React Three Fiber.

Key differences:
- Three.js is optional peer dep — zero bundle cost unless you import a 3D component
- On-demand rendering (no continuous rAF loop unless renderMode: "realtime")
- Scroll-driven scenes as first-class API (useScrollScene)
- Adaptive quality — auto-detects device capability
- JatiLens performance marks: FPS, draw calls, memory per frame
- ResizeObserver for responsive canvas
- SSR-safe: no canvas during SSR

New:
- createMegaScape() — imperative 3D scene factory
- useMegaScapeScene() — React hook for 3D scenes
- useScrollScene() — scroll-progress-driven 3D
- detectDeviceQuality() — auto GPU/CPU detection
- loadGLTF() / loadTexture() — lazy asset loader with cache

Install: bun add raktajs three
```

---

### v1.0.5 — Vector Animation: TrusmiVector

```
TrusmiVector — SVG state machine animation. Beyond Rive.

Key differences vs Rive:
- No proprietary .riv format — works with SVG (open standard)
- State machines defined in TypeScript (type-safe, tree-shakeable)
- Respects prefers-reduced-motion automatically
- GSAP-backed for production-quality easing
- Zero-cost when not imported
- Built-in Shrimp mascot states for ShrimpRun game

New:
- createStateMachine() — type-safe SVG animation state machine
- useTrusmiVector() — React hook for SVG state machine
- useMascot() — typed hook pre-wired for Rakta.js shrimp mascot
- SHRIMP_MASCOT_STATES — idle/run/jump/fall/hurt/celebrate/dead
- useImageZoom() — click-to-zoom with Web Animations API, keyboard & gesture support
- useTrusmiGallery() — image gallery with preload, keyboard nav

Install: bun add raktajs
```

---

### v1.0.6 — DevTools, Performance & Data Fetching

```
Professional development experience + performance fixes + data fetching.

Rakta Dev Terminal:
- ⩛ Rakta.js 1.0.6 (CherbonsEngine) startup banner
- Actual Local URL + LAN Network IP detection
- Environment filenames (never values/secrets)
- Actual startup timing (measured, not hardcoded)
- Request logger: method, path, status, timing, [slow] flag
- NO_COLOR env variable respected
- Configurable slow-request threshold (default 1000ms)

Rakta Dev Indicator (browser):
- Floating circular button (bottom-left) with Rakta.js SVG logo
- Panel: route path, render mode, bundler (runtime actual)
- Performance tab: Network/Parse/State/Render/Paint from Navigation Timing API
- Diagnostics: highlights "response done but UI slow" gap
- Preferences stored in localStorage
- Keyboard accessible: Enter/Space/Escape + ARIA
- Respects prefers-reduced-motion
- Development-only: guarded by process.env.NODE_ENV === "development"

useRaktaData hook:
- Lifecycle: idle → loading → success | error
- In-memory request deduplication by key
- AbortController cancellation on unmount or dep change
- Manual refetch()

Middleware timing:
- Per-middleware elapsed time tracked
- X-Rakta-Middleware-Ms header on development responses

Performance fixes (bug reported by RAUL — "response done but UI takes 10s"):
- <link rel="modulepreload"> for JS bundle → browser discovers script during HTML parse (not after)
- <link rel="preload"> for CSS → stylesheet no longer blocks render
- Inline critical CSS + loading overlay dismissed on rakta:mounted event
- PanturaFetch: timeout 10s (was 30s), keepalive:true, retry with exponential backoff
- devServer: single ensureFreshClientBundle() call per request (was called twice)
- Bun.file() async reads (was readFileSync blocking)
- Smart cache headers: immutable for hashed chunks, must-revalidate for app.js

Tests: 53 pass, 0 fail

Install: bun add raktajs
```

---

## GitHub Topic Tags (recommended)

```
react, bun, typescript, framework, fullstack, ssr, ssg, csr, spa, routing, rpc, pwa, indonesia, cirebon, nusantara
```
