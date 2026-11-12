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

- Twenty-one songs in `src/band/library.ts`, including all prepared files in `public/band/`.
- All fifteen film and TV scenes, the Fool me once speech, the two Apollo scenes and all six concert and music-video performances in `src/scene/library.ts` and `public/scenes/`, including the existing A Few Good Men MP4 download.
- The `?solo=1` player, Greek pronunciation/whistling and the robotic finger-click hand.
- MEGALOVANIA’s retained model leases and shared WebGL renderer; do not revert these, or some of the 24 heads disappear.
- Solo playback’s prepared audio buffer; routing it back through the overloaded live solver previously produced silent playback.
- Gzipped `.tele.gz` assets, stereo instrumental backing and independent mixer controls.
- Existing song IDs, scene IDs and default selection. Complete links are in `CONTENT.md`.
- The speech's single-speaker `press` setting, synchronized gestures and original excerpt pauses; see `docs/fool-me-once.md`.
- Lose Yourself’s original music, approved clear rap voice, source-timed lyric highlighting and rainy city presentation; see `docs/lose-yourself.md`.
- Mahna Mahna’s complete trio sketch, three independent physical singers, original music, nonsense calls, all answering syllables, walk-offs, Kermit’s telephone and the balcony ending. Keep its six leased models and explicit source timing; see `docs/mahna-mahna.md`.
- Frontier Psychiatrist’s complete surreal theatre video, six physical sample voices, original music and nonverbal effects, measured beats, source-aligned chopped samples, approved pronunciation and seven foreground heads. Keep the turtle’s borrowed model ownership; see `docs/frontier-psychiatrist.md`.
- Celentano’s complete classroom performance, physical lead and answering voices, original music and harmonica, teacher, students, desks, globe, measured beat, harmonica player and standing finale; see `docs/celentano.md`.
- The Truman Show’s complete supplied ending, seven physical dialogue voices, shared timing map, painted sky, boat, stairs and door, control room and monitors, viewers, farewell bow, exit and closing guard exchange; see `docs/truman-show.md`.
- Good Will Hunting’s complete park conversation, approved physical Sean voice, distinct Will voice, shared timing map, original background, cap and beard, bench, pond, swans and walk-away ending; see `docs/good-will-hunting.md`.
- Interstellar’s TARS humor-setting scene, three physical voices, four helmeted crew, actual robot airway display, joke indicator, 100% → 75% readout and stage separation. Keep its shared source/performance timing map; see `docs/tars.md`.
- The Big Lebowski’s four distinct physical voices, separated dialogue turns, original opening song/background, bowling action, five characters and doorstep flashback; keep the shared source/performance timing map. See `docs/big-lebowski.md`.
- Blade Runner’s full rainy rooftop rescue and monologue, approved physical Roy voice, silent Deckard, dove flight and quiet ending; see `docs/tears-in-rain.md`.
- Реченька’s complete Russian physical performance, original music, dock and boat, river/forest scenery, dancers and kneeling ending; see `docs/rechenka.md`.
- SOS’s full Dimash concert clip, approved French physical voice, original music, populated TV stage, gestures and camera cuts; see `docs/dimash-sos.md`.
- Nessun Dorma’s complete concert performance and extended finale, with Italian physical tenor/choir, original orchestra and a populated opera stage; see `docs/nessun-dorma.md`.
- Apollo 13’s oxygen tank failure, five radio voices from NASA’s transcripts and the flight director’s loop, with the pauses shortened; see `docs/apollo-13.md`.
- The Apollo 11 landing on the mission clock, three radio voices from NASA’s transcripts, the lander driven by the called heights and speeds; see `docs/apollo-11.md`.
- The Wizard of Oz throne room, five mouths, staged from the public-domain book; the great Voice is the little man’s airway enlarged; see `docs/wizard-of-oz.md`.
- The complete Sagan explanation, Flatland figures and dimensional models; see `docs/sagan-dimensions.md`.
- The Cuckoo’s Nest ward, four speaking mouths, seated group and nurses’ closing reaction; see `docs/cuckoos-nest.md`.
- The Matrix waiting room, three physical voices, bending spoon and handoff; see `docs/matrix-spoon.md`.
- The Arrival dusk field, Ian’s physical dialogue and Louise’s silent reaction; see `docs/arrival.md`.
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
