# Developer Experience

Rakta.js includes analyzer utilities for dependency graphs, route dependency
reports, and bundle-size inspection.

```ts
import { analyzeBundle, analyzeRoutes, createDependencyGraph } from "rakta/dx";

const graph = createDependencyGraph([
	{ id: "app/page.tsx", imports: ["lib/http.ts"], routePattern: "/", size: 42 },
	{ id: "lib/http.ts", size: 12 },
]);

const routes = analyzeRoutes(graph);
const bundle = analyzeBundle(graph.modules);
```

These helpers are intentionally runtime-neutral so the CLI, dev server,
inspector, and external tooling can share the same analysis contract.
