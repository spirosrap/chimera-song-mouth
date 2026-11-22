# Keeping this edition current

Original repository: https://github.com/jamesondh/chimera-vocal-synth, branch `main`.
`PROVENANCE.json` records the last imported upstream revision and check date.
This edition began as an independent export, so its Git history has no common
ancestor with upstream. Import reviewed changes with `git cherry-pick -x`; do
not merge unrelated histories or replace this tree with an upstream checkout.

## Latest synchronization

Checked on 2026-11-22, through `7c0f722e6a375f0acae543364565741d58c100c9`
(two first-parent commits after `caf270a`, both merges imported with `git cherry-pick -x -m 1`;
no conflicts, nothing left out).

What came in:

- **Frication just past the soft palate** (upstream #143, issue #124): when the narrowest point
  of the mouth, or the stretch of airflow the engine follows on either side of it, landed on the
  first section of the oral tube, the engine made no frication noise there at all, and the teeth
  source was dropped with it. That hit back vowels and velar consonants. The one section now
  maps to its branch like every other (`voice/human_airway.rs`); a new test,
  `tests/frication_junction.rs`, counts the narrow moments that have no noise source (none now).
  Upstream describes the audible change as small: about 1 dB more noise above 1 kHz in [x].
- **Mandarin 长 after a degree word** (upstream #128): 很长, 太长, 那么长 now read cháng (long);
  长大 and 校长 keep zhǎng, and so does 怎么长. A rule in the front end
  (`phonetics/mandarin.rs`), with a test; the lexicon file `public/data/mandarin.txt.gz` is
  unchanged. Two notes in `docs/language-front-ends.md` and a comment in
  `tools/build-mandarin.ts` came with it.

Adapted rather than taken as written: nothing. Both commits applied as upstream wrote them, no
edition file needed a change, and no file under `public/` was added or changed (the media
manifest is as it was). Earlier adaptations still stand (`git log --grep='Upstream import'`),
and `.github/workflows/` stays out as before; neither commit touched it.

Golden fixtures: upstream re-blessed four audio fixtures with the frication fix (`beatbox-bar`,
`voice-speech-male`, `voice-speech-female-96k`, `voice-speech-child`). This edition's copies of
those four were byte-identical to upstream's before the commit, upstream's new ones came in
with the pick, and this edition's engine reproduces them: every golden test passes and nothing
was blessed here. `planning.json` (the fixture that differs in this edition) was not touched.

The engine source changed, so `src/wasm/chimera.wasm` is rebuilt (Arch `rust` and `rust-wasm`
1.99.1; sha256 in `PROVENANCE.json`). Unlike the last two imports, this one changes the sound
of everything the live voice says or sings, slightly. Against the 2026-11-21 build, 78 of the
80 judge sentences render differently (two are byte-identical): the level is the same within
0.02 dB, the energy above 1 kHz within -0.32 to +0.18 dB, and the difference between old and
new render sits 12 to 42 dB below the signal (median 18.5). The five songs of `chimera render
song` all differ too: same level within 0.02 dB, difference 22 to 34 dB below the signal. The
prepared songs and scenes are recordings: none was re-rendered, and no file in the media
manifest changed. They keep the sound of the engine that rendered them.

Word clarity (`tools/asr/speech_wer.py`, Whisper small.en, the same sentences as before):
verdict **no clear change**. Training sentences 21.85 → 20.53 % word errors (66 → 62 wrong
words of 302; 15 of 40 transcripts changed, 7 better, 4 worse). Held-out sentences 29.33 →
31.67 % (88 → 95 of 300; 12 of 40 changed, 2 better, 7 worse); the judge does not use them to
decide, and its limit for "worse" is +3 points on the training set. Both sets together: 154 →
157 wrong words of 602. The largest single moves were held-out: "The salt breeze came across
from the sea" (female) went from perfect to four wrong words and "The boy was there when the
sun rose" (male) from perfect to three, while "The source of the huge river is the clear
spring" (male) went from six wrong to two. The judge is English only; nothing here measures
Mandarin.

Speed (`cargo run --release -p chimera --example bench`, previous engine and this one built
side by side and run alternately three times on a busy laptop): 30.3 to 34.2 % of a core
before, 29.6 to 30.4 % after at 2x oversampling; 12.6 to 16.8 % before, 13.2 to 14.8 % after
at 1x. No slowdown.

Validation: 370 native tests passed (two existing ignored; two more than last time, the two
new tests above); 702 Bun tests with `--timeout 60000` (twenty more than at the last import,
all from scenes added in between); typecheck; content verification (1073 public files). Three
more commits were pushed by another session while this ran; after rebasing onto them, the Bun
tests (704), the typecheck and the content verification (1079 files) passed again.

Browser checks ran in the system Chromium with software rendering against a local server, on
the single-mouth player (`?solo=1`). This time the laptop was not in its power-saver mode
(`performance` during the e2e, `balanced` later), which is why the results differ from the
last two records:

- `tools/e2e.ts`, desktop and phone sizes: no errors, for the first time in these records. The
  voice stayed at 48 kHz (engine load 67 % desktop, 63 % phone), Record video produced a clip,
  the slow-device warning showed, and the tune was silent after Stop. Upstream's tongue-grab
  check was again skipped (2D face only, too slow under software rendering).
- `tools/layout-lint.ts`, 240 views at 8 sizes: 5 errors, 12 warnings. One error is the known
  Speak one at 375x812 (two "k" labels touching in the gestural score). The other four are one
  error not seen in earlier records, at four sizes (1280x720, 1366x768, 1440x900, 1920x1080),
  in Sing while a tune sings: the area label on the narrowest point of the vocal tract
  ("0.26 CM²") drawn over the sung word "OF" as it leaves the mouth. It is not from this
  import: the previously published build (`93ff700`), linted the same hour, reported it too
  (3 errors, 12 warnings: the Speak one and this overlap at 1366x768 and 1920x1080), and
  repeating two sizes twice on each build gave it in 3 of 4 runs on the previous build and 1 of
  4 on the import. The lint looks 1.5 s after pressing Sing; on a machine at normal speed that
  is the moment the third word is sung, and the earlier records were taken in power-saver
  mode. The label's code (`drawCalipers` in `src/ui/render/anatomy.ts`) reads only the tract's
  shape and no file under `src/` changed here. It is an upstream layout fault, left as it is.
  The three known Sing errors at 1280x720 (the readouts "0.7", "CM" and "SHUT" below the
  canvas) did not show in the full run and came back in one of five repeats at that size (a
  second repeat reported three errors there and its log was not kept). The twelve warnings are
  the same twelve as last time.

Not tested: the new sound by ear; back vowels and velars specifically (the judge's sentences
are ordinary English); the Mandarin reading in the browser (the rule is tested natively and
is in the rebuilt engine); anything about the plugin; a real phone; Safari.

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
