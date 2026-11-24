# Keeping this edition current

Original repository: https://github.com/jamesondh/chimera-vocal-synth, branch `main`.
`PROVENANCE.json` records the last imported upstream revision and check date.
This edition began as an independent export, so its Git history has no common
ancestor with upstream. Import reviewed changes with `git cherry-pick -x`; do
not merge unrelated histories or replace this tree with an upstream checkout.

## Latest synchronization

Checked on 2026-11-24, through `616b9af366ce43d5b41094aee2503e64afb795a0`
(twelve first-parent commits after `f1b2bb1`, all imported with `git cherry-pick -x`; no merge
commits, none left out).

What came in:

- **Dials** (`c835f82`, `f565447`): an encoder's readout now reserves the room of the widest
  value and unit it can show, so turning a dial no longer moves the row (Sing's Key going from
  "0" to "+1" used to wrap "semitones" and make both dials jump). Arrow keys now move Key,
  Tempo, Vibrato and Beatbox's Tempo, which used to snap back (`Encoder` takes a `step`).
- **Phone layout** (`076f2c6`): on a phone (640 px and under) every screen you touch comes
  before every screen you only watch, in all five tabs; `<Screen watch>` marks the charts.
  Upstream measured Play's keys 1303 px higher at 390 x 844. Nothing changes above 640 px.
  `AGENTS.md` gained the rule.
- **Desktop heights** (`f52d06f`, `45becf3`): Beatbox's pads sit beside the spectrogram over
  the tempo, and the beat as text moved into the step sequencer's header, so Beatbox no longer
  scrolls on a desktop window that fits the other tabs (measured here at 1728 x 808: 85 px over
  before, fits now). Upstream's matching change for Sing is not taken as written, see below.
- **Canvas labels** (`616b9af`): 2D canvases scale by their rounded backing store, not by
  `devicePixelRatio` (`cssScale` in `src/ui/useCanvas.ts`), so an 11 px label is no longer
  drawn at 10.9 px on a canvas with a fractional height.
- **Layout lint and smoke test**: three new lint checks (`shift`: every encoder turned to both
  ends, its readout must not move; `order`: the phone rule above; `page-scroll` at a new ninth
  size, 1728 x 808) and one new smoke-test step (an arrow key on every encoder of Sing and
  Beatbox).
