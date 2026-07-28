# Publishing

Rakta.js mem-publish dua package npm dari GitHub Actions menggunakan **npm Trusted Publishing (OIDC)**. Tidak ada `NPM_TOKEN` berumur panjang yang disimpan di mana pun dalam repository.

---

## Package

| Package npm | Direktori sumber | Halaman npm |
|---|---|---|
| `raktajs` | `packages/rakta` | https://www.npmjs.com/package/raktajs |
| `create-rakta-app` | `packages/create-rakta` | https://www.npmjs.com/package/create-rakta-app |

---

## Arsitektur

```
Developer push git tag  →  buat GitHub Release
         ↓
GitHub Actions publish.yml berjalan (release: published)
         ↓
Token identitas OIDC dikeluarkan GitHub untuk workflow
         ↓
npm Trusted Publishing memvalidasi token
         ↓
validasi versi  (tag == versi di package.json)
cek konflik versi  (versi belum ada di npm)
         ↓
typecheck → lint → test → build
         ↓
npm pack --dry-run  (validasi isi tarball)
         ↓
npm publish --provenance  (attestasi SLSA disematkan)
         ↓
Package aktif di npm dengan provenance terverifikasi
```

---

## Workflow

### CI - `.github/workflows/ci.yml`

Berjalan pada setiap push ke `main` dan setiap pull request yang menargetkan `main`.

- **Tidak mem-publish package.**
- Menjalankan: typecheck → lint → test → build → workspace check
- Menggunakan `bun install --frozen-lockfile` untuk install yang dapat direproduksi
- Concurrency: membatalkan run yang redundan pada branch/PR yang sama
- Permission: hanya `contents: read`

### Publish - `.github/workflows/publish.yml`

Hanya berjalan pada:
1. GitHub Release yang dipublish (`release: published`)
2. `workflow_dispatch` manual (untuk dist-tag `latest`, `next`, atau `beta`)

Urutan langkah:

1. Checkout (frozen)
2. Setup Bun 1.3.11 + Node.js 22
3. `bun install --frozen-lockfile`
4. **Validasi versi** - git tag (misal `v1.0.7`) harus cocok dengan `packages/rakta/package.json` dan `packages/create-rakta/package.json`. Workflow gagal jika tidak cocok.
5. **Cek konflik versi** - query npm untuk memastikan versi belum pernah dipublish. Mencegah publish ulang yang tidak disengaja.
6. typecheck → lint → test → build
7. `npm pack --dry-run` untuk kedua package
8. Smoke test CLI (`node packages/create-rakta/dist/index.js --version`)
9. `npm publish --access public --provenance` untuk `raktajs`
10. `npm publish --access public --provenance` untuk `create-rakta-app`

Permission:

```yaml
permissions:
  contents: read   # hanya checkout
  id-token: write  # token OIDC untuk npm Trusted Publishing
```

Tidak ada permission lain. `write-all` tidak pernah digunakan.

Perlindungan concurrency:

```yaml
concurrency:
  group: npm-release
  cancel-in-progress: false   # jangan pernah batalkan release yang sedang berjalan
```

---

## OIDC Trusted Publishing - Cara Kerjanya

npm Trusted Publishing menggunakan GitHub Actions OIDC (OpenID Connect). Alih-alih token rahasia berumur panjang:

1. GitHub Actions menghasilkan JWT OIDC berumur pendek untuk workflow run.
2. JWT berisi klaim: pemilik repository, nama repository, nama file workflow, nama environment.
3. npm memvalidasi JWT terhadap konfigurasi Trusted Publisher pada package.
4. Jika semua klaim cocok, npm mengizinkan publish tanpa token yang dibagikan sebelumnya.

Ini berarti:
- Tidak ada `NPM_TOKEN` di GitHub Secrets
- Tidak perlu rotasi token
- Token tidak bisa dicuri dari source code atau log CI
- Hanya bisa berjalan dari file workflow dan environment yang kamu konfigurasi

---

## KONFIGURASI MANUAL DIPERLUKAN - npmjs.com

Ini adalah **langkah manual satu kali** yang harus dilakukan di npmjs.com. Tidak bisa diotomasi dari repository.

Lakukan ini untuk **kedua** package sebelum publish OIDC pertama kali:

### Untuk `raktajs`

1. Buka https://www.npmjs.com/package/raktajs
2. Klik **Settings** → **Publishing**
3. Di bawah **Trusted Publishers**, klik **Add a publisher**
4. Pilih **GitHub Actions**
5. Isi:

| Field | Value |
|---|---|
| GitHub owner | `RheinSullivan` |
| Repository name | `raktajs` |
| Workflow filename | `publish.yml` |
| Environment name | `npm` |

6. Simpan.

### Untuk `create-rakta-app`

1. Buka https://www.npmjs.com/package/create-rakta-app
2. Ulangi langkah yang sama dengan nilai identik.

> **Penting:** Gunakan `publish.yml` (nama file saja), bukan path lengkap `.github/workflows/publish.yml`.

---

