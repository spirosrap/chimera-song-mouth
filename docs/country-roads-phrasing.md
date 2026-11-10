# Country Roads: pronunciation and lead melody

The first version used CMUdict, but its automatic word timestamps were poor singing
boundaries. For example, the first two-syllable “Country” had only 180 ms, while
the held endings of “Virginia” and “Mama” stopped more than a second early.
Splitting tracked pitch fluctuations into separate notes did not fix that.

The phonetics-2 revision repaired those durations, but a direct comparison with
the user's demo exposed a second problem: the monophonic pitch estimate followed
lower harmonies or accompaniment in several passages. The held “belong” was
scored at MIDI 58.5 or 54, rather than the demo's F#4 (66), and much of “older than
the trees” incorrectly stayed on E3. This was a melody error, not a missing
pronunciation dictionary or a reason to replace the shared voice engine.

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
- Revision melody-3 uses reviewed musical note targets, checked against the
  supplied demo's audio / note boxes and a local RMVPE estimate of the full vocal.
  The chorus's rising “I belong” is C#4, E4, F#4 in every repetition. Sustained
  notes receive 18-cent vibrato only after the vowel settles; the physical voice
  supplies its normal pitch glide. The unreliable old pitch trace is not reused.
- The score contains 242 syllables, 713 explicitly timed phones and 3,242 pitch /
  breath points. Captions, note boxes, section markers, audio and telemetry share
  the corrected clock. Edited lyrics still fall back to ordinary text planning.

The finished performance is 195.8504375 seconds with 3,918 telemetry frames.
Decoded voice/music peak at the default mix is 0.930000, below clipping. The
instrumental MP3 and its mixer level are byte-for-byte / value-for-value unchanged.
Only Country Roads' score, credits, generated vocal and mouth telemetry change
among the 221 public assets; all other songs and movies are retained.

The three regression checks in `tests/country-roads-phrasing.test.ts` cover the
opening syllable spacing, formerly missing held vowels, and the correct rising
chorus melody in both the score and rendered mouth. The user heard a preview of
the same 31.808-second passage as their demo and confirmed it was “Much closer
to the video” before publication.

The demo's backing aligns to 22.407375 seconds in the supplied full recording.
On 14.85 seconds of confidently detected vowel interiors, the average pitch
discrepancy from that demo fell from 1.70 to 0.19 semitones (78.7% to 97.8% of
compared frames within one semitone). This diagnoses the specific pitch error;
it is not a general listening-quality score or proof of an identical voice.

Validation also includes the full native suite, 122 Bun tests, type checking, production
build, media checksums and all twelve prepared song loaders. Browser playback
and visual QA were not run because browser access was previously declined.
Automatic phoneme and pitch estimates remain approximate; the user's listening
feedback is the perceptual check, not the automated audio measurements.

The prepared `performance` in `public/band/country-roads/arrangement.json` is the
renderable source of truth. Do not regenerate it from the old ASR word endpoints
or the original pYIN pitch trace. `assetVersion: "melody-3"` and the matching catalogue query prevent reuse of
the earlier cached vocal and telemetry.
