# Testing

`rakta/testing` provides a small official testing contract for unit, integration, component, e2e, snapshot, mock server, and coverage workflows.

---

## Usage

```ts
import {
  createCoverageReport,
  createMockServer,
  createSnapshot,
  runRaktaTests,
} from "rakta/testing";

const results = await runRaktaTests([
  { name: "home route", kind: "unit", run() {} },
]);

const server = createMockServer([
  { method: "GET", pathname: "/api/hello", response: Response.json({ ok: true }) },
]);

const snapshot = createSnapshot({ route: "/" });
const coverage = createCoverageReport({ files: 10, covered: 9 });
```

The helpers are runner-neutral and work with Bun, CI checks, or custom framework tooling.

---

## Related

- [`devtools.md`](./devtools.md) - Dev Indicator and terminal tools
- [`performance.md`](./performance.md) - benchmarks and performance analysis