## KONFIGURASI MANUAL DIPERLUKAN - GitHub

### GitHub Environment `npm`

Workflow publish menggunakan `environment: npm`. Kamu perlu membuat environment ini di GitHub:

1. Buka https://github.com/RheinSullivan/raktajs/settings/environments
2. Klik **New environment**
3. Beri nama `npm`
4. Opsional: tambahkan **Required reviewers** untuk perlindungan tambahan sebelum publish
5. Opsional: batasi ke pola branch/tag tertentu (misal hanya tag `v*`)

> Tanpa environment ini, publishing tetap berjalan tetapi kamu kehilangan opsi untuk menambah gerbang persetujuan.

---

## Proses Release - Langkah demi Langkah

1. **Buat perubahan** di branch fitur, buka PR, tunggu CI hijau.

2. **Merge ke `main`** setelah review.

3. **Bump versi** - update keduanya:
   - `packages/rakta/package.json` → `"version": "X.Y.Z"`
   - `packages/create-rakta/package.json` → `"version": "X.Y.Z"`

   Kedua package saat ini menggunakan versi yang sama. Commit perubahan ini.

4. **Buat GitHub Release:**
   - Buka https://github.com/RheinSullivan/raktajs/releases/new
   - Tag: `vX.Y.Z` (misal `v1.0.7`)
   - Judul: `Rakta.js vX.Y.Z`
   - Tulis release notes
   - Klik **Publish release**

5. `publish.yml` berjalan otomatis. Workflow akan:
   - Memverifikasi tag cocok dengan versi kedua package
   - Memastikan versi belum ada di npm
   - Build, test, pack, dan publish dengan provenance

6. **Verifikasi di npm:**
   - https://www.npmjs.com/package/raktajs
   - https://www.npmjs.com/package/create-rakta-app

---

## Provenance

Kedua package dipublish dengan `--provenance`. Ini membuat attestasi SLSA (Supply Chain Levels for Software Artifacts) yang ditandatangani dan menghubungkan setiap package yang dipublish ke:

- Repository GitHub yang tepat
- Commit SHA yang tepat
- Workflow run yang tepat

Pengguna dapat memverifikasi provenance di halaman package npm atau dengan:

```bash
npm audit signatures raktajs
npm audit signatures create-rakta-app
```

---

## Konsistensi Versi

Kedua package saat ini menggunakan nomor versi yang sama. Saat merilis:

- Tag `v1.0.7` harus cocok dengan `"version": "1.0.7"` di **kedua** `packages/rakta/package.json` dan `packages/create-rakta/package.json`.
- Jika tidak cocok, workflow gagal dengan error yang jelas sebelum mempublish apapun.

---

## Publish Manual Darurat

Jika CI sedang down dan kamu harus publish secara manual:

```bash
# Dari root repository
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run test
bun run build

# Publish (perlu login ke npm dengan 2FA aktif)
cd packages/rakta && npm publish --access public
cd ../create-rakta && npm publish --access public
```

> Publish manual tidak menghasilkan attestasi provenance. Gunakan hanya sebagai pilihan terakhir.

---

## Rollback / Deprecation

npm tidak mengizinkan unpublish versi yang lebih dari 72 jam. Untuk menangani release yang bermasalah:

```bash
# Deprecate versi tertentu
npm deprecate raktajs@1.0.7 "Bug kritis - gunakan 1.0.7"
npm deprecate create-rakta-app@1.0.7 "Bug kritis - gunakan 1.0.7"
```

Kemudian segera rilis versi yang sudah diperbaiki.

---

## Troubleshooting

**`npm publish` gagal dengan 401 Unauthorized**

Trusted Publisher belum dikonfigurasi di npmjs.com untuk package ini, atau nama file workflow / nama environment tidak cocok. Lihat bagian konfigurasi manual di atas.

**Workflow gagal di validasi versi**

Git tag (misal `v1.0.7`) tidak cocok dengan field `"version"` di salah satu atau kedua file `package.json`. Bump versi dan buat tag baru.

**Workflow gagal di cek konflik versi**

Versi tersebut sudah dipublish di npm. Kamu harus menaikkan versi.

**`bun install --frozen-lockfile` gagal**

File `bun.lock` sudah tidak sinkron. Jalankan `bun install` secara lokal, commit lockfile yang diperbarui.

---

## Catatan Keamanan

- Tidak ada `NPM_TOKEN` yang disimpan di GitHub Secrets atau source code.
- `.npmrc` hanya berisi konfigurasi registry. Tidak ada token autentikasi.
- Workflow publish tidak bisa dipicu oleh pull request dari fork. Token OIDC GitHub yang dikeluarkan untuk fork PR tidak memiliki permission `id-token: write` dan tidak akan cocok dengan konfigurasi Trusted Publisher.
- `npm install -g npm@latest` **tidak** digunakan di CI. Node.js 22 LTS sudah menyertakan npm ≥10 yang mendukung OIDC. Mem-pin versi runtime lebih aman daripada menarik install global yang tidak di-pin.
