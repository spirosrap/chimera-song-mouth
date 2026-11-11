# Starman — original music and a physical singer

The full David Bowie recording supplied by the user is the seventeenth song at
`?song=starman`. Its original guitar, string and drum backing stays at its original
speed. CHIMERA's physical mouth generates the lead, with synchronized words and
mouth animation. The prepared duration is 4:18, including 350 ms of release.

The source was separated locally. A local transcription and phone alignment were
corrected for held diphthongs, weak consonants and repeated phrases. The score
contains 395 words, 434 syllables and 36 connected phrases. Brief consonants,
held vowel nuclei and late diphthong glides keep the words connected. The vocal
ends at 4:12.94; the complete source recording and its final fade are retained.

All six cycles of the sung la-la ending are included: 96 syllables. Repeated
identical phones can confuse recognition near cycle boundaries, so the ending
uses the recording's changing beat clock and the repeated musical motif. The
existing level automation fades the generated mouth audio with the recording;
this preserves viable vocal-fold pressure through the final syllables. It adds
no recorded vocals, synthetic instrument source, echo or pumping effect.

Stable melody targets and within-vowel changes were reviewed against
[A. Valle's melodic transcription](https://www.alessandrovalle.com/partiture/Starman.pdf)
and the supplied source, in the sung register. Independent instrumental passages
measure tuning offsets of +5.7, +8.7, +4.8 and +6.9 cents; the singer uses +6.5 cents.
This avoids copying unreliable pitch-tracker slides, octave errors and unvoiced
frames directly into sung notes. Delayed vibrato is restrained to 14 cents.

The chorus ending was revised after the user identified wrong notes in the first
preview. The recording takes `me` down to F4, alternates F4/G4 across the first
children line, and uses a different final descent from the flute transcription.
All three refrains now follow those recorded notes. Earlier vowel anchors and
short falling releases prevent the final `it` syllables from hanging into the
next pickup. The user approved the corrected ending preview. These entries and
phrase endings have dedicated regression checks.

The physical voice uses the softer Life on Mars settings: a male body, pressure
7.2, brightness 0.46, breathiness 0.04 and no random pitch drift. Higher held rounded
vowels use a more open mouth shape. `planPart` and `renderPart` synthesize the voice
at 48 kHz and capture mouth telemetry from the same render. This is not a vocal
recording passed through a robotic filter. Pronunciation and timing remain
approximate.

During singing, the backing uses the separated stereo instrumental stem. In the
instrumental passages, the unaltered supplied audio is restored with crossfades
outside the vocal tails. No tempo or pitch change is applied. Resampling and
constant gain provide playback compatibility and headroom. Separation may leave
faint original vocal traces.

The existing singer view supplies synchronized lyrics, mouth word overlays,
separate music/voice levels, mute, solo, seeking and WAV export. All 257 previously
prepared public files are preserved byte for byte.

## Rebuild

```sh
bun tools/render-prepared-voice.ts starman lead
bun run content:manifest
bun run test --timeout 15000
bun run typecheck
bun run build:static --base=/chimera-song-mouth/
```

The committed score includes the timed phonetics, melody, ending and fade.
Rebuilding requires ffmpeg but no original recording, transcription model or
analysis cache. The asset version is `starman-tuned-20261111`.

Validation covers all vocal phrases and the complete ending, silent instrumental
rests, the octave leap, source-clock pitch following, finite moving telemetry,
stereo backing and mix headroom. Repository checks and the subfolder build are
used. Browser interaction and visual/recording QA are not performed because
browser access was previously declined.
