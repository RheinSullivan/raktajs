# Testing

`rakta/testing` menyediakan kontrak testing resmi yang kecil untuk workflow
unit, integration, component, e2e, snapshot, mock server, dan coverage.

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

Helper ini netral terhadap test runner dan bisa dipakai dengan Bun, CI check,
atau tooling framework custom.
