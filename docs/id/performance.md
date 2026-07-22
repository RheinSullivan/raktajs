# Performance

`rakta/performance` berisi primitive benchmark, laporan bundle, dan cache build
persistent untuk tooling framework.

```ts
import {
	benchmark,
	createBenchmarkReport,
	createBuildCache,
	createBundleSizeReport,
} from "rakta/performance";

const startup = await benchmark("startup", "boot", bootApp);
const report = createBenchmarkReport([startup]);
const bundle = createBundleSizeReport([{ path: "app.js", bytes: 1200 }]);

const cache = createBuildCache();
cache.set({ key: "app", hash: "abc", createdAt: Date.now() });
```

Jenis benchmark mencakup startup, routing, hydration, dan build. Laporan bundle
serta pengecekan freshness cache build dibuat untuk integrasi CLI dan CI.
