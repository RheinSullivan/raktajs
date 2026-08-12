# Operations - rakta/ops

`rakta/ops` berisi primitive request context, background job, queue, cron task, dan event bus untuk kebutuhan fullstack dan server-side.

---

## Kode Dasar

```ts
import {
  createRequestContext,
  RaktaEventBus,
  RaktaQueue,
  runCronTask,
} from "rakta/ops";

// Request context
const context = createRequestContext(new Request("https://app.test/api"));

// Job queue
const queue = new RaktaQueue();
queue.push({ id: "job_1", name: "send-mail", payload: { to: "user@test" } });

// Event bus
const bus = new RaktaEventBus();
bus.on("ready", (event) => console.log(event.payload));
bus.emit({ name: "ready", payload: true });

// Cron
await runCronTask({ name: "cleanup", intervalMs: 60_000, run() {} });
```

---

## Terkait

- [`middleware.md`](./middleware.md) - integrasi request context di middleware pipeline
- [`kernel.md`](./kernel.md) - lifecycle dan service container
