# Upgrade Guide

This guide helps you upgrade Rakta.js from an older version to the latest release without breaking your app.

If you are RAUL or any developer who used an earlier version of Rakta.js to build a report app or any other project, this is the page for you.

---

## How to upgrade

```bash
# Bun (recommended)
bun update raktajs

# npm
npm update raktajs

# pnpm
pnpm update raktajs

# yarn
yarn upgrade raktajs
```

After updating, run:

```bash
bun run typecheck
bun run dev
```

If you see TypeScript errors or runtime issues, check the relevant section below.

---

## v1.0.5 → v1.0.6

This is the most impactful release for app performance. If your app had slow UI updates after API responses (like RAUL reported - "response shows in Network but UI takes 10 seconds"), upgrading to v1.0.6 directly addresses this.

### Breaking changes

None. All existing APIs are backward-compatible.

### What changed and what you may want to update

#### HTTP client - PanturaFetch

Default timeout reduced from 30 000ms to 10 000ms. If your API legitimately takes more than 10 seconds, set a custom timeout:

```ts
const http = createRaktaHttp({
  baseUrl: "http://localhost:4000",
  timeout: 30_000, // restore old behavior if needed
});
```

New options available:

```ts
// Retry on transient network errors (off by default)
const data = await http.get("/api/report", { retries: 2 });
```

#### Smooth scroll - component renamed

Old names still work but are removed from docs. Use the new names:

| Old | New |
|---|---|
| `<scroll to="">` | `<pantura to="">` |
| `<anchor id="">` | `<reborns id="">` |
| `useSintren()` | `usePantura()` |

If your code uses the old names, update them:

```tsx
// Before
<scroll to="contact">Contact</scroll>
<anchor id="contact"><h2>Contact</h2></anchor>

// After
<pantura to="contact">Contact</pantura>
<reborns id="contact"><h2>Contact</h2></reborns>
```

```ts
// Before
import { useSintren } from "raktajs/components";
const scrollTo = useSintren({ offset: 80 });

// After
import { usePantura } from "raktajs/components";
const scrollTo = usePantura({ offset: 80 });
```

#### New: useRaktaData hook

If you were manually managing loading/error state with `useState` + `useEffect`, replace it with `useRaktaData`:

```ts
// Before - manual fetch
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetch("/api/report")
    .then(r => r.json())
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);

// After - useRaktaData
import { useRaktaData } from "raktajs";

const { data, loading, error, refetch } = useRaktaData(
  (signal) => fetch("/api/report", { signal }).then(r => r.json()),
  [],
  "report" // deduplication key
);
```

Benefits: automatic AbortController on unmount, request deduplication, manual refetch, consistent loading state.

#### postcss.config.js → postcss.config.ts

If you have `postcss.config.js` in your project, rename it:

```bash
# Delete old file
rm postcss.config.js

# Create new file
```

```ts
// postcss.config.ts
import type { Config } from "postcss-load-config";

const config: Config = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};

export default config;
```

#### New optional packages: motion, scene, vector

These are entirely optional. Your existing app is unaffected. If you want to use them:

```bash
# Motion system (page transitions, gestures, parallax)
# No extra install needed - included in raktajs

# 3D scenes (optional peer dependency)
bun add three

# Vector animation - no extra install needed
```

```ts
import { definePageTransition, useMagnetic } from "raktajs/motion";
import { useMegaScapeScene } from "raktajs/scene"; // requires: bun add three
import { useTrusmiVector, useImageZoom } from "raktajs/vector";
```

---

## v1.0.4 → v1.0.5

### Breaking changes

None.

### Component rename: `<scroll>` → `<pantura>`, `<anchor>` → `<reborns>`

See v1.0.5 → v1.0.6 section above for migration steps.

---

## v1.0.3 → v1.0.4

### Breaking changes

None.

### GSAP replaces previous animation library

GSAP is now the animation engine. If you previously imported from `motion` or `framer-motion`:

```bash
# Remove old deps
bun remove motion framer-motion
```

GSAP is already configured in Rakta.js - no action needed on your part.

---

## v1.0.2 → v1.0.3

### Breaking changes

None. This was a documentation and tooling release.

---

## Fixing the "UI slow after response" issue (all versions)

If you are seeing: **response appears in the browser Network tab but the UI doesn't update for several seconds**, this is a browser-side rendering issue, not a server issue.

After upgrading to v1.0.6:

- The HTML shell now includes `<link rel="modulepreload">` for the JS bundle - the browser starts loading JavaScript during HTML parsing instead of after it finishes
- The HTTP client keeps TCP connections alive (`keepalive: true`)
- A loading overlay appears immediately so the page never looks blank

If the problem persists after upgrading, check:

1. **Large JSON payload** - paginate your API response (`limit: 50` instead of returning 10 000 rows)
2. **Expensive client-side transform** - sorting or filtering 1000+ items in JavaScript blocks the main thread
3. **Many simultaneous requests** - `useRaktaData` deduplicates requests with the same key
4. **No AbortController** - old `useEffect` + `fetch` patterns may continue running after unmount; `useRaktaData` handles this automatically

See [docs/en/performance.md](./performance.md) for the full diagnosis guide.

---

## Troubleshooting

**TypeScript error after upgrade: `Cannot find module 'raktajs/motion'`**

The `motion`, `scene`, and `vector` subpaths are new in v1.0.6. Make sure you are on v1.0.6:

```bash
cat node_modules/raktajs/package.json | grep version
```

**`<pantura>` / `<reborns>` not recognized in TypeScript**

Update your `rakta-env.d.ts` by running:

```bash
bun run imports:generate
```

or manually add to `rakta-env.d.ts`:

```ts
declare namespace JSX {
  interface IntrinsicElements {
    pantura: React.HTMLAttributes<HTMLElement> & { to: string; offset?: number; duration?: number };
    reborns: React.HTMLAttributes<HTMLElement> & { id: string };
  }
}
```

**Build fails after adding `raktajs/scene`**

Three.js is an optional peer dependency:

```bash
bun add three
```

**`useRaktaData` not found**

Make sure you are importing from `raktajs` (root) or `raktajs/data`:

```ts
import { useRaktaData } from "raktajs";
// or
import { useRaktaData } from "raktajs/data";
```

---

## Getting help

- GitHub Issues: [github.com/RheinSullivan/raktajs/issues](https://github.com/RheinSullivan/raktajs/issues)
- Performance guide: [docs/en/performance.md](./performance.md)
- Dev tools guide: [docs/en/devtools.md](./devtools.md)
