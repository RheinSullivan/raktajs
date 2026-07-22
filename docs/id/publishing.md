# Publishing

Rakta.js mem-publish dua package npm dari GitHub Actions:

| Package | Folder |
| --- | --- |
| `raktajs` | `packages/rakta` |
| `create-rakta-app` | `packages/create-rakta` |

Workflow publish ada di `.github/workflows/publish.yml` dan mem-publish kedua
package dari GitHub-hosted runner memakai npm trusted publishing.

Saat npm meminta GitHub Actions workflow filename, isi:

```txt
publish.yml
```

Jangan isi URL dan jangan isi `.github/workflows/publish.yml`. Workflow ini
memakai GitHub Actions OIDC, jadi tidak perlu long-lived `NPM_TOKEN`.

Gunakan konfigurasi trusted publisher ini di npm untuk kedua package:

| Field | Value |
| --- | --- |
| Organization or user | `RheinSullivan` |
| Repository | `raktajs` |
| Workflow filename | `publish.yml` |
| Environment name | `npm` |
