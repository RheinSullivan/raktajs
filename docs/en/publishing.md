# Publishing

Rakta.js publishes two npm packages from GitHub Actions:

| Package | Directory |
| --- | --- |
| `raktajs` | `packages/rakta` |
| `create-rakta-app` | `packages/create-rakta` |

The publish workflow is `.github/workflows/publish.yml` and publishes both
packages from GitHub-hosted runners with npm trusted publishing.

When npm asks for the GitHub Actions workflow filename, enter:

```txt
publish.yml
```

Do not enter a URL and do not enter `.github/workflows/publish.yml`. The
workflow uses GitHub Actions OIDC, so no long-lived `NPM_TOKEN` is required.

Use this trusted publisher configuration on npm for both packages:

| Field | Value |
| --- | --- |
| Organization or user | `RheinSullivan` |
| Repository | `raktajs` |
| Workflow filename | `publish.yml` |
| Environment name | `npm` |
