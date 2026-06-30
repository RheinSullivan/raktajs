# Security Policy

---

## Indonesian

Rakta.js masih berada di fase pengembangan aktif `0.x`. Selama fase ini, API publik masih bisa berubah, tetapi laporan keamanan tetap diprioritaskan dan akan ditangani dengan serius.

Security policy ini berlaku untuk package utama Rakta.js, CLI generator, dan template bawaan yang dibuat langsung dari repository ini.

---

### Versi yang Didukung

Untuk saat ini, security fix hanya diberikan ke versi `0.x` terbaru yang sudah dipublish.

| Package | Dukungan |
| --- | --- |
| `rakta` | latest `0.x` |
| `create-rakta-app` | latest `0.x` |

Versi lama di bawah rilis terbaru tidak dijamin menerima patch terpisah selama Rakta.js masih berada di fase `0.x`.

Kalau kamu menemukan masalah keamanan di versi lama, coba reproduksi dulu di versi terbaru. Kalau masih terjadi, segera laporkan.

---

### Melaporkan Vulnerability

Jangan membuka public GitHub issue untuk vulnerability.

Gunakan jalur private supaya detail teknis tidak langsung terekspos ke publik.

Cara melaporkan:
1. Buka GitHub Security Advisory di repository:
```txt
https://github.com/RheinSullivan/raktajs/security/advisories/new
```

2. Kalau kamu tidak bisa memakai GitHub Security Advisory, buka issue biasa dengan judul:
```txt
Security contact requested
```

Jangan tulis detail teknis vulnerability di issue tersebut. Maintainer akan follow up melalui channel private.

---

### Informasi yang Perlu Disertakan

Agar laporan bisa ditangani lebih cepat, sertakan informasi berikut:
- deskripsi vulnerability
- dampak yang mungkin terjadi
- langkah reproduksi
- proof of concept minimal jika ada
- package yang terdampak, misalnya `rakta` atau `create-rakta-app`
- versi package yang digunakan
- versi Bun
- sistem operasi
- konfigurasi project jika relevan
- estimasi severity jika kamu memilikinya

Contoh ringkas:
```txt
Package: rakta
Version: 0.1.0
Bun: 1.3.x
OS: Windows 11
Impact: API route can expose unexpected file content when path is crafted in a specific way.
Reproduction: ...
```

---

### Scope

Security policy ini mencakup:
- package `rakta`
- package `create-rakta-app`
- CLI command bawaan Rakta.js
- runtime, router, renderer, SEO, RPC, HTTP client, PWA, dan auto import yang berada di package `rakta`
- kode yang digenerate oleh template resmi `create-rakta-app`, jika vulnerability berasal dari template bawaan Rakta.js

Security policy ini tidak mencakup:
- dependency pihak ketiga yang ditambahkan sendiri oleh user
- bug keamanan di framework backend pihak ketiga seperti Express.js, Nest.js, Adonis.js, atau framework lain
- konfigurasi deployment milik user
- environment variable yang bocor karena salah konfigurasi project
- kode aplikasi user yang tidak berasal dari template resmi Rakta.js

Kalau vulnerability berasal dari dependency pihak ketiga, laporkan juga ke upstream package tersebut.

---

### Contoh Masalah yang Masuk Scope

Contoh laporan yang masuk scope Rakta.js:
- route matcher membuka path yang seharusnya tidak bisa diakses
- static file server membaca file di luar folder public
- generated template menyimpan secret di client bundle
- RPC handler menerima input berbahaya tanpa validasi dasar
- PWA service worker bawaan melakukan cache file yang seharusnya tidak dicache
- CLI generator membuat konfigurasi default yang tidak aman

Contoh yang bukan scope langsung Rakta.js:
- aplikasi user menyimpan token di localStorage
- user menambahkan dependency yang vulnerable
- server production salah konfigurasi CORS
- backend Express/Nest/Adonis custom milik user memiliki bug sendiri

---

### Proses Setelah Laporan Diterima

Setelah laporan diterima:
1. Maintainer akan membaca dan mengonfirmasi laporan.
2. Maintainer akan mencoba mereproduksi masalah.
3. Jika valid, maintainer akan menentukan severity dan area terdampak.
4. Fix akan dibuat di branch private atau branch terbatas jika diperlukan.
5. Rilis patch akan disiapkan.
6. Setelah aman, detail vulnerability dapat diumumkan di release notes atau advisory.

Kami akan berusaha memberi kabar secepat mungkin. Waktu perbaikan bisa berbeda tergantung tingkat risiko dan luas perubahan yang dibutuhkan.

---

### Disclosure

Jangan mempublikasikan detail vulnerability sebelum fix tersedia.

Koordinasikan disclosure dengan maintainer agar user Rakta.js punya waktu untuk update.

Jika kamu ingin tetap anonim, tulis di laporan. Kalau kamu ingin diberi kredit, sertakan nama, GitHub profile, atau link portfolio yang ingin ditampilkan.

