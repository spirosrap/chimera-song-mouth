# Independent hosting

## Recommended setup

Keep source and the current prepared media together in this public GitHub repository. Connect the new host to it and publish the static output. At the initial export, public assets total **263,166,339 bytes (250.97 MiB)**; the largest file is the 23,264,211-byte subtitled MP4. All files fit regular GitHub storage, so Git LFS and an external storage account are unnecessary.

GitHub [blocks individual Git files above 100 MiB and recommends repositories under 1 GB](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github). Repeatedly replacing large media will grow Git history; use an external media store if that becomes significant.

## Build from the repository

| Setting | Value |
| --- | --- |
| Project/root directory | Repository root |
| Install | `bun install --frozen-lockfile` |
| Build | `bun run build:static` |
| Publish/output directory | `dist` |
| Bun version used in the export | `1.4.4` |
| Secrets/environment variables | None for playback or build |
| Deployment path | Root of an HTTPS origin |

If the host only has one build-command box, use `bun install --frozen-lockfile && bun run build:static`. Select/install Bun in its build environment. The `vercel.json` includes these commands; other hosts can use the same settings. Rust is only needed when rebuilding the engine from source.

Cloudflare Pages is one suitable option for the current assets: its documented [25 MiB per-file limit](https://developers.cloudflare.com/pages/platform/limits/) is above the largest current file, and this site is far below its file-count limit. Connect the host’s GitHub integration to this repository for automatic builds. Account setup and deployment remain for the next agent; this handoff does not change the existing live website.

## Deploy without a build environment

Download `chimera-website.zip` from this repository’s latest release, verify its checksum against `SHA256SUMS.txt`, and extract it. Upload the **contents**, with `index.html` at the web root. It already contains all compiled JavaScript/WASM, nine songs and both scenes. Do not upload the ZIP itself as the website or omit its `band/`, `scenes/`, `fonts/`, `data/` and `assets/` directories.

Keep the website and media on the same origin. Correct MIME types include `text/javascript` for JS and `application/wasm` for WASM. Serve `.tele.gz` as binary; if a host transparently decompresses it, the loader can detect the already-decompressed data. Avoid rewriting missing media to `index.html`; missing media should return 404. Query-string routes such as `?song=megalovania` need no special rewrite.

## If the collection grows

The next practical split is **GitHub for code + Cloudflare R2 for prepared media**. R2’s [public bucket/custom-domain documentation](https://developers.cloudflare.com/r2/buckets/public-buckets/) describes serving large files. Another agent would then add a configurable media base URL for song/scene fetches and downloads, set CORS for the app origin, copy assets with the manifest checksums, and keep rollback copies. That migration is not required or configured now; simply uploading assets to a bucket would not update the app’s current same-origin URLs.

## Check after deployment

Open the root page and every link in `CONTENT.md`. Start playback with a user click. Check the solo voice, all 24 MEGALOVANIA heads, both Greek backings, the whistle and snapping hand, all movie scenes and the speech with their captions, WAV downloads and the ready MP4. Record a short scene test in the target browser; real-time recording support depends on the browser’s encoders. Only A Few Good Men currently has a pre-encoded MP4; the other scenes use live recording.

The Rodehihi addition brings the library to ten songs. Standard builds still include every media file locally. The older Sites deployment uses the optional `CHIMERA_EXTERNAL_MOVIE_DOWNLOAD` build setting described in the README to keep its archive under 256 MiB; the courtroom MP4 remains in this repository and its original release attachment.

## Existing agenticspiros.com installation

The current independent installation is at `https://agenticspiros.com/chimera-song-mouth/`. Build with `bun run build:static --base=/chimera-song-mouth/`; `BASE_PATH` resolves prepared song/scene and dictionary URLs under that prefix. Upload new media and hashed bundles before `index.html`, preserving unrelated files and prior assets. The established upload helper is on the owner's Mac mini at `/Users/spiros/Projects/chimera-song-mouth-deploy/publish.sh`, with its connection secret kept in Keychain. Its source directory is `/Users/spiros/Projects/chimera-song-mouth-dist`; an optional path-list argument limits uploads. No hosting secrets are in this repository.

The 13 November 2026 prepared-performance release uses application commit `e79d3d7`: Fade Into You, Je t’aime and I Will Always Love You are all live, with 534 prepared public files preserved. Its final live check verified 240 files and the direct route. A concurrent upstream engine import (`14e541d`) was preserved in the repository when the completion notes were rebased; it was not part of this performance deployment. Fourteen focused scene/model-lease checks, TypeScript and the 534-file media/WASM verification passed on the combined repository afterward. Rebuild from the current source before deploying later engine changes; preserve the three owner-approved prepared voices and their telemetry.

The subsequent Hello release on 13 November 2026 uses application commit `29477b8`. It adds the complete supplied 5:26 school video, four physical voices, original accompaniment and the clay-portrait ending. The upload helper completed all 27 changed files successfully, with `index.html` last. All 534 earlier prepared public files are unchanged; the manifest now contains 543. This production build also includes the previously integrated upstream source from `14e541d` (engine revision `153c971`), which was absent from the earlier Whitney deployment. The full combined checks passed: 187 native tests with two existing ignored, 377 Bun tests across 94 files, TypeScript, content verification and the production build. The tracked WASM matches `PROVENANCE.json`.

Hello’s final live check verified 257 files byte-for-byte, including all 27 uploaded files, preserved songs/scenes, and the direct `?scene=hello` route. Upload and live verification both exited successfully. Browser/GPU playback and recording remain unverified because browser access is declined.

The Bon Jovi — Always release on 13 November 2026 uses application commit `641ef44`. It adds the complete supplied 6:06 video as a procedural scene with one approved physical English lead, original accompaniment, captions and six prepared assets. The change was rebased onto the Hello release without replacing its media; the manifest now contains 549 public files. The combined checks passed 381 Bun tests across 95 files, TypeScript, content verification, production build and local HTTP. The upload helper accepted all 26 changed files, with `index.html` last. Live verification matched 32 files byte-for-byte, including Bon Jovi, Hello, application bundles and preserved Whitney media, and the direct `?scene=bon-jovi-always` route. Local Chromium playback, seeking and recorder availability passed without console errors. The deployed browser connection was refused in this environment, so live browser playback and real-time recording are not claimed as verified.

The Bon Jovi visual revision (`d66ce2d`, 13 November 2026) is live at the existing `?scene=bon-jovi-always` route. It changes character rendering, acting, lighting and camera edits while preserving the approved mix, backing, vocal score, lyrics/captions and mouth telemetry byte-for-byte. Only `scenes/bon-jovi-always/scene.json` changes among the 549 prepared public files, and only its camera shots change. All twelve uploads and 32 live file checks succeeded, including preserved Bon Jovi, Hello and Whitney media and the direct route. Combined validation passed 187 native tests (two existing ignored), 382 Bun tests across 95 files, TypeScript, content verification, production build and local HTTP checks. Browser/GPU playback and layout lint were not rerun because browser access remains declined in this chat.

The Un-Break My Heart addition (`fd93646`, 13 November 2026) is live at `?scene=unbreak-my-heart`. It includes the complete supplied 4:33 video, original accompaniment and the owner-approved physical lead, with the motorcycle opening, home memories, pool, mirror, bedroom, seated staircase grief and white-gown orchestra finale. All seventeen uploads and 38 live checksum checks succeeded, including the direct route, six new files, app bundles and preserved Bon Jovi, Hello and Whitney media. All 549 earlier public assets remain byte-identical; the manifest contains 555 files. Required validation passed 187 native tests (two existing ignored), 387 Bun tests across 96 files, TypeScript, content verification, production build and local HTTP checks. The tracked WASM matches its unchanged provenance. Native composition checks do not verify browser/GPU playback or real-time recording; those were not retested because browser access remains declined in this chat.

The November Rain addition (`b189ada`, 14 November 2026) is live at `?scene=november-rain`. It reconstructs the complete supplied 9:17 film with an approved physical lead and answering outro voice, original instrumental music and guitar solos, wedding, desert church, reception storm, funeral, cemetery and grave roses. Its seven new assets include two physical telemetry tracks. The manifest contains 562 public files. Combined validation passed 391 Bun tests across 97 files, TypeScript, content verification, production build and local HTTP. All 25 changed files uploaded with `index.html` last; live verification matched 31 files, including November Rain, Un-Break My Heart, application bundles and preserved Whitney media, plus the direct scene route. Local Chromium playback, seeking and recorder availability passed without console errors. Live browser playback and real-time recording were not retested.

The Hero addition (`d596a24`, 14 November 2026) is live at `?scene=hero`. It reconstructs the complete supplied 4:23 video with the approved physical lead and original accompaniment, station, convertible, desert, chapel, lovers, confrontation and rain-soaked cradling ending. All seventeen changed files uploaded with `index.html` last; live verification matched 51 files, including Hero, app bundles and five preserved performances, plus the direct route. All 562 earlier public assets remain byte-identical; the manifest contains 568 files. Validation passed 187 native tests (two existing ignored), 396 Bun tests across 98 files, TypeScript, content verification, production build and local HTTP. The tracked WASM matches its unchanged provenance. Native compositions cover the seven sets, portrait and cinema framing, seeking and borrowed-model ownership. Browser/GPU playback, layout lint and real-time recording were not retested because browser access remains declined in this chat. The temporary publish job was removed.
