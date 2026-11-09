# Export validation — 2026-11-09

- Clean portable copy installed successfully with `bun install --frozen-lockfile` using Bun 1.4.4.
- `bun run build:static` passed using only Bun and the bundled WASM engine; it produced the complete static website.
- `bun run typecheck` passed.
- `bun run test` passed: 112 native Rust tests across 29 result groups, plus 101 Bun tests with 11,300 assertions and zero failures.
- All 181 public assets are byte-for-byte identical to the current app’s source assets and pass their SHA-256 manifest checks.
- Every prepared arrangement’s audio and telemetry references resolve, including all 24 MEGALOVANIA parts. Both scenes’ audio and all seven character telemetry files resolve. All gzipped telemetry decompresses successfully.
- The included WASM is valid and its checksum remained identical after a full Rust rebuild.
- A credential-pattern scan found no embedded private keys or service tokens. Previous Site configuration and local caches are excluded.
- The prebuilt website ZIP passed its archive integrity check; every extracted file hash matches its production build counterpart.

Only portability documents, Git tracking rules, build scripts and independent hosting configuration differ from the source app. Playback, visuals and the sound engine were not changed.

Browser playback, visual layout, live recording and upload to X were not exercised during the export. Browser access had been declined in the source session. The receiving agent should test those interactions after deploying to the new host.
