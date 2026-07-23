# Layout System

## Overview

Rakta.js uses a file-based layout system similar to the `app/` directory convention. Layouts wrap pages and persist across navigations within the same URL segment tree. The `rakta/layout` module provides the scanner, manifest builder, and matcher used by the Forge build engine and any custom tooling.

## When to use this

Use layouts when you need shared UI - navigation bars, sidebars, footers, or authentication guards - that should remain mounted across route transitions within a section of your app.

## File conventions

| File | Purpose |
| --- | --- |
| `app/layout.tsx` | Root layout - wraps every page in the app |
| `app/dashboard/layout.tsx` | Nested layout - wraps every page under `/dashboard` |
| `app/dashboard/loading.tsx` | Loading skeleton shown while the route segment loads |
| `app/dashboard/error.tsx` | Error boundary for the dashboard segment |
| `app/(auth)/layout.tsx` | Route group layout - does not add a URL segment |
| `app/dashboard/@analytics/layout.tsx` | Parallel slot - renders alongside the main content |

## Root layout

Every Rakta.js app must have a root layout at `app/layout.tsx`. It is responsible for the `<html>` and `<body>` tags:

```tsx
// app/layout.tsx
interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## Nested layouts

Create a `layout.tsx` inside any segment folder to wrap only those routes:

```txt
app/
├─ layout.tsx           ← root layout (wraps everything)
├─ page.tsx             → /
├─ dashboard/
│  ├─ layout.tsx        ← dashboard layout (sidebar, user menu)
│  ├─ page.tsx          → /dashboard
│  ├─ settings/
│  │  └─ page.tsx       → /dashboard/settings
│  └─ analytics/
│     └─ page.tsx       → /dashboard/analytics
└─ (auth)/
   ├─ layout.tsx        ← auth layout (no sidebar, centered form)
   ├─ login/page.tsx    → /login
   └─ register/page.tsx → /register
```

The layout chain for `/dashboard/settings` is: `app/layout.tsx` → `app/dashboard/layout.tsx`.

## Route groups for layout isolation

Wrap a folder in parentheses - `(auth)` - to group routes under a shared layout without adding a URL segment. The parentheses are stripped from the URL:

```tsx
// app/(auth)/layout.tsx - applies to /login, /register, /forgot-password
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-shell">
      <div className="auth-card">{children}</div>
    </main>
  );
}
```

## Layout API (`rakta/layout`)

```ts
import { createLayoutManifest, matchLayouts } from "raktajs/layout";
import type { RaktaLayoutManifest, RaktaLayoutEntry } from "raktajs/layout";

// Build the manifest from a list of file paths
const manifest: RaktaLayoutManifest = createLayoutManifest([
  { path: "app/layout.tsx" },
  { path: "app/dashboard/layout.tsx" },
  { path: "app/dashboard/loading.tsx" },
  { path: "app/dashboard/error.tsx" },
  { path: "app/(auth)/layout.tsx" },
  { path: "app/dashboard/@analytics/layout.tsx" },
]);

// Resolve the layout chain for a given pathname
const activeLayouts: RaktaLayoutEntry[] = matchLayouts(manifest, "/dashboard/settings");
// → [app/layout.tsx, app/dashboard/layout.tsx]
```

### Layout kinds

| Kind | File | Description |
| --- | --- | --- |
| `root` | `layout.tsx` at `app/` | Always included in every chain |
| `nested` | `layout.tsx` in any subdirectory | Included for all routes below it |
| `loading` | `loading.tsx` | Shown during route load |
| `error` | `error.tsx` | Error boundary for the segment |
| `not-found` | `notFound.tsx` / `not-found.tsx` | Rendered when no route matches |
| `parallel` | `@slotName/layout.tsx` | Parallel slot, rendered alongside main content |
| `group` | Layout inside `(group)/` | Applied without adding a URL segment |

## Special layouts

### Loading layout

```tsx
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="skeleton-shell">
      <div className="skeleton-sidebar" />
      <div className="skeleton-content" />
    </div>
  );
}
```

### Error layout

```tsx
// app/dashboard/error.tsx
interface ErrorLayoutProps {
  readonly error: Error;
  readonly reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorLayoutProps) {
  return (
    <section>
      <h2>Something went wrong in the dashboard</h2>
      <p>{error.message}</p>
      <button type="button" onClick={reset}>Try again</button>
    </section>
  );
}
```

### Not-found layout

```tsx
// app/notFound.tsx
export default function NotFound() {
  return (
    <main>
      <h1>404 - Page not found</h1>
      <click to="/">Return home</click>
    </main>
  );
}
```

## Common mistakes

- Creating `Layout.tsx` instead of `layout.tsx` - the scanner matches exact lowercase filenames.
- Forgetting the root layout - without `app/layout.tsx` the HTML shell will not render.
- Adding a layout inside a `(group)` and expecting it to affect routes outside the group - route groups are scoped.

## Related docs

- [`routing.md`](./routing.md) - file-based routing overview
- [`data.md`](./data.md) - data fetching strategy per route
- [`templates.md`](./templates.md) - how the fullstack template structures layouts
