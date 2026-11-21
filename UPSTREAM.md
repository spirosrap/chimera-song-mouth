# Keeping this edition current

Original repository: https://github.com/jamesondh/chimera-vocal-synth, branch `main`.
`PROVENANCE.json` records the last imported upstream revision and check date.
This edition began as an independent export, so its Git history has no common
ancestor with upstream. Import reviewed changes with `git cherry-pick -x`; do
not merge unrelated histories or replace this tree with an upstream checkout.

## Latest synchronization

Checked on 2026-11-21, through `caf270abf893bdc63f6342059d4468f754edf5c6`
(six first-parent commits after `0dc13f8`: four merges imported with `git cherry-pick -x -m 1`
and two single commits; one file left out, see "Left out").

What came in:

- **CHIMERA as a plugin for music programs** (upstream #62, #136, #137): a new crate,
  `crates/chimera-plugin`, builds the voice as a CLAP, VST3 and AU instrument for macOS and as
  CLAP and VST3 for Linux (Windows build scripts are there, not released). Its window is this
  same web page inside the host, or in the web browser on Linux. `docs/plugin.md` describes it.
  Upstream releases the builds on its own GitHub page; nothing here builds or publishes them.
- For the plugin, the engine gained code without changing its sound: the live note logic in Rust
  (`control/singer.rs`), a voice that can be swapped without allocating (`Engine::prepare_voice`,
  `install_voice`), a pitch-bend ratio (1 unless set), a beat sequencer that can follow a host's
  transport, and a planner split so a live note is planned without allocating (`plan_timed`, new
  dependency `smallvec`). The page's stores and panels gained `inPlugin` branches
  (`src/audio/pluginBridge.ts`, `src/ui/pluginState.ts`, `src/audio/sampleAnalyser.ts`), which do
  nothing on a website.
- **On the website**: a "Plugin" link in the single-mouth player's top bar, a page for it
  (`public/plugin/index.html`: download buttons for upstream's Mac and Linux releases and how to
  install them) and upstream's installer script (`public/install.sh`).
- **Sung Mandarin** (upstream #130): the voice now starts on the beat after an initial consonant
  (it came in 35 to 110 ms late), and the consonants before a sung vowel shorten with fast notes
  instead of leaving the vowel no room. Only Mandarin syllables set the two new fields
  (`voiceLag`, `onsetShare`).
- The scope list in the README no longer puts MPE under "Not now", and the browser tab's icon is
  the 2D head's profile (`public/favicon.svg`, `public/apple-touch-icon.png`).

Adapted rather than taken as written:

- `README.md`: this edition's text is kept, so it has no plugin section. The one-line scope
  change (MPE) applied to the scope list this edition quotes.
- `src/audio/AudioEngine.ts`: upstream moved the worklet's message handler into a `receive`
  method. This edition's rule that frames arriving while a prepared song renders are not shown
  moved with it.
- `src/ui/components/SingPanel.tsx`: this edition's order (Lyrics, Song player, Pitch) is kept.
  Upstream hides the tune buttons and the EN/TR chips inside the plugin; the song player is
  hidden there too. On the website nothing changes.
- `src/ui/styles.css`, `tools/layout-lint.ts`, `AGENTS.md`, `vercel.json`: both sides kept (the
  lint still opens `?solo=1` except with upstream's new `--plugin` option).
- `index.html`: this edition's title with upstream's icon links. Vite rewrites them for the
  subfolder (`/chimera-song-mouth/favicon.svg` in the build).
- Subfolder paths: the "Plugin" link goes through `BASE_PATH` (upstream's `/plugin/` would have
  left this site), and the plugin page's four root links are relative (`../favicon.svg`,
  `../apple-touch-icon.png`, `../` and, for "Open the voice", `../?solo=1`).
- `crates/chimera-plugin/build.rs` embeds the built site (`dist/`) as the plugin's page. Here
  `dist/` also holds the prepared songs and scenes (2.3 GB against 6 MB for the page), so
  `band/` and `scenes/` are skipped, as upstream skips `shows/`. Without that, `cargo test
  --workspace` in a checkout that has been built would compile gigabytes into the test binaries.
  Checked: with `dist/` present the crate embeds 36 files and its 52 tests pass.
- `MEDIA-MANIFEST.json`: regenerated; the diff adds exactly the four new public files (1006).

Left out, for the owner to decide: `.github/workflows/plugin.yml`. Actions is enabled on this
repository, and the workflow runs on every push to `main` that touches `public/`, `src/` or
`crates/`: a macOS and a Linux job of up to an hour each that build the plugin from this tree,
run it in REAPER, and on a `plugin-v*` tag publish a release. This edition does not ship the
plugin, so none of that was asked for. The file is not in this repository's history; upstream's
own staging copy, `crates/chimera-plugin/plugin.yml`, is, and does nothing where it sits. To
turn the builds on: `git show upstream/main:.github/workflows/plugin.yml`. Upstream's two
release tags (`plugin-v0.1.0`, `plugin-v0.2.0`) were not taken either.

Not adapted: the plugin itself. It was not built or run from this edition, and a build from
this tree would open on the band page, not the single mouth. The plugin page's download
buttons and its `curl … | sh` line point at upstream's releases and upstream's own address
(`chimera.audio`), as written. Earlier adaptations still stand
(`git log --grep='Upstream import'`).

The engine source changed, so `src/wasm/chimera.wasm` is rebuilt (Arch `rust` and `rust-wasm`
1.99.1; sha256 in `PROVENANCE.json`). No golden fixture changed upstream and none was blessed
here: all golden tests pass against this edition's fixtures as they were. The sound is
unchanged outside sung Mandarin: the 80 test sentences rendered by the new CLI are
byte-identical to the 2026-11-20 build's, and `chimera render song` (Daisy Bell, Twinkle, the
Russian song, two more) is byte-identical to a CLI built on 2026-11-18. No prepared song or
scene was re-rendered, and no existing file in the media manifest changed.

Word clarity (`tools/asr/speech_wer.py`, Whisper small.en, the same sentences as before):
21.85 % word errors on the training sentences and 29.33 % on the held-out ones, every one of
the 80 transcripts identical to the 2026-11-20 run (verdict: no clear change). The judge is
English only; nothing here measures sung Mandarin.

Validation: 368 native tests passed (two existing ignored; 70 more than last time: 52 in the
plugin crate, 8 for the beat following a host, 4 for the live singer, 6 for sung Mandarin on
the beat); 682 Bun tests with `--timeout 60000` (seven more); typecheck; content verification
(1006 public files).

Browser checks ran in the system Chromium with software rendering against a local server, on
the single-mouth player (`?solo=1`), with the laptop in its power-saver mode again (the voice
at 138 to 171 % load at 48 kHz, 88 to 128 % after falling back to 32 kHz). `tools/e2e.ts` did
not change in this import, so the same script ran against the previously published build
(`dc789c0`) under the same conditions:

- `tools/e2e.ts`, desktop and phone sizes, twice on the import and once on the previous build.
  All three runs: the fall back to 32 kHz at both sizes, "Record video never offered a clip",
  "no clip after two taps", and the slow-device step's can't-keep-up warning not showing within
  its 10 s. The second run on the import also reported "the tune still sounding after stop" at
  both sizes. That one is the test losing a race on a slow machine, not the voice: the tune it
  sings has the same planned length in both builds (6.06 s) and ended by itself 7.5 to 9.4 s
  after the Sing press at this load (four timings, two per build), while a click took 2.6 to
  4.5 s to land. When Stop landed after the tune had ended, the button already read "Sing" and
  the click started the tune again. Repeating only that step, 5 of 9 tries on the import and 1
  of 9 on the previous build went that way; the two that were timed had the click 8.7 and
  8.9 s after Sing, and every timed Stop that landed within 8.2 s silenced the voice. The page
  itself is no slower: both builds drew 21 to 23 frames in 5 s while the tune sang (four tries
  each, order alternated) and took 2.4 to 2.7 s for a click, so the difference in counts is
  read as chance. None of these are counted as passes. Upstream's tongue-grab check was again
  skipped (2D face only, too slow under software rendering).
- `tools/layout-lint.ts`, 240 views at 8 sizes: 4 errors, 12 warnings, all known. One is the
  Speak error at 375x812 (two "k" labels touching in the gestural score); three are Sing at
  1280x720 while running (the readouts "0.7", "CM" and "SHUT" drawn below the live vocal
  tract's canvas, as on 2026-11-20). The twelve warnings are the same twelve as last time. The
  new "Plugin" link in the top bar brought no error or warning at any size.

Not tested: the plugin in any host, or built at all on a Mac; `tools/plugin-e2e.ts` and the
lint's `--plugin` sizes (they drive the plugin's page, which this edition does not ship);
upstream's installer script; sung Mandarin by ear or by any judge; the video recorder, the
48 kHz path and the can't-keep-up warning at normal machine speed; a real phone; Safari.

## Next update

1. Read `AGENTS.md` and `HANDOFF.md`, check the working tree and fetch the latest
   `origin/main`. Preserve other agents' changes.
2. Add `upstream` with `git remote add upstream
   https://github.com/jamesondh/chimera-vocal-synth.git` if it is not already
   configured, then run `git fetch --no-tags upstream main`.
3. Read `upstreamRevision` from `PROVENANCE.json`. Inspect the commits and diff
   from that revision to `upstream/main`. If the saved revision is no longer
   its ancestor, investigate the history change instead of guessing a range.
4. Apply reviewed commits in chronological order with `git cherry-pick -x`.
   Resolve conflicts in favor of retaining this edition's functionality while
   incorporating the actual fix. Record any deliberately skipped changes.
   Preserve all prepared media, subfolder paths, the tracked WASM binary,
   portable build settings, retained MEGALOVANIA heads and solo audio fixes.
   `.github/workflows/` is not imported until the owner says so (see the 2026-11-21 record
   above): when a pick changes `.github/workflows/plugin.yml`, resolve the modify/delete
   conflict with `git rm` and keep upstream's change to `crates/chimera-plugin/plugin.yml`.
5. Run `bun run test`, `bun run typecheck`, `bun run verify:content` and
   `bun run build:static --base=/chimera-song-mouth/`. Follow the additional
   engine/ABI checks in `AGENTS.md` when those files change. Never bless golden
   tests merely to hide an unexplained failure. Compare media hashes with the
   pre-update manifest. Prepared songs do not automatically acquire a new
   engine's sound: re-rendering is separate work and must retain approved scores.
6. Advance `upstreamRevision` only after the range is accounted for and checks
   pass. Update this record, commit and push. Follow `DEPLOYMENT.md` to publish
   changed media/bundles before the entry page, then verify the uploaded bytes.
   If the generated site is identical, verify it is already synchronized;
   tooling-only changes do not require new song renders or changed web assets.

Since 2026-11-18 the owner's ThinkBook checks upstream once a day (a systemd user timer,
`chimera-upstream-check`, outside this repository). When upstream is ahead of
`upstreamRevision`, it starts an unattended agent that follows this procedure: import, test,
push and publish, or stop and leave a report when a test fails, a conflict needs judgment or
the word-clarity judge reads worse. Nothing in this repository runs on a schedule, and no run
re-renders recordings.
Browser checks run in the system Chromium against a local server only (Playwright's
own browser is not installed, so `tools/e2e.ts` and `tools/layout-lint.ts` need
`executablePath: "/usr/bin/chromium"` in a temporary copy); never point a headless
browser at the live site. The native tests,
content verification and static build remain available.
