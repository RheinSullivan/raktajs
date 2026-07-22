# Developer Experience

Rakta.js menyertakan utilitas analyzer untuk dependency graph, laporan
dependency route, dan inspeksi ukuran bundle.

```ts
import { analyzeBundle, analyzeRoutes, createDependencyGraph } from "rakta/dx";

const graph = createDependencyGraph([
	{ id: "app/page.tsx", imports: ["lib/http.ts"], routePattern: "/", size: 42 },
	{ id: "lib/http.ts", size: 12 },
]);

const routes = analyzeRoutes(graph);
const bundle = analyzeBundle(graph.modules);
```

Helper ini sengaja netral terhadap runtime supaya CLI, dev server, inspector,
dan tooling eksternal bisa memakai kontrak analisis yang sama.
