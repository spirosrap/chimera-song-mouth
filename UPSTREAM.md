# Keeping this edition current

Original repository: https://github.com/jamesondh/chimera-vocal-synth, branch `main`.
`PROVENANCE.json` records the last imported upstream revision and check date.
This edition began as an independent export, so its Git history has no common
ancestor with upstream. Import reviewed changes with `git cherry-pick -x`; do
not merge unrelated histories or replace this tree with an upstream checkout.

## Latest synchronization

Checked on 2026-11-23, through `f1b2bb13b295709f03fc01c0798d8569e096a5fd`
(thirteen first-parent commits after `7c0f722`: twelve imported with `git cherry-pick -x`, the
one merge among them with `-m 1`; one left out, see below).

What came in:

- **/s/ and /z/ with the tongue tip 3 mm further forward** (upstream #135, commit `0885014`):
  s and z were heard as sh and zh because the narrowest point sat too far behind the lips. The
  tip target moves (`TtX` 6.3 → 6.6 in `phonetics/inventory.rs`), its height is recalibrated
  (`consonantTargets.generated.json`), /ts dz/ follow, and Mandarin's apical vowel ɿ, tied to
  /s/'s tip, is refit (`vowelTargets.generated.json`). Upstream's own judges: real-speaker cost
  0.817 → 0.519, the hiss of /s/ about 1.2 to 1.3 kHz higher, Whisper and singer no clear
  change, and the upstream owner's blind listen preferred it. Two entries in
  `docs/hill-climb/log.md` came with it (`0885014`, `b8e4bf9`).
- **A body the 3D head can be worn on** (nine commits, `da49862` to `cb54ec4`): a small library
  in `src/rig/` (a posable body mesh `body.rig.bin`, CC0 from MakeHuman and MPFB2, with
  `tools/rig/gen-body.ts` to rebuild it; motion from Mixamo FBX, BVH or glTF clips through
  three.js's loaders), a dev page `rig.html`, `docs/rig.md`, and 14 tests in
  `tests/rig.test.ts`. The 3D head (`src/ui/render/anatomy3d.ts`, `beams3d.ts`) gained drawing
  options and skin-surface queries for it; the defaults draw the app's head as before. Nothing
  in the site uses the rig: `rig.html` is not a build input, so the published site has no rig
  page and no rig code. Upstream's README scope gained a point for it (now point 7).
- **Readable labels** (upstream #145, merge `60ae9f9`): every label in Hershey Medium, an 11 px
  floor for DOM and canvas text, text never in a line colour or dimmed by opacity, a thin black
  halo behind canvas labels, a small square before a lit chip. It changes `src/ui/styles.css`,
  the shared canvas `label()` in `src/ui/render/vector.ts`, eleven components, and the layout
  lint (which now fails text under 11 px). This edition's band, song and scene pages share the
  stylesheet and `label()`, so their text is slightly larger and bolder too.

Left out: `f1b2bb1` "Create checks.yml" adds only `.github/workflows/checks.yml` (tests,
typecheck, layout lint and e2e on every pull request and push to main). `.github/workflows/`
is not imported until the owner says so, because Actions is enabled on this repository and the
workflow would run on every push. `upstreamRevision` is set to that commit all the same: the
range is accounted for, and the file can be taken later with
`git checkout upstream/main -- .github/workflows/checks.yml`.

Adapted rather than taken as written:

- `README.md` (conflict in `acf41b7`): the edition's text is kept. The quoted upstream scope
  list took the new point 7 and the renumbered point 8, so the sentence above it now says this
  edition goes beyond points 6 and 8 (it said 6 and 7), and the licence paragraph names the
  body mesh's CC0 source.
- `AGENTS.md` (conflict in `60ae9f9`): the edition's rules are kept and upstream's new
  "Text is readable" rule is added beside them.
- `crates/chimera/tests/golden/planning.json` (conflict in `0885014`): the edition's fixture
  is kept and re-blessed twice with that one commit applied. The change is 174 values, every
  one an /s/ or /z/ gesture's `ttX` (6.3 → 6.6, 87 of them) or `ttY`, and the list of changed
  paths with their old and new values is identical to upstream's own change to its fixture
  (`jdiff.py` at full depth, no difference). `beatbox-bar.f32` was byte-identical to
  upstream's before the commit, upstream's new one came in with the pick, and this edition's
  engine reproduces it.
- `tests/folk-singer-overlay.test.ts`: the test's stand-in canvas gained an empty
  `strokeText`, which `label()` now calls for the halo. Its assertions are unchanged.

Not adapted, noted: the band page keeps two labels of its own under the new floor
(`.band-badge`/`.band-eyebrow` at 10 px, `.band-ensemble .screen-sub` at 9 px) and the scene
pages a few more. The lint only covers the single-mouth player, and they are this edition's
text, so they are left for the owner.

No file under `public/` was added or changed (the media manifest is as it was), and
`src/audio/AudioEngine.ts`, `src/ui/singing.ts` and `SingPanel.tsx` were not touched.

The engine source changed, so `src/wasm/chimera.wasm` is rebuilt (Arch `rust` and `rust-wasm`
1.99.1; sha256 in `PROVENANCE.json`). The live voice changes wherever it says s or z. Against
the 2026-11-22 build, 76 of the 80 judge sentences render differently (the four identical ones
are two sentences with no s or z, in both voices): the level is the same within 0.03 dB, the
energy above 4 kHz moves by -2.5 to +2.8 dB (median +0.5), and the difference between old and
new render sits 10 to 29 dB below the signal (median 17.7). The prepared songs and scenes are
recordings: none was re-rendered, and no file in the media manifest changed.

Word clarity (`tools/asr/speech_wer.py`, Whisper small.en, the same sentences as before):
verdict **no clear change**. Training sentences 20.53 → 19.87 % word errors (62 → 60 wrong
words of 302; 15 of 40 transcripts changed, 6 better, 6 worse). Held-out sentences 31.67 →
30.00 % (95 → 90 of 300; 21 of 40 changed, 8 better, 8 worse); the judge does not use them to
decide. Both sets together: 157 → 150 wrong words of 602. The largest gains are held-out
and in the female voice: "The salt breeze came across from the sea" (four wrong → perfect)
and "The boy was there when the sun rose" (six wrong → three). The largest loss is "Four
hours of steady work faced us" (female, one wrong → three), where "faced us" is now heard as
"faceless", as it already was in the male voice. The judge is English only.

Validation: 370 native tests passed (two existing ignored; upstream added none); 759 Bun tests
with `--timeout 60000` (758 on the first run plus the stand-in fix above; 14 are the new rig
tests, the rest of the growth is scenes added in between); typecheck; content verification
(1176 public files).

Browser checks ran in the system Chromium with software rendering against a local server, on
the single-mouth player (`?solo=1`), with the laptop in `balanced` mode but busy (load average
12 to 17 from the owner's desktop):

- `tools/e2e.ts`, desktop and phone sizes: one error, the known busy-machine one (the phone
  run fell back to 32 kHz; engine load 77 % desktop, 84 % phone). The previously published
  build, run with the pre-import test a few minutes later, did worse (three errors: both sizes
  fell back to 32 kHz, load 84 % and 96 %, and the tune still sounding after Stop), so it is
  the machine. Everything else passed, including Record video. Upstream's tongue-grab check
  was again skipped.
- `tools/layout-lint.ts`, 240 views at 8 sizes: 1 error, 2 warnings, and no text under the new
  11 px floor. The error is the known Speak one at 375x812 (two "k" labels touching in the
  gestural score); the warnings are the two known duet-title ones. The ten Bestiary warnings
  of earlier records are gone (the label change fixed them). The Sing overlap first seen on
  2026-11-22 (the area label over the sung word) did not show in this run; it depends on
  timing and may return.
- The band page, a song (`?song=megalovania`), two scene pages and the solo player were
  opened on both builds at desktop and phone sizes: no console or request errors, and the
  pages look as before apart from the slightly larger, bolder text.

Not tested: the new sound by ear; the speed bench (not rerun: only target values changed, no
code path, upstream measured no difference, and the laptop was too busy for a fair reading);
Mandarin ɿ; the rig beyond its own tests (its dev page was not opened, no real FBX, BVH or
glTF file was played); anything about the plugin; a real phone; Safari.

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
