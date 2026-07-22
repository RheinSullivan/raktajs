# API Reference

Rakta.js public APIs are exported from the package root and stable subpaths:

| Subpath | Purpose |
| --- | --- |
| `rakta` | Root framework exports |
| `rakta/router` | Route manifest and matching |
| `rakta/render` | SSR, CSR, SSG, hybrid, and edge render helpers |
| `rakta/layout` | Layout manifest and matching |
| `rakta/data` | Cache, revalidation, and route strategy |
| `rakta/plugin` | Plugin manifest and capability registry |
| `rakta/testing` | Test runner helpers, mock server, snapshots, coverage |
| `rakta/performance` | Benchmarks, bundle reports, build cache |
| `rakta/security` | Secure headers, CSRF, rate limiter, secrets |
| `rakta/ops` | Request context, jobs, queues, cron, event bus |
| `rakta/deployment` | Deployment adapter generation |
| `rakta/dx` | Dependency graph, analyzer, overlay, profiler |

Every subpath is typed and included in the build output.
