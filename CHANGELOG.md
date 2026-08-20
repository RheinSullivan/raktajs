# Changelog

All notable changes to the Rakta.js framework will be documented in this file.

## [1.1.8] - 2026-08-20

### Added
- Added structural **Laravel + MySQL** backend template option in `create-rakta-app` generator.
- Added `BroadcastHMR` method and event stream handler in native Go engine (`engine/forge/server.go`).
- Added strict null-body response formatting for 204 No Content and 304 Not Modified HTTP status codes in `packages/rakta/src/tide/runtime.ts`.

### Fixed
- Fixed reflected XSS vulnerability in Go forge server fallback response by HTML-escaping path parameters (`engine/forge/server.go`).
- Fixed double-write header issue in Go middleware CORS handler when responding to OPTIONS preflight requests (`engine/middleware/middleware.go`).
- Fixed engine version constant in Go engine to match framework release `1.1.8`.
- Synchronized workspace package manifests, generator starter templates, and generator unit tests to version `1.1.8`.

### Security
- Hardened static file serving paths with strict `resolve()` boundaries to prevent directory traversal.
- Added max capacity bounds (10,000 max entries) and automatic expired entry pruning to `RateLimiter` and `MemoryCache`.
- Implemented `DecompressGzipWithLimit` with a 10MB default threshold to prevent gzip decompression memory exhaustion.

---

## [1.1.7] - 2026-08-15

### Added
- Added multi-value `Set-Cookie` header preservation in `mergeHeaders`.
- Added strict input validation for positive image dimensions in ecosystem tools.
- Synchronized release tools and template manifests.
