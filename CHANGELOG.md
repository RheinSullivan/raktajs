# Changelog

Semua perubahan penting pada Rakta.js dicatat di file ini.
Format changelog ini mengikuti semangat [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Rakta.js akan mengikuti [Semantic Versioning](https://semver.org/) setelah mencapai versi `1.0.0`.
Sebelum `1.0.0`, breaking changes masih bisa terjadi di minor release karena public API framework masih distabilkan.

All notable changes to Rakta.js are documented in this file.
This changelog follows the spirit of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Rakta.js intends to follow [Semantic Versioning](https://semver.org/) once it reaches `1.0.0`.
Before `1.0.0`, breaking changes may still happen in minor releases while the framework public API is being stabilized.

---

## Indonesian

### [Unreleased]

Bagian ini berisi perubahan yang sudah masuk ke branch utama, tetapi belum dirilis sebagai version tag baru.

---

#### Added

- Menambahkan repository hygiene files:
  - `LICENSE`
  - `CONTRIBUTING.md`
  - `CODE_OF_CONDUCT.md`
  - `SECURITY.md`
  - `CHANGELOG.md`

- Menambahkan GitHub community files:
  - `.github/ISSUE_TEMPLATE/bug_report.yml`
  - `.github/ISSUE_TEMPLATE/feature_request.yml`
  - `.github/pull_request_template.md`
  - `.github/workflows/ci.yml`

- Menambahkan rekomendasi workspace untuk VS Code:
  - `.vscode/extensions.json`
  - `.vscode/settings.json`

- Menambahkan dokumentasi bilingual untuk Rakta.js:
  - English documentation di `docs/en`
  - Indonesian documentation di `docs/id`

- Menambahkan dokumentasi untuk topik utama:
  - Getting started
  - MendungWeave routing
  - Templates
  - CarubanWire RPC
  - Rakta Store
  - PanturaFetch
  - ShrimpHarbor PWA
  - WaliSignal SEO
  - TrusmiThread auto import
  - Backend framework choices

- Menambahkan package-level README untuk:
  - `packages/rakta/README.md`
  - `packages/create-rakta/README.md`

---

#### Changed

- Memperjelas arah dokumentasi root `README.md`.
- Memperjelas branding Rakta.js sebagai framework frontend berbasis Bun, React, dan TypeScript.
- Memperjelas command resmi untuk membuat project Rakta.js.
- Memperjelas aturan kontribusi agar contributor tidak mengganti file besar dengan potongan kecil.
- Memperjelas aturan generator `create-rakta-app`, khususnya `packages/create-rakta/src/generator.ts`.

---

#### Fixed

- Memperbaiki heading root `README.md` dari title yang terlalu umum menjadi `Rakta.js`.
- Memastikan dokumentasi kontribusi menjelaskan bahwa hanya root `workspace.test.ts` yang boleh dipakai sebagai workspace sanity test.
- Memastikan generated output seperti `dist`, `.rakta`, `.next`, dan coverage tidak dijadikan bagian dari alur kontribusi.

---

#### Notes

- Rakta.js masih berada di fase `0.x`.
- Public API masih bisa berubah sebelum `1.0.0`.
- Breaking changes harus tetap dijelaskan di changelog meskipun terjadi sebelum `1.0.0`.

---

### [0.1.0] - Initial Framework Preview

Rilis awal Rakta.js sebagai framework preview.

---

#### Added

- Menambahkan package core `rakta`.

- Menambahkan MendungWeave file-based routing:
  - Route scanner
  - Route matcher
  - Route manifest
  - Dynamic route support
  - API route concept melalui KasepuhanGate

- Menambahkan ShrimpStep navigation:
  - Custom `<click to="">`
  - Internal navigation behavior
  - External link handling

- Menambahkan TrusmiFrame image component:
  - Custom `<picture path="">`
  - `<picture><img /></picture>` output
  - Loading, title, alt, dan error handling dasar

- Menambahkan SunyaragiCrown metadata/head manager:
  - Title
  - Description
  - Open Graph
  - Twitter metadata
  - JSON-LD rendering tanpa `dangerouslySetInnerHTML`

- Menambahkan WaliSignal SEO utilities:
  - Robots
  - Sitemap
  - Metadata signal helpers

- Menambahkan CarubanWire type-safe RPC:
  - Procedure
  - Router
  - Client
  - Error model
  - JSON request/response flow

- Menambahkan lightweight store:
  - `createStore`
  - `getState`
  - `setState`
  - `subscribe`
  - React hook integration

- Menambahkan PanturaFetch HTTP client:
  - Base URL
  - Query params
  - JSON body
  - Typed response
  - Request and response lifecycle

- Menambahkan TrusmiThread auto import system:
  - Scanner
  - Generated auto import layer
  - Summary output

- Menambahkan NorthCoastFlow runtime layer:
  - Runtime context
  - Response helpers
  - Render context

- Menambahkan CherbonsEngine tooling:
  - Development server
  - Build command
  - Route inspection foundation

- Menambahkan CLI `rakta`:
  - `rakta dev`
  - `rakta build`
  - `rakta start`
  - `rakta routes`
  - `rakta imports:generate`
  - `rakta rpc:types`
  - `rakta doctor`

- Menambahkan package `create-rakta-app`:
  - Interactive project generator
  - Frontend-only mode
  - Fullstack mode
  - CSS framework choices
  - Rendering mode choices
  - Backend framework choices

- Menambahkan template frontend-only:
  - React 19
  - Tailwind CSS v4
  - Rakta config
  - `rakta-env.d.ts`
  - Default app layout
  - Loading, error, and notFound pages
  - ShrimpRun offline mini-game
  - Rakta shrimp mascot drawn without external image assets

---

#### Known Limitations

- Rakta.js masih dalam tahap preview.
- Beberapa API masih dapat berubah.
- Template fullstack masih akan terus diperluas.
- ShrimpHarbor PWA support masih akan dikembangkan lebih lanjut.
- Dokumentasi akan terus ditambah mengikuti perkembangan fitur.

---

## English

### [Unreleased]

This section contains changes that have landed in the main branch but have not been released as a new version tag yet.

---

#### Added

- Added repository hygiene files:
  - `LICENSE`
  - `CONTRIBUTING.md`
  - `CODE_OF_CONDUCT.md`
  - `SECURITY.md`
  - `CHANGELOG.md`

- Added GitHub community files:
  - `.github/ISSUE_TEMPLATE/bug_report.yml`
  - `.github/ISSUE_TEMPLATE/feature_request.yml`
  - `.github/pull_request_template.md`
  - `.github/workflows/ci.yml`

- Added recommended VS Code workspace files:
  - `.vscode/extensions.json`
  - `.vscode/settings.json`

- Added bilingual documentation for Rakta.js:
  - English documentation in `docs/en`
  - Indonesian documentation in `docs/id`

- Added documentation for core topics:
  - Getting started
  - MendungWeave routing
  - templates
  - CarubanWire RPC
  - Rakta Store
  - PanturaFetch
  - ShrimpHarbor PWA
  - WaliSignal SEO
  - TrusmiThread auto import
  - Backend framework choices

- Added package-level README files for:
  - `packages/rakta/README.md`
  - `packages/create-rakta/README.md`

---

#### Changed

- Clarified the direction of the root `README.md`.
- Clarified Rakta.js branding as a frontend framework built on Bun, React, and TypeScript.
- Clarified the official commands for creating a Rakta.js project.
- Clarified contribution rules so contributors do not replace large files with small fragments.
- Clarified `create-rakta-app` generator rules, especially for `packages/create-rakta/src/generator.ts`.

---

#### Fixed

- Fixed the root `README.md` heading from a generic title to `Rakta.js`.
- Ensured contribution documentation explains that only the root `workspace.test.ts` should be used as the workspace sanity test.
- Ensured generated output such as `dist`, `.rakta`, `.next`, and coverage are not part of the contribution flow.

---

#### Notes

- Rakta.js is still in `0.x`.
- Public APIs may still change before `1.0.0`.
- Breaking changes should still be documented in the changelog even before `1.0.0`.

---

### [0.1.0] - Initial Framework Preview

Initial Rakta.js release as a framework preview.

---

#### Added

- Added the `rakta` core package.

- Added MendungWeave file-based routing:
  - Route scanner
  - Route matcher
  - Route manifest
  - Dynamic route support
  - API route concept through KasepuhanGate

- Added ShrimpStep navigation:
- Ccustom `<click to="">`
  - Internal navigation behavior
  - External link handling

- Added TrusmiFrame image component:
  - Custom `<picture path="">`
  - `<picture><img /></picture>` output
  - Loading, title, alt, and basic error handling

- Added SunyaragiCrown metadata/head manager:
  - Title
  - Description
  - Open Graph
  - Twitter metadata
  - JSON-LD rendering without `dangerouslySetInnerHTML`

- Added WaliSignal SEO utilities:
  - Robots
  - Sitemap
  - Metadata signal helpers

- Added CarubanWire type-safe RPC:
  - Procedure
  - Router
  - Client
  - Error model
  - JSON request/response flow

- Added lightweight store:
  - `createStore`
  - `getState`
  - `setState`
  - `subscribe`
  - React hook integration

- Added PanturaFetch HTTP client:
  - Base URL
  - Query params
  - JSON body
  - Typed response
  - Request and response lifecycle

- Added TrusmiThread auto import system:
  - Scanner
  - Generated auto import layer
  - Summary output

- Added NorthCoastFlow runtime layer:
  - Runtime context
  - Response helpers
  - Render context

- Added CherbonsEngine tooling:
  - Development server
  - Build command
  - Route inspection foundation

- Added the `rakta` CLI:
  - `rakta dev`
  - `rakta build`
  - `rakta start`
  - `rakta routes`
  - `rakta imports:generate`
  - `rakta rpc:types`
  - `rakta doctor`

- Added the `create-rakta-app` package:
  - Interactive project generator
  - Frontend-only mode
  - Fullstack mode
  - CSS framework choices
  - Rendering mode choices
  - Backend framework choices

- Added the frontend-only template:
  - React 19
  - Tailwind CSS v4
  - Rakta config
  - `rakta-env.d.ts`
  - Default app layout
  - Loading, error, and notFound pages
  - ShrimpRun offline mini-game
  - Rakta shrimp mascot drawn without external image assets

---

#### Known Limitations

- Rakta.js is still in preview.
- Some APIs may still change.
- Fullstack templates will continue to expand.
- ShrimpHarbor PWA support will continue to be developed.
- Documentation will continue to grow as features evolve.

---

[Unreleased]: https://github.com/RheinSullivan/raktajs/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/RheinSullivan/raktajs/releases/tag/v0.1.0