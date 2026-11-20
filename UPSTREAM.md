# Keeping this edition current

Original repository: https://github.com/jamesondh/chimera-vocal-synth, branch `main`.
`PROVENANCE.json` records the last imported upstream revision and check date.
This edition began as an independent export, so its Git history has no common
ancestor with upstream. Import reviewed changes with `git cherry-pick -x`; do
not merge unrelated histories or replace this tree with an upstream checkout.

## Latest synchronization

Checked on 2026-11-20, through `0dc13f8704bd998e8d70377f3bc4de53b16863f8`
(one first-parent commit after `c6147d0`, a merge imported with `git cherry-pick -x -m 1`;
none skipped).

What came in:

- Turkish in Speak and Sing (upstream #44). Turkish is written in Latin letters, so the lyrics
  router cannot tell it from English by script: a new **EN / TR** choice, next to "Text is IPA"
  in Speak and in the Lyrics header in Sing, says which one reads Latin-script words. It is one
  setting for both tabs, kept on the device with Sing's words; English stays the default.
  `crates/chimera/src/phonetics/turkish.rs` reads the spelling by rule (no dictionary, no new
  sounds): fronted k, g and l by the vowels beside them, ğ as a long vowel, doubled consonants,
  stress rules, numbers read out. `docs/turkish.md` describes it and lists what is not done yet.
- With it: three Turkish vowels (/y/, /ø/, /ɯ/) get their own lengths in the duration table
  instead of the 80 ms fallback, a `length` field on a segment (a long sound), `chimera render
  turkish` and `chimera syllables "<lyrics>" tr` in the CLI, 19 native tests
  (`crates/chimera/tests/turkish.rs`), `tests/turkish.test.ts`, one more Sing test and an e2e step.

Adapted rather than taken as written:

- `README.md`: this edition's text is kept (upstream's feature list is not in it), so the README
  does not mention Turkish; `docs/turkish.md` and `docs/language-front-ends.md` do.
- `src/wasm/engine.ts`: `lyricsToSyllables` takes upstream's `lang` argument and still sends
  Greek script to this edition's own reader first; the language is passed on for the non-Greek
  words of a mixed line.
- `src/ui/components/SingPanel.tsx`: the EN/TR chips are added to the Lyrics screen where this
  edition has it (Lyrics, Song player, Pitch); upstream's order (Pitch before Lyrics) is not taken.
- `crates/chimera/tests/golden/planning.json`: this edition's fixture is kept and re-blessed
  twice with the commit applied. Exactly one utterance moved, the same one as in upstream's own
  change to the fixture ("phrase 16: y ø ˈɨ", which uses two of the three vowels that got table
  lengths): the same 22 fields (segment and gesture times, three f0 targets, the end) plus one
  last-digit rounding difference in a `rampOut`. /y/ goes 52 → 92 ms upstream and 89 → 156 ms
  here, /ø/ 44 → 90 ms upstream and 74 → 153 ms here: upstream's new lengths times this
  edition's 1.7 clear-speech factor for unstressed vowels. The other 97 utterances, the Klatt
  cases and the beatbox audio are unchanged.
- `durations.rs` merged without a conflict; the clear-speech vowel lengths are untouched.

Not adapted, for the owner to decide: the song player (`src/song/plan.ts`) still reads the
Lyrics box as English whichever of EN/TR is lit, as it did before; only the Sing button, the
keys and Speak follow TR. Earlier adaptations still stand (`git log --grep='Upstream import'`).

The engine source changed, so `src/wasm/chimera.wasm` is rebuilt (Arch `rust` and `rust-wasm`
1.99.1; sha256 in `PROVENANCE.json`). English is unchanged: two test sentences rendered by the
new CLI in the male and female voices are byte-identical to the 2026-11-18 build's, and the
syllables for a Korean, Russian and English line are the same JSON. No prepared song or scene
was re-rendered and no file in the media manifest changed.

Word clarity (`tools/asr/speech_wer.py`, Whisper small.en, the same sentences as before):
21.85 % word errors on the training sentences and 29.33 % on the held-out ones, with every one
of the 80 transcripts identical to the 2026-11-19 run (verdict: no clear change). The judge
is English only; nothing here measures how clear the Turkish is.

Validation: 298 native tests passed (two existing ignored; 19 more than last time, all in the
new Turkish file); 675 Bun tests with `--timeout 60000` (six more); typecheck; content
verification (1002 public files). The rebuilt CLI split "çok güzel bağlarında" into çok, gü,
zel, bağ, la, rın, da and rendered "Merhaba, nasılsın? Bugün hava çok güzel." (4.8 s).

Browser checks ran in the system Chromium with software rendering against a local server, on
the single-mouth player (`?solo=1`). The laptop was in its power-saver (Cool Saver) mode this
time, so the software-rendered voice ran at about twice the load of the last import (185 to
200 % against 79 and 89 %), and both checks were repeated against the previously published
build (`1c58e6a`) under the same conditions to tell the machine from the import:

- `tools/e2e.ts`, desktop and phone sizes. The new step passed at both sizes: TR chosen in
  Speak is lit in Sing and still chosen, with the Turkish example, when Speak comes back.
  Errors: the fall back to 32 kHz at both sizes, the can't-keep-up warning in the slow-device
  step, and "Record video never offered a clip" / "no clip after two taps". The previous build
  gave the same five on the same machine (engine load 193 and 195 %), plus a creature call
  still sounding after Stop, which the first of two runs on the import also showed along with a
  silent sung key and a recorder step; none of them appeared on 2026-11-19 at normal speed.
  They are counted as the slow machine, not as passes. Upstream's tongue-grab check was again
  skipped (2D face only, too slow under software rendering).
- `tools/layout-lint.ts`, 240 views at 8 sizes: 7 errors, 12 warnings. One is the known Speak
  error at 375x812 (two "k" labels touching in the gestural score). Six are in Sing at
  1280x720, idle and running: the readouts "0.7", "CM" and "SHUT" of the live vocal tract are
  drawn below its canvas. The previous build gives exactly the same three per view at 1280x720
  (run twice each, same coordinates), so they do not come from this import; they were not
  reported on 2026-11-19, when Sing's error at this size was the word over a readout. Play,
  Beatbox, Bestiary and the duet page report 0 errors.

Not tested: Turkish by ear, or by any judge; typing Turkish in a browser beyond the e2e step
(the engine and CLI were asked directly); the video recorder and the 48 kHz path at normal
machine speed; a real phone; Safari.

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
