# Rakta.js Custom Tags

Rakta.js has exactly **10 official custom tags**. Four older primitives remain supported for compatibility, but they are not counted as official custom tags.

## Official Custom Tags

| Tag | Purpose | Key props |
| --- | --- | --- |
| `<click>` | SPA navigation without full reloads | `to`, `prefetch`, `replace`, `activeClassName` |
| `<picture>` | Optimized image rendering when used with `path` | `path`, `alt`, `width`, `height`, `priority` |
| `<lazy>` | Deferred rendering/loading boundary | `fallback`, `delayMs` |
| `<guard>` | Permission or route authorization boundary | `isAllowed`, `fallback` |
| `<seal>` | Runtime error boundary | `fallback` |
| `<shelf>` | Local state persistence boundary | `storageKey`, `initialValue` |
| `<island>` | Client/hydration island boundary | `mode`, `fallback`, `rootMargin` |
| `<prefetch>` | Route or data prefetch hint | `to`, `as`, `when` |
| `<route>` | Route-state UI boundary | `path`, `exact`, `fallback` |
| `<resource>` | Declarative browser resource hint | `href`, `rel`, `as`, `crossOrigin` |

## Compatibility Tags

These tags remain implemented and exported, but are excluded from the official count: `<pantura>`, `<reborns>`, `<form>`, and `<title>`.

## Examples

```tsx
<click to="/dashboard" activeClassName="text-red-600">Dashboard</click>
<picture path="/hero.png" alt="Rakta.js hero" priority />

<lazy fallback={<p>Loading chart...</p>} delayMs={120}>
  <AnalyticsChart />
</lazy>

<guard isAllowed={session.role === "admin"} fallback={<p>Access denied.</p>}>
  <AdminPanel />
</guard>

<seal fallback={(error) => <p>{error.message}</p>}>
  <RiskyWidget />
</seal>

<shelf storageKey="theme" initialValue="dark">
  {(theme, setTheme) => (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme}
    </button>
  )}
</shelf>

<island mode="visible" fallback={<p>Preparing editor...</p>}>
  <RichEditor />
</island>

<prefetch to="/dashboard" as="document" when="hover">
  Warm dashboard
</prefetch>

<route path="/dashboard" fallback={<p>Open the dashboard route.</p>}>
  <DashboardSummary />
</route>

<resource href="/fonts/inter.woff2" rel="preload" as="font" crossOrigin="anonymous" />
```

## Preserved Compatibility Examples

```tsx
<pantura to="features" offset={80}>Features</pantura>
<reborns id="features"><h2>Features</h2></reborns>

<form action="/api/login" csrfToken={token}>
  <input type="email" name="email" required />
</form>

<title>Dashboard - Rakta.js</title>
```