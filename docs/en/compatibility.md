# Compatibility Policy

Rakta.js keeps public APIs backward compatible within the same major release.

- New framework capabilities are added through typed subpaths.
- Existing public exports are not removed without a migration path.
- Templates may gain files, but generated app conventions stay compatible.
- Edge-compatible helpers avoid Node-only APIs unless a Node adapter requires
  them.
- Breaking changes are reserved for major versions and must include migration
  documentation.
