# Keeping this edition current

Original repository: https://github.com/jamesondh/chimera-vocal-synth, branch `main`.
`PROVENANCE.json` records the last imported upstream revision and check date.
This edition began as an independent export, so its Git history has no common
ancestor with upstream. Import reviewed changes with `git cherry-pick -x`; do
not merge unrelated histories or replace this tree with an upstream checkout.

## Latest synchronization

Checked on 2026-11-25, through `efc42a46c0dbd2332171fad4227346700a52bbc0`
(two first-parent commits after `616b9af`, both merge commits, both imported with
`git cherry-pick -x -m 1`; none left out).

What came in:

- **Japanese in Sing** (`f795b84`, upstream PR #148): lyrics typed in kana (hiragana, katakana,
  half-width katakana) are sung one mora to a note by a new front end,
  `crates/chimera/src/phonetics/japanese.rs`. ん is a note of its own, a hum on the nasal of
  the sound after it; っ is a note that ends in the long consonant after it; ー and a repeated
  vowel hold the vowel on the next note. Kanji are not read (a Han character still goes to the
  Mandarin reader), so Japanese is typed in kana. Kana are recognised by their script, whichever
  of EN and TR is chosen. The half-width ､ and ｡ now end a phrase. A demo song came with it,
  "さくら さくら" (traditional), which shows up as the ninth entry of Sing's Tune menu with its
  own words. `docs/language-front-ends.md` has upstream's account, including what a listener
  there still finds wrong (ぎゃ and ひゃ at the start of a phrase, a weak k at a phrase start).
- **A crackle fix in the voice source** (`efc42a4`, upstream PR #117, in
  `crates/chimera/src/voice/human_voice.rs`): changing a voice setting in the middle of a scored
  note dropped the score's vibrato, fold opening and effort until the next control step,
  so a stream of changes crackled. They are kept now. Upstream's test for it is in
  `crates/chimera/tests/engine.rs`.
- **Plugin** (the rest of `efc42a4`; this edition builds and ships no plugin): MPE for the
  single voice (a note's own bend at ±48 semitones, pressure to breath, slide to brightness), a
  new host parameter "MPE", `docs/plugin.md`.

Adapted rather than taken as written: nothing in the code. `README.md` conflicted in `f795b84`
and keeps this edition's text; upstream's change there is one clause in its "What it does" list
("Japanese (kana, one mora per note)"), a list this edition's README does not have. Every other
file the two commits touch is now byte-identical to upstream's at `efc42a4`.

No file under `public/` was added or changed (the media manifest is as it was), no workflow
file came with the range, and nothing under `src/` changed except the rebuilt engine: the
Tune menu reads the engine's own song list, and Sing reads lyrics through the engine's own list
of front ends. `src/audio/AudioEngine.ts`, `src/ui/singing.ts`, `src/ui/components/SingPanel.tsx`
and the golden fixtures were not touched, and upstream re-blessed no golden in this range.

`src/wasm/chimera.wasm` is rebuilt (Arch `rust` and `rust-wasm` 1.99.1; sha256 in
`PROVENANCE.json`): 1,249,908 bytes, 16,668 more than before.

The sound of what the voice already said and sang is unchanged, measured three ways with the
engine built before and after the import: the 80 renders of the word-clarity judge are
byte-identical, the five existing demo songs rendered by `chimera render song` (female) are
byte-identical, and the native goldens pass unblessed. The word-clarity judge
(`tools/asr/speech_wer.py`, Whisper small.en) therefore reads exactly as on 2026-11-23:
training 19.87 %, held-out 30.00 %, verdict "no clear change". The engine built from the tree
before the import was run through the judge the same morning and reproduced the stored result
byte for byte. The speed bench (`--example bench`, the two engines run in turn, six and five
times, with the laptop in `power-saver` mode) shows no slowdown: 53 to 79 % of one core before, 69 to
76 % after at oversampling 2, both wandering with the processor's speed. The prepared songs and
scenes are recordings: none was re-rendered.

The new song was rendered once with the command-line tool (female, 29.6 s, mean level
−11.8 dB) and sung in the browser (below). Nobody listened to it here, and the judge does not
score Japanese.

Validation: 400 native tests passed (three ignored, the same three as before; 21 of the new
ones are upstream's Japanese tests and one is the crackle test); 765 Bun tests across 195
files with `--timeout 60000`, four of them upstream's new `tests/japanese.test.ts`; typecheck;
content verification (1183 public files).

Browser checks ran in the system Chromium with software rendering against a local server, on
the single-mouth player (`?solo=1`), with the laptop in `power-saver` mode:

- `tools/e2e.ts`, desktop and phone sizes: two errors, both of the slow-machine kind recorded
  on 2026-11-24 (the can't-keep-up warning check; Record video never offered a clip). Both
  sizes ran at 32 kHz after the fallback, engine load 96 % and 89 %. The previously published
  build, run with the same test right after, gave three (the same two and "no clip after two
  taps"), so it is the machine. Upstream's tongue-grab check was again skipped.
- `tools/layout-lint.ts`, 270 views at 9 sizes: 113 errors and 4 warnings, where the last
  record had 112 and 2. By kind:
  - `shift`, 99 errors (101 last time): the half-pixel differences of the test browser's text
    metrics, as recorded on 2026-11-24.
  - `page-scroll` at 1728 x 808, 13 errors (5 last time). Sing at rest is 402 px over, as
    before (the song player). In this run the views with the voice running were 21 to 24 px
    taller than that (Sing 426 to 443 px, Play 21 px, Speak 13 to 14 px over): the screenshot
    shows the one-line notice "This device can't keep up…" under the Sing button, engine load
    165 %. Run again at that size alone, this build gives Sing 402, 402, 419 and 402 px and
    nothing for Play or Speak, and so does the previously published build: the same figures as
    on 2026-11-24.
  - `overlap`, 1 error: the known Speak one at 375 x 812 (two "k" labels in the gestural
    score).
  - The warnings: the two known duet-title ones, and two "hadn't redrawn at its new size" in
    Play at 1280 x 720, which did not come back when that size was run again alone.
  - No `order` errors, and no text under 11 px.
- The new song in Sing, at 1440 x 900 and 375 x 812: "さくら さくら" is in the Tune menu,
  choosing it puts its words in the lyrics (50 syllables for its 50 notes), Sing sings it (output
  level 0.39, the word display stepping through さ, く, ら…), Stop silences it, and there were no
  console or request errors.
- The band page, a song (`?song=megalovania`), two scene pages (`hello`, `wizard-of-oz`) and
  the single-mouth player were opened on this build and on the previously published one at
  the same two sizes: no console or request errors on either, and the same page heights.

Not tested: how the Japanese sounds to a listener (nobody listened, and no Japanese speaker
has heard this edition's build); kana typed as the words for the edition's song player (not
tried); a real phone or tablet; anything about the plugin
beyond compiling it and its own tests (no host, no MPE controller); playback on the band, song
and scene pages (they were only opened); Safari.

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
