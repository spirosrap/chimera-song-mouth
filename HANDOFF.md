# Handoff to another agent

## Goal

Host this complete CHIMERA edition on a new independent hosting account, preserving every existing song, movie scene, mouth animation and download. Work from this repository, not the original upstream repository, which does not contain this edition’s media.

## Access

This repository is private. On the owner’s computer, the existing GitHub login can clone it. For an agent running elsewhere, connect the owner’s GitHub account and grant access to this repository, or invite that agent’s human collaborator under GitHub Settings → Collaborators. A private repository URL alone does not grant access. No credentials are stored in the project.

## First commands

```sh
bun install --frozen-lockfile
bun run verify:content
bun run build:static
```

This uses the included precompiled WASM engine. Publish the entire generated `dist/` folder; see [DEPLOYMENT.md](DEPLOYMENT.md). The initial release also has a prebuilt website ZIP. A hosting account connection is a separate step from repository access.

## Preserve

- Nine songs in `src/band/library.ts`, including all prepared files in `public/band/`.
- Both movies in `src/scene/library.ts` and `public/scenes/`, including the existing A Few Good Men MP4 download.
- The `?solo=1` player, Greek pronunciation/whistling and the robotic finger-click hand.
- MEGALOVANIA’s retained model leases and shared WebGL renderer; do not revert these, or some of the 24 heads disappear.
- Solo playback’s prepared audio buffer; routing it back through the overloaded live solver previously produced silent playback.
- Gzipped `.tele.gz` assets, stereo instrumental backing and independent mixer controls.
- Existing song IDs, scene IDs and default selection. Complete links are in `CONTENT.md`.

## Platform independence

This is a static React/Vite site with a Rust engine already compiled to WebAssembly. There is no server component and no service credential requirement for playback. The previous `.openai/hosting.json` was omitted intentionally: do not reattach this copy to the old Site. Deployment to a new host should create a separate website.

Absolute asset URLs assume hosting at the root of an origin. Do not deploy under `/chimera-song-mouth/` without adapting every asset URL. HTTPS or localhost is required for browser media/worker features. Preserve MIME types and ordinary binary delivery of `.wasm` and `.tele.gz` files.

## Verification and limits

`MEDIA-MANIFEST.json` covers every public asset. `bun run verify:content` checks its hashes and validates the compiled WASM binary. `bun run test` needs Rust and runs the full upstream/native and Bun checks; `bun run typecheck` checks the TypeScript.

The exported code and assets were checked with unit/native tests, a static production build, full asset checksums and source/export byte comparisons. Browser interaction, visual layout and recording QA were unavailable in the source session because browser access was declined. Do not describe those as verified; inspect playback and downloads after the new deployment.

Read `AGENTS.md` before changing the engine. `EDITION-NOTES.md` retains detailed implementation history and prior validation limitations.
