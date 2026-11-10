# Keeping this edition current

Original repository: https://github.com/jamesondh/chimera-vocal-synth, branch `main`.
`PROVENANCE.json` records the last imported upstream revision and check date.
This edition began as an independent export, so its Git history has no common
ancestor with upstream. Import reviewed changes with `git cherry-pick -x`; do
not merge unrelated histories or replace this tree with an upstream checkout.

## Latest synchronization

Checked on 2026-11-10, through `eed4a5ff2695ad151df2210d012b2a4ab584f099`.
The original export's upstream base was
`092b16ce12b927d473c884ca2dfae53ce1b995df`, verified from the source workspace's
shallow boundary and unchanged Rust source.

All four intervening commits were imported: the MusicXML-to-notes converter,
its case-insensitive lyric diagnostics and tests, XML attribute-order fixes,
and the macOS Metal backend for layout checks. The README addition was adapted
to this edition's documentation; the three imported code/test files match
upstream exactly. No voice-engine, runtime UI or prepared-media change was
present in this range.

Validation: 112 native tests passed (two existing ignored tests); all 127 Bun
tests passed, including the five new importer tests. The first full test run
hit the default five-second timeout in an existing Country Roads audio render;
`bun test tests --timeout 15000` passed without changing assertions or code.
Typechecking, all 12 prepared song loaders, all 221 media checksums and the
production build passed. The 242 generated site files were byte-identical to
the current deployment staging, and all 22 published runtime files were
downloaded and checksum-verified. No deployment upload was needed. Browser
QA and the macOS Metal layout path were not exercised.

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
