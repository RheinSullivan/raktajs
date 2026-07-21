# Hooks Rakta

## Gambaran umum

Hooks Rakta adalah alias bernama khas framework untuk hooks React. Hooks
ini berguna ketika Auto Import dimatikan dan kalian tetap ingin code yang
terasa seperti Rakta.js, bukan mengimpor `useState`, `useEffect`, atau
`useRef` langsung dari React.

## Mulai cepat

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

## Referensi API

| Hook Rakta | Padanan React |
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

## Perilaku generator

`create-rakta-app` sekarang bertanya apakah Auto Import ingin diaktifkan.
Jika dimatikan, file starter yang dihasilkan akan mengimpor hooks dari
`raktajs/hooks` dengan nama khas Rakta.

## Dokumen terkait

- [`autoImport.md`](./autoImport.md)
- [`mulai.md`](./mulai.md)
