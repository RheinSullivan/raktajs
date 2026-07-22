# Migration Guide

## From early Rakta.js versions

1. Keep `rakta` as the main dependency.
2. Use `path=` for `Photo` assets and `/` routes for `Click`.
3. Move fullstack backend customization into `templates/fullStack/backend`.
4. Prefer `rakta/layout`, `rakta/data`, `rakta/plugin`, `rakta/testing`,
   `rakta/performance`, and `rakta/security` instead of deep internal imports.
5. Keep auto import enabled unless the project intentionally uses Rakta-named
   hooks from `rakta/hooks`.

Public APIs are additive. Existing app/router/render/component APIs remain
compatible.
