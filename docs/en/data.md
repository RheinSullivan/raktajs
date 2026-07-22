# Data Fetching

The Rakta data layer provides a small cache primitive and route strategy
helpers for SSR, CSR, SSG, hybrid, and edge rendering decisions.

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

`cache()` keeps repeated loaders stable, `revalidate()` invalidates by key or
tag, and route strategies make render behavior explicit per route.
