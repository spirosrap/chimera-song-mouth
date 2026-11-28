# Keeping this edition current

Original repository: https://github.com/jamesondh/chimera-vocal-synth, branch `main`.
`PROVENANCE.json` records the last imported upstream revision and check date.
This edition began as an independent export, so its Git history has no common
ancestor with upstream. Import reviewed changes with `git cherry-pick -x`; do
not merge unrelated histories or replace this tree with an upstream checkout.

## Latest synchronization

Checked on 2026-11-28, through `720b2412a8bd7bef329e9a6408f6fde0c2cab8b7`
(three first-parent commits after `1beb677`, all merge commits: `153c7c8` (upstream PR #182),
`d7cce4a` (PR #181) and `720b241` (PR #178), each imported with `git cherry-pick -x -m 1`;
nothing left out, no conflicts).

What came in:

- **The animal voices come to rest at exactly zero** (`crates/chimera/src/creatures/voice.rs`,
  `creatures/songbird.rs`, `sources/syrinx.rs`, 22 lines). Two smoothed values crept toward
  zero for ever and ended as denormals, numbers so small the processor computes with them
  slowly: a dial that a call moves away from zero and hands back (the elephant's `mode` after
  its trumpet or squeak, the alligator's `hiss` after its hiss), and the gate of a muted side of
  the songbird's syrinx ("Left ↔ both ↔ right" at one end). Upstream measured 102 to 264 of 375
  blocks a second computed that way from 14 to 27 s after a call was let go, for good. Now a
  value under 1e-30 whose target is zero becomes 0; a dial sent to a value just above zero still
  arrives. Four new tests in `crates/chimera/tests/denormals.rs`.
- **`chimera render song` (the command-line tool only)**: a demo song whose words read as no
  syllables is an error naming the song where it panicked, and the dictionaries load once for
  all songs (`crates/chimera-cli/src/render.rs`, two new tests). With it a reworded comment in
  `crates/chimera/src/phonetics/songs.rs` about which printing of 送别 the demo follows; no data
  changed.
- **The MusicXML converter (`tools/musicxml-to-notes.ts`, a developer tool)** stops with an
  error naming the measure when its repeat expansion would leave a written measure out (a third
  ending), where it wrote a partial melody. One new test in `tests/musicxml-to-notes.test.ts`.

Nothing was adapted: the eight files are byte-identical to upstream's at `720b241`. No file
under `src/` changed except the rebuilt engine, nothing under `public/`, no workflow file came
with the range, no golden fixture was touched, and upstream re-blessed none.

`src/wasm/chimera.wasm` is rebuilt (Arch `rust` and `rust-wasm` 1.99.1; sha256 in
`PROVENANCE.json`): 1,251,656 bytes, 133 more than before.

The sound is unchanged, measured against an engine built from this repository as it was before
the import: the 80 renders of the word-clarity judge are byte-identical, the seven demo songs
rendered by `chimera render song` (female) are byte-identical, the four `chimera render
creature` files (songbird, seal, alligator, elephant) are byte-identical, and the native goldens
pass unblessed. The word-clarity judge (`tools/asr/speech_wer.py`, Whisper small.en) reads
exactly as before: training 19.87 %, held-out 30.00 %, verdict "no clear change", its result
file byte-identical to the stored one (the pre-import engine reproduced that file too). The
speed bench was not run: it times the human voice only, and no code on that path changed. The
prepared songs and scenes are recordings: none was re-rendered.

Validation: 407 native tests passed (three ignored, the same three as before; six are new with
this import); 873 Bun tests across 204 files with `--timeout 60000` (one new with this import);
typecheck; content verification (1790 public files).

Browser checks ran in the system Chromium with software rendering against a local server, on
the single-mouth player (`?solo=1`), with the laptop in `balanced` mode; other work on the
machine came and went (load average between 2 and 18):

- `tools/e2e.ts`, desktop and phone sizes, run twice. First run: one error, the known fall back
  to 32 kHz at the phone size (engine load 135 % at that moment, machine load average 11).
  Second run right after: no errors, 48 kHz at both sizes, engine load 76 % and 80 %, the video
  clip recorded. In both runs the four animal voices sounded and stopped. Upstream's
  tongue-grab check was again skipped.
- `tools/layout-lint.ts`, 270 views at 9 sizes: 105 errors and 2 warnings, all of kinds recorded
  before (a first attempt was cut off at the fifth size by the import run's own ten-minute
  limit and repeated in full):
  - `shift`, 96 errors (95 last time): the half-pixel differences of the test browser's text
    metrics, as recorded on 2026-11-24.
  - `page-scroll` at 1728 x 808, 5 errors, all in Sing (the song player), the same five figures
    as last time: 402 px over at rest and running, 419 px on the Tune page, 402 px on Tone,
    414 px with a tune playing.
  - `overlap`, 4 errors: the known Speak one at 375 x 812 (two "k" labels in the gestural
    score), and three times the one first recorded on 2026-11-22: in Sing with a tune playing,
    the opening-size label over the mouth lies over the sung word "OF" (at 1280 x 720,
    1440 x 900 and 1920 x 1080 this time; which sizes show it depends on the moment the picture
    is taken). It is upstream's layout, untouched by this import.
  - The warnings: the two known duet-title ones.
  - No `order` errors, and no text under 11 px.
- The band page, a song (`?song=megalovania`), two scene pages (`hello`, `wizard-of-oz`) and
  the single-mouth player were opened on this build at 1440 x 900 and 375 x 812: no console or
  request errors. Page heights, for the next comparison: 2275 / 4314, 2185 / 4883, 1730 / 1623,
  1834 / 1747, 1227 / 2513 px. The previous build was not opened beside it this time (nothing
  the pages draw with changed).

Not tested: the fix itself in a browser (nobody let an animal call go and watched the page's
processor load 14 to 27 s later; upstream's native tests for it pass here, and they failed on
the engine before the fix according to upstream, which was not re-measured here); anything by
ear; the MusicXML converter and `render song` beyond their own tests and the seven song
renders; a real phone or tablet; the plugin beyond compiling it and its own tests; playback on
the band, song and scene pages; Safari.

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
   `.github/workflows/` is not imported until the owner says so (decided on 2026-11-21, when
   the plugin workflow arrived): when a pick changes `.github/workflows/plugin.yml`, resolve the
   modify/delete conflict with `git rm` and keep upstream's change to
   `crates/chimera-plugin/plugin.yml`; a commit that only adds a workflow file (`checks.yml`,
   2026-11-23) is left out and recorded.
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
