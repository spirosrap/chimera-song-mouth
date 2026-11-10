# Country Roads: phonetics revision

The first version used CMUdict, but its automatic word timestamps were poor singing
boundaries. For example, the first two-syllable “Country” had only 180 ms, while
the held endings of “Virginia” and “Mama” stopped more than a second early.
Splitting tracked pitch fluctuations into separate notes did not fix that.

The [quoted performance renderer](https://github.com/cupOJoseph/chimera-vocal-synth/blob/main/tools/performance/voice.mjs)
uses dictionary pronunciations and explicit timing for sung syllables. This
revision applies that principle to the full supplied recording, with explicit
phoneme durations in the existing `VocalPerformance` format. It does not change
the shared Rust voice engine or the other songs' pronunciation.

- The supplied lyrics constrain a local phoneme alignment against the separated
  vocal; acoustic-model blank frames are never interpreted as rests.
- Consonants connect the vowels briefly. Vowels receive the sustain, with
  diphthong glides confined to the end (at most 110 ms).
- “Virginia” and “Mama” retain open sung final vowels instead of conversational
  schwas. The omitted “Take” at the first outro entrance is restored.
- Continuous measured pitch retains bends and vibrato. Additional synthetic
  vibrato is disabled for this part to avoid doubling it.
- The score contains 242 syllables, 713 explicitly timed phones and 3,242 pitch /
  breath points. Captions, note boxes, section markers, audio and telemetry share
  the corrected clock. Edited lyrics still fall back to ordinary text planning.

The finished performance is 195.8504375 seconds with 3,918 telemetry frames.
Decoded voice/music peak at the default mix is 0.923562, below clipping. The
instrumental MP3 and its mixer level are byte-for-byte / value-for-value unchanged.
Only Country Roads' score, credits, generated vocal and mouth telemetry change
among the 221 public assets; all other songs and movies are retained.

The two regression checks in `tests/country-roads-phrasing.test.ts` cover the
opening syllable spacing and the formerly missing held vowels. The second check
renders the physical mouth and measures its output through both sustained
endings. The user listened to the revised 25-second chorus and confirmed it was
clearer and more connected before the full version was published.

Validation also includes the full native/Bun suite, type checking, production
build, media checksums and all twelve prepared song loaders. Browser playback
and visual QA were not run because browser access was previously declined.
Automatic phoneme and pitch estimates remain approximate; the user's listening
feedback is the perceptual check, not the automated audio measurements.

The prepared `performance` in `public/band/country-roads/arrangement.json` is the
renderable source of truth. Do not regenerate it from the old ASR word endpoints.
`assetVersion: "phonetics-2"` and the matching catalogue query prevent reuse of
the earlier cached vocal and telemetry.
