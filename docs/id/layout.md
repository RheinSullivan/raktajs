# Layout

Rakta.js sekarang menyediakan API manifest layout untuk project bergaya
`app/layout.tsx`. Scanner ini memahami root layout, nested layout, loading
layout, error layout, not-found layout, route group, dan parallel slot.

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

Gunakan API ini di build tool, route analyzer, atau renderer custom yang
perlu mengetahui urutan layout aktif untuk sebuah pathname.
