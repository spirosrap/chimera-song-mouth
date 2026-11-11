# Keeping this edition current

Original repository: https://github.com/jamesondh/chimera-vocal-synth, branch `main`.
`PROVENANCE.json` records the last imported upstream revision and check date.
This edition began as an independent export, so its Git history has no common
ancestor with upstream. Import reviewed changes with `git cherry-pick -x`; do
not merge unrelated histories or replace this tree with an upstream checkout.

## Latest synchronization

Checked on 2026-11-11, through `e33221d006f44c78849210eb29dd1eb9755dc78e`
(18 commits after `eed4a5ff`, all imported with `git cherry-pick -x`).

What came in:

- Engine: the voice keeps the airway above 60 kHz at low device rates, a child
  voice at 16 or 32 kHz no longer rings, and a tongue pressed low no longer
  shortens the oral tube under its stable length (issue #50, with its review).
- Front end: `Segment.aspirated`, and IPA marks for nasalization,
  palatalization and breathy voice, with their tests and docs.
- App: the audio context runs at 48 kHz whatever the device, a demo song gives
  the player's own lyrics back, Z and X move the on-screen keys at once, Play's
  Whisper and Beatbox's ready pose stay in their tabs, the dictionary loads
  with the Sing panel.
- Repo: `.gitattributes` (LF text), Windows file-URL paths in tests and tools,
  the model's references and credits, upstream's Vision & scope.

Adapted rather than taken as written:

- `README.md` keeps this edition's text. Upstream's Vision & scope is included
  under "The original project's vision & scope", with a note that this edition
  goes beyond its points 6 and 7 (tracked media, multi-voice scenes); the
  `AGENTS.md` rule that points at it is worded to match. The credits link was
  added to the opening paragraph, since this README has no Docs list.
- `src/ui/singing.ts`: upstream's `endDemo` is merged with this edition's
  imported-melody player; it takes the elapsed time this edition's song clock
  shows. `src/ui/store.ts` keeps `threeD: true`. `.gitattributes` keeps
  `*.mp3` and `*.mp4` binary.

The engine changed, so `src/wasm/chimera.wasm` is rebuilt (Arch `rust` and
`rust-wasm` 1.99.1; sha256 in `PROVENANCE.json`). Two checks that the rebuild
is safe: the previous source rebuilt with this compiler renders three test
utterances (audio, telemetry and plans) bit-identically to the previously
tracked binary, and so does the new source. The fixes touch low device rates
and extreme tongue positions, not ordinary 48 kHz speech, so no prepared song
or scene was re-rendered and all 313 media hashes are unchanged.

Validation: 144 native tests passed (two existing ignored), no golden fixture
blessed; 222 Bun tests passed; typecheck; content verification. `tools/e2e.ts`
was run against a local build of the single-mouth player (`?solo=1`, system
Chromium with software GL): every check passed except "the syllable cursor did
not move", which fails identically on the tree before this import and is open.
Before the import the same run also failed the Z/X check, which this range fixes.

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
Browser/layout QA was previously declined; do not run a browser or claim that
coverage without a subsequent change in authorization. The native tests,
content verification and static build remain available.
