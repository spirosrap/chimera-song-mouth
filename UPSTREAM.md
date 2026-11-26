# Keeping this edition current

Original repository: https://github.com/jamesondh/chimera-vocal-synth, branch `main`.
`PROVENANCE.json` records the last imported upstream revision and check date.
This edition began as an independent export, so its Git history has no common
ancestor with upstream. Import reviewed changes with `git cherry-pick -x`; do
not merge unrelated histories or replace this tree with an upstream checkout.

## Latest synchronization

Checked on 2026-11-26, through `577faa1be232d8366ae4ee239210a77db71717da`
(23 first-parent commits after `efc42a4`: one merge commit, `2c96403`, imported with
`git cherry-pick -x -m 1`, and 22 ordinary ones; all imported in order, none left out, no
conflicts).

What came in:

- **A Mandarin demo song, "送别"** (`2c96403`, upstream PR #157; words by Li Shutong, 1915, to
  J. P. Ordway's 1851 tune, both public domain): one more entry in
  `crates/chimera/src/phonetics/songs.rs`, the first verse at one character to a note. It shows
  up by itself as the tenth entry of Sing's Tune menu with its own words, read with the Mandarin
  dictionary the page already fetches. The command-line `chimera render song` now reads Han
  lyrics too. This is the only change under `crates/chimera/src`, and it is data: no code the
  voice runs through changed.
- **The body rig's nerve x-ray and playground** (the other 22 commits): `src/rig/nerves.ts`
  (a nervous system drawn as lines over the rig), `src/rig/playground.ts` in place of
  `src/rig/demo.ts` (several figures, a chat bar that makes the chosen one speak, poses saved as
  code), `src/rig/aimNeck.ts`, `docs/rig.md`. All of it belongs to `rig.html`, the developers'
  page, which is not a build input here: nothing of it is in the published site.
- **Changes to the 3D head the app shares with the rig**, made for that page:
  `src/ui/render/anatomy3d.ts` (an option for the eyes to look into the camera, off by default;
  parts of the head that can be dimmed or widened, unset by default; the head's scale on screen
  measured across the screen whichever way the head is turned), `src/ui/render/profile.ts`,
  `src/ui/mouthWords.ts` (the side the words are written on can follow the face) and
  `src/ui/render/beams3d.ts` (two wider line widths, 2.6 and 3.2 px).
- Upstream's tests for the above (`crates/chimera/tests/mandarin.rs`, eight in
  `tests/rig.test.ts`), and a fix to `tests/plugin-speech.test.ts`, which left its stand-in for
  `fetch` in place for the test files that ran after it.

Adapted rather than taken as written, one thing:

