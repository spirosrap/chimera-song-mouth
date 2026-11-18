# Keeping this edition current

Original repository: https://github.com/jamesondh/chimera-vocal-synth, branch `main`.
`PROVENANCE.json` records the last imported upstream revision and check date.
This edition began as an independent export, so its Git history has no common
ancestor with upstream. Import reviewed changes with `git cherry-pick -x`; do
not merge unrelated histories or replace this tree with an upstream checkout.

## Latest synchronization

Checked on 2026-11-18, through `eeb0c1940d2d52f5f5effdecf3507fe79157f389`
(13 first-parent commits after `a5d22beb`, all imported with `git cherry-pick -x`; the two
merge commits, Mandarin #85 and hill-climb batch 3 #41, with `-m 1`; none skipped).

What came in:

- Mandarin: Chinese lyrics (Han characters) and pinyin with tones are sung, the tones as
  pitch bends, from a new lexicon (`public/data/mandarin.txt.gz`, loaded only when the lyrics
  have Han characters; its license beside it). Later fixes by a native speaker's ear.
- Voice, hill-climb batch 3 (the voice measured against recordings of real speakers): stops
  and nasals are timed from where they sound closed; "ch" and "j" have a closure and a
  frication; "v" and "z" weaken the voice; "th" after a pause is a silent closure; a vowel
  and the "r" after it share one span; the lungs' pressure reaches the mouth; the female
  voice's pulse and open phase changed.
- Singing: a sung phrase ending in a vowel or sonorant is let go by the folds; the ring
  control narrows the tube above the folds (the singer's formant near 3.2 kHz); the trilled
  r no longer collapses into one silence; a Korean reading fix.
- Slow devices: when the audio thread cannot keep up at 48 kHz the voice is rebuilt at
  32 kHz and the top bar says so; if it still cannot keep up, a notice says that. Creature
  voices zero their decayed state as the human voice does.

Adapted rather than taken as written:

- `crates/chimera/tests/golden/planning.json` conflicted three times (trill, sung release,
  batch 3), because this edition's fixture already differs from upstream's (its longer
  vowels). Each time the edition's fixture was kept and re-blessed twice with the one change
  applied, then compared field by field with upstream's own re-bless: the trill commit moved
  the same 105 values in the same four utterances, the sung release the same 68 values in
  the same seven songs, and batch 3 moved 1161 values against upstream's 1164 in the same
  five groups; the difference is five values whose last decimal digit moves in one fixture
  and not the other.
- This edition's clear-speech vowel lengths (1.7x unstressed, 1.4x stressed) are applied
  before batch 3's rule that a vowel and its coda "r" share one span, so the pair gets the
  lengthened vowel's span. `crates/chimera/tests/nasal_spans.rs` compares that pair with a
  vowel and an onset "r" and asked for under 0.75 of it; with the longer vowels the ratio is
  0.88 (0.73 upstream), so this edition's copy of the test asks for under 0.9. Nothing else
  in the engine is changed from upstream.
- `docs/hill-climb/log.md` keeps both this edition's clear-speech batch (retitled, with a
  note that its experiment numbers 21 to 23 are its own) and upstream's batch 3.
- The Mandarin lexicon is fetched through `BASE_PATH` (upstream fetches `/data/…`, which is
  not this site's folder), and both new files are in `MEDIA-MANIFEST.json`.
- `tests/prepared-song.test.ts` gives the engine a stand-in `window` (the slow-device code
  listens there for a tap). When the song player starts, the "can't keep up" notice is
  cleared: the live solver is paused then, so nothing can fall behind.

The engine changed, so `src/wasm/chimera.wasm` is rebuilt (Arch `rust` and `rust-wasm`
1.99.1; sha256 in `PROVENANCE.json`). All speech and singing sound different in the new
engine, not only fast speech. No prepared song or scene was re-rendered and no existing file
in the media manifest changed, so what the site plays from prepared audio is the same; a
later re-render of any scene or song will not reproduce the published audio. Live voices
(the single-mouth player, and a band song re-rendered in the browser after an edit) use the
new engine.

Word clarity, measured because this edition lengthened vowels for it: `tools/asr/speech_wer.py`
(Whisper small.en, the same sentences as the run recorded in the log for experiment 21)
reads 21.85 % word errors on the training sentences against 26.49 % before this import, and
29.33 % against 38.67 % on the held-out ones. Upstream's own figures for batch 3 are 27.15 %
and 38.33 %.

Validation: 278 native tests passed (two existing ignored); 650 Bun tests with
`--timeout 60000`; typecheck; content verification (983 public files after rebasing onto the newest scenes). Browser checks ran in
the system Chromium with software rendering against a local server, on the single-mouth
player (`?solo=1`), while the machine was busy (load average 17):

- `tools/e2e.ts`, desktop and phone sizes: every step passed except its check that this
  machine stays at 48 kHz. Under software rendering and that load the engine load reached
  119 % and the voice fell back to 32 kHz, which is the new fallback doing its job; the
  simulated slow-device steps passed. No console errors. Upstream's tongue-grab check was
  again skipped (2D face only, too slow under software rendering).
- `tools/layout-lint.ts`: Play, Beatbox, Bestiary and the duet page report 0 errors at 8
  sizes. Sing reports the word at the mouth over a readout at 1280x720 and 1366x768 (the
  same kind of error that came and went at the last sync). Speak reports the same one error
  at 375x812 as before (two "k" labels touching in the gestural score).
- By hand in the same browser: Chinese lyrics split into one syllable per character, the
  lexicon loads from the site's folder, and both the Sing button and the song player sing
  them.

Not tested: listening to anything by ear (the new consonants, the female voice, Mandarin),
a real phone or a real slow device, Safari, sharing a recorded clip.

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
