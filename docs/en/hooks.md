# Rakta hooks

## Overview

Rakta hooks are framework-named aliases for React hooks. They are useful
when Auto Import is disabled and you still want code that looks and feels
like Rakta.js instead of importing `useState`, `useEffect`, or `useRef`
directly from React.

## Quick start

```tsx
import { raktaEffect, raktaRef, raktaState } from "raktajs/hooks";

export default function Counter() {
  const [count, setCount] = raktaState(0);
  const buttonRef = raktaRef<HTMLButtonElement>(null);

  raktaEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <button ref={buttonRef} onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

## API reference

| Rakta hook | React equivalent |
| --- | --- |
| `raktaState` | `useState` |
| `raktaEffect` | `useEffect` |
| `raktaRef` | `useRef` |
| `raktaMemo` | `useMemo` |
| `raktaCallback` | `useCallback` |
| `raktaReducer` | `useReducer` |
| `raktaContext` | `useContext` |
| `raktaId` | `useId` |
| `raktaTransition` | `useTransition` |
| `raktaDeferredValue` | `useDeferredValue` |
| `raktaSyncExternalStore` | `useSyncExternalStore` |
| `raktaLayoutEffect` | `useLayoutEffect` |
| `raktaInsertionEffect` | `useInsertionEffect` |
| `raktaImperativeHandle` | `useImperativeHandle` |
| `raktaOptimistic` | `useOptimistic` |
| `raktaActionState` | `useActionState` |
| `raktaDebugValue` | `useDebugValue` |

## Generator behavior

`create-rakta-app` asks whether Auto Import should be enabled. If you
disable it, generated starter files import hooks from `raktajs/hooks`
using Rakta names.

## Related docs

- [`autoImport.md`](./autoImport.md)
- [`gettingStarted.md`](./gettingStarted.md)
