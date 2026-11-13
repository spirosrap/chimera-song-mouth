# Keeping this edition current

Original repository: https://github.com/jamesondh/chimera-vocal-synth, branch `main`.
`PROVENANCE.json` records the last imported upstream revision and check date.
This edition began as an independent export, so its Git history has no common
ancestor with upstream. Import reviewed changes with `git cherry-pick -x`; do
not merge unrelated histories or replace this tree with an upstream checkout.

## Latest synchronization

Checked on 2026-11-13, through `153c97195ffa44de5ce53f0eadf3ea27c7193c43`
(30 commits after `e33221d0`, all imported with `git cherry-pick -x`; none skipped).

What came in:

- Languages: a router sends each lyric word to the front end for its script. Korean
  (Hangul, one block per note, with its sound rules and three-way stops) and Russian
  (Cyrillic, with a demo song) are new; English is unchanged. New sounds for Korean and
  Mandarin (ɕ ʑ tɕ dʑ tʂ dʐ ɥ), `Segment.vot`, `chimera syllables`, and
  `docs/language-front-ends.md`.
- Single-mouth app: each tab has one main button that also starts the audio (the start
  overlay is gone), with a retry when the start fails; the body presets, MIDI and the
  Speak examples moved into headers and menus; the 2D face draws the whole head; grabbing
  the face before any audio starts it; Speak's IPA mode says which symbols it skipped; an
  iPhone in silent mode now plays.
- Tools and docs: the scramble test (`tools/asr/scramble.py`, how intelligible a front
  end's singing is on sound alone), `CONTRIBUTING.md`, a PR template, and upstream's
  reworded vision item 3 (realism is the main push; the robotic voice stays as a preset).

Adapted rather than taken as written:

- `README.md` keeps this edition's text in six commits that touched upstream's feature
  list and run instructions; the reworded vision item 3 is taken.
- Sing tab: upstream's new main button and demo-song menu sit above this edition's song
  player, which stays (`SingPanel.tsx`, `styles.css`: an extra `song` row). The demo-song
  chips this edition had in the Lyrics header are replaced by upstream's menu. The song
  player's own chooser is now labelled "Melody": two menus named "Song" on one tab were
  ambiguous to a screen reader and to `tools/e2e.ts`.
- `App.tsx`: the start overlay is removed as upstream does; the song player starts the
  audio itself.

The engine changed, so `src/wasm/chimera.wasm` is rebuilt (Arch `rust` and `rust-wasm`
1.99.1; sha256 in `PROVENANCE.json`). No golden fixture was blessed. Rendered with the
engine before and after: Lovell's voice in the Apollo 13 scene (audio and telemetry) and the
whole Wizard of Oz scene (five voices, mix and telemetry) are bit-identical, so no prepared
song or scene was re-rendered and the media manifest is unchanged.

Validation: 187 native tests passed (two existing ignored); 357 Bun tests; typecheck;
content verification. Browser checks ran in the system Chromium with software rendering
against a local server, on the single-mouth player (`?solo=1`), since this edition's root is
the band page:

- `tools/layout-lint.ts`: the duet page and all five tabs report 0 errors at 8 sizes. One
  first pass of Sing reported 3 errors at 1280x720 while playing; two reruns reported none
  and the detail was not kept.
- `tools/e2e.ts`, desktop and phone sizes: no console errors; every check passed except "the
  syllable cursor did not move", which was already open before this import. Upstream's new
  tongue-grab check was not run: it scans the 2D face for the tongue handle, this edition
  opens on the 3D face, and with the 2D face switched on the scan did not finish in nine
  minutes under software rendering.

Not tested: a real iPhone in silent mode, Korean or Russian singing by ear, Safari.

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
