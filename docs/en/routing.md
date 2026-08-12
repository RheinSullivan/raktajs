# File-Based Routing - MendungWeave

**MendungWeave** is the file-based routing layer in Rakta.js. The folder structure under `app/` is the router - there is no centralized route configuration file to maintain.

---

## Route Resolution Architecture & Lifecycle

```mermaid
flowchart TD
    Start((Start))
    Start --> ScanDir[Scan app/ Directory Tree\nscanRoutes File Scanner]
    ScanDir --> ClassifyFile{Classify File Entry}

    ClassifyFile -->|page.tsx| PageKind[Kind: page\nRoute Component]
    ClassifyFile -->|route.ts| APIKind[Kind: api\nAPI Endpoint]
    ClassifyFile -->|layout.tsx| LayoutKind[Kind: layout\nLayout Wrapper]
    ClassifyFile -->|loading.tsx / error.tsx| SpecialKind[Kind: special\nLoading / Error / NotFound]

    PageKind --> ManifestBuilder[generateManifest\nRoute Manifest Builder]
    APIKind --> ManifestBuilder
    LayoutKind --> LayoutTree[findLayoutsForPathname\nNested Layout Tree]
    SpecialKind --> ManifestBuilder
    LayoutTree --> ManifestBuilder

    ManifestBuilder --> RouteManifest[(RouteManifest\nEntry Table)]

    RouteManifest --> MatchEngine[matchRoute Engine\nPath Pattern Matching]

    MatchEngine --> MatchResult{Route\nMatch Found?}

    MatchResult -->|Yes| ExtractParams[Extract Dynamic Params\nslug, id, catchAll...]
    MatchResult -->|No| NotFound[Render notFound.tsx\nBoundary]

    ExtractParams --> Execute[Execute Component\n& Wrap Layout Tree]
    Execute --> End((End))
    NotFound --> End

    classDef startEnd fill:#e63946,stroke:#c1121f,color:#ffffff,font-weight:bold
    class Start,End startEnd
```

---

## File Conventions

| File | Resolves To |
| --- | --- |
| `app/page.tsx` | `/` |
| `app/about/page.tsx` | `/about` |
| `app/blog/[slug]/page.tsx` | `/blog/:slug` (dynamic segment) |
| `app/blog/[...slug]/page.tsx` | `/blog/*` (catch-all) |
| `app/(auth)/login/page.tsx` | `/login` - `(auth)` is a route group and excluded from URL |
| `app/layout.tsx` | Root layout wrapping downstream routes |
| `app/loading.tsx` | Rendered while route segment is loading |
| `app/error.tsx` | Error boundary for route segment |
| `app/notFound.tsx` | Rendered when no route matches |
| `app/api/users/route.ts` | API endpoint at `/api/users` |

---

## Code Example

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
// app/api/users/route.ts
export async function GET(): Promise<Response> {
  return Response.json({ users: [] });
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  return Response.json({ created: body }, { status: 201 });
}
```

---

## Route Groups for Layout Isolation

Wrap folder names in parentheses to group routes under a shared layout without affecting the URL path:

```txt
app/
├─ (auth)/
│  ├─ layout.tsx        auth layout (login/register)
│  ├─ login/page.tsx     /login
│  └─ register/page.tsx  /register
├─ dashboard/
│  ├─ layout.tsx        dashboard sidebar layout
│  └─ page.tsx           /dashboard
└─ layout.tsx            public marketing layout
```

---

## Related Documentation

- [`templates.md`](./templates.md) - How routing is structured in generated templates
- [`seo.md`](./seo.md) - Per-route metadata
- [`rpc.md`](./rpc.md) - Type-safe RPC API