- **The scenes keep their line widths.** `Beams` (`src/ui/render/beams3d.ts`) draws every line at
  the nearest of a fixed list of widths, which ended at 2.1 px. Upstream added 2.6 and 3.2 px for
  the x-ray's face and noted that nothing in its app asks for them. This edition's scenes do:
  about 100 calls in 29 scene renderers ask for 2.4 to 9 px (49 of them 3 px, 14 of them 4 px,
  mostly hair) and all were drawn at 2.1 px when the scenes were made and approved. Imported as
  written, each would have been drawn at 2.6 or 3.2 px, up to half as wide again. So a `Beams`
  here keeps the six widths unless it is made with `new Beams(true)`, which the head's own is
  (the head and the x-ray are then as upstream's). `tests/scene-line-widths.test.ts` holds it,
  and `AGENTS.md` has the rule. Whether the scenes' wide lines should be drawn as wide as they
  ask is the owner's to decide; nothing was restyled.

One change of upstream's does reach an edition page, and was taken as it is: the head's scale on
screen is now right for a turned head. The Greek folk singer's head is turned 60°, so the scale
its sung words are placed by doubles (at a 640 x 360 stage, 1.9 → 3.8 px per cm). The words stay
26 px high (the smallest size, before and after) and start 2 to 5 px further from the lips; a
word too long for the space in front of the mouth is written lower under the chin than before.
Measured with the stage built in Bun at five sizes; not looked at in a browser.

Every other file in the range is byte-identical to upstream's at `577faa1`, except `AGENTS.md`
(this edition's own; upstream's two-line change to the map applied cleanly) and `anatomy3d.ts`
(the edition's earlier differences and the one line above). No file under `public/` was added
or changed (the media manifest is as it was), no workflow file came with the range, and
`src/audio/AudioEngine.ts`, `src/ui/singing.ts`, `src/ui/components/SingPanel.tsx`, the style
sheet and the golden fixtures were not touched; upstream re-blessed no golden in this range.

`src/wasm/chimera.wasm` is rebuilt (Arch `rust` and `rust-wasm` 1.99.1; sha256 in
`PROVENANCE.json`): 1,251,060 bytes, 1,152 more than before (the song).

The sound of what the voice already said and sang is unchanged: the 80 renders of the
word-clarity judge are byte-identical to those of 2026-11-25, the six earlier demo songs
rendered by `chimera render song` (female) are byte-identical to that day's, and the native
goldens pass unblessed. The word-clarity judge (`tools/asr/speech_wer.py`, Whisper small.en)
reads exactly as before: training 19.87 %, held-out 30.00 %, verdict "no clear change", its
result file byte-identical to the stored one. The speed bench was not run: no code on the
voice's path changed. The prepared songs and scenes are recordings: none was re-rendered.

The new song was rendered once with the command-line tool (female, 54.0 s, mean level
−10.5 dB, peak −2.5 dB) and sung in the browser (below). Nobody listened to it here, and the
judge does not score Mandarin.

Validation: 401 native tests passed (three ignored, the same three as before; the new one is
upstream's test that 送别 reads one syllable to a note); 776 Bun tests across 197 files with
`--timeout 60000` (eight of the new ones are upstream's rig tests, one is the line-width test);
typecheck; content verification (1190 public files).

Browser checks ran in the system Chromium with software rendering against a local server, on
the single-mouth player (`?solo=1`), with the laptop in `power-saver` mode:

- `tools/e2e.ts`, desktop and phone sizes: six errors on this build, five on the previously
  published build run with the same test right after. The five are the slow-machine ones
  recorded before (the can't-keep-up warning check; Record video never offered a clip; no clip
  after two taps; the fall back to 32 kHz at both sizes). The sixth, "the tune still sounding
  after stop" at the desktop size, is the late Stop click recorded on 2026-11-21 (in this mode
  it presses Sing again); the new song's own check below shows Stop silencing a tune on this
  build at both sizes. Both builds ran at 32 kHz, engine load 76 % and 93 % here, 84 % and 97 %
  on the previous build. Upstream's tongue-grab check was again skipped.
- `tools/layout-lint.ts`, 270 views at 9 sizes: 113 errors and 2 warnings, the same count
  and the same kinds as on 2026-11-25 (113 and 4):
  - `shift`, 99 errors (99 last time): the half-pixel differences of the test browser's text
    metrics, as recorded on 2026-11-24.
  - `page-scroll` at 1728 x 808, 13 errors (13 last time), with last time's figures: Sing at
    rest 402 px over (the song player); with the voice running, Sing 426 to 443 px, Play 21 px,
    Speak 13 to 14 px over, the one-line notice "This device can't keep up…" being on screen.
    Run again at that size alone, this build and the previously published one give the same
    thirteen figures as each other, to the pixel (the laptop's load was near 20 throughout, so
    the notice never went away and the 402, 402, 419, 402 of a quieter machine did not show).
  - `overlap`, 1 error: the known Speak one at 375 x 812 (two "k" labels in the gestural
    score).
  - The warnings: the two known duet-title ones. Last time's two "hadn't redrawn" warnings did
    not come back.
  - No `order` errors, and no text under 11 px.
- The new song in Sing, at 1440 x 900 and 375 x 812: "送别" is in the Tune menu, choosing it
  puts its words in the lyrics (58 syllable marks for its 58 notes, twelve of them holds), the
  Mandarin dictionary is fetched from under the site's own folder, Sing sings it (output level
  0.41, the word display stepping through 长, 亭, 外, 古, 道, 边…), Stop silences it, and there
  were no console or request errors. On this machine the audio's fall back to 32 kHz a few
  seconds in ends any tune that is playing, this one too; sung again after it, the song carried
  on until Stop.
- The band page, a song (`?song=megalovania`), two scene pages (`hello`, `wizard-of-oz`) and
  the single-mouth player were opened on this build and on the previously published one at
  1440 x 900 and 375 x 812: no console or request errors on either, and the same page heights
  as each other and as on 2026-11-25.

Not tested: how the Mandarin song sounds to a listener (nobody listened, and no Mandarin
speaker has heard this edition's build); a picture of any scene before and after (the line
widths are held by a unit test; the scene pages were only opened, not played); the folk
singer's words in a browser; `rig.html` itself (the developers' page was not opened, only its
tests run); a real phone or tablet; the plugin beyond compiling it and its own tests; playback
on the band, song and scene pages; Safari.

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
