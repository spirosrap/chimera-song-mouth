# Lyric-song phrasing, 2026-11-10

The owner requested the Country Roads improvements across the other songs with
lyrics. This updates eleven sung parts in six full songs; it does not change
the shared Rust/WASM engine, Country Roads, the wordless electronic songs or
movie scenes.

| Song | Revised parts | Method |
| --- | --- | --- |
| House of the Rising Sun | Lead, answering choir | Dictionary phones, connected sustains, late diphthong glides; authored notes retained |
| All Made of Air | Lead, answering choir | Same explicit timing; the spoken outro and other mouths are retained |
| Night Train Radio | Bass, tenor, alto, soprano | Full quartet with the accepted original words; held pitch changes retain one vowel instead of rearticulating consonants |
| Συννεφούλα | Singer | Greek phones aligned to the supplied vocal; continuous vowel timing and source pitch; all 93 whistle notes retained |
| Τα παιδιά του Πειραιά | Singer | Greek phone alignment and source pitch; instrumental and robotic finger-click channels retained |
| Rodehihi — Δεν ξανακάνω φυλακή | Singer | Approved accent phone sequence retained exactly; source pitch estimate improved and 19 overlong consonants shortened, restoring about two seconds to adjacent vowels |

English score preparation uses `tools/prepare-lyric-performance.ts`. Its input
is an already-authored arrangement and a list of parts; it does not invent a
melody or align a recording. CMUdict supplies the pronunciations. The prepared
phones keep consonants brief and allocate sustained time to vowels; diphthong
glides last at most 110 ms. Held notes do not repeat the syllable's consonants.
Restrained 18-cent vibrato begins only after the note settles.

The two Greek spelling-based performances were aligned locally against the
previously separated, user-supplied vocals with the cached multilingual phone
model. Acoustic-model blank frames are not rests. Genuine gaps are identified
from the source envelope; each lyric syllable retains an explicit vowel span.
An independent RMVPE estimate supplies continuous pitch, including source
slides and vibrato. Rodehihi keeps the previously approved nonstandard Greek
phone sequence and phrase spans, rather than regenerating standard Greek
pronunciation. These estimates are approximate; automatic pitch agreement is
not a perceptual-quality score.

The user heard the updated 15-second Τα παιδιά του Πειραιά preview and described
it as “Clearer and better connected.” This is feedback on that excerpt, not a
claim that every full render has received listening approval.

## Playback and rebuilding

The six `public/band/<id>/arrangement.json` files are the renderable source of
truth, including explicit `performance` phones and pitch/breath controls.
House of the Rising Sun and All Made of Air now load their prepared score just
like the other songs. Their original TypeScript compositions remain as the
authoring reference; replacing the prepared JSON from those functions alone
would discard the improved timing.

All revised singer assets use `assetVersion: "phrasing-20261110"`, and matching
catalogue queries prevent reuse of cached scores. Rendering an unedited voice
in the app uses the prepared performance. Editing its words still falls back
to ordinary text planning.

The combined singer planner now appends whistle gestures after prepared vocal
gestures. Its previous early return would have removed the pursed-lip
animation when Συννεφούλα gained an explicit performance. A rendered regression
test covers both the whistle articulation and the following audible vowel.

The existing backing and finger-click recordings and their mixer controls are
preserved. New voice files and telemetry cover the full original durations.
When required for mix headroom, only the new singers' default levels are
reduced. Source recordings, alignment caches and models remain outside Git.
Συννεφούλα's singer level also retains the previous whistle recording's 0.93
gain; its decoded whistle passages differ by less than 0.00018 RMS at the
default mix level. The whistle model, notes and timing are unchanged.

## Validation

All eleven full vocals have finite, non-silent audio and moving telemetry of
the correct duration. Every prepared phrase is audible; all six default mixes
peak at or below 0.95. The four Night Train singers share a small level reduction
to retain headroom. All accompaniment audio and controls are unchanged.

`bun run test --timeout 15000` passes 112 native tests (two existing ignored)
and 132 Bun tests. The longer per-test budget accommodates actual acoustic
renders without weakening assertions. Added checks cover the six prepared
score loads, the authored English melodies, the exact approved accent phone
sequence, late diphthong glides, held-note consonants and combined whistle
articulation. Typechecking also passes.

Browser interaction and visual QA remain untested because browser access was
previously declined. Validation uses the actual acoustic renderer, telemetry,
audio decoding, repository tests and deployment checksums.
