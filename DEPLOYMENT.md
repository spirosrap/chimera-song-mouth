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

Open the root page and every link in `CONTENT.md`. Start playback with a user click. Check the solo voice, all 24 MEGALOVANIA heads, both Greek backings, the whistle and snapping hand, both movie scenes and their captions, WAV downloads and the ready MP4. Record a short scene test in the target browser; real-time recording support depends on the browser’s encoders. The Princess Bride has live recording, not a pre-encoded MP4.

The Rodehihi addition brings the library to ten songs. Standard builds still include every media file locally. The older Sites deployment uses the optional `CHIMERA_EXTERNAL_MOVIE_DOWNLOAD` build setting described in the README to keep its archive under 256 MiB; the courtroom MP4 remains in this repository and its original release attachment.

## Existing agenticspiros.com installation

The current independent installation is at `https://agenticspiros.com/chimera-song-mouth/`. Build with `bun run build:static --base=/chimera-song-mouth/`; `BASE_PATH` resolves prepared song/scene and dictionary URLs under that prefix. Upload new media and hashed bundles before `index.html`, preserving unrelated files and prior assets. The established upload helper is on the owner's Mac mini at `/Users/spiros/Projects/chimera-song-mouth-deploy/publish.sh`, with its connection secret kept in Keychain. Its source directory is `/Users/spiros/Projects/chimera-song-mouth-dist`; an optional path-list argument limits uploads. No hosting secrets are in this repository.
