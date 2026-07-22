# Layout

Rakta.js now exposes a layout manifest API for `app/layout.tsx` style
projects. The scanner understands root layouts, nested layouts, loading
layouts, error layouts, not-found layouts, route groups, and parallel slots.

```ts
import { createLayoutManifest, matchLayouts } from "rakta/layout";

const manifest = createLayoutManifest([
	{ path: "app/layout.tsx" },
	{ path: "app/dashboard/layout.tsx" },
	{ path: "app/dashboard/loading.tsx" },
	{ path: "app/dashboard/@analytics/layout.tsx" },
]);

const activeLayouts = matchLayouts(manifest, "/dashboard/settings");
```

Use this API inside build tools, route analyzers, or custom renderers that
need the exact layout chain for a pathname.
