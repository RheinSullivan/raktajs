# Ruby Ecosystem Utilities in Rakta.js

Rakta.js includes Ruby ecosystem utilities for environment diagnostics, automated version releases, documentation indexing, linter orchestration, benchmark profiling, test running, and project generators.

---

## Ruby Tooling Architecture

```mermaid
flowchart TD
    Start((Start))
    Start --> Tool{Select Ruby Tool?}

    Tool -->|doctor.rb| Doctor[Environment Diagnostics\nBun / Node / Git / Go / Ruby]
    Tool -->|release.rb| Release[Automated Version Bump\npackage.json & CHANGELOG.md]
    Tool -->|docs.rb| Docs[Markdown Indexer\nSidebar & Search Manifest]
    Tool -->|generators.rb| Gen[Project Scaffolding\nSPA / SSR / Fullstack]
    Tool -->|benchmark.rb| Bench[Performance Profiling\nP95 Stats & Reports]
    Tool -->|lint.rb| Lint[Lint Orchestrator\nBiome + go vet + Ruby]
    Tool -->|test.rb| Test[Bun Test Suite Runner\nJSON / TAP / Console Output]
    Tool -->|inspector.rb| Inspect[Project Inspector\nDependency & Route Analysis]

    Doctor --> Report[(Health Report\nOutput)]
    Release --> ChangeLog[(CHANGELOG.md\nUpdated)]
    Docs --> SidebarIndex[(Sidebar Manifest\nSearch Index)]
    Gen --> Scaffold[Project Files\nGenerated]
    Bench --> PerfStats[(P95 Performance\nReport)]
    Lint --> LintOutput[TypeScript / Go / Ruby\nLint Results]
    Test --> TestReport[(Test Output\nJSON / TAP)]
    Inspect --> InspectOut[Project Analysis\nResults]

    Report --> End((End))
    ChangeLog --> End
    SidebarIndex --> End
    Scaffold --> End
    PerfStats --> End
    LintOutput --> End
    TestReport --> End
    InspectOut --> End

    classDef startEnd fill:#e63946,stroke:#c1121f,color:#ffffff,font-weight:bold
    class Start,End startEnd
```

---

## Utility Overview

1. **`doctor.rb`**: Diagnostic checker for Bun, Node, Git, Go, and Ruby runtime environments.
2. **`release.rb`**: Automated monorepo version bumper and CHANGELOG.md entry generator.
3. **`docs.rb`**: Markdown navigation parser and sidebar manifest indexer.
4. **`generators.rb`**: Project scaffolding generator for SPA, SSR, SSG, CSR, Dashboard, and Landing Page routes.
5. **`benchmark.rb`**: Performance profiling suite measuring startup latency, compilation timing, and monorepo file stats.
6. **`lint.rb`**: Multi-language linter orchestrator coordinating Biome (TS), `gofmt` & `go vet` (Go), and Ruby syntax checks.
7. **`test.rb`**: Automated test suite runner supporting JSON, TAP, and text console outputs.

---

## Script Execution

```bash
ruby tools/ruby/doctor.rb
ruby tools/ruby/lint.rb
ruby tools/ruby/benchmark.rb --suite=full
ruby tools/ruby/test.rb --reporter=json
```
