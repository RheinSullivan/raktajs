# SEO — WaliSignal & SunyaragiCrown

## Overview

Rakta.js splits SEO concerns into two cooperating pieces:
- **SunyaragiCrown** — the metadata and `<head>` manager (`RaktaHead`,
  `Metadata` type, `resolveTitle`).
- **WaliSignal** — the signal layer that turns metadata into machine-
  readable output: `robots.txt` and sitemap generation.

## When to use this

Use this on every public-facing page where search engines or social
previews matter — almost always your marketing pages, rarely your
authenticated dashboard pages.

## Architecture

Each route can export a `metadata` object (or a function that returns
one) describing its `title`, `description`, Open Graph data, Twitter
Card data, canonical URL, robots directives, and JSON-LD. `RaktaHead`
renders all of this into proper `<title>`, `<meta>`, `<link>`, and
`<script type="application/ld+json">` tags, using stable, content-derived
React keys (not array indices) so re-renders stay correct.

`generateRobotsTxt` / `createRobotsHandler` produce a valid `robots.txt`
response, including `Allow`, `Disallow`, `Crawl-delay`, `Sitemap`, and
`Host` directives, ready to mount at a KasepuhanGate `route.ts`.

## Code example

```tsx
// app/about/page.tsx
import { RaktaHead } from "rakta/seo";
import type { Metadata } from "rakta/seo";

const metadata: Metadata = {
  title: "About — My App",
  description: "Learn what My App does.",
  openGraph: { title: "About", type: "website" },
};

export default function AboutPage() {
  return (
    <>
      <RaktaHead metadata={metadata} />
      <main>
        <h1>About</h1>
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

## Common mistakes

- Rendering `<RaktaHead>` inside a deeply nested component instead of
  near the top of the page — head tags should be set once per route, as
  early as possible in the render tree.
- Forgetting `canonical` on paginated or duplicate-content pages.
- Mounting the sitemap/robots handler at a path that doesn't match what
  you put in `Sitemap:`/the URL crawlers expect (`/robots.txt`,
  `/sitemap.xml` at the domain root).

## Related docs

- [`routing.md`](./routing.md) — where `route.ts` handlers like the robots example live