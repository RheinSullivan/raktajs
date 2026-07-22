# API Reference

API publik Rakta.js diekspor dari root package dan subpath stabil:

| Subpath | Fungsi |
| --- | --- |
| `rakta` | Export utama framework |
| `rakta/router` | Manifest route dan matching |
| `rakta/render` | Helper render SSR, CSR, SSG, hybrid, dan edge |
| `rakta/layout` | Manifest dan matching layout |
| `rakta/data` | Cache, revalidation, dan strategi route |
| `rakta/plugin` | Manifest plugin dan registry capability |
| `rakta/testing` | Helper test runner, mock server, snapshot, coverage |
| `rakta/performance` | Benchmark, laporan bundle, cache build |
| `rakta/security` | Secure headers, CSRF, rate limiter, secrets |
| `rakta/ops` | Request context, job, queue, cron, event bus |
| `rakta/deployment` | Generator adapter deployment |
| `rakta/dx` | Dependency graph, analyzer, overlay, profiler |

Setiap subpath sudah typed dan masuk ke output build.
