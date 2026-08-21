# Tag Kustom Rakta.js

Rakta.js memiliki tepat **10 tag kustom resmi**. Empat primitif lama tetap didukung untuk kompatibilitas, tetapi tidak dihitung sebagai tag resmi.

## Tag Kustom Resmi

| Tag | Tujuan | Props utama |
| --- | --- | --- |
| `<click>` | Navigasi SPA tanpa reload penuh | `to`, `prefetch`, `replace`, `activeClassName` |
| `<picture>` | Rendering gambar teroptimasi saat memakai `path` | `path`, `alt`, `width`, `height`, `priority` |
| `<lazy>` | Boundary loading dan render tertunda | `fallback`, `delayMs` |
| `<guard>` | Boundary izin akses atau proteksi route | `isAllowed`, `fallback` |
| `<seal>` | Boundary error runtime | `fallback` |
| `<shelf>` | Boundary persistensi state lokal | `storageKey`, `initialValue` |
| `<island>` | Boundary island/hydration client | `mode`, `fallback`, `rootMargin` |
| `<prefetch>` | Hint prefetch route atau data | `to`, `as`, `when` |
| `<route>` | Boundary UI berbasis state route | `path`, `exact`, `fallback` |
| `<resource>` | Hint resource browser secara deklaratif | `href`, `rel`, `as`, `crossOrigin` |

## Tag Kompatibilitas

Tag berikut tetap diimplementasikan dan diekspor, tetapi tidak masuk hitungan resmi: `<pantura>`, `<reborns>`, `<form>`, dan `<title>`.

## Contoh

```tsx
<click to="/dashboard" activeClassName="text-red-600">Dashboard</click>
<picture path="/hero.png" alt="Hero Rakta.js" priority />

<lazy fallback={<p>Memuat chart...</p>} delayMs={120}>
  <AnalyticsChart />
</lazy>

<guard isAllowed={session.role === "admin"} fallback={<p>Akses ditolak.</p>}>
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

<island mode="visible" fallback={<p>Menyiapkan editor...</p>}>
  <RichEditor />
</island>

<prefetch to="/dashboard" as="document" when="hover">
  Panaskan dashboard
</prefetch>

<route path="/dashboard" fallback={<p>Buka route dashboard.</p>}>
  <DashboardSummary />
</route>

<resource href="/fonts/inter.woff2" rel="preload" as="font" crossOrigin="anonymous" />
```

## Contoh Kompatibilitas

```tsx
<pantura to="features" offset={80}>Fitur</pantura>
<reborns id="features"><h2>Fitur</h2></reborns>

<form action="/api/login" csrfToken={token}>
  <input type="email" name="email" required />
</form>

<title>Dashboard - Rakta.js</title>
```