- **Plugin** (six commits, `14d21c9` to `40efa44`; this edition builds and ships no plugin):
  the Linux editor maps an X11 child window through `x11rb` so Bitwig keeps it open (upstream
  #158), `tools/third-party-notices.ts` lists the building system's dependencies, `docs/plugin.md`,
  and the workspace version 0.2.0 → 0.2.1 (`Cargo.toml`, `Cargo.lock`).

Adapted rather than taken as written:

- `src/ui/components/SingPanel.tsx` and the phone rule in `src/ui/styles.css` (conflicts in
  `076f2c6`): the edition's Sing column keeps its song player. Pitch and Spectrum take upstream's
  `watch` mark, and the phone order is Sing, Lyrics, Song player, Keys, Voice, Pitch, Spectrum
  (upstream's order with the song player where it was, after Lyrics; it has things to touch, so
  it is not `watch`). The lint's `order` check passes on it.
- `.right-sing` rows in `src/ui/styles.css` (conflict in `f52d06f`): the edition keeps
  `240fr` for the pitch roll's row; upstream went to `200fr`. Upstream's reason does not hold
  here. There, the keys' minimum stretched the roll 41 px past its own, and 200fr removed that.
  Here the roll has a taller minimum of its own (`.mode-sing .s-roll .screen-body`, 165 px,
  from the original export), so the roll sets the ratio and 200fr stretched the keys instead:
  measured at 1728 x 808, the Keys screen went from 139.6 to 167.6 px and the Sing page from
  1210 to 1238 px. With 240fr every screen in Sing is the size it was before the import
  (measured, identical to the previous build). The comment above the rule gives the numbers.
  Sing scrolls on a desktop window in this edition either way: the song player's screen is
  about 343 px tall.

No file under `public/` was added or changed (the media manifest is as it was), no workflow
file came with the range, and `src/audio/AudioEngine.ts`, `src/ui/singing.ts`, the golden
fixtures and everything under `crates/chimera/` and `crates/chimera-wasm/` were not touched.

`src/wasm/chimera.wasm` is rebuilt all the same (Arch `rust` and `rust-wasm` 1.99.1; sha256 in
`PROVENANCE.json`), because the engine reports the workspace version (`env!("CARGO_PKG_VERSION")`
in `crates/chimera-wasm/src/api.rs`), which is now 0.2.1. The binary has the same size
(1,233,240 bytes) with its contents reordered. The sound is the same: no engine source changed,
the native goldens pass unblessed, and `tests/wasm-engine.test.ts` renders the voice scenarios
through the new binary bit-identically to the native build. The word-clarity judge was not run
(nothing under `crates/chimera/src` changed); the 2026-11-23 figures stand: training 19.87 %,
held-out 30.00 %. The prepared songs and scenes are recordings: none was re-rendered.

Validation: 370 native tests passed (three ignored: the two existing ones and upstream's new X11
editor test, which needs a display); 759 Bun tests across 193 files with `--timeout 60000` (on
the first run one timed out, `tests/wasm-engine.test.ts`, cut off at its 120 s limit while cargo
was still compiling its native reference renderer in a fresh worktree; it passed once that was
built, and the whole suite passed on the final tree); typecheck; content verification (1176
public files).

Browser checks ran in the system Chromium with software rendering against a local server, on
the single-mouth player (`?solo=1`), with the laptop in `power-saver` mode and busy (load
average 6 to 20):

- `tools/e2e.ts`, desktop and phone sizes: six errors, all of the slow-machine kind met in
  power-saver mode on 2026-11-20 and 2026-11-21 (both sizes fell back to 32 kHz, engine load 164 % and 99 %; the
  can't-keep-up warning check; two Record video steps; the tune still sounding after Stop). The
  previously published build, run with the pre-import test right after, also gave six (the same
  ones, with "the breath stopped sounding across the fallback" in place of the tune one), so it
  is the machine. The new arrow-key step passed (9 encoders turned, 0 stuck). Upstream's
  tongue-grab check was again skipped.
- `tools/layout-lint.ts`, 270 views at 9 sizes: 112 errors and 2 warnings, where the last
  record had 1 and 2. Nearly all come from the two new checks:
  - `shift`, 101 errors: a readout's width or its unit's position differs by 0.5 px (the
    check's rounding step) between a dial's ends, in Play, Sing and Bestiary. Upstream's own
    unmodified tree at `616b9af`, built and linted in the same browser, gives 95 of the same errors (and no others), where
    upstream reports 0 with Playwright's browser: it is the test browser's text metrics, not
    this edition and not the import. Nothing moves by a visible amount, and the wrap that the
    fix is for does not happen.
  - `page-scroll` at 1728 x 808, 5 errors, all Sing: the page is 402 to 419 px taller than
    the window, because of the song player (the previous build measures the same 402 px).
    Beatbox, 85 and 109 px over in the previous build, fits now. An earlier run of the same
    lint also had Play 21 px and Speak 13 to 14 px over while running; so do the previous
    build and upstream's own tree in this browser.
  - `overlap`, 6 errors: the known Speak one at 375 x 812 (two "k" labels in the gestural
    score) and five of the timing-dependent Sing one first seen on 2026-11-22 (the area label
    over the sung word). The 2 warnings are the known duet-title ones.
  - No `order` errors, and no text under 11 px.
- Sing, Play and Beatbox were opened on both builds at 375 x 812 and 1440 x 900: no console
  or request errors; the phone order is as described above and Sing's page height is unchanged
  (2513 px on the phone, 1227 px at 1440 x 900).
- The band page, a song (`?song=megalovania`) and two scene pages (`hello`, `wizard-of-oz`)
  were opened on both builds at the same two sizes: no console or request errors, and the
  pages look the same.

Not tested: a real phone or tablet; the dials with a keyboard by hand; anything about the
plugin beyond compiling it and its own tests (the X11 test needs a display and did not run;
no host was opened); playback on the band, song and scene pages (they were only opened);
Safari; a HiDPI screen.

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
