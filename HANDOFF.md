# Handoff to another agent

## Goal

Host this complete CHIMERA edition on a new independent hosting account, preserving every existing song, movie scene, mouth animation and download. Work from this repository, not the original upstream repository, which does not contain this edition’s media.

## Access

This repository is public. Anyone can view, clone or download it without signing in. Another agent only needs the repository URL to read the code and media. Pushing changes still requires the owner’s GitHub connection or a collaborator invitation under Settings → Collaborators. No credentials are stored in the project.

## First commands

```sh
bun install --frozen-lockfile
bun run verify:content
bun run build:static
```

This uses the included precompiled WASM engine. Publish the entire generated `dist/` folder; see [DEPLOYMENT.md](DEPLOYMENT.md). The latest release also has a prebuilt website ZIP. A hosting account connection is a separate step from repository access.

## Preserve

- Eighteen songs in `src/band/library.ts`, including all prepared files in `public/band/`.
- All five movies and the Fool me once speech in `src/scene/library.ts` and `public/scenes/`, including the existing A Few Good Men MP4 download.
- The `?solo=1` player, Greek pronunciation/whistling and the robotic finger-click hand.
- MEGALOVANIA’s retained model leases and shared WebGL renderer; do not revert these, or some of the 24 heads disappear.
- Solo playback’s prepared audio buffer; routing it back through the overloaded live solver previously produced silent playback.
- Gzipped `.tele.gz` assets, stereo instrumental backing and independent mixer controls.
- Existing song IDs, scene IDs and default selection. Complete links are in `CONTENT.md`.
- The speech's single-speaker `press` setting, synchronized gestures and original excerpt pauses; see `docs/fool-me-once.md`.
- The Contact beach, two physical speakers, original background, captions and absolute-time gestures; see `docs/contact.md`.
- The Project Hail Mary karaoke setting, prepared singing, original accompaniment and silent listener; see `docs/project-hail-mary.md`.

## Platform independence

This is a static React/Vite site with a Rust engine already compiled to WebAssembly. There is no server component and no service credential requirement for playback. The previous `.openai/hosting.json` was omitted intentionally: do not reattach this copy to the old Site. Deployment to a new host should create a separate website.

Prepared media and dictionary URLs resolve from the Vite base path. The existing agenticspiros.com installation uses `/chimera-song-mouth/`; build it with `bun run build:static --base=/chimera-song-mouth/`. HTTPS or localhost is required for browser media/worker features. Preserve MIME types and ordinary binary delivery of `.wasm` and `.tele.gz` files.

## Verification and limits

`MEDIA-MANIFEST.json` covers every public asset. `bun run verify:content` checks its hashes and validates the compiled WASM binary. `bun run test` needs Rust and runs the full upstream/native and Bun checks; `bun run typecheck` checks the TypeScript.

The exported code and assets were checked with unit/native tests, a static production build, full asset checksums and source/export byte comparisons. Browser interaction, visual layout and recording QA were unavailable in the source session because browser access was declined. Do not describe those as verified; inspect playback and downloads after the new deployment.

Read `AGENTS.md` before changing the engine. `EDITION-NOTES.md` retains detailed implementation history and prior validation limitations.

Read `UPSTREAM.md` when importing changes from the original CHIMERA repository.
The last imported upstream revision is recorded in `PROVENANCE.json`; this
independent export uses reviewed cherry-picks rather than an unrelated-history merge.

The six other lyric songs now use prepared phoneme timing like Country Roads.
Read `docs/lyric-song-phrasing.md` before regenerating them: retain the prepared
JSON, Rodehihi's accent phones, Συννεφούλα's whistle gestures and the unchanged
instrumental/finger-click channels.

Συννεφούλα now has a wireframe singer with a hat, guitar, moving hands and a
microphone. Read `docs/synnefoula-singer.md` before changing its presentation;
it reuses the existing vocal/whistle telemetry and preserves every audio asset.
