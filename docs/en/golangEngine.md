# Rakta Engine (Golang Native Tooling)

Rakta Engine is a high-performance native Golang core powering the dev server, build pipeline, HMR file watcher, native router, and deployment adapters for Rakta.js.

---

## Golang Engine Architecture

```mermaid
flowchart TD
    Start((Start))
    Start --> CLI[CLI Command Invoked\nrakta dev / build / deploy / routes]
    CLI --> ConfigLoad[Config Loader\nengine/config]
    ConfigLoad --> CmdCheck{Command?}

    CmdCheck -->|dev| ForgeServer[Forge Dev Server\nengine/forge HTTP/HTTPS]
    CmdCheck -->|build| Builder[Builder Pipeline\nengine/builder Parallel Compile]
    CmdCheck -->|deploy| DeployGen[Deploy Adapter Generator\nengine/deploy]
    CmdCheck -->|routes| RouteInspect[Route Inspector\nengine/router List Routes]

    ForgeServer --> Router[Trie/Radix Router\nengine/router Named Params]
    ForgeServer --> Watcher[HMR File Watcher\nengine/watcher Polling]
    ForgeServer --> MWStack[Middleware Stack\nCORS, Headers, Logger]

    Watcher --> SSEBus[/HMR SSE Event Bus\nBroadcast to Browser/]

    Builder --> Artifacts[(Build Output Artifacts\ndist/ Static & Server)]
    DeployGen --> CloudCfg[Cloud Config Files\nVercel / Netlify / Docker]

    Router --> End((End))
    SSEBus --> End
    Artifacts --> End
    CloudCfg --> End
    RouteInspect --> End

    classDef startEnd fill:#e63946,stroke:#c1121f,color:#ffffff,font-weight:bold
    class Start,End startEnd
```

---

## Engine Components

1. **Rakta Forge (`engine/forge`)**: High-speed HTTP/HTTPS dev server with SSE HMR bridge and reverse proxy capability.
2. **Rakta Router (`engine/router`)**: Native Radix Trie HTTP router supporting named parameters (`:id`), catch-all (`*`), and middleware chains.
3. **Rakta Watcher (`engine/watcher`)**: Polling-based file system watcher with incremental modification detection for HMR.
4. **Rakta Builder (`engine/builder`)**: Parallel compilation pipeline, dependency graph scanner, and persistent hashing cache.
5. **Rakta Middleware (`engine/middleware`)**: Native request middleware stack supplying CORS, Secure Headers, and Logger functions.
6. **Rakta Config (`engine/config`)**: Structured JSON/TS configuration loader with typed environment variable fallbacks.
7. **Rakta Deploy (`engine/deploy`)**: Automated cloud deployment spec generator for Vercel, Netlify, Cloudflare Workers/Pages, Railway, and Docker.

---

## Native Binary Compilation

Compile cross-platform native Golang binaries:

```bash
cd engine
go build -o rakta ./cmd/cli
```