---

### Kredit Reporter

Reporter vulnerability akan diberi kredit di release notes atau security advisory, kecuali reporter memilih untuk tetap anonim.

Contoh kredit:
```txt
Reported by @username
```

atau:
```txt
Reported by Nama Contributor
```

---

### Kontak

Jalur utama pelaporan security adalah GitHub Security Advisory:
```txt
https://github.com/RheinSullivan/raktajs/security/advisories/new
```

Kalau jalur tersebut tidak tersedia, gunakan issue dengan judul:
```txt
Security contact requested
```

Tanpa detail teknis vulnerability.

---

Terima kasih sudah membantu menjaga Rakta.js dan user-nya tetap aman.

---

## English

Rakta.js is currently in active `0.x` development. During this stage, public APIs may still change, but security reports are still prioritized and handled seriously.

This security policy applies to the main Rakta.js package, the CLI generator, and official templates shipped from this repository.

---

### Supported Versions

For now, security fixes are applied to the latest published `0.x` release.

| Package | Supported |
| --- | --- |
| `rakta` | latest `0.x` |
| `create-rakta-app` | latest `0.x` |

Older versions below the latest release are not guaranteed to receive separate security patches while Rakta.js is still in `0.x`.

If you find a security issue in an older version, try to reproduce it on the latest release first. If it still happens, please report it.

---

### Reporting a Vulnerability

Do not open a public GitHub issue for security vulnerabilities.

Use a private channel so technical details are not exposed publicly before a fix is available.

How to report:
1. Open a GitHub Security Advisory in the repository:
```txt
https://github.com/RheinSullivan/raktajs/security/advisories/new
```

2. If you cannot use GitHub Security Advisory, open a regular issue with this title:
```txt
Security contact requested
```

Do not include technical vulnerability details in that issue. A maintainer will follow up through a private channel.

---

### What to Include

To help us investigate faster, include:
- vulnerability description
- possible impact
- reproduction steps
- minimal proof of concept when available
- affected package, such as `rakta` or `create-rakta-app`
- package version
- Bun version
- operating system
- relevant project configuration
- suggested severity if you have one

Short example:
```txt
Package: rakta
Version: 0.1.0
Bun: 1.3.x
OS: Windows 11
Impact: API route can expose unexpected file content when path is crafted in a specific way.
Reproduction: ...
```

---

### Scope

This security policy covers:
- the `rakta` package
- the `create-rakta-app` package
- official Rakta.js CLI commands
- runtime, router, renderer, SEO, RPC, HTTP client, PWA, and auto import code inside the `rakta` package
- code generated by official `create-rakta-app` templates, when the vulnerability comes from the Rakta.js template itself

This security policy does not cover:
- third-party dependencies added manually by users
- security bugs in third-party backend frameworks such as Express.js, Nest.js, Adonis.js, or other frameworks
- user deployment configuration
- leaked environment variables caused by project misconfiguration
- user application code that does not come from official Rakta.js templates

If the vulnerability comes from a third-party dependency, please also report it to the upstream package.

---

### Examples of In-Scope Issues

Examples that are in scope for Rakta.js:
- route matcher exposes a path that should not be accessible
- static file server reads files outside the public directory
- generated template stores secrets in the client bundle
- RPC handler accepts dangerous input without basic validation
- built-in PWA service worker caches files that should not be cached
- CLI generator creates insecure default configuration

Examples that are not directly in scope:
- user application stores tokens in localStorage
- user adds a vulnerable dependency
- production server has incorrect CORS configuration
- custom user Express/Nest/Adonis backend has its own bug

---

### What Happens After a Report

After a report is received:
1. A maintainer will read and acknowledge the report.
2. A maintainer will try to reproduce the issue.
3. If valid, the severity and affected area will be identified.
4. A fix will be developed in a private or limited branch when needed.
5. A patch release will be prepared.
6. Once safe, details may be published in release notes or a security advisory.

We will try to respond as soon as possible. Fix time may vary depending on severity and the amount of work required.

---

### Disclosure

Do not publish vulnerability details before a fix is available.

Coordinate disclosure with the maintainer so Rakta.js users have time to update.

If you prefer to stay anonymous, say so in your report. If you want credit, include the name, GitHub profile, or portfolio link you want listed.

---

### Reporter Credit

Vulnerability reporters will be credited in release notes or security advisories, unless they choose to remain anonymous.

Example credit:
```txt
Reported by @username
```

or:
```txt
Reported by Contributor Name
```

---

### Contact

The main security reporting channel is GitHub Security Advisory:
```txt
https://github.com/RheinSullivan/raktajs/security/advisories/new
```

If that is not available, open an issue titled:
```txt
Security contact requested
```

Do not include technical vulnerability details.

---

Thank you for helping keep Rakta.js and its users safe.