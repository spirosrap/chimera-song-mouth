# CHIMERA

A physical-modeling voice synthesizer: a Rust engine (wasm in an AudioWorklet, native for tests
and the CLI) under a React UI. See the README.

## Working here

- Do what was asked, the simplest way. Side work nobody asked for (experiments, tooling, paid
  runs) is a proposal with its cost. If the work grows well past the estimate, stop and say so.
- Weigh every engine or single-mouth-app feature against README → The original project’s vision &
  scope; anything outside it is a proposal with its cost, not work to do. Songs and scenes the owner
  asks for are this edition’s own scope.
- Before repeating or reversing earlier work, read its history (`git log -- <path>`, `git log -S`).
- Commit small. The subject names what changed and the trap, in searchable words; the body gives
  the why, what you ruled out, what you ran (with numbers) and what you didn't test.
- Keep each fixed bug's reproduction as a test.
- PRs follow `CONTRIBUTING.md`: the body is written top-down, with evidence, and ends with the
  model and harness that wrote it.
- Code outranks this file: fix the file when they disagree. When something breaks unnoticed, add
  a rule here, with a check.

## Map

- `crates/chimera/`: the engine (no I/O). `crates/chimera-wasm/`: the browser's C ABI.
  `crates/chimera-cli/`: `chimera render | compare csd | compare tsp | diagnose | calibrate`.
  `crates/chimera-plugin/`: CLAP, VST3 and AU (`docs/plugin.md`).
- `src/wasm/`: the UI's facade over the engine. `src/worklet/`: the AudioWorklet. `src/ui/`: React
  and the canvas renderers. `src/song/`: Sing's tunes, fitting words to them, clip recording.
- `src/rig/`: a body the 3D head can be worn on (`docs/rig.md`); `rig.html` is its dev page and
  `tools/rig/gen-body.ts` makes its mesh (`src/rig/body.rig.bin`: generated, never edited).
