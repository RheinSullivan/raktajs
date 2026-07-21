# Sistem dokumentasi Markdown

## Gambaran umum

Rakta menyertakan scanner dokumentasi Markdown yang bisa menghasilkan
manifest halaman, sidebar, index search lokal, dan config yang kompatibel
dengan VitePress. Modul ini diekspor dari `rakta/docs`.

## Mulai cepat

```ts
import { createVitePressConfig, scanMarkdownDocs } from "rakta/docs";

const manifest = scanMarkdownDocs({
  rootDir: "docs/id",
  locale: "id",
  basePath: "/docs",
});

export default createVitePressConfig(manifest, {
  title: "Rakta.js",
  description: "Dokumentasi Rakta.js",
});
```

## Fitur

| Fitur | Status |
| --- | --- |
| Scan Markdown | Didukung |
| Generate sidebar | Didukung |
| Index search lokal | Didukung |
| Metadata i18n | Didukung |
| Bridge config VitePress | Didukung |

## Praktik terbaik

- Simpan satu konsep per halaman Markdown.
- Awali setiap halaman dengan satu heading `#`.
- Gunakan heading `##` untuk konteks search dan sidebar.
- Jaga halaman Bahasa Inggris dan Bahasa Indonesia tetap sinkron.

## Dokumen terkait

- [`deployment.md`](./deployment.md)
- [`templates.md`](./templates.md)
- [`kernel.md`](./kernel.md)
