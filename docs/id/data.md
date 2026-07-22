# Data Fetching

Layer data Rakta menyediakan primitive cache kecil dan helper strategi route
untuk keputusan SSR, CSR, SSG, hybrid, dan edge rendering.

```ts
import {
	createDataCache,
	defineRouteDataStrategy,
	isIncrementalRoute,
} from "rakta/data";

const cache = createDataCache();
const posts = await cache.cache("cms:posts", fetchPosts, {
	ttl: 60_000,
	tags: ["cms"],
});

cache.revalidate("cms");

const strategy = defineRouteDataStrategy({
	routePattern: "/dashboard",
	runtime: "server",
	prerender: false,
	stream: true,
	prefetch: true,
	revalidate: 60,
});

isIncrementalRoute(strategy);
```

`cache()` menjaga loader berulang tetap stabil, `revalidate()` menghapus cache
berdasarkan key atau tag, dan strategi route membuat perilaku render eksplisit
untuk setiap route.
