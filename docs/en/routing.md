# Routing — MendungWeave

## Overview

**MendungWeave** is the file-based routing layer of Rakta.js. The folder
structure under `app/` is the router — there is no central route config
file to keep in sync.

## When to use this

Anytime you need a new page, API endpoint, layout, loading state, or error
boundary in a Rakta.js app.

## File conventions

| File | Becomes |
| --- | --- |
| `app/page.tsx` | `/` |
| `app/about/page.tsx` | `/about` |
| `app/blog/[slug]/page.tsx` | `/blog/:slug` (dynamic segment) |
| `app/blog/[...slug]/page.tsx` | `/blog/*` (catch-all) |
| `app/(auth)/login/page.tsx` | `/login` — the `(auth)` segment is a route group and does not appear in the URL |
| `app/layout.tsx` | Layout wrapping every route below it |
| `app/loading.tsx` | Shown while a route segment is loading |
| `app/error.tsx` | Error boundary for a route segment |
| `app/notFound.tsx` | Rendered when no route matches |
| `app/api/users/route.ts` | An API endpoint (KasepuhanGate) at `/api/users` |

## Architecture

MendungWeave has three stages:

1. **Scanner** (`rakta/router`'s `scanRoutes`) walks the `app/` directory
   and produces a flat list of route entries with their kind (`page`,
   `layout`, `loading`, `error`, `notFound`, `api`) and raw segments.
2. **Manifest** turns that list into a `RouteManifestEntry[]`, computing
   the URL pattern and any dynamic parameter names for each entry.
3. **Matcher** (`matchRoute`) takes an incoming pathname and the manifest
   and returns the matching entry plus extracted parameters, or `null` if
   nothing matches.

Layouts are resolved separately with `findLayoutsForPathname`, which
returns every layout whose pattern is a prefix of the current pathname, so
nested layouts compose naturally.

## Code example

```tsx
// app/blog/[slug]/page.tsx
interface BlogPostPageProps {
  params: { slug: string };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return <h1>Post: {params.slug}</h1>;
}
```

```ts
// app/api/users/route.ts — KasepuhanGate endpoint
export async function GET(): Promise<Response> {
  return Response.json({ users: [] });
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  return Response.json({ created: body }, { status: 201 });
}
```

## Route groups for layout isolation

Wrap a folder name in parentheses to group routes under a shared layout
without adding a URL segment:

```txt
app/
├─ (auth)/
│  ├─ layout.tsx        ← only wraps login/register/etc, no navbar/footer
│  ├─ login/page.tsx     → /login
│  └─ register/page.tsx  → /register
├─ dashboard/
│  ├─ layout.tsx        ← dashboard sidebar, no marketing footer
│  └─ page.tsx           → /dashboard
└─ layout.tsx            ← public marketing layout (navbar + footer)
```

This is exactly how the fullstack template structures public marketing
pages, auth pages, and the dashboard — see
[`templates.md`](./templates.md).

## Navigation with ShrimpStep

Use the `<click to="">` custom element for in-app navigation instead of a
plain `<a href="">`:

```tsx
import { Click } from "rakta/components";

<click to="/dashboard">Go to dashboard</click>
```

`Click` understands internal vs. external destinations automatically,
supports keyboard activation, and marks the active route with
`aria-current="page"`.

## Common mistakes

- Naming a file `Page.tsx` instead of `page.tsx` — the scanner matches
  exact lowercase filenames.
- Forgetting that `(group)` folders do not add a URL segment — `app/(auth)/login/page.tsx`
  is `/login`, not `/auth/login`.
- Using `<a href="">` for internal navigation, which causes a full page
  reload instead of a client-side transition.

## Related docs

- [`templates.md`](./templates.md) — how routing is laid out in generated apps
- [`seo.md`](./seo.md) — per-route metadata with SunyaragiCrown
- [`rpc.md`](./rpc.md) — CarubanWire, for typed calls instead of raw `route.ts` handlers