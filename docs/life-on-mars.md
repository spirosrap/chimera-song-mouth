# Life on Mars? — a physical singer and the original music

The complete David Bowie recording supplied by the user is added as the
sixteenth song at `?song=life-on-mars`. The piano, strings, drums and other
instrumental parts stay on the original recording's clock. The lead is generated
by CHIMERA's physical vocal engine and has its own synchronized mouth animation.

The source was separated locally. Its 259 transcribed words are converted through
CMUdict into 312 sung syllables in 33 phrases. Overlapping local transcription checks resolve
word errors; instrumental-tail hallucinations are excluded. A cached phone model
aligns the consonants and vowels, and adjacent chorus lines with competing vowel
anchors are aligned together. Confident onset consonant releases anchor held
vowels so a late diphthong glide does not delay the beginning of a word. Short
consonants, sustained vowel nuclei and late glides preserve connected phrasing.

The first preview followed the source pitch too literally and the user heard it
as out of tune. Stable notes improved it, but specific high entries and descents
still sounded wrong. The final score checks both verses and choruses against
[vocal notation](https://sheetsfree.com/sheets/D/David%20Bowie%20-%20Life%20on%20Mars.pdf),
transposed down one semitone in the sung register to match the supplied video recording. Independent
instrumental passages measure tuning offsets of +30.1, +31.2 and +27.0 cents;
the generated voice uses +29.5 cents to sit with the unchanged backing.

Pitch changes within held vowels are explicit, including the intermediate steps
in the descending show phrases and final notes. Early high entries and the final
held word are anchored to their sung entrances rather than the late diphthong
release detected by the phone model. Restrained vibrato starts only after a vowel
settles. The score allows all chromatic notes and preserves its modulations.
The user approved the final version after the two high law/Oh entries used
more open vowel shapes and a softer source setting (pressure 7.2, brightness
0.46). The melody stays intact; these are physical mouth and source controls.

Genuine vocal rests remain rests, and the first chorus's descending vocal tail is
retained beyond the initial transcription's end timestamp.

`planPerformance`, `planPart` and `renderPart` generate the lead at 48 kHz using
the simulated airflow, vocal folds and tract. The corresponding telemetry is
captured from the same render. No original vocal samples, vocal effect or vocoder
are used in the lead. Pronunciation, transcription and timing remain approximate.

During singing, the backing uses the separated stereo instrumental stem. In
instrumental passages the unaltered source recording is restored, with crossfades
outside the vocal tails. There is no tempo or pitch change; resampling and constant
gain provide playback compatibility and headroom. Separation may leave faint
original vocal traces. The full musical performance is retained, plus 350 ms of release. Seven seconds
of near-silence from the supplied video intro are removed (peak below 0.0005),
so the music starts promptly. The prepared duration is 4:03.

The existing singer view provides lyrics, mouth word overlays, separate music and
voice levels, mute, solo, seeking and WAV export. The prepared phonetic performance
also remains editable and rebuildable through the existing physical engine.

## Rebuild

```sh
bun tools/render-prepared-voice.ts life-on-mars lead
bun run content:manifest
bun run test --timeout 15000
bun run typecheck
bun run build:static --base=/chimera-song-mouth/
```

Rebuilding reads the committed prepared score and preserves its accompaniment and
mixer levels. It requires ffmpeg, but no original recording, transcription model
or local analysis cache. The asset version is `life-on-mars-20261111`.

Validation covers the complete vocal ending, silent instrumental rests, audible
phrases, source-clock pitch following, finite moving mouth telemetry, stereo
backing and mix headroom. All 252 previous public files are preserved byte for
byte. Repository checks and the subfolder build are used; browser interaction and
visual/recording QA are not performed because browser access was previously declined.
