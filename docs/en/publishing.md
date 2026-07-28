# Publishing

Rakta.js publishes two npm packages from GitHub Actions using **npm Trusted Publishing (OIDC)**. No long-lived `NPM_TOKEN` is stored anywhere in the repository.

---

## Packages

| npm package | Source directory | npm page |
|---|---|---|
| `raktajs` | `packages/rakta` | https://www.npmjs.com/package/raktajs |
| `create-rakta-app` | `packages/create-rakta` | https://www.npmjs.com/package/create-rakta-app |

---

## Architecture

```
Developer pushes git tag  →  creates GitHub Release
         ↓
GitHub Actions publish.yml fires (release: published)
         ↓
OIDC identity token issued by GitHub to the workflow
         ↓
npm Trusted Publishing validates the token
         ↓
version validation  (tag == package.json version)
version conflict check  (version not already on npm)
         ↓
typecheck → lint → test → build
         ↓
npm pack --dry-run  (validate tarball contents)
         ↓
npm publish --provenance  (SLSA attestation embedded)
         ↓
Package live on npm with verified provenance
```

---

## Workflows

### CI - `.github/workflows/ci.yml`

Runs on every push to `main` and every pull request targeting `main`.

- **Does NOT publish packages.**
- Runs: typecheck → lint → test → build → workspace check
- Uses `bun install --frozen-lockfile` for reproducible installs
- Concurrency: cancels redundant runs on same branch/PR
- Permissions: `contents: read` only

### Publish - `.github/workflows/publish.yml`

Fires only on:
1. A published GitHub Release (`release: published`)
2. Manual `workflow_dispatch` (for `latest`, `next`, or `beta` dist-tags)

Steps in order:

1. Checkout (frozen)
2. Setup Bun 1.3.11 + Node.js 22
3. `bun install --frozen-lockfile`
4. **Version validation** - git tag (e.g. `v1.0.7`) must match both `packages/rakta/package.json` and `packages/create-rakta/package.json`. Fails the workflow if they don't match.
5. **Version conflict check** - queries npm to ensure neither version is already published. Prevents accidental re-publish.
6. typecheck → lint → test → build
7. `npm pack --dry-run` for both packages
8. CLI smoke test (`node packages/create-rakta/dist/index.js --version`)
9. `npm publish --access public --provenance` for `raktajs`
10. `npm publish --access public --provenance` for `create-rakta-app`

Permissions:

```yaml
permissions:
  contents: read   # checkout only
  id-token: write  # OIDC token for npm Trusted Publishing
```

No other permissions. `write-all` is never used.

Concurrency protection:

```yaml
concurrency:
  group: npm-release
  cancel-in-progress: false   # never cancel a release in progress
```

---

## OIDC Trusted Publishing - How It Works

npm Trusted Publishing uses GitHub Actions OIDC (OpenID Connect). Instead of a long-lived secret token:

1. GitHub Actions generates a short-lived OIDC JWT for the workflow run.
2. The JWT contains claims: repository owner, repository name, workflow filename, environment name.
3. npm validates the JWT against the Trusted Publisher configuration on the package.
4. If all claims match, npm allows publishing without any pre-shared token.

This means:
- No `NPM_TOKEN` in GitHub Secrets
- No token rotation required
- Token cannot be stolen from source code or CI logs
- Works only from the exact workflow file and environment you configure

---

## MANUAL SETUP REQUIRED - npmjs.com

This is a **one-time manual step** that must be done on npmjs.com. It cannot be automated from the repository.

Do this for **both** packages before the first OIDC publish:

### For `raktajs`

1. Go to https://www.npmjs.com/package/raktajs
2. Click **Settings** → **Publishing**
3. Under **Trusted Publishers**, click **Add a publisher**
4. Select **GitHub Actions**
5. Fill in:

| Field | Value |
|---|---|
| GitHub owner | `RheinSullivan` |
| Repository name | `raktajs` |
| Workflow filename | `publish.yml` |
| Environment name | `npm` |

6. Save.

### For `create-rakta-app`

1. Go to https://www.npmjs.com/package/create-rakta-app
2. Repeat the same steps with identical values.

