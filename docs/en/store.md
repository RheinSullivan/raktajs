# Store

## Overview

Rakta.js ships a small, Zustand-inspired state store built directly on React's `useSyncExternalStore`. No external state management dependency required.

---

## When to Use This

Use the store for UI state shared across components that does not belong in the URL or server data - theme toggles, modal visibility, multi-step form state, a shopping cart, and similar. For server data, prefer fetching it where it is needed with [PanturaFetch](./http.md) or [CarubanWire](./rpc.md) rather than mirroring it into the store.

---

## Code Example

```ts
// lib/stores/counterStore.ts
import { createRaktaStore } from "rakta/store";

interface CounterState {
  count: number;
  increment: () => void;
  reset: () => void;
}

export const useCounterStore = createRaktaStore<CounterState>((set, get) => ({
  count: 0,
  increment: () => set({ count: get().count + 1 }),
  reset: () => set({ count: 0 }),
}));
```

```tsx
function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return <button onClick={increment}>Count: {count}</button>;
}
```

Reading outside React:
```ts
const currentCount = useCounterStore.getState().count;
useCounterStore.setState({ count: 0 });
```

---

## Common Mistakes

- Calling the store hook conditionally (inside an `if`) - like any React hook, it must be called unconditionally at the top of the component.
- Storing large server response payloads directly in the store instead of fetching them where needed - this tends to make the store the source of truth for data it should not own.
- Forgetting that `set({ ... })` merges into the existing state shallowly - it does not replace the whole state object.

---

## Related Docs

- [`http.md`](./http.md) - fetching the data you might put into a store
- [`rpc.md`](./rpc.md) - CarubanWire, another common data source