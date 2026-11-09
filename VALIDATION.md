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

## Rodehihi addition

Full native checks, all 103 Bun tests (11,309 assertions), typecheck and production builds passed. The new track has 84 aligned words, 182 syllables and 256 notes across 192.681 seconds. Both MP3 channels decode fully and the mouth telemetry matches the audio clock. The decoded backing has 25.87 dB signal-to-error ratio against its prepared WAV. The instrumental intro and long ending match the gain-adjusted source before encoding within 1.2e-7. The mix peaks at 0.92. The full library asset check now loads all ten songs. Browser listening/layout verification remains unavailable.

## Rodehihi source pronunciation revision

The existing track now uses 400 estimated source phones over 15 phrases and 3,238 continuous pitch/emphasis points. Native tests and all 106 Bun tests (11,344 assertions) passed, along with typecheck, both build modes, and all ten prepared-song asset checks. All 15 sung phrases have signal; instrumental gaps are silent in the generated lead. The 3,854 mouth frames match the 192.681-second audio clock. The decoded full mix peaks at 0.883. Backing MP3 SHA-256 and backing level are identical to the previous release. Only the Rodehihi score, lead MP3, mouth telemetry and credits changed among the 186 public assets. The physical engine is unchanged. Source pronunciation was estimated automatically; no listening or browser verification was available.