> **Important:** Use `publish.yml` (filename only), not the full path `.github/workflows/publish.yml`.

---

## MANUAL SETUP REQUIRED - GitHub

### GitHub Environment `npm`

The publish workflow uses `environment: npm`. You should create this environment in GitHub:

1. Go to https://github.com/RheinSullivan/raktajs/settings/environments
2. Click **New environment**
3. Name it `npm`
4. Optionally add **Required reviewers** for extra protection before any publish
5. Optionally restrict to branch/tag patterns (e.g. `v*` tags only)

> Without this environment, publishing still works but you lose the option to add approval gates.

---

## Release Process - Step by Step

1. **Make changes** on a feature branch, open a PR, get CI green.

2. **Merge to `main`** after review.

3. **Bump versions** - update both:
   - `packages/rakta/package.json` → `"version": "X.Y.Z"`
   - `packages/create-rakta/package.json` → `"version": "X.Y.Z"`

   Both packages currently share the same version. Commit the bump.

4. **Create a GitHub Release:**
   - Go to https://github.com/RheinSullivan/raktajs/releases/new
   - Tag: `vX.Y.Z` (e.g. `v1.0.7`)
   - Title: `Rakta.js vX.Y.Z`
   - Write release notes
   - Click **Publish release**

5. `publish.yml` fires automatically. It will:
   - Verify the tag matches both package versions
   - Check neither version is already on npm
   - Build, test, pack, and publish with provenance

6. **Verify on npm:**
   - https://www.npmjs.com/package/raktajs
   - https://www.npmjs.com/package/create-rakta-app

---

## Provenance

Both packages are published with `--provenance`. This creates a signed SLSA (Supply Chain Levels for Software Artifacts) attestation that links each published package to:

- The exact GitHub repository
- The exact commit SHA
- The exact workflow run

Users can verify provenance on the npm package page or with:

```bash
npm audit signatures raktajs
npm audit signatures create-rakta-app
```

---

## Version Consistency

Both packages currently share the same version number. When you release:

- Tag `v1.0.7` must match `"version": "1.0.7"` in **both** `packages/rakta/package.json` and `packages/create-rakta/package.json`.
- If they don't match, the workflow fails with a clear error before publishing anything.

---

## Emergency Manual Publish

If CI is down and you must publish manually:

```bash
# From the repository root
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run test
bun run build

# Publish (requires you to be logged in to npm with 2FA)
cd packages/rakta && npm publish --access public
cd ../create-rakta && npm publish --access public
```

> Manual publish does not produce provenance attestation. Use it only as a last resort.

---

## Rollback / Deprecation

npm does not allow unpublishing versions older than 72 hours. To handle a bad release:

```bash
# Deprecate a specific version
npm deprecate raktajs@1.0.7 "Critical bug - use 1.0.7"
npm deprecate create-rakta-app@1.0.7 "Critical bug - use 1.0.7"
```

Then release a fixed version immediately.

---

## Troubleshooting

**`npm publish` fails with 401 Unauthorized**

OIDC Trusted Publisher is not configured on npmjs.com for this package, or the workflow filename / environment name does not match. See the manual setup section above.

**Workflow fails at version validation**

The git tag (e.g. `v1.0.7`) does not match the `"version"` field in one or both `package.json` files. Bump the version and re-tag.

**Workflow fails at version conflict check**

That version is already published on npm. You must increment the version.

**`bun install --frozen-lockfile` fails**

The `bun.lock` file is out of date. Run `bun install` locally, commit the updated lockfile.

---

## Security Notes

- No `NPM_TOKEN` is stored in GitHub Secrets or source code.
- `.npmrc` contains only registry configuration. No auth tokens.
- The publish workflow cannot be triggered by pull requests from forks. GitHub OIDC tokens issued to fork PRs do not have `id-token: write` permission and would not match the Trusted Publisher configuration.
- `npm install -g npm@latest` is **not** used in CI. The Node.js 22 LTS ships npm ≥10 which supports OIDC. Pinning the runtime version is safer than pulling an unpinned global install.
