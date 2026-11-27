# Keeping this edition current

Original repository: https://github.com/jamesondh/chimera-vocal-synth, branch `main`.
`PROVENANCE.json` records the last imported upstream revision and check date.
This edition began as an independent export, so its Git history has no common
ancestor with upstream. Import reviewed changes with `git cherry-pick -x`; do
not merge unrelated histories or replace this tree with an upstream checkout.

## Latest synchronization

Checked on 2026-11-27, through `1beb677f0ac5e94b32b87cd043f57e965e2fc2e7`
(one first-parent commit after `577faa1`: the merge commit `1beb677`, upstream PR #172,
imported with `git cherry-pick -x -m 1`; nothing left out, no conflicts).

What came in:

- **A Japanese reading fix for typed lyrics** (`crates/chimera/src/phonetics/japanese.rs`, twelve
  lines). The voicing repeat marks ゞ and ヾ after わ ゐ ゑ を now read [v], the same as the
  repeat mark followed by a separate voicing mark already did: わゞ sings "wa va" where it sang
  "wa wa", ヲヾ sings "o vo". A plain ゝ still only repeats, and ゞ after any other kana reads as
  before (かゞ "ka ga"). Nothing else in the reader changed.
- Upstream's test for it (five more lines in `crates/chimera/tests/japanese.rs`) and one
  sentence in `docs/language-front-ends.md` (the small っ before a vowel or at a word's end is a
  silent glottal stop).

Nothing was adapted: the three files are byte-identical to upstream's at `1beb677`. No file
under `src/`, `public/`, `tests/` or `tools/` changed, no workflow file came with the range, no
golden fixture was touched, and upstream re-blessed none. Neither mark occurs in any text file
of this edition (songs, scenes, scores, demo songs), so the only place the change can be heard
is Sing with lyrics somebody types.

`src/wasm/chimera.wasm` is rebuilt (Arch `rust` and `rust-wasm` 1.99.1; sha256 in
`PROVENANCE.json`): 1,251,523 bytes, 463 more than before. Read through it the way the page
does (`lyricsToSyllables`), わゞ gives "wa", "va"; わゝ gives "wa", "wa"; さくら is as it was.

The sound of what the voice already said and sang is unchanged: the 80 renders of the
word-clarity judge are byte-identical to those of 2026-11-26, the seven demo songs rendered by
`chimera render song` (female) are byte-identical to that day's, and the native goldens pass
unblessed. The word-clarity judge (`tools/asr/speech_wer.py`, Whisper small.en) reads exactly
as before: training 19.87 %, held-out 30.00 %, verdict "no clear change", its result file
byte-identical to the stored one. The speed bench was not run: no code on the voice's path
changed. The prepared songs and scenes are recordings: none was re-rendered.

Validation: 401 native tests passed (three ignored, the same three as before; the new
assertions are inside an existing test of `tests/japanese.rs`, 21 tests); 786 Bun tests across
202 files with `--timeout 60000`; typecheck; content verification (1232 public files).

Browser checks ran in the system Chromium with software rendering against a local server, on
the single-mouth player (`?solo=1`), with the laptop in `balanced` mode and little else running:

- `tools/e2e.ts`, desktop and phone sizes: no errors on this build (48 kHz at both sizes, engine
  load 79 % and 83 %, the video clip recorded). The previously published build of 2026-11-26, run
  with the same test right after, gave one error, the known fall back to 32 kHz at the phone
  size (load 107 % at that moment). Upstream's tongue-grab check was again skipped.
- `tools/layout-lint.ts`, 270 views at 9 sizes: 104 errors and 2 warnings, all of kinds recorded
  before:
  - `shift`, 95 errors (99 last time): the half-pixel differences of the test browser's text
    metrics, as recorded on 2026-11-24.
  - `page-scroll` at 1728 x 808, 5 errors, all in Sing (the song player): 402 px over at rest
    and running, 419 px on the Tune page, 402 px on Tone, 414 px with a tune playing. Run again
    at that size alone, this build and the previous one give the same five figures. With the
    machine quiet the "This device can't keep up…" line never showed, so the eight figures it
    caused on 2026-11-26 (Play 21 px, Speak 13 to 14 px) are absent.
  - `overlap`, 4 errors: the known Speak one at 375 x 812 (two "k" labels in the gestural
    score), and three times the one first recorded on 2026-11-22, which only shows on a quick
    machine: in Sing with a tune playing, the opening-size label over the mouth ("0.22 CM²")
    lies over the sung word "OF" (at 1024 x 768, 1280 x 720 and 1920 x 1080 this time). It
    depends on the moment the picture is taken: the previous build showed it too at 1280 x 720
    when run again ("0.27 CM²" over "OF"). It is upstream's layout, untouched by this import.
  - The warnings: the two known duet-title ones.
  - No `order` errors, and no text under 11 px.
- The band page, a song (`?song=megalovania`), two scene pages (`hello`, `wizard-of-oz`) and
  the single-mouth player were opened on this build and on the previous one at 1440 x 900 and
  375 x 812: no console or request errors on either, and the same page heights as each other
  and as on 2026-11-26.

Not tested: the new reading in a browser (it was read through the built engine in Bun, the
path the page uses, but nobody typed わゞ into Sing) or by ear; how any Japanese sounds to a
listener (the judge does not score Japanese, and no Japanese speaker has heard this edition's
build); a real phone or tablet; the plugin beyond compiling it and its own tests; playback on
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
