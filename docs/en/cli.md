# CLI

## Overview

The `rakta` command is the framework control surface for local
development, generation, diagnostics, build inspection, deployment setup,
and project maintenance.

```bash
rakta help
```

## Core commands

| Command | Purpose |
| --- | --- |
| `rakta dev` | Start the development server |
| `rakta build` | Build the application |
| `rakta build --analyze` | Build and print a Forge inspection report |
| `rakta start` | Start the production server |
| `rakta routes` | Print the file-based route manifest |
| `rakta doctor` | Check project health |
| `rakta analyze` | Inspect build output and route render modes |
| `rakta benchmark` | Run a local route-manifest benchmark |
| `rakta upgrade [version]` | Update Rakta.js dependencies in `package.json` |
| `rakta check` | Run typecheck and lint scripts |
| `rakta lint` | Run Biome checks |
| `rakta format` | Format the project with Biome |

## Generators

```bash
rakta create page dashboard
rakta add component Button
rakta make:api users
rakta generate deployment vercel
```

`create` and `add` are aliases around the existing `make:*` generators.
Deployment generation writes provider-native files such as `vercel.json`,
`netlify.toml`, `wrangler.toml`, or `Dockerfile`.

## Plugins and telemetry

```bash
rakta plugin list
rakta plugin create analytics
rakta telemetry on
rakta telemetry off
```

Telemetry is local opt-in state stored in `.rakta/telemetry.json`.

## Upgrades

```bash
rakta upgrade
rakta upgrade ^1.0.2
```

Without a version, `upgrade` moves Rakta.js dependencies to `latest`.
After running it, refresh your lockfile with `bun install`.

## Related docs

- [`deployment.md`](./deployment.md)
- [`kernel.md`](./kernel.md)
- [`autoImport.md`](./autoImport.md)
