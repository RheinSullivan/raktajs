# Contributing to Rakta.js

> Small in size. Fierce in speed. Alive in every route.

---

## Indonesian

Terima kasih sudah mau berkontribusi untuk Rakta.js.

Rakta.js adalah framework frontend ringan berbasis Bun, React, dan TypeScript. Project ini dibuat untuk developer yang ingin membangun aplikasi modern dengan routing yang jelas, DX yang nyaman, dan struktur yang tidak terlalu berat.

Kontribusi yang baik bukan hanya soal menambah fitur. Kontribusi yang baik juga berarti menjaga project tetap stabil, mudah dipahami, mudah dites, dan tidak merusak fitur yang sudah berjalan.

---

### Daftar Isi

- [Contributing to Rakta.js](#contributing-to-raktajs)
	- [Indonesian](#indonesian)
		- [Daftar Isi](#daftar-isi)
		- [Persiapan](#persiapan)
		- [Struktur Project](#struktur-project)
		- [Aturan Umum](#aturan-umum)
		- [Penamaan File](#penamaan-file)
		- [Aturan TypeScript](#aturan-typescript)
		- [Public API](#public-api)
		- [Nama Fitur Rakta.js](#nama-fitur-raktajs)
		- [Bekerja di create-rakta-app](#bekerja-di-create-rakta-app)
		- [Template](#template)
		- [ShrimpRun](#shrimprun)
		- [Dokumentasi](#dokumentasi)
		- [Validasi](#validasi)
		- [Commit Message](#commit-message)
		- [Pull Request](#pull-request)
		- [Melaporkan Bug](#melaporkan-bug)
		- [Feature Request](#feature-request)
		- [Security](#security)
		- [Code of Conduct](#code-of-conduct)
		- [Kredit Kontribusi](#kredit-kontribusi)
	- [English](#english)
		- [Table of Contents](#table-of-contents)
		- [Getting Started](#getting-started)
		- [Project Structure](#project-structure)
		- [General Rules](#general-rules)
		- [File Naming](#file-naming)
		- [TypeScript Rules](#typescript-rules)
		- [Public API](#public-api-1)
		- [Rakta.js Feature Names](#raktajs-feature-names)
		- [Working on create-rakta-app](#working-on-create-rakta-app)
		- [Templates](#templates)
		- [ShrimpRun](#shrimprun-1)
		- [Documentation](#documentation)
		- [Validation](#validation)
		- [Commit Messages](#commit-messages)
		- [Pull Requests](#pull-requests)
		- [Reporting Bugs](#reporting-bugs)
		- [Feature Requests](#feature-requests)
		- [Security](#security-1)
		- [Code of Conduct](#code-of-conduct-1)
		- [Contribution Credit](#contribution-credit)

---

### Persiapan

Sebelum mengubah kode, pastikan environment sudah siap.

Requirements:
- Bun 1.3 atau lebih baru
- Git
- Editor dengan dukungan TypeScript
- Node.js hanya untuk kebutuhan tooling tertentu, bukan runtime utama

Clone repository:
```bash
git clone https://github.com/RheinSullivan/raktajs.git
cd raktajs
bun install
```

Jalankan validasi awal sebelum membuat perubahan:
```bash
bun run typecheck
bun run build
bun test
bun run lint
bun run check:workspace
```

Kalau command di atas gagal di clean checkout, buka issue terlebih dahulu. Jangan mencampur perubahan fitur dengan error yang tidak berhubungan.

---

### Struktur Project

Struktur utama repository:
```txt
raktajs/
├─ packages/
│  ├─ rakta/            core framework
│  └─ create-rakta/     create-rakta-app CLI generator
├─ templates/
│  ├─ frontendOnly/     frontend-only starter template
│  └─ fullstack/        fullstack starter template
├─ docs/
│  ├─ en/               English documentation
│  └─ id/               Indonesian documentation
└─ workspace.test.ts    workspace sanity test
```

Hanya boleh ada satu workspace sanity test di root repository:
```txt
workspace.test.ts
```

Jangan membuat file ini:
```txt
packages/workspace.test.ts
```

Test khusus package boleh dibuat dekat source code yang diuji.

Contoh:
```txt
packages/rakta/src/router/matcher.test.ts
packages/rakta/src/http/panturaFetch.test.ts
```

---

### Aturan Umum

- Jangan membuat komponen duplikat.
- Jangan membuat placeholder palsu hanya untuk menyembunyikan error.
- Jangan menghapus fitur yang sudah berjalan.
- Jangan commit generated output seperti `dist`, `.rakta`, `.next`, atau coverage.
- Jangan lint atau format `.history`, `node_modules`, `dist`, `.git`, `.next`, atau coverage.
- Jangan melemahkan TypeScript, Biome, atau validasi project.
- Jangan mengganti file besar dengan potongan kecil.
- Jangan mengubah banyak hal yang tidak berhubungan dalam satu Pull Request.
- Kalau mengubah file, pastikan perubahan itu memang diperlukan.
- Kalau memperbaiki bug, sertakan penjelasan singkat penyebab bug dan cara mengetesnya.

---

### Penamaan File

Rakta.js memakai `camelCase` untuk source file.

Benar:
```txt
createStore.ts
loadConfig.ts
panturaFetch.ts
shrimpRunGame.tsx
raktaShrimpMascot.tsx
```

Salah:
```txt
create-store.ts
load-config.ts
pantura-fetch.ts
shrimp-run-game.tsx
rakta-shrimp-mascot.tsx
```

File ekosistem tetap memakai nama standar tool masing-masing:
```txt
package.json
tsconfig.json
tsconfig.base.json
README.md
LICENSE
.gitignore
.npmrc
bunfig.toml
```

---

### Aturan TypeScript

Rakta.js menggunakan TypeScript strict. Jangan melemahkan konfigurasi TypeScript hanya agar error hilang.

Jangan gunakan:
```ts
any
as any
null
// @ts-ignore
// @ts-expect-error
```

`unknown` hanya boleh dipakai di batas luar sistem, misalnya:
- hasil parsing JSON
- HTTP response
- dynamic import
- input filesystem
- hasil prompt CLI

Setelah masuk ke fungsi, `unknown` harus langsung dicek dan dipersempit tipenya.

Contoh salah:
```ts
function parseInput(input: unknown) {
	return input.name;
}
```

Contoh benar:
```ts
function isNamedPayload(input: unknown): input is { name: string } {
	return (
		typeof input === "object" &&
		input !== null &&
		"name" in input &&
		typeof input.name === "string"
	);
}

function parseInput(input: unknown): string {
	if (!isNamedPayload(input)) {
		throw new Error("Invalid input payload.");
	}

	return input.name;
}
```

Untuk optional property, jangan isi property dengan explicit `undefined`.

Salah:
```ts
return {
	kind,
	inputSchema: this.inputSchema,
	handler,
};
```

Benar:
```ts
if (this.inputSchema !== undefined) {
	return {
		kind,
		inputSchema: this.inputSchema,
		handler,
	};
}

return {
	kind,
	handler,
};
```

Setiap exported function harus punya return type yang jelas.

```ts
export function createRoutePath(routeName: string): string {
	return `/${routeName}`;
}
```

Gunakan nama variable yang jelas.

Hindari:
```txt
data
res
req
ctx
fn
arg
opts
val
err
tmp
```

Gunakan:
```txt
requestPayload
response
request
runtimeContext
handler
requestOptions
parsedValue
originalError
temporaryPath
```

Nama pendek seperti `id`, `url`, atau `key` masih boleh digunakan kalau konteksnya jelas.

---

### Public API

Public API Rakta.js harus nyaman dipakai oleh developer React dan Next.js.

Jangan terlalu berlebihan memakai `readonly` pada interface yang ditulis langsung oleh user.

Boleh untuk internal manifest:
```ts
export interface RouteManifestEntry {
	readonly routePath: string;
	readonly filePath: string;
	readonly kind: RouteKind;
}
```

Lebih nyaman untuk public props:
```ts
export interface PageProps {
	params: Record<string, string>;
	searchParams: Record<string, string>;
}
```

Hindari bentuk seperti ini untuk user-facing API:
```ts
export interface PageProps {
	readonly params: Readonly<Record<string, string>>;
	readonly searchParams: Readonly<Record<string, string>>;
}
```

Internal type boleh strict. Public API harus tetap natural dan mudah dipakai.

---

### Nama Fitur Rakta.js

Gunakan nama fitur resmi Rakta.js secara konsisten.

| Name | Purpose |
| --- | --- |
| MendungWeave | file-based routing |
| ShrimpStep | navigation with `<click to="">` |
| TrusmiFrame | image component with `<picture path="">` |
| KasepuhanGate | file-based API endpoint |
| KanomanShield | route protection |
| SunyaragiCrown | metadata/head manager |
| CarubanWire | type-safe RPC |
| TrusmiThread | auto import system |
| CherbonsEngine | build/dev engine |
| NorthCoastFlow | runtime layer |
| WaliSignal | SEO, sitemap, robots, RSS |
| ShrimpHarbor | PWA/offline system |
| JatiLens | diagnostics/project health |
| PanturaFetch | built-in HTTP client |
| ShrimpRun | offline starter game |

Jangan membuat nama baru untuk fitur yang sama. Kode, dokumentasi, dan contoh harus memakai istilah yang konsisten.

---

### Bekerja di create-rakta-app

File generator utama ada di:
```txt
packages/create-rakta/src/generator.ts
```

File ini besar karena berisi banyak generator dalam satu tempat:
- root file generator
- frontend-only generator
- fullstack frontend generator
- backend generator
- Gaman.js generator
- Express.js generator
- Nest.js generator
- Adonis.js generator
- database helpers
- CSS helpers
- README generator
- main `generateProjectFiles` export

Jangan mengganti file ini dengan potongan kecil.

Sebelum mengubah `generator.ts`, jalankan:
```bash
wc -l packages/create-rakta/src/generator.ts
grep -n "function getRootFiles" packages/create-rakta/src/generator.ts
grep -n "function getFrontendOnlyFiles" packages/create-rakta/src/generator.ts
grep -n "function getFullstackFrontendFiles" packages/create-rakta/src/generator.ts
grep -n "function getBackendFiles" packages/create-rakta/src/generator.ts
grep -n "function getDatabaseDependencies" packages/create-rakta/src/generator.ts
grep -n "function generateProjectReadme" packages/create-rakta/src/generator.ts
grep -n "export function generateProjectFiles" packages/create-rakta/src/generator.ts
```

Setelah mengubah file, jalankan command yang sama.

Kalau jumlah line turun drastis atau salah satu section hilang, berarti file rusak dan harus direstore sebelum Pull Request dibuat.

---

### Template

Template harus benar-benar bisa dipakai user baru.

Frontend-only template harus tetap ringan dan jelas.

Fullstack template harus memisahkan folder dengan jelas:
```txt
frontend/
backend/
shared/
docs/
```

Jangan membuat placeholder kosong hanya untuk memenuhi struktur folder.

Ketika menambahkan halaman baru, pastikan:
- route bisa discan
- import valid
- typecheck lolos
- layout sesuai konteks
- styling memakai Tailwind utilities
- `globals.css` tetap minimal

Public pages boleh memakai navbar, footer, dan CTA.

Auth pages tidak boleh memakai marketing navbar atau footer.

Dashboard pages harus memakai dashboard layout dan tidak memakai marketing footer.

---

### ShrimpRun

`ShrimpRun` adalah starter game bawaan Rakta.js, bukan placeholder.

Main file:
```txt
templates/frontendOnly/app/components/shrimpRunGame.tsx
```

Kalau mengubah ShrimpRun, fitur ini harus tetap berjalan:
- click or tap to jump
- Space key to jump
- restart
- score
- high score
- collision detection
- obstacles
- increasing speed
- pause when the tab is inactive
- mobile responsiveness
- accessible labels
- no game library
- no external image assets

Karakter udang harus tetap dibuat dengan JSX, SVG, atau CSS.

Jangan memakai asset berlisensi atau gambar dari internet.

Jangan memotong file hanya supaya lint lolos. Perbaiki masalahnya tanpa menghapus behavior.

---

### Dokumentasi

Dokumentasi bahasa Inggris ada di:
```txt
docs/en/
```

Dokumentasi bahasa Indonesia ada di:
```txt
docs/id/
```

Kalau menambah dokumentasi baru, buat dua versi:
```txt
docs/en/topicName.md
docs/id/topicName.md
```

Gunakan `camelCase` untuk nama file dokumentasi.

Benar:
```txt
gettingStarted.md
autoImport.md
backendFrameworks.md
```

Salah:
```txt
getting-started.md
auto-import.md
backend-frameworks.md
```

Dokumentasi yang baik biasanya berisi:
- penjelasan singkat
- kapan digunakan
- contoh kode
- kesalahan umum
- link ke topik terkait

---

### Validasi

Sebelum Pull Request, jalankan semua validasi:
```bash
bun install
bun run typecheck
bun run build
bun test
bun run lint
bun run check:workspace
```

Jangan klaim validasi berhasil kalau command belum dijalankan.

Kalau mengubah generator, template, package export, atau config build, jalankan validasi penuh.

---

### Commit Message

Gunakan commit message yang jelas dan scoped.

Contoh bagus:
```bash
git commit -m "fix(router): correct dynamic segment matching"
git commit -m "feat(pwa): add ShrimpHarbor offline support"
git commit -m "docs: add Indonesian routing guide"
git commit -m "refactor(template): simplify public landing layout"
```

Hindari:
```bash
git commit -m "update"
git commit -m "fix all"
git commit -m "batch 2"
git commit -m "changes"
```

Commit message harus menjelaskan apa yang berubah.

---

### Pull Request

Sebelum membuka Pull Request:
1. Fork repository.
2. Buat branch dari `main`.
3. Kerjakan satu topik per branch.
4. Jalankan validation suite.
5. Isi Pull Request template.
6. Jelaskan apa yang diubah.
7. Jelaskan cara mengetesnya.
8. Link issue terkait jika ada.
9. Tunggu review.

Pull Request kecil lebih mudah direview daripada Pull Request besar yang mencampur banyak hal.

---

### Melaporkan Bug

Gunakan issue template di:
```txt
.github/ISSUE_TEMPLATE/
```

Bug report yang baik berisi:
- versi Rakta.js
- versi Bun
- sistem operasi
- langkah reproduksi
- hasil yang diharapkan
- hasil yang terjadi
- error log lengkap
- contoh project kecil jika memungkinkan

Jangan hanya menulis “error” tanpa log dan langkah reproduksi.

---

### Feature Request

Feature request yang baik menjelaskan masalah terlebih dahulu.

Contoh:
```txt
Saya ingin membuat route yang hanya bisa diakses user login, tapi saat ini harus menulis guard manual di setiap halaman.
```

Setelah itu baru usulkan API:
```txt
Mungkin KanomanShield bisa mendukung route guard di rakta.config.ts.
```

Jangan mengusulkan API besar sebelum menjelaskan masalah yang ingin diselesaikan.

---

### Security

Jangan membuka public issue untuk vulnerability.

Baca:
```txt
SECURITY.md
```

Laporkan vulnerability secara private sesuai instruksi di file tersebut.

---

### Code of Conduct

Dengan berkontribusi ke Rakta.js, kamu setuju mengikuti:
```txt
CODE_OF_CONDUCT.md
```

Kritik teknis boleh tegas. Serangan personal tidak boleh.

---

### Kredit Kontribusi

Kalau ingin profil GitHub atau portfolio kamu dicantumkan dalam catatan kontribusi, tulis di deskripsi Pull Request.

Kontributor yang membantu Rakta.js akan tetap dihargai.

---

## English

Thank you for contributing to Rakta.js.

Rakta.js is a lightweight frontend framework built on Bun, React, and TypeScript. It is built for developers who want to create modern applications with clear routing, comfortable DX, and a structure that does not feel unnecessarily heavy.

A good contribution is not only about adding features. A good contribution also keeps the project stable, understandable, testable, and safe for existing users.

---

### Table of Contents

- [Contributing to Rakta.js](#contributing-to-raktajs)
	- [Indonesian](#indonesian)
		- [Daftar Isi](#daftar-isi)
		- [Persiapan](#persiapan)
		- [Struktur Project](#struktur-project)
		- [Aturan Umum](#aturan-umum)
		- [Penamaan File](#penamaan-file)
		- [Aturan TypeScript](#aturan-typescript)
		- [Public API](#public-api)
		- [Nama Fitur Rakta.js](#nama-fitur-raktajs)
		- [Bekerja di create-rakta-app](#bekerja-di-create-rakta-app)
		- [Template](#template)
		- [ShrimpRun](#shrimprun)
		- [Dokumentasi](#dokumentasi)
		- [Validasi](#validasi)
		- [Commit Message](#commit-message)
		- [Pull Request](#pull-request)
		- [Melaporkan Bug](#melaporkan-bug)
		- [Feature Request](#feature-request)
		- [Security](#security)
		- [Code of Conduct](#code-of-conduct)
		- [Kredit Kontribusi](#kredit-kontribusi)
	- [English](#english)
		- [Table of Contents](#table-of-contents)
		- [Getting Started](#getting-started)
		- [Project Structure](#project-structure)
		- [General Rules](#general-rules)
		- [File Naming](#file-naming)
		- [TypeScript Rules](#typescript-rules)
		- [Public API](#public-api-1)
		- [Rakta.js Feature Names](#raktajs-feature-names)
		- [Working on create-rakta-app](#working-on-create-rakta-app)
		- [Templates](#templates)
		- [ShrimpRun](#shrimprun-1)
		- [Documentation](#documentation)
		- [Validation](#validation)
		- [Commit Messages](#commit-messages)
		- [Pull Requests](#pull-requests)
		- [Reporting Bugs](#reporting-bugs)
		- [Feature Requests](#feature-requests)
		- [Security](#security-1)
		- [Code of Conduct](#code-of-conduct-1)
		- [Contribution Credit](#contribution-credit)

---

### Getting Started

Before changing the code, make sure your environment is ready.

Requirements:
- Bun 1.3 or newer
- Git
- A code editor with TypeScript support
- Node.js only when needed for tooling, not as the main runtime

Clone the repository:
```bash
git clone https://github.com/RheinSullivan/raktajs.git
cd raktajs
bun install
```

Run the initial validation before making changes:
```bash
bun run typecheck
bun run build
bun test
bun run lint
bun run check:workspace
```

If those commands fail on a clean checkout, open an issue first. Do not mix a feature change with unrelated breakage.

---

### Project Structure

Main repository structure:
```txt
raktajs/
├─ packages/
│  ├─ rakta/            core framework
│  └─ create-rakta/     create-rakta-app CLI generator
├─ templates/
│  ├─ frontendOnly/     frontend-only starter template
│  └─ fullstack/        fullstack starter template
├─ docs/
│  ├─ en/               English documentation
│  └─ id/               Indonesian documentation
└─ workspace.test.ts    workspace sanity test
```

There must only be one workspace sanity test at the repository root:
```txt
workspace.test.ts
```

Do not create this file:
```txt
packages/workspace.test.ts
```

Package-specific tests may live next to the source file they test.

Example:
```txt
packages/rakta/src/router/matcher.test.ts
packages/rakta/src/http/panturaFetch.test.ts
```

---

### General Rules

- Do not create duplicate components.
- Do not create fake placeholders just to hide errors.
- Do not remove working features.
- Do not commit generated output such as `dist`, `.rakta`, `.next`, or coverage.
- Do not lint or format `.history`, `node_modules`, `dist`, `.git`, `.next`, or coverage.
- Do not weaken TypeScript, Biome, or project validation.
- Do not replace a large file with a small fragment.
- Do not change unrelated areas in one Pull Request.
- When changing a file, make sure the change is actually needed.
- When fixing a bug, include a short explanation of the cause and how it was tested.

---

### File Naming

Rakta.js uses `camelCase` for source files.

Correct:
```txt
createStore.ts
loadConfig.ts
panturaFetch.ts
shrimpRunGame.tsx
raktaShrimpMascot.tsx
```

Wrong:
```txt
create-store.ts
load-config.ts
pantura-fetch.ts
shrimp-run-game.tsx
rakta-shrimp-mascot.tsx
```

Ecosystem files keep their standard tool names:
```txt
package.json
tsconfig.json
tsconfig.base.json
README.md
LICENSE
.gitignore
.npmrc
bunfig.toml
```

---

### TypeScript Rules

Rakta.js uses strict TypeScript. Do not weaken TypeScript settings just to make errors disappear.

Do not use:
```ts
any
as any
null
// @ts-ignore
// @ts-expect-error
```

`unknown` is only allowed at real external boundaries, such as:
- JSON parsing
- HTTP responses
- dynamic imports
- filesystem input
- CLI prompt results

Once it enters your function, narrow it immediately.

Bad example:
```ts
function parseInput(input: unknown) {
	return input.name;
}
```

Good example:
```ts
function isNamedPayload(input: unknown): input is { name: string } {
	return (
		typeof input === "object" &&
		input !== null &&
		"name" in input &&
		typeof input.name === "string"
	);
}

function parseInput(input: unknown): string {
	if (!isNamedPayload(input)) {
		throw new Error("Invalid input payload.");
	}

	return input.name;
}
```

For optional properties, do not assign explicit `undefined`.

Wrong:
```ts
return {
	kind,
	inputSchema: this.inputSchema,
	handler,
};
```

Correct:
```ts
if (this.inputSchema !== undefined) {
	return {
		kind,
		inputSchema: this.inputSchema,
		handler,
	};
}

return {
	kind,
	handler,
};
```

Every exported function must have an explicit return type.

```ts
export function createRoutePath(routeName: string): string {
	return `/${routeName}`;
}
```

Use clear variable names.

Avoid:
```txt
data
res
req
ctx
fn
arg
opts
val
err
tmp
```

Use:
```txt
requestPayload
response
request
runtimeContext
handler
requestOptions
parsedValue
originalError
temporaryPath
```

Short names such as `id`, `url`, or `key` are still fine when the meaning is clear.

---

### Public API

Rakta.js public APIs should feel natural for React and Next.js developers.

Do not overuse `readonly` on interfaces that users write directly.

Acceptable for internal manifest types:
```ts
export interface RouteManifestEntry {
	readonly routePath: string;
	readonly filePath: string;
	readonly kind: RouteKind;
}
```

Better for public props:
```ts
export interface PageProps {
	params: Record<string, string>;
	searchParams: Record<string, string>;
}
```

Avoid this for user-facing APIs:
```ts
export interface PageProps {
	readonly params: Readonly<Record<string, string>>;
	readonly searchParams: Readonly<Record<string, string>>;
}
```

Internal types may stay strict. Public APIs should stay natural and easy to use.

---

### Rakta.js Feature Names

Use the official Rakta.js feature names consistently.

| Name | Purpose |
| --- | --- |
| MendungWeave | file-based routing |
| ShrimpStep | navigation with `<click to="">` |
| TrusmiFrame | image component with `<picture path="">` |
| KasepuhanGate | file-based API endpoint |
| KanomanShield | route protection |
| SunyaragiCrown | metadata/head manager |
| CarubanWire | type-safe RPC |
| TrusmiThread | auto import system |
| CherbonsEngine | build/dev engine |
| NorthCoastFlow | runtime layer |
| WaliSignal | SEO, sitemap, robots, RSS |
| ShrimpHarbor | PWA/offline system |
| JatiLens | diagnostics/project health |
| PanturaFetch | built-in HTTP client |
| ShrimpRun | offline starter game |

Do not invent another name for the same feature. Code, documentation, and examples must use consistent terms.

---

### Working on create-rakta-app

The main generator file is:
```txt
packages/create-rakta/src/generator.ts
```

This file is large because it contains many generators in one place:
- root file generator
- frontend-only generator
- fullstack frontend generator
- backend generator
- Gaman.js generator
- Express.js generator
- Nest.js generator
- Adonis.js generator
- database helpers
- CSS helpers
- README generator
- main `generateProjectFiles` export

Do not replace this file with a small fragment.

Before changing `generator.ts`, run:
```bash
wc -l packages/create-rakta/src/generator.ts
grep -n "function getRootFiles" packages/create-rakta/src/generator.ts
grep -n "function getFrontendOnlyFiles" packages/create-rakta/src/generator.ts
grep -n "function getFullstackFrontendFiles" packages/create-rakta/src/generator.ts
grep -n "function getBackendFiles" packages/create-rakta/src/generator.ts
grep -n "function getDatabaseDependencies" packages/create-rakta/src/generator.ts
grep -n "function generateProjectReadme" packages/create-rakta/src/generator.ts
grep -n "export function generateProjectFiles" packages/create-rakta/src/generator.ts
```

After changing the file, run the same commands.

If the line count drops drastically or one of those sections disappears, the file is broken and must be restored before opening a Pull Request.

---

### Templates

Templates must work for real users.

The frontend-only template should stay small and clear.

The fullstack template should clearly separate folders:
```txt
frontend/
backend/
shared/
docs/
```

Do not add empty placeholders only to satisfy a folder structure.

When adding a new page, make sure:
- the route can be scanned
- imports are valid
- typecheck passes
- the layout matches the page context
- styling uses Tailwind utilities
- `globals.css` stays minimal

Public pages may use navbar, footer, and CTA.

Auth pages must not use the marketing navbar or footer.

Dashboard pages must use the dashboard layout and must not use the marketing footer.

---

### ShrimpRun

`ShrimpRun` is the default starter game in Rakta.js, not a placeholder.

Main file:
```txt
templates/frontendOnly/app/components/shrimpRunGame.tsx
```

If you touch ShrimpRun, these features must keep working:
- click or tap to jump
- Space key to jump
- restart
- score
- high score
- collision detection
- obstacles
- increasing speed
- pause when the tab is inactive
- mobile responsiveness
- accessible labels
- no game library
- no external image assets

The shrimp character must stay drawn with JSX, SVG, or CSS.

Do not use licensed assets or images from the internet.

Do not shorten the file just to make lint pass. Fix the issue without removing behavior.

---

### Documentation

English documentation lives in:
```txt
docs/en/
```

Indonesian documentation lives in:
```txt
docs/id/
```

When adding a new documentation page, add both versions:
```txt
docs/en/topicName.md
docs/id/topicName.md
```

Use `camelCase` for documentation filenames.

Correct:
```txt
gettingStarted.md
autoImport.md
backendFrameworks.md
```

Wrong:
```txt
getting-started.md
auto-import.md
backend-frameworks.md
```

A good documentation page usually includes:
- short overview
- when to use it
- code example
- common mistakes
- related links

---

### Validation

Before opening a Pull Request, run all validation commands:
```bash
bun install
bun run typecheck
bun run build
bun test
bun run lint
bun run check:workspace
```

Do not claim validation passed if the commands were not actually run.

If you change the generator, templates, package exports, or build config, run the full validation suite.

---

### Commit Messages

Use clear and scoped commit messages.

Good examples:
```bash
git commit -m "fix(router): correct dynamic segment matching"
git commit -m "feat(pwa): add ShrimpHarbor offline support"
git commit -m "docs: add Indonesian routing guide"
git commit -m "refactor(template): simplify public landing layout"
```

Avoid:
```bash
git commit -m "update"
git commit -m "fix all"
git commit -m "batch 2"
git commit -m "changes"
```

A commit message should describe what changed.

---

### Pull Requests

Before opening a Pull Request:
1. Fork the repository.
2. Create a branch from `main`.
3. Keep one topic per branch.
4. Run the validation suite.
5. Fill in the Pull Request template.
6. Explain what changed.
7. Explain how it was tested.
8. Link related issues when available.
9. Wait for review.

Small Pull Requests are easier to review than large Pull Requests that mix many changes.

---

### Reporting Bugs

Use the issue templates in:
```txt
.github/ISSUE_TEMPLATE/
```

A good bug report includes:
- Rakta.js version
- Bun version
- operating system
- reproduction steps
- expected result
- actual result
- full error log
- small reproduction project when possible

Do not only write “error” without logs and reproduction steps.

---

### Feature Requests

A good feature request explains the problem first.

Example:
```txt
I want to protect routes for logged-in users, but right now I have to write a guard manually on every page.
```

Then suggest the API:
```txt
Maybe KanomanShield can support route guards in rakta.config.ts.
```

Do not propose a large API before explaining the problem it solves.

---

### Security

Do not open a public issue for a vulnerability.

Read:
```txt
SECURITY.md
```

Report vulnerabilities privately using the instructions in that file.

---

### Code of Conduct

By contributing to Rakta.js, you agree to follow:
```txt
CODE_OF_CONDUCT.md
```

Direct technical feedback is fine. Personal attacks are not.

---

### Contribution Credit

If you want your GitHub profile or portfolio link mentioned in contribution notes, include it in your Pull Request description.

People who help build Rakta.js deserve credit.

---

Thank you for helping build Rakta.js.

Rhein Sullivan  
Lead of Vyagra Nexus™