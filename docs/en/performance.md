# Performance

`rakta/performance` contains benchmark, bundle reporting, and persistent build
cache primitives for framework tooling.

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

Benchmark kinds include startup, routing, hydration, and build. Bundle reports
and build-cache freshness checks are designed for CLI and CI integration.
