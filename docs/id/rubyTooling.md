# Utilitas Ekosistem Ruby di Rakta.js

Rakta.js menyertakan utilitas ekosistem Ruby untuk diagnostik lingkungan, rilis versi otomatis, pengindeksan dokumentasi, linter orchestrator, benchmark suite, test runner, dan generator proyek.

---

## Arsitektur Tooling Ruby

```mermaid
flowchart TD
    Mulai((Mulai))
    Mulai --> Tool{Pilih Tool Ruby?}

    Tool -->|doctor.rb| Doctor[Diagnostik Lingkungan\nBun / Node / Git / Go / Ruby]
    Tool -->|release.rb| Release[Pembaruan Versi Otomatis\npackage.json & CHANGELOG.md]
    Tool -->|docs.rb| Docs[Pengindeks Markdown\nManifest Sidebar & Pencarian]
    Tool -->|generators.rb| Gen[Scaffolding Proyek\nSPA / SSR / Fullstack]
    Tool -->|benchmark.rb| Bench[Profiling Performa\nLaporan & Statistik P95]
    Tool -->|lint.rb| Lint[Orchestrator Lint\nBiome + go vet + Ruby]
    Tool -->|test.rb| Test[Test Runner Suite Bun\nOutput JSON / TAP / Konsol]
    Tool -->|inspector.rb| Inspect[Inspektor Proyek\nAnalisis Dependensi & Rute]

    Doctor --> Report[(Output Laporan\nKesehatan)]
    Release --> ChangeLog[(CHANGELOG.md\nDiperbarui)]
    Docs --> SidebarIndex[(Manifest Sidebar\n& Indeks Pencarian)]
    Gen --> Scaffold[Berkas Proyek\nDihasilkan]
    Bench --> PerfStats[(Laporan Performa\nP95)]
    Lint --> LintOutput[Hasil Lint\nTypeScript / Go / Ruby]
    Test --> TestReport[(Output Pengujian\nJSON / TAP)]
    Inspect --> InspectOut[Hasil Analisis\nProyek]

    Report --> Selesai((Selesai))
    ChangeLog --> Selesai
    SidebarIndex --> Selesai
    Scaffold --> Selesai
    PerfStats --> Selesai
    LintOutput --> Selesai
    TestReport --> Selesai
    InspectOut --> Selesai

    classDef startEnd fill:#e63946,stroke:#c1121f,color:#ffffff,font-weight:bold
    class Mulai,Selesai startEnd
```

---

## Ringkasan Utilitas

1. **`doctor.rb`**: Pemeriksa diagnostik lingkungan runtime Bun, Node, Git, Go, dan Ruby.
2. **`release.rb`**: Pembaru versi otomatis monorepo dan pembuat catatan CHANGELOG.md.
3. **`docs.rb`**: Parser navigasi markdown dan pengindeks manifest sidebar dokumentasi.
4. **`generators.rb`**: Engine generator scaffolding untuk rute SPA, SSR, SSG, CSR, Dashboard, dan Landing Page.
5. **`benchmark.rb`**: Suite pengujian performa untuk startup time, bundling timing, dan statistik file monorepo.
6. **`lint.rb`**: Orchestrator linter lintas bahasa yang mengoordinasikan Biome (TS), `gofmt` & `go vet` (Go), serta sintaks Ruby.
7. **`test.rb`**: Test runner suite otomatis dengan dukungan format laporan JSON, TAP, dan konsol.

---

## Eksekusi Script

```bash
ruby tools/ruby/doctor.rb
ruby tools/ruby/lint.rb
ruby tools/ruby/benchmark.rb --suite=full
ruby tools/ruby/test.rb --reporter=json
```
