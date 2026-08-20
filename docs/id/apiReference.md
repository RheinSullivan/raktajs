# API Reference

API publik Rakta.js diekspor dari root package dan subpath stabil:

| Subpath | Fungsi |
| --- | --- |
| `raktajs` | Export utama framework |
| `raktajs/router` | Manifest route dan matching |
| `raktajs/render` | Helper render SSR, CSR, SSG, hybrid, dan edge |
| `raktajs/layout` | Manifest dan matching layout |
| `raktajs/data` | Cache, revalidation, dan strategi route |
| `raktajs/plugin` | Manifest plugin dan registry capability |
| `raktajs/testing` | Helper test runner, mock server, snapshot, coverage |
| `raktajs/performance` | Benchmark, laporan bundle, cache build |
| `raktajs/security` | Secure headers, CSRF, rate limiter, secrets |
| `raktajs/ops` | Request context, job, queue, cron, event bus |
| `raktajs/deployment` | Generator adapter deployment |
| `raktajs/developerExperience` | Dependency graph, analyzer, overlay, profiler |

Setiap subpath sudah typed dan masuk ke output build.
