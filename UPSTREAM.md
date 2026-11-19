# Keeping this edition current

Original repository: https://github.com/jamesondh/chimera-vocal-synth, branch `main`.
`PROVENANCE.json` records the last imported upstream revision and check date.
This edition began as an independent export, so its Git history has no common
ancestor with upstream. Import reviewed changes with `git cherry-pick -x`; do
not merge unrelated histories or replace this tree with an upstream checkout.

## Latest synchronization

Checked on 2026-11-19, through `c6147d0198890475dbe8a65a0bb8f56240c539b7`
(one first-parent commit after `eeb0c194`, imported with `git cherry-pick -x`; none skipped).

What came in:

- Korean: Hangul typed as its separate letters (conjoining jamo, as decomposed/NFD text has
  them, for example lyrics pasted from a Mac file name) used to be skipped whole and sang
  nothing. Modern jamo are now joined into blocks before the sound rules, so they sing like
  the same text typed as blocks. Blocks with a letter modern Korean dropped (ㆍ ㅿ ㆁ ㆆ) are
  still skipped. Upstream #133; a new test in `crates/chimera/tests/syllables.rs` and a
  paragraph in `docs/language-front-ends.md` came with it.

Adapted rather than taken as written: nothing. The commit applied without a conflict, touches
no golden fixture, no file under `public/`, no UI or audio code, and no test needed an
edition-specific limit. The adaptations made by earlier imports still stand and are described
in their commits (`git log --grep='Upstream import'`): this edition's own
`tests/golden/planning.json`, the 0.9 limit in `tests/nasal_spans.rs`, the Mandarin lexicon
fetched through `BASE_PATH`, the stand-in `window` in `tests/prepared-song.test.ts`, and both
hill-climb logs in `docs/hill-climb/log.md`.

The engine source changed, so `src/wasm/chimera.wasm` is rebuilt (Arch `rust` and `rust-wasm`
1.99.1; sha256 in `PROVENANCE.json`). Precomposed Hangul, English and every other language
read exactly as before: no golden fixture moved, and the prepared Korean songs' regression
tests pass unchanged. No prepared song or scene was re-rendered and no file in the media
manifest changed.

Word clarity (`tools/asr/speech_wer.py`, Whisper small.en, the same sentences as before):
21.85 % word errors on the training sentences and 29.33 % on the held-out ones, the same
figures as the 2026-11-18 import (verdict: no clear change), as expected for a change that
only reads Korean text.

Validation: 279 native tests passed (two existing ignored; one more than last time, the new
Korean test); 669 Bun tests with `--timeout 60000`; typecheck; content verification (1002
public files). The rebuilt engine was asked for the syllables of "한국 노래" in both forms and
gave the same four. Browser checks ran in the system Chromium with software rendering against
a local server, on the single-mouth player (`?solo=1`), on a quiet machine (load average 2):

- `tools/e2e.ts`, desktop and phone sizes: every step passed, no console errors, and the
  voice stayed at 48 kHz this time (engine load 79 % and 89 %). Upstream's tongue-grab check
  was again skipped (2D face only, too slow under software rendering).
- `tools/layout-lint.ts`, 240 views at 8 sizes: 2 errors, both known. Sing reports the word
  at the mouth over a readout at 1366x768 (not at 1280x720 this time; this error comes and
  goes). Speak reports the same one error at 375x812 as before (two "k" labels touching in
  the gestural score). Play, Beatbox, Bestiary and the duet page report 0 errors.

Not tested: listening to Korean by ear, typing decomposed Hangul into the Sing box in a
browser (the engine was asked directly instead), a real phone, Safari.

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
