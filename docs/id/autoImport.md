# Auto import - TrusmiThread

## Gambaran umum

TrusmiThread adalah sistem auto import Rakta.js. Sistem ini menjaga app
hasil generator tetap bersih dengan membuat primitive framework dan hooks
starter tersedia tanpa import manual saat Auto Import aktif.

Generator project akan bertanya apakah Auto Import ingin diaktifkan.
Default-nya adalah **aktif**.

## Perilaku generator

Saat Auto Import aktif, komponen starter yang dihasilkan bisa memakai
global framework Rakta dan hooks yang kompatibel dengan React tanpa
mengimpor semuanya di setiap file.

Saat Auto Import dimatikan, file yang dihasilkan akan mengimpor hooks
bernama khas Rakta dari `raktajs/hooks`, bukan mengimpor hooks React
secara langsung:

```tsx
import { raktaEffect, raktaRef, raktaState } from "raktajs/hooks";
```

Dengan begitu code tetap eksplisit, tetapi identitas Rakta.js tetap
terasa.

## Konfigurasi

```ts
import { defineRaktaConfig } from "raktajs";

export default defineRaktaConfig({
  autoImport: {
    enabled: true,
    directories: ["app", "components", "lib", "stores", "schemas"],
    outputDirectory: ".rakta",
    dts: true,
  },
});
```

## CLI

Generate manifest auto import secara manual:

```bash
bun rakta imports:generate
```

## Manifest hasil generate

TrusmiThread juga menulis file barrel hasil generate di
`.rakta/auto-imports.ts`. File ini berguna untuk import eksplisit,
tooling editor, dan integrasi compiler/runtime berikutnya.

```ts
// .rakta/auto-imports.ts
export { Click } from "../app/components/clickButton";
export { useCounterStore } from "../stores/counter.store";
```

## Praktik terbaik

- Biarkan Auto Import aktif untuk pengalaman starter Rakta.js paling
  sederhana.
- Matikan Auto Import hanya ketika tim kalian ingin semua dependency
  terlihat eksplisit.
- Gunakan `raktajs/hooks` ketika Auto Import dimatikan.
- Jangan mengedit `.rakta/auto-imports.ts` secara manual.

## Dokumen terkait

- [`hooks.md`](./hooks.md)
- [`templates.md`](./templates.md)
- [`mulai.md`](./mulai.md)
