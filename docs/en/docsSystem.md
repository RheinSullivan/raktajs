# Markdown docs system

## Overview

Rakta includes a Markdown documentation scanner that can generate a page
manifest, sidebar, local search index, and VitePress-compatible config.
It is exported from `rakta/docs`.

## Quick start

```ts
import { createVitePressConfig, scanMarkdownDocs } from "rakta/docs";

const manifest = scanMarkdownDocs({
  rootDir: "docs/en",
  locale: "en",
  basePath: "/docs",
});

export default createVitePressConfig(manifest, {
  title: "Rakta.js",
  description: "Rakta.js documentation",
});
```

## Features

| Feature | Status |
| --- | --- |
| Markdown scanning | Supported |
| Sidebar generation | Supported |
| Local search index | Supported |
| i18n metadata | Supported |
| VitePress config bridge | Supported |

## Best practices

- Keep one concept per Markdown page.
- Start each page with one `#` heading.
- Use `##` headings for search and sidebar context.
- Keep English and Indonesian pages synchronized.

## Related docs

- [`deployment.md`](./deployment.md)
- [`templates.md`](./templates.md)
- [`kernel.md`](./kernel.md)
