## Summary

<!-- What does this PR change, and why? One or two sentences. -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactor (no behavior change)
- [ ] Chore / tooling

## Related issue

<!-- Closes #... or "No related issue" -->

## What was tested

<!-- Describe how you verified this change. -->

## Validation checklist

- [ ] `bun install`
- [ ] `bun run typecheck`
- [ ] `bun run build`
- [ ] `bun test`
- [ ] `bun run lint`
- [ ] `bun run check:workspace`

## Generator safety (only if you touched `packages/create-rakta/src/generator.ts`)

- [ ] I ran `wc -l packages/create-rakta/src/generator.ts` before and after, and the line count did not drop unexpectedly.
- [ ] `getRootFiles`, `getFrontendOnlyFiles`, `getFullstackFrontendFiles`, `getBackendFiles`, `getDatabaseDependencies`, `generateProjectReadme`, and `generateProjectFiles` are all still present.

## Notes for reviewers

<!-- Anything else reviewers should know. -->