# Operations

`rakta/ops` berisi primitive request context, background job, queue, cron task,
dan event bus.

```ts
import {
	createRequestContext,
	RaktaEventBus,
	RaktaQueue,
	runCronTask,
} from "rakta/ops";

const context = createRequestContext(new Request("https://app.test/api"));

const queue = new RaktaQueue();
queue.push({ id: "job_1", name: "send-mail", payload: { to: "user@test" } });

const bus = new RaktaEventBus();
bus.on("ready", (event) => console.log(event.payload));
bus.emit({ name: "ready", payload: true });

await runCronTask({ name: "cleanup", intervalMs: 60_000, run() {} });
```
