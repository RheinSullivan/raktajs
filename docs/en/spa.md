# Single Page Application (SPA) Mode in Rakta.js

Single Page Application (SPA) is a first-class supported rendering mode in Rakta.js.

---

## SPA Lifecycle & Client Navigation Architecture

```mermaid
flowchart TD
    Start((Start))
    Start --> HTMLShell[Static HTML Shell\nrakta-root mount point]
    HTMLShell --> AppMount[RaktaAppShell Mount\nReact Hydration / CSR Init]
    AppMount --> AutoLoad[Auto-Import & Asset\nGlobal Loaders]
    AutoLoad --> UserAction[User Click or\nuseNavigation call]
    UserAction --> RouteGuard{Route Guard\nCheck?}

    RouteGuard -->|Blocked| Redirect[Redirect to Auth / Login]
    RouteGuard -->|Allowed| ChunkLoad[Dynamic Route\nChunk Import Lazy]

    Redirect --> End((End))

    ChunkLoad --> ScrollRestore[Scroll Restoration\n& Input State Preservation]
    ScrollRestore --> ReactRender[React Client Render\n& Fast Refresh Sync]
    ReactRender --> SplashDismiss[Dismiss Splash Screen\nrakta:mounted event]
    SplashDismiss --> PageReady[Page Ready\nFully Interactive]
    PageReady --> UserAction

    classDef startEnd fill:#e63946,stroke:#c1121f,color:#ffffff,font-weight:bold
    class Start,End startEnd
```

---

## Key Features

- Instant client-side navigation via `<click to="...">` or `useNavigation()`
- Automatic code splitting and route lazy loading
- Built-in scroll restoration (`<ScrollRestoration />`)
- Page protection & route guards (`useRouteGuard()`)
- SPA error boundary isolation (`<SpaErrorBoundary />`)

---

## Enabling SPA Mode

In `rakta.config.ts`:

```ts
import { defineConfig } from "raktajs/config";

export default defineConfig({
  mode: "spa",
  spa: true,
  autoImport: {
    enabled: true,
  },
});
```

CLI flag:

```bash
rakta create my-app --spa
```

---

## Route Guard Example

```tsx
import { useRouteGuard } from "raktajs/spa";

export default function ProtectedDashboard() {
  useRouteGuard(({ pathname }) => {
    const authenticated = Boolean(localStorage.getItem("token"));
    if (!authenticated) {
      return "/login";
    }
    return true;
  });

  return <div>Welcome to Protected Dashboard</div>;
}
```
