# Migration Guide

## Dari versi awal Rakta.js

1. Tetap gunakan `rakta` sebagai dependency utama.
2. Gunakan `path=` untuk asset `Photo` dan route `/` untuk `Click`.
3. Pindahkan kustomisasi backend fullstack ke `templates/fullStack/backend`.
4. Prioritaskan `rakta/layout`, `rakta/data`, `rakta/plugin`,
   `rakta/testing`, `rakta/performance`, dan `rakta/security` daripada import
   internal yang terlalu dalam.
5. Biarkan auto import aktif kecuali project sengaja memakai hook bernama khas
   Rakta dari `rakta/hooks`.

API publik bersifat additive. API app/router/render/component yang sudah ada
tetap kompatibel.
