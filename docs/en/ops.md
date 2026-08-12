# Operations

`rakta/ops` contains request context, background jobs, queues, cron tasks, and event bus primitives for fullstack and server-side needs.

---

## Usage

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

## Related

- [`middleware.md`](./middleware.md) - integrating request context into the middleware pipeline
- [`kernel.md`](./kernel.md) - lifecycle and service container
