# Rakta DevTools

Rakta DevTools are development-only browser tools that appear when you run the Rakta.js Forge dev server. Production builds do not mount the indicator, include the DevTools browser module, or expose the DevTools control endpoints.

## Dev Indicator

The Rakta Dev Indicator is a small floating button that uses the real `public/Rakta.js.svg` logo. Press the button with a mouse, `Enter`, or `Space` to open Rakta DevTools. Press `Escape` or click outside the panel to close it.

The panel shows:

- current route pathname
- route status based on the resolved Rakta render mode
- active bundler, currently `Bun.build (CherbonsEngine)`
- Route Info
- Preferences
- Restart Dev Server
- Reset Bundler Cache

## Route Info

Route Info comes from the active Forge route manifest and render configuration. The browser asks the development server for metadata through the DevTools route endpoint; it does not scan the filesystem.

The panel shows the matched pattern, route type, render mode source, route source file, layout files, page file, route segments, and dynamic parameter names.

## Preferences

Preferences are stored in browser storage for the local development browser.

Supported preferences:

- Theme: System, Light, Dark
- Position: Bottom Left, Bottom Right, Top Left, Top Right
- Size: Small, Medium, Large
- Hide DevTools shortcut

The default shortcut is `Alt+Shift+D`. Shortcut recording requires at least one modifier key, avoids common browser-reserved shortcuts, and does not trigger while typing in inputs, textareas, selects, or editable content.

Use "Hide DevTools for this session" to hide the indicator until the development browser session is restarted. This does not modify project configuration.

## Project Configuration

Disable Rakta DevTools for a project with:

```ts
import { defineConfig } from "raktajs/config";

export default defineConfig({
  devTools: false,
});
```

When disabled, the Forge dev server does not mount the browser indicator and does not expose the DevTools control endpoints.

## Dev Server Commands

"Restart Dev Server" asks the active Forge development server to regenerate the route manifest, rebuild the client bundle, and notify connected browsers through the existing live-reload channel.

"Reset Bundler Cache" clears only the generated `.rakta/dev` development bundle cache, then rebuilds the client bundle. It does not delete source files, `node_modules`, `.git`, or project configuration.

Both commands prevent duplicate requests while a previous command is still running and show success or failure feedback in the panel.

## Rakta Dev Terminal

Rakta Dev Terminal is the server-side output printed by `bun run dev`. It shows the Rakta.js version, local URL, LAN URL when available, detected environment filenames, startup time, and request timings.
