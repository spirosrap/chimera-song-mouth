# Keeping this edition current

Original repository: https://github.com/jamesondh/chimera-vocal-synth, branch `main`.
`PROVENANCE.json` records the last imported upstream revision and check date.
This edition began as an independent export, so its Git history has no common
ancestor with upstream. Import reviewed changes with `git cherry-pick -x`; do
not merge unrelated histories or replace this tree with an upstream checkout.

## Latest synchronization

Checked on 2026-11-15, through `a5d22bebe7589a031916e67412e365cd2b65aecd`
(6 commits after `153c9719`, all imported with `git cherry-pick -x`; none skipped).

What came in:

- Sing: the **Sing** button sings the words in the lyrics box to a tune chosen by mood
  (`src/song/tunes.ts`, `fit.ts`), with Tempo and Key on the Voice screen; the engine's
  demo songs are in the same Tune menu and bring their own words. **Record video** sings it
  again into a 9:16 clip to share or save (`src/song/record.ts`). The words, tune, tempo and
  key are kept on the device.
- Engine: decayed states are zeroed (in the browser a block took four times as long after a
  nasal, and the sound could break up); speech planned faster than rate 1 shortens its
  gesture ramps and release holds with the rate; beatbox patterns play up to 256 steps and
  240 bpm; one more demo song.

Adapted rather than taken as written:

- `README.md` keeps this edition's text.
- Sing tab: this edition's song player stays. `singing.ts` keeps `playMelody` and its state
  (`demo`, `elapsed`, `duration`, `renderProgress`) beside upstream's `tune`, `tempo`, `key`,
  `playing` and `at`; the lyrics follow whichever is singing, and starting one stops the
  other. Order on the tab: Sing button, Lyrics, Song player, Pitch (upstream puts the words
  right under the button that sings them).
- The song player used to load its first melody's words every time the tab opened, which
  overwrote the words upstream now keeps. It loads them only when none were kept.
- `crates/chimera/tests/golden/planning.json` conflicted twice, because this edition's
  fixture already differs from upstream's (its longer vowels). Each time the edition's
  fixture was kept and re-blessed twice with the one change applied, then compared field by
  field with the fixture before: the fast-speech commit moved only `rampIn`, `rampOut` and
  `releaseHold` in fixtures planned at rate 1.1 to 1.3; the beatbox commit moved only player
  scenario 1 (the same 73 differences as upstream's own re-bless).
- `tools/e2e.ts` types words into the lyrics box when it is empty. This edition opens Sing
  on a melody without words (Ode to Joy), and upstream's checks follow a syllable. This was
  also the cause of the "syllable cursor did not move" failure recorded at the last sync.

The engine changed, so `src/wasm/chimera.wasm` is rebuilt (Arch `rust` and `rust-wasm`
1.99.1; sha256 in `PROVENANCE.json`). Rendered with the engine before and after, Lovell's
voice in the Apollo 13 scene is no longer identical: his lines are planned at rates above 1,
so the fast-speech change shortens their ramps (difference 16 dB under the signal). With
that one change left out the two renders differ by less than 1e-30, so the zeroing is
inaudible. Lines at rate 1 or slower, and all singing, are unchanged. A search of the
render scripts for rates above 1 finds Apollo 13, the Wizard of Oz, the Apollo 11 landing, and
spoken lines in band songs (`src/band/planning.ts`). No prepared song or scene was re-rendered and
the media manifest is unchanged, so what the site plays is the same; a later re-render of
those scenes will not reproduce the published audio exactly.

Validation: 195 native tests passed (two existing ignored); 493 Bun tests (two needed
`--timeout 60000` on a busy machine); typecheck; content verification. Browser checks ran
in the system Chromium with software rendering against a local server, on the single-mouth
player (`?solo=1`):

- `tools/e2e.ts`, desktop and phone sizes: exit 0, no console errors, including the video
  clip, the words coming back on reload, and the tune singing the lyrics. Upstream's
  tongue-grab check was again skipped (2D face only, too slow under software rendering).
- `tools/layout-lint.ts`: Play, Beatbox, Bestiary and the duet page report 0 errors at 8
  sizes. Sing reports 0 on most passes; two errors come and go between passes (canvas text
  measured against a canvas that had moved at 1280x720, also seen before this import; the
  word at the mouth over a readout at 768x1024, once in three passes). Speak reports one
  error at 375x812 (two "k" labels touching in the gestural score), which the build from
  before this import reports too.
- By hand in the same browser: the song player plays a melody with its clock and word
  highlight, the Sing button sings the same words, and each stops the other.

Not tested: listening to fast speech or to anything else by ear, a real phone, Safari,
sharing a recorded clip, the lint's "clip to save" view (it looks for a button named
"Video"; the button is "Record video").

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

This is an on-request update procedure, not a scheduled updater. No workflow
automatically merges upstream code, re-renders recordings or publishes a site.
Browser checks run in the system Chromium against a local server only (Playwright's
own browser is not installed, so `tools/e2e.ts` and `tools/layout-lint.ts` need
`executablePath: "/usr/bin/chromium"` in a temporary copy); never point a headless
browser at the live site. The native tests,
content verification and static build remain available.
