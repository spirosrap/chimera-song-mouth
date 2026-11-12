# CHIMERA · Vocal Band & Movie Scenes

Complete portable edition of the CHIMERA mouth app: **twenty-one songs, fifteen film and TV scenes, one speech, two Apollo missions, seven concert and music-video performances, the single-mouth player, and all prepared media used by the website**.

Based on [Jameson Hodge’s CHIMERA](https://github.com/jamesondh/chimera-vocal-synth). The Rust/WebAssembly physical voice engine, React interface, mouth animation and generated scene environments are included. This independent repository has no dependency on the previous ChatGPT Site or its account. The voice model’s sources are listed in [docs/architecture.md](docs/architecture.md#references-and-credits).

## Start here

- **Another agent taking over:** read [HANDOFF.md](HANDOFF.md).
- **Move to a new host:** read [DEPLOYMENT.md](DEPLOYMENT.md).
- **Update from the original CHIMERA:** read [UPSTREAM.md](UPSTREAM.md).
- **Included songs, scenes and media:** see [CONTENT.md](CONTENT.md).
- **Earlier implementation notes:** see [EDITION-NOTES.md](EDITION-NOTES.md). References there to media being ignored describe the earlier workspace; this repository tracks the complete prepared media.

## The original project’s vision & scope

From upstream’s README. It governs the engine and the single-mouth app. This edition deliberately goes beyond points 6 and 7: it tracks the prepared song and scene media the owner asked for (see [MEDIA-RIGHTS.md](MEDIA-RIGHTS.md)) and stages multi-voice scenes.

1. **One instrument**: a physically modeled voice (lungs, vocal folds, throat, mouth). No
   samples, no neural audio.
2. **The web app is the primary surface**: anyone should be able to make songs in it without
   an LLM's help. Mobile is the likely next surface. The plugin (CLAP/VST3/AU) still ships, but
   it's secondary.
3. **More realistic without losing what it is**: the robotic, primitive sound people like today
   stays available, and every realism change is checked by ear against it.
4. **Languages enter through one shared front-end design**, not one-off hacks. Each needs a
   native speaker's check and must leave English unchanged.
5. **The design language (the vector display) is settled**; the look within it can still evolve.
6. **Nothing copyrighted in git**; MIT; a deterministic, real-time-safe engine.
7. **Not now**: a DAW or sequencer, a light theme, MPE, multi-voice dialogue.

## Run locally — Bun only

Install [Bun](https://bun.sh/), then:

```sh
gh repo clone spirosrap/chimera-song-mouth
cd chimera-song-mouth
bun install --frozen-lockfile
bun run verify:content
bun run dev:static
```

Open the address printed by Vite (normally `http://127.0.0.1:5317`). The precompiled voice engine is included, so Rust is unnecessary when running or deploying the current edition.

## Build for any static host

```sh
bun install --frozen-lockfile
bun run build:static
```

Publish **all of `dist/`** at the root of an HTTPS website. No backend, API key, database, paid voice service, or separate media bucket is required. Media comes from this repository, not GitHub raw-file URLs. Importing a song in the single-mouth player stays in the visitor’s browser.

A ready-built `chimera-website.zip` is also attached to the latest GitHub release. Unzip it and deploy its contents directly if the hosting service accepts prebuilt websites.

## Change the engine or run the full tests

Install Rust/Rustup as well as Bun, then:

```sh
rustup target add wasm32-unknown-unknown
bun install --frozen-lockfile
bun run test
bun run typecheck
bun run build
```

`build` rebuilds the Rust engine; `build:static` uses the tracked WebAssembly binary. After changing Rust, commit the rebuilt `src/wasm/chimera.wasm` alongside its source. Do not reuse a `target/` directory from another checkout. See [AGENTS.md](AGENTS.md) for engine and animation contracts.

## Prepare a MusicXML arrangement

The upstream score converter reads `.mxl` or `.musicxml` files and prepares a part for `chimera render notes`:

```sh
bun tools/musicxml-to-notes.ts score.mxl                  # list the score's parts
bun tools/musicxml-to-notes.ts score.mxl P1 --out p1.json  # convert one part
```

It uses the included WebAssembly engine and pronunciation dictionary. Repeats, alternate endings and tied notes are handled; `--spell word=respelling` resolves lyrics that do not fit the notes. This is an arrangement-preparation tool, separate from the website's MIDI importer. See the tool's introductory comments for its supported score features.

## Media storage

All 448 public files are tracked in ordinary Git, including MP3 stems, compressed mouth telemetry, prepared scores, captions, credits, fonts, the dictionary and the existing subtitled MP4. `MEDIA-MANIFEST.json` records their sizes and SHA-256 hashes; a static build verifies it first. No Git LFS setup or secondary download is needed.

After intentionally adding or replacing public assets, run `bun run content:manifest`, inspect the changes, and commit the new manifest with the files. Do not regenerate the manifest to conceal missing assets.

Original source recordings from the Music/Videos folders, temporary processing files, model downloads and caches are not required to run the site and are not included. All content currently available through the app is included.

## License and credits

The software retains the upstream [MIT license](LICENSE) and Jameson Hodge’s copyright notice. Included third-party fonts and dictionary retain their own license files. Song and movie material is separately credited and is not relicensed as MIT; see [MEDIA-RIGHTS.md](MEDIA-RIGHTS.md).

## Rodehihi — Δεν ξανακάνω φυλακή

The tenth selection, `?song=rodehihi-den-xanakano-fylaki`, adds the complete 3:12 supplied Rodehihi performance. The original stereo instrumental backing, breaks and long ending remain at their original speed. Vocal separation is used only around the sung phrases; the instrumental intro and ending use the source mix directly, with a common gain for headroom. No original lead vocal is intentionally mixed in; faint separation remnants may remain.

A CHIMERA mouth sings the three verses and repeated refrains. The updated performance uses sound-by-sound estimates from the supplied vocal instead of converting the lyrics into standard Greek pronunciation. Explicit consonant/vowel durations and a continuous source pitch and emphasis contour preserve more of this singer’s accented delivery, slides and held vowels. Phonetic recognition is approximate; this is physical robotic singing, not a copy of the singer’s voice. Greek captions remain correctly spelled. Editing the lyrics returns to ordinary text-based planning; changing the body keeps the source performance. Singer and backing have independent mute/solo and level controls, and the full mix can be downloaded as WAV.

The prepared score, two MP3 channels, compressed mouth telemetry and credits are in `public/band/rodehihi-den-xanakano-fylaki/`. All nine earlier songs, the default selection and both movie scenes remain.

For the existing Sites host’s archive limit, builds can set `CHIMERA_EXTERNAL_MOVIE_DOWNLOAD=https://github.com/spirosrap/chimera-song-mouth/releases/download/v1.0.0/for-x.mp4`. This makes the existing courtroom video download use the identical, checksum-verified release attachment and omits that duplicate MP4 from the hosted archive. Ordinary builds retain the local MP4 and are self-contained. Song playback always uses the local prepared assets.

## Country Roads

`?song=country-roads` adds the complete supplied 3:15 John Denver recording as one generated singer over separated original instrumental music. It uses the CMUdict pronunciation, timed syllable and held-vowel approach described in the quoted demo, with source-aligned words and melody. The large head and scrolling green notes/yellow rendered-pitch trace share the actual audio clock, including pause and seek. All eleven earlier songs and three scenes remain.

This edition also includes the full supplied Dimash SOS concert, with an approved French physical singer, original music and a populated stage with synchronized microphone gestures, lights and camera cuts. Open `?scene=dimash-sos`; see [the concert notes](docs/dimash-sos.md).

Реченька adds the full supplied live performance as a scene with Russian physical singing, original accompaniment, river scenery, a dock and boat, shadow dancers and reaction cameras. Open `?scene=rechenka`; see [the scene notes](docs/rechenka.md).

The complete supplied **Big Lebowski** bowling sequence is available at `?scene=big-lebowski`, with four physical voices, five characters, rolling ball and pins, a doorstep flashback, the original opening song and background sound. See [the scene notes](docs/big-lebowski.md).

The complete supplied **Blade Runner · Tears in Rain** rooftop sequence is available at `?scene=tears-in-rain`, with physical dialogue, the original background soundtrack, a rainy rooftop rescue and the dove’s flight. See [the scene notes](docs/tears-in-rain.md).

The complete supplied **Interstellar — TARS humor setting** scene is available at `?scene=tars`, with three physical voices, four helmeted crew in the Ranger cabin, TARS’s working airway display, joke light, changing humor setting and rocket separation. See [the scene notes](docs/tars.md).

The complete supplied **Good Will Hunting — the park bench** conversation is available at `?scene=good-will-hunting`, with two physical voices, original background music and ambience, the pond and swans, Sean’s cap and beard, Will’s reactions and the quiet walk-away ending. See [the scene notes](docs/good-will-hunting.md).

The complete supplied **The Truman Show — the exit** ending is available at `?scene=truman-show`: seven physical dialogue voices, original music and effects, the painted sky, sailboat, staircase, exit door, broadcast control room and viewers. The farewell bow, exit and closing guard exchange remain. See [the scene notes](docs/truman-show.md).

The complete supplied **Celentano — Prisencolinensinainciusol** classroom performance is available at `?scene=celentano`: physical nonsense singing, original music and harmonica, the teacher with glasses and a blue tie, answering students, desks, globe, clapping and dancing. See [the scene notes](docs/celentano.md).

The complete supplied **The Avalanches — Frontier Psychiatrist** music video is available at `?scene=frontier-psychiatrist`: six physical voices, original music, gold curtains, orchestra, cowboys, ghosts, turtle, parrot and scratched-record finale. See [the scene notes](docs/frontier-psychiatrist.md).

The complete supplied **The Muppet Show — Mahna Mahna** sketch is available at `?scene=mahna-mahna`: a physical singing trio, original accompaniment, orange hair and glasses, two pink Snowths, scat walk-offs, telephone and balcony ending. See [the scene notes](docs/mahna-mahna.md).

The complete supplied **Laurie Anderson — O Superman** music video is available at `?scene=o-superman`: physical words and ha pulse, original instrumental bed, circular light, hand shadows, red silhouette, keyboard and abstract ending. See [the scene notes](docs/o-superman.md).
