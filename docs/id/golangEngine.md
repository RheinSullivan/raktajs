# Rakta Engine (Golang Native Tooling)

Rakta Engine adalah engine bawaan Golang berperforma tinggi yang mentenagai dev server, pipeline build, HMR file watcher, router native, dan adapter deployment Rakta.js.

---

## Arsitektur Engine Golang

```mermaid
flowchart TD
    Mulai((Mulai))
    Mulai --> CLI[Perintah CLI Diterima\nrakta dev / build / deploy / routes]
    CLI --> ConfigLoad[Pemuat Konfigurasi\nengine/config]
    ConfigLoad --> CmdCheck{Perintah?}

    CmdCheck -->|dev| ForgeServer[Forge Dev Server\nengine/forge HTTP/HTTPS]
    CmdCheck -->|build| Builder[Pipeline Builder\nengine/builder Kompilasi Paralel]
    CmdCheck -->|deploy| DeployGen[Generator Adapter Deploy\nengine/deploy]
    CmdCheck -->|routes| RouteInspect[Inspektor Rute\nengine/router Daftar Rute]

    ForgeServer --> Router[Router Trie/Radix\nengine/router Parameter Bernama]
    ForgeServer --> Watcher[Watcher Berkas HMR\nengine/watcher Polling]
    ForgeServer --> MWStack[Stack Middleware\nCORS, Header, Logger]

    Watcher --> SSEBus[/Bus Event SSE HMR\nSiarkan ke Browser/]

    Builder --> Artifacts[(Output Artifact Build\ndist/ Statis & Server)]
    DeployGen --> CloudCfg[Berkas Konfigurasi Cloud\nVercel / Netlify / Docker]

    Router --> Selesai((Selesai))
    SSEBus --> Selesai
    Artifacts --> Selesai
    CloudCfg --> Selesai
    RouteInspect --> Selesai

    classDef startEnd fill:#e63946,stroke:#c1121f,color:#ffffff,font-weight:bold
    class Mulai,Selesai startEnd
```

---

## Komponen Engine

1. **Rakta Forge (`engine/forge`)**: Development server HTTP/HTTPS berkecepatan tinggi dengan bridge SSE HMR dan reverse proxy.
2. **Rakta Router (`engine/router`)**: Router Trie/Radix native Go dengan dukungan named parameters (`:id`), catch-all (`*`), dan middleware stack.
3. **Rakta Watcher (`engine/watcher`)**: Watcher berkala berbasis polling dengan deteksi modifikasi file inkremental untuk HMR.
4. **Rakta Builder (`engine/builder`)**: Pipeline kompilasi paralel, pemindai dependency graph, dan cache hash inkremental.
5. **Rakta Middleware (`engine/middleware`)**: Layer middleware request native dengan fitur CORS, Secure Headers, dan Logger.
6. **Rakta Config (`engine/config`)**: Loader konfigurasi JSON/TS terstruktur dengan validasi dan environment reader.
7. **Rakta Deploy (`engine/deploy`)**: Pembuat konfigurasi deployment otomatis untuk Vercel, Netlify, Cloudflare, Railway, dan Docker.

---

## Kompilasi Binary Native

Anda dapat mengkompilasi binary native Golang untuk eksekusi lintas platform:

```bash
cd engine
go build -o rakta ./cmd/cli
```