- `tests/`: bun tests on the wasm build. `tools/`: e2e, layout lint, spectrogram, speech judges
  (`asr/` Whisper, `tsp/` the real speakers' data).
- `docs/`: architecture, the engine contract (`rust-engine.md`), the UI look, the singer and
  speech judges, the hill-climb rules, and how a language plugs in (`language-front-ends.md`).

## Rules

- **The engine's contract** (`docs/rust-engine.md`): transcendental math only through
  `chimera::math`, no allocation while rendering, output independent of block size. `cargo test`
  enforces each.
- **The voice must hold at any device sample rate** (a Bluetooth headset runs the page at 16 kHz,
  and an airway simulated too slowly goes NaN: silence, no error). Check:
  `cargo test -p chimera --test engine the_voice_holds`.
- **Any change to the sound or the plans fails the golden tests, by design.** Re-bless with
  `CHIMERA_BLESS=1 cargo test --workspace --no-fail-fast`, run twice. Human-voice audio, plans
  (including the beat sounds' gestures and the beat player), the tract geometry and the human
  airway's transfer functions re-bless; see `crates/chimera/tests/golden/README.md` for the rest.
- **`*.generated.json` tables are regenerated (`chimera calibrate`, `tools/gen-*`), never edited.**
  Vowel calibration isn't bit-reproducible, so rerun it only when the formants should move.
- **This portable edition tracks `src/wasm/chimera.wasm` for Bun-only static hosting.** After a Rust
  change, rebuild and commit it with `bun run wasm`; `bun test tests` alone tests the old engine.
  Use `bun run test`. Do not share a cargo `target/` between checkouts.
- **Gesture records are defined twice**, in `crates/chimera-wasm/src/lib.rs` and
  `src/wasm/wire.ts`. Change both and bump `LAYOUT_VERSION`.
- **The wasm loads before the UI.** A module that calls the engine at import must not be reachable
  from `src/main.tsx`'s static imports. Check: `bun tools/e2e.ts` against `bun run preview`.
- **Recorded band heads own model leases for their mounted lifetime.** Do not hold an evictable live-preview model in a recorded feed; the original MEGALOVANIA used 13 body blends, beyond the eight-entry cache. Preserve that regression test even when an arrangement changes bodies. Check: `bun test tests/model-leases.test.ts`.
- **Camera cuts must keep the active singing head clear of background geometry.** Check all Abracadabra source cuts at phone and desktop widths with `bun test tests/abracadabra.test.ts tests/bad-guy.test.ts tests/montero.test.ts tests/taste.test.ts tests/skibidi.test.ts tests/manchild.test.ts tests/aperture.test.ts tests/denial-river.test.ts tests/storm.test.ts`. Its rear camera once sat behind the hall wall. Intentional rear/profile poses may face away; move an obstructed camera or set rather than forcing the head over foreground props. Preserve this regression check in later scenes.
- **Manual camera fallbacks use the loaded scene's catalog.** Unlisted recent videos previously showed courtroom cameras. Keep `sceneViewChoices` as the fallback in ScenePage; check `bun test tests/scene-view-choices.test.ts` before adding another performance.
- **DOM content flows in `.screen-body`, never absolutely positioned.** Check: `bun run lint:layout`.
- **The layout lint's encoder checks target `?solo=1`**; the bare URL intentionally opens the band. Check: `bun run lint:layout`.
- **This handoff explicitly includes the user-requested prepared music/movie assets.**
  Keep all twenty-two songs, all fifteen film and TV scenes, the speech scene, the two Apollo scenes and all eighty-six concert and music-video performances in `public/`; read `CONTENT.md` and `MEDIA-RIGHTS.md`.
  The upstream copyright exclusion does not apply to this explicitly requested export. CSD
  datasets, original input recordings and analysis caches are not included. Do not add them.
  After intentionally changing public assets, run `bun run content:manifest` and commit the
  manifest together with the assets. `bun run verify:content` must pass before a static build.
- **Voice tuning follows `docs/hill-climb/README.md`** and never edits its judges.
- **Finish saving an audio preview before sharing its path.** Confirm that the file exists, has the expected duration with `ffprobe`, and decodes with `ffmpeg -v error -i <file> -f null -`. A link shared before encoding completed failed to play; after such a failure, provide a validated MP3 under a fresh filename.
- **The planner speaks vowels at clear-speech length** (`durations.rs`, hill-climb experiment 21;
  `docs/speech-clarity.md`); shortening them again swallows the words around them. Spoken scene lines
  still go through `clearPhrases` (`src/scene/clarity.ts`) for the affricate floor, and a line timed
  to a source clip uses `CLEAR_SPEECH_TIGHT`. Check a finished scene with
  `~/.cache/chimera-asr/.venv/bin/python tools/scene-clarity.py <scene-id>` and listen to what it lists.
- **Prepared English vocals must load CMUdict (`tools/lib/english-phones.ts`), never bare `EnglishG2P`.**
  Calling `EnglishG2P` in Bun without loading `public/data/cmudict.txt.gz` silently falls back to
  letter-to-sound rules and mangles common English words. Always use `ensureEnglishDict` +
  `buildTimedPhones` (split diphthongs `aɪ/aʊ/eɪ/oʊ/ɔɪ`, crisp fixed consonants, stress-weighted
  vowels) and floor active-phrase `contour` `breath` at `>= 0.72` so initial/final consonants are
  never starved of airflow. Always match `part.melody.lyrics === part.performance.lyrics` (otherwise
  `planPart` ignores `part.performance`). Check: run `tools/scene-clarity.py <scene-id>` and verify
  sample phrases produce real CMUdict IPA.
- **Inspect the full 0-to-end vocal RMS timeline at a low threshold (`> 0.010`) before scoring.**
  Quiet/reverb-heavy opening vocals, whispers, or non-English chants (e.g. Enigma's `25.85–43.20s`
  opening chant at `0.029` RMS) are missed by high cutoffs (`> 0.035`) and by English-only Whisper.
  Always check a per-second RMS profile from `0s` to the end so the opening voice is never silent.
- **Verify `index.html` and ALL `dist/assets/*` chunk checksums after every live deploy, and never cut off `publish.sh`.**
  Wait strictly until `DEPLOY_EXIT=0` appears in the `macmini` launchd log before `bootout` (never
  use a fixed timeout loop that can kill `publish.sh` before `index.html` uploads). Always include
  every file in `dist/assets/*` in the `publish.sh` upload list (not only `index-*.js` and
  `ScenePage-*.js`, because Vite re-hashes sibling chunks like `mount-*.js` and `BandPage-*.js` when
  `MOVIE_SCENES` changes), and verify live HTTPS SHA-256 matches local `dist/` for `index.html`,
  every file in `dist/assets/*`, plus `scene.json`, `mix.mp3`, and `.tele.gz`. When re-rendering an
  existing scene, always bump `assetVersion` in `src/scene/library.ts`, `performance.json`, and tests.

## Checks

| When you touch | Run |
|---|---|
| anything | `bun run test` and `bun run typecheck` |
| `crates/chimera/` sound | re-bless goldens (above); `cargo run --release -q -p chimera --example bench` against the previous commit |
| `crates/chimera-wasm/`, `src/wasm/`, `src/worklet/`, `src/main.tsx` | `bun run build && bun run preview`, then `bun tools/e2e.ts` |
| `src/ui/`, `src/show/`, CSS | `bun run lint:layout` |
| `src/rig/`, `src/ui/render/anatomy3d.ts`, `beams3d.ts` | `bun test tests/rig.test.ts`; look at `/rig.html` in `bun run dev` |
| `crates/chimera-plugin/`, `src/audio/`, `src/ui/store.ts`, `src/ui/singing.ts`, `src/ui/speech.ts`, `src/ui/pluginState.ts` | `bun run build`, `cargo build -p chimera-plugin --release --example ui_harness`, then `bun tools/plugin-e2e.ts` |
| the plugin's page or CSS | the harness (above), then `bun tools/layout-lint.ts --plugin --url http://127.0.0.1:8549/` |
| the plugin, on a branch that builds on CI | read the REAPER group in the run's log, screenshots included (`docs/plugin.md`, "Testing in a host") |

## Portable hosting handoff

Read `HANDOFF.md` first. This is an independent repository; the previous ChatGPT Site identity
and credentials were deliberately omitted. Do not reattach or change the old Site.
Use `bun run build:static` to deploy unchanged engine code without Rust. A full Rust rebuild
uses `bun run build`. Deploy all of `dist/` at its configured HTTPS base path, including `.tele.gz`; see `DEPLOYMENT.md` for the current agenticspiros.com subfolder.
The inherited `EDITION-NOTES.md` describes prior development; its historical references to
ignored media do not describe this portable repository.
