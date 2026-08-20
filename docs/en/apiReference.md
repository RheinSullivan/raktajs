# API Reference

Rakta.js public APIs are exported from the package root and stable subpaths:

| Subpath | Purpose |
| --- | --- |
| `raktajs` | Root framework exports |
| `raktajs/router` | Route manifest and matching |
| `raktajs/render` | SSR, CSR, SSG, hybrid, and edge render helpers |
| `raktajs/layout` | Layout manifest and matching |
| `raktajs/data` | Cache, revalidation, and route strategy |
| `raktajs/plugin` | Plugin manifest and capability registry |
| `raktajs/testing` | Test runner helpers, mock server, snapshots, coverage |
| `raktajs/performance` | Benchmarks, bundle reports, build cache |
| `raktajs/security` | Secure headers, CSRF, rate limiter, secrets |
| `raktajs/ops` | Request context, jobs, queues, cron, event bus |
| `raktajs/deployment` | Deployment adapter generation |
| `raktajs/developerExperience` | Dependency graph, analyzer, overlay, profiler |

Every subpath is typed and included in the build output.
