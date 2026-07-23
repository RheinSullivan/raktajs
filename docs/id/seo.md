# SEO - WaliSignal & SunyaragiCrown

## Overview

Rakta.js membagi urusan SEO ke dua bagian yang saling bekerja sama:
- **SunyaragiCrown** - manajer metadata dan `<head>` (`RaktaHead`, tipe
  `Metadata`, `resolveTitle`).
- **WaliSignal** - layer signal yang mengubah metadata menjadi output
  yang bisa dibaca mesin: generasi `robots.txt` dan sitemap.

## Kapan dipakai

Pakai ini di setiap halaman publik yang penting untuk mesin pencari atau
preview media sosial - hampir selalu halaman marketing kalian, jarang di
halaman dashboard yang sudah login.

## Arsitektur

Setiap route bisa export object `metadata` (atau fungsi yang
mengembalikannya) yang mendeskripsikan `title`, `description`, data Open
Graph, data Twitter Card, canonical URL, arahan robots, dan JSON-LD.
`RaktaHead` merender semua ini menjadi tag `<title>`, `<meta>`, `<link>`,
dan `<script type="application/ld+json">` yang benar, menggunakan React
key yang stabil dan berasal dari konten (bukan index array), sehingga
re-render tetap benar.

`generateRobotsTxt` / `createRobotsHandler` menghasilkan response
`robots.txt` yang valid, termasuk arahan `Allow`, `Disallow`,
`Crawl-delay`, `Sitemap`, dan `Host`, siap dipasang di `route.ts`
KasepuhanGate.

## Contoh kode

```tsx
// app/about/page.tsx
import { RaktaHead } from "rakta/seo";
import type { Metadata } from "rakta/seo";

const metadata: Metadata = {
  title: "Tentang - Aplikasi Saya",
  description: "Pelajari apa yang dilakukan Aplikasi Saya.",
  openGraph: { title: "Tentang", type: "website" },
};

export default function AboutPage() {
  return (
    <>
      <RaktaHead metadata={metadata} />
      <main>
        <h1>Tentang</h1>
      </main>
    </>
  );
}
```

```ts
// app/robots.txt/route.ts
import { createRobotsHandler } from "rakta/seo";

export const GET = createRobotsHandler({
  rules: [{ userAgent: "*", allow: "/" }],
  sitemap: "https://example.com/sitemap.xml",
});
```

## Kesalahan umum

- Merender `<RaktaHead>` di komponen yang sangat dalam dibanding dekat
  bagian atas halaman - tag head sebaiknya diatur sekali per route,
  seawal mungkin di render tree.
- Lupa `canonical` di halaman berpaginasi atau konten duplikat.
- Memasang handler sitemap/robots di path yang tidak cocok dengan yang
  ditulis di `Sitemap:`/yang diharapkan crawler (`/robots.txt`,
  `/sitemap.xml` di root domain).

## Dokumen terkait

- [`routing.md`](./routing.md) - tempat handler `route.ts` seperti contoh robots di atas