# A note from the lead developer

To everyone who's ready to contribute to this project — as the lead
developer, I'd like to express my sincere gratitude for joining us in
developing the Rakta.js framework. Building a framework from scratch,
especially one rooted in a specific cultural identity like Cirebon's, is
not something one person should try to finish alone, and every person who
shows up to help shape it makes the project stronger.

## What this project is trying to be

Rakta.js exists to give developers who already think in React and JSX a
framework that feels familiar on day one, while quietly borrowing the best
ideas from the wider ecosystem — file-based routing inspired by modern app
routers, convention-driven auto imports inspired by Nuxt, a type-safe RPC
layer inspired by tRPC, a small state store inspired by Zustand, and a
fetch-based HTTP client inspired by Axios's ergonomics. None of those tools
are being replaced or criticized here — Rakta.js simply tries to package
familiar ideas into one small, Bun-first toolkit with its own identity.

## Documentation map

- [`gettingStarted.md`](./gettingStarted.md) - install Rakta.js and create your first app
- [`routing.md`](./routing.md) - file-based routing and route conventions
- [`layout.md`](./layout.md) - root, nested, special, grouped, and parallel layouts
- [`data.md`](./data.md) - cache, revalidation, prefetch, streaming, and render strategy helpers
- [`kernel.md`](./kernel.md) - service container, environment, and plugin lifecycle
- [`middleware.md`](./middleware.md) - request pipeline, redirect, rewrite, and abort
- [`authentication.md`](./authentication.md) - JWT, session, and single-session fullstack auth
- [`cli.md`](./cli.md) - command surface for generators, checks, deployment, and diagnostics
- [`deployment.md`](./deployment.md) - Vercel, Netlify, Cloudflare, Docker, and static deployment
- [`dx.md`](./dx.md) - dependency graph, route analysis, and bundle analysis helpers
- [`plugin.md`](./plugin.md) - plugin manifests, capabilities, official adapters, and templates
- [`testing.md`](./testing.md) - unit, integration, component, e2e, snapshot, mock server, and coverage helpers
- [`performance.md`](./performance.md) - benchmarks, bundle reports, and build cache
- [`security.md`](./security.md) - secure headers, CSP, CSRF, rate limiter, and secrets
- [`ops.md`](./ops.md) - request context, jobs, queues, cron, and event bus
- [`apiReference.md`](./apiReference.md) - stable public subpaths
- [`migrationGuide.md`](./migrationGuide.md) - migration notes for early Rakta.js projects
- [`compatibility.md`](./compatibility.md) - release compatibility policy
- [`docsSystem.md`](./docsSystem.md) - Markdown docs scanner and VitePress bridge
- [`autoImport.md`](./autoImport.md) - framework-owned auto imports
- [`hooks.md`](./hooks.md) - Rakta-named hooks for projects without auto import
- [`rpc.md`](./rpc.md) - type-safe RPC
- [`http.md`](./http.md) - PanturaFetch HTTP client
- [`store.md`](./store.md) - state management
- [`seo.md`](./seo.md) - metadata, sitemap, and robots helpers
- [`templates.md`](./templates.md) - generated project structures

## What we expect from a contribution

If you want to contribute, please include the materials you're adding —
whether that's sample code, a documentation page, or a fundamental
explanation of how a piece of the framework works. A pull request that
only says "fixed it" without showing what changed and why is much harder
for us to review and merge in good faith.

Concretely, that means:

- **If you add a feature**, add or update the matching documentation page
  under `docs/en/` (and ideally `docs/id/` too, even a rough translation
  is welcome).
- **If you fix a bug**, describe the bug and the fix in the pull request
  description, and add a regression check if practical.
- **If you add an example or template**, make sure it actually runs —
  `bun install && bun run dev` should work without extra manual steps.

## How to add examples

Examples and templates live in `templates/`. Keep new template output
consistent with the existing `frontendOnly` and `fullstack` structure
documented in `docs/en/templates.md`. If your example needs sample data,
keep it self-contained — no external services required to see it work.

## How to add documentation

Documentation pages use camelCase filenames (`gettingStarted.md`, not
`getting-started.md`) and live in `docs/en/` for English and `docs/id/`
for Bahasa Indonesia. Every page should have: an overview, when to use the
feature, a short architecture note when relevant, a working code example,
common mistakes, and links to related pages. Please write for someone who
has never used Rakta.js before — assume React knowledge, but not
familiarity with our specific layer names (MendungWeave, ShrimpStep,
TrusmiFrame, CarubanWire, PanturaFetch, and so on).

## How to add code

Follow the strict TypeScript rules in `CONTRIBUTING.md` — no `any`, no
`null`, no silenced errors, descriptive names, and explicit return types
on exported functions. If you're touching `packages/create-rakta/src/generator.ts`,
read the "Generator safety" section in `CONTRIBUTING.md` first; it is a
large file by design and should not shrink unexpectedly.

## How to add tests

Package- or feature-specific tests should sit next to the code they
cover, using the `*.test.ts` suffix, and run through `bun test`. Please do
not create a second root-level workspace test file — there is exactly one,
`workspace.test.ts`, at the repository root.

## Avoiding broken imports

Before opening a pull request, run:

```bash
bun run typecheck
bun run build
```

Both should complete without errors. If you added a new module, make sure
it is exported from the correct package barrel (for example, a new SEO
helper should be reachable through `rakta/seo`, not only from a deep
internal path).

## Writing beginner-friendly explanations

A good rule of thumb: if you had to look something up to write the code,
write down what you learned in the documentation, in plain language. The
person reading it next might be a complete beginner, a student, or an
experienced developer evaluating Rakta.js for a real project — write for
all three.

## Including your GitHub profile or portfolio

Don't forget to include your GitHub profile or web portfolio in your pull
request description, as proof of your contribution to this project.
We're glad to credit the people who help build Rakta.js, in the
`CHANGELOG.md` and in release notes.

## Commit messages

Use a clear, scoped style:

```bash
git commit -m "feat(router): support optional catch-all segments"
git commit -m "fix(http): respect custom timeout in PanturaFetch retries"
git commit -m "docs(id): translate the routing guide"
```

## Opening pull requests

1. Fork the repository, branch from `main`.
2. Keep the change focused — one concern per pull request when possible.
3. Run the full validation suite (`bun run typecheck`, `bun run build`,
   `bun test`, `bun run lint`, `bun run check:workspace`).
4. Fill in the pull request template completely.
5. Be ready for a round or two of review — that's a normal, healthy part
   of building something other people will rely on.

## Reporting issues

Use the issue templates under `.github/ISSUE_TEMPLATE/`. The more specific
the reproduction, the faster we can help.

## Keeping code clean and TypeScript strict

Please avoid `any`, `null` as a domain value, unsafe casts, and vague
variable names like `data`, `res`, or `temp`. `CONTRIBUTING.md` has the
full list with examples of the correct pattern for handling optional
properties under `exactOptionalPropertyTypes`.

## Documenting new features

If you introduce a new capability, give it a place in the feature table in
the root `README.md`, and write a full documentation page for it — even a
short one is better than none. If the feature deserves its own Rakta.js
identity name in the spirit of MendungWeave, ShrimpStep, or CarubanWire,
propose it in your pull request description so we can agree on naming
before merge.

## Closing thank you

Once again, thank you very much for being willing to spend your time and
skill helping this project grow. Whatever size your contribution is — one
typo fix or one entire new module — it matters, and it's appreciated.

Rhein Sullivan
Lead of Vyagra Nexus™ <3
