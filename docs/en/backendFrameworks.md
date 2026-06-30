# Backend frameworks

## Overview

In fullstack mode, `create-rakta-app` generates a different `backend/`
folder structure depending on which framework you choose — there is no
single generic shape forced onto all four.

## When to use this

Read this after choosing a backend framework during `create-rakta-app`,
or before adding support for a new backend framework to the generator.

## Gaman.js

```txt
backend/
├─ src/
│  ├─ routes/
│  ├─ controllers/
│  ├─ services/
│  ├─ middlewares/
│  └─ app.ts
├─ package.json
└─ tsconfig.json
```

`app.ts` is the entry point that wires routes to controllers. This is the
lightest of the four options and pairs naturally with CarubanWire if you
want typed RPC instead of plain REST routes.

## Express.js

```txt
backend/
├─ src/
│  ├─ routes/
│  ├─ controllers/
│  ├─ services/
│  ├─ middlewares/
│  └─ server.ts
├─ package.json
└─ tsconfig.json
```

Same layered shape as Gaman.js, but the entry point is named `server.ts`
to match Express community convention, and the generated `package.json`
depends on `express` and its types.

## Nest.js

```txt
backend/
├─ src/
│  ├─ app.module.ts
│  ├─ main.ts
│  ├─ modules/
│  └─ common/
├─ nest-cli.json
├─ package.json
└─ tsconfig.json
```

Nest.js gets its own conventions — a root `AppModule`, a `main.ts`
bootstrap file, feature `modules/`, and `common/` for shared decorators,
guards, and pipes, plus the `nest-cli.json` the Nest CLI itself expects.

## Adonis.js

```txt
backend/
├─ app/
│  ├─ controllers/
│  ├─ middleware/
│  └─ services/
├─ start/
├─ config/
├─ package.json
└─ tsconfig.json
```

Adonis.js follows its own idiomatic layout — `app/` for application code,
`start/` for boot-time route/middleware registration, and `config/` for
framework configuration, matching what an Adonis.js developer already
expects.

## Common mistakes

- Assuming all four backends share `src/app.ts` as the entry point — only
  Gaman.js does; Express.js uses `server.ts`, Nest.js uses `main.ts`, and
  Adonis.js has no single entry file in the same sense.
- Forgetting that Nest.js needs `nest-cli.json` to use the Nest CLI's own
  tooling (`nest build`, `nest start`) alongside or instead of Bun's
  build pipeline.
- Wiring CarubanWire's HTTP handler into a framework-specific middleware
  signature incorrectly — each framework has its own request/response
  types, so the adapter code differs even though the router definition
  itself does not.

## Related docs

- [`templates.md`](./templates.md)
- [`rpc.md`](./rpc.md)