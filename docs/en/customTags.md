# 10 Official Rakta.js Custom Tags & Primitives

Rakta.js includes **EXACTLY 10 official custom tags and primitives** designed to declare application intent, optimize navigation, manage loading & error boundaries, and streamline route authorization without extra boilerplate.

## 10 Official Custom Primitives Summary
| Tag | Main Intent & Purpose | Key Attributes / Props |
| --- | --- | --- |
| `<click>` | Instant client-side SPA navigation | `to`, `prefetch`, `activeClassName` |
| `<picture>` | Optimized responsive image component | `path`, `alt` |
| `<pantura>` | Smooth section scroll trigger | `to`, `duration`, `offset` |
| `<reborns>` | Section scroll target marker | `id` |
| `<lazy>` | Deferred rendering & loading boundary | `fallback`, `delayMs` |
| `<guard>` | Route & authorization protection boundary | `isAllowed`, `fallback` |
| `<seal>` | Runtime error boundary component | `fallback` |
| `<form>` | Form wrapper with auto-CSRF token injection | `action`, `csrfToken`, `onSubmit` |
| `<title>` | Declarative document title metadata primitive | `text` |
| `<shelf>` | Local state persistence boundary | `storageKey`, `initialValue` |

---

## 1. Navigation Primitive: `<click>`
Instant Single Page Application (SPA) navigation without full page reloads.

```tsx
<click to="/dashboard" activeClassName="text-sky-400 font-bold">
  Open Dashboard
</click>
```

---

## 2. Optimized Image Primitive: `<picture>` / `<photo>`
Responsive images with automatic lazy loading, layout shift prevention, and high-performance loading.

```tsx
<picture path="/assets/hero.png" alt="Rakta Hero" className="w-full h-auto" />
```

---

## 3. Section Scroll Primitives: `<pantura>` & `<reborns>`
Smooth section-to-section scrolling on single-page layouts.

```tsx
<pantura to="features" duration={600} offset={-80}>
  Explore Features
</pantura>

<reborns id="features" className="py-20">
  <h2>Core Features</h2>
</reborns>
```

---

## 4. Deferred Loading Boundary: `<lazy>`
Defers component rendering or supplies Suspense fallbacks.

```tsx
<lazy fallback={<p>Loading widget...</p>} delayMs={200}>
  <HeavyAnalyticsWidget />
</lazy>
```

---

## 5. Authorization Boundary: `<guard>`
Conditionally renders UI elements based on user permissions or roles.

```tsx
<guard isAllowed={user.role === "ADMIN"} fallback={<p>Access Denied.</p>}>
  <AdminPanel />
</guard>
```

---

## 6. Error Boundary Primitive: `<seal>`
Catches runtime component errors safely without crashing the application.

```tsx
<seal fallback={(error) => <p className="text-red-500">Error: {error.message}</p>}>
  <UnstableWidget />
</seal>
```

---

## 7. Auto-CSRF Form Primitive: `<form>`
Wraps standard forms and injects hidden CSRF tokens automatically.

```tsx
<form action="/api/login" csrfToken={token} onSubmit={handleSubmit}>
  <input type="email" name="email" required />
  <button type="submit">Sign In</button>
</form>
```

---

## 8. Declarative Document Title Primitive: `<title>`
Updates `document.title` declaratively from any component.

```tsx
<title>User Dashboard - Rakta.js</title>
```

---

## 9. State Persistence Boundary Primitive: `<shelf>`
Automatically syncs and restores component state to `localStorage`.

```tsx
<shelf storageKey="theme_pref" initialValue="dark">
  {(theme, setTheme) => (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Current Theme: {theme}
    </button>
  )}
</shelf>
```
