# 10 Tag Kustom & Primitif Resmi Rakta.js

Rakta.js menyediakan tepat **10 tag kustom dan primitif resmi bawaan** untuk memperjelas intent aplikasi, mengoptimalkan navigasi, menangani loading & error boundary, serta mempermudah proteksi rute tanpa menulis boilerplate tambahan.

## Ringkasan 10 Tag Kustom Resmi
| Tag | Fungsi & Intent Utama | Props / Atribut Utama |
| --- | --- | --- |
| `<click>` | Navigasi SPA instan tanpa reload browser | `to`, `prefetch`, `activeClassName` |
| `<picture>` | Komponen gambar teroptimasi & lazy-loading | `path`, `alt` |
| `<pantura>` | Pemicu navigasi scroll halus ke seksi | `to`, `duration`, `offset` |
| `<reborns>` | Penanda lokasi target scroll seksi | `id` |
| `<lazy>` | Batas penundaan render & loading boundary | `fallback`, `delayMs` |
| `<guard>` | Batas proteksi rute & hak akses role | `isAllowed`, `fallback` |
| `<seal>` | Batas penanganan error runtime (Error Boundary) | `fallback` |
| `<form>` | Pembungkus form bawaan dengan injeksi auto-CSRF | `action`, `csrfToken`, `onSubmit` |
| `<title>` | Pengatur judul dokumen deklaratif | `text` |
| `<shelf>` | Batas persistensi state & caching lokal | `storageKey`, `initialValue` |

---

## 1. Tag Navigasi: `<click>`
Tag `<click>` digunakan untuk navigasi antarhalaman Single Page Application (SPA) secara instan tanpa reload browser.

```tsx
<click to="/dashboard" activeClassName="text-sky-400 font-bold">
  Buka Dashboard
</click>
```

---

## 2. Tag Gambar Teroptimasi: `<picture>` / `<photo>`
Tag `<picture>` (atau `<photo>`) digunakan untuk menampilkan gambar dengan lazy loading otomatis, pengodean responsif, dan pencegahan layout shift (CLS).

```tsx
<picture path="/assets/hero.png" alt="Rakta Hero" className="w-full h-auto" />
```

---

## 3. Tag Navigasi Seksi: `<pantura>` & `<reborns>`
Pasangan `<pantura>` dan `<reborns>` memberikan dukungan navigasi scroll halus (smooth scrolling) antar seksi pada halaman tunggal.

```tsx
<pantura to="fitur" duration={600} offset={-80}>
  Lihat Fitur
</pantura>

<reborns id="fitur" className="py-20">
  <h2>Fitur Utama Rakta.js</h2>
</reborns>
```

---

## 4. Tag Batas Loading: `<lazy>`
Tag `<lazy>` menyediakan batas penundaan render (deferred boundary) atau Suspense fallback untuk komponen asynchronous.

```tsx
<lazy fallback={<p>Memuat widget...</p>} delayMs={200}>
  <ComplexDashboardWidget />
</lazy>
```

---

## 5. Tag Proteksi Akses: `<guard>`
Tag `<guard>` menyederhanakan kondisional hak akses atau role-based authorization pada antarmuka pengguna.

```tsx
<guard isAllowed={user.role === "ADMIN"} fallback={<p>Akses ditolak.</p>}>
  <AdminControlPanel />
</guard>
```

---

## 6. Tag Penanganan Error: `<seal>`
Tag `<seal>` menangkap error runtime pada komponen anak dan menampilkan tampilan fallback secara aman tanpa membuat seluruh aplikasi crash.

```tsx
<seal fallback={(error) => <p className="text-red-500">Terjadi kesalahan: {error.message}</p>}>
  <UnstableAnalyticsWidget />
</seal>
```

---

## 7. Tag Form Auto-CSRF: `<form>`
Tag `<form>` membungkus elemen form standar dan secara otomatis menyisipkan hidden input token CSRF jika diberikan.

```tsx
<form action="/api/login" csrfToken={csrfToken} onSubmit={handleFormSubmit}>
  <input type="email" name="email" required />
  <button type="submit">Masuk</button>
</form>
```

---

## 8. Tag Judul Deklaratif: `<title>`
Tag `<title>` memperbarui judul tab browser (`document.title`) secara deklaratif langsung dari komponen mana saja.

```tsx
<title>Dashboard Pengguna - Rakta.js</title>
```

---

## 9. Tag Persistensi State: `<shelf>`
Tag `<shelf>` menyimpan dan memulihkan state lokal ke `localStorage` secara otomatis tanpa perlu menulis effect manual.

```tsx
<shelf storageKey="user_theme" initialValue="dark">
  {(theme, setTheme) => (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Tema Saat Ini: {theme}
    </button>
  )}
</shelf>
```
