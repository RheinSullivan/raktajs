# Rakta.js Framework Elements

Rakta.js ships **10 built-in JSX elements** that look like HTML but carry framework-level behavior at runtime. You use them directly in your components — no import needed when auto-import is enabled.

Four older elements remain fully supported for compatibility but are not counted in the core set.

## Core Elements

| Element | What It Does | Key Props |
| --- | --- | --- |
| `<click>` | Client-side navigation without full page reloads | `to`, `prefetch`, `replace`, `activeClassName` |
| `<picture>` | Optimized image rendering | `path`, `alt`, `width`, `height`, `priority` |
| `<lazy>` | Deferred rendering boundary with optional delay | `fallback`, `delayMs` |
| `<guard>` | Permission and route authorization boundary | `isAllowed`, `fallback` |
| `<seal>` | Runtime error boundary | `fallback` |
| `<shelf>` | Local state persistence to localStorage | `storageKey`, `initialValue` |
| `<island>` | Client hydration island with load strategy | `mode`, `fallback`, `rootMargin` |
| `<prefetch>` | Route or resource prefetch hint | `to`, `as`, `when` |
| `<route>` | Route-conditional UI boundary | `path`, `exact`, `fallback` |
| `<resource>` | Declarative browser resource hint (`<link>` injection) | `href`, `rel`, `as`, `crossOrigin` |

## Compatibility Elements

These elements remain implemented and exported but are not part of the core set:

| Element | What It Does |
| --- | --- |
| `<pantura>` | Smooth scroll trigger — navigates to a `<reborns>` target by ID |
| `<reborns>` | Scroll anchor target — receives `<pantura>` navigation |
| `<form>` | Form wrapper with automatic CSRF token injection |
| `<title>` | Declarative document title update from any component |

## Usage Examples

### Navigation

```tsx
<click to="/dashboard" activeClassName="text-red-600">
  Dashboard
</click>
```

### Image

```tsx
<picture path="/hero.png" alt="Rakta.js hero" priority />
```

### Deferred Loading

```tsx
<lazy fallback={<p>Loading chart...</p>} delayMs={120}>
  <AnalyticsChart />
</lazy>
```

### Authorization Boundary

```tsx
<guard isAllowed={session.role === "admin"} fallback={<p>Access denied.</p>}>
  <AdminPanel />
</guard>
```

### Error Boundary

```tsx
<seal fallback={(error) => <p>{error.message}</p>}>
  <RiskyWidget />
</seal>
```

### State Persistence

```tsx
<shelf storageKey="theme" initialValue="dark">
  {(theme, setTheme) => (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme}
    </button>
  )}
</shelf>
```

### Hydration Island

```tsx
<island mode="visible" fallback={<p>Preparing editor...</p>}>
  <RichEditor />
</island>
```

### Prefetch on Hover

```tsx
<prefetch to="/dashboard" as="document" when="hover">
  Warm dashboard
</prefetch>
```

### Route-conditional UI

```tsx
<route path="/dashboard" fallback={<p>Open the dashboard route.</p>}>
  <DashboardSummary />
</route>
```

### Resource Hint

```tsx
<resource href="/fonts/inter.woff2" rel="preload" as="font" crossOrigin="anonymous" />
```

## Compatibility Examples

```tsx
<pantura to="features" offset={80}>Features</pantura>
<reborns id="features"><h2>Features</h2></reborns>

<form action="/api/login" csrfToken={token}>
  <input type="email" name="email" required />
</form>

<title>Dashboard - Rakta.js</title>
```
