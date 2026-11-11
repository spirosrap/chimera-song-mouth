# Cry Me a River — original accompaniment and physical singer

The complete Julie London recording supplied by the user is the nineteenth song
at `?song=cry-me-a-river`. The file identifies the recording as *Julie Is Her Name*
(1955), with music and lyrics by Arthur Hamilton. Its 178.573-second source clock
is preserved, followed by 350 ms of release.

One CHIMERA airway generates the singer from a prepared phonetic score: 144 words,
176 syllables and 20 connected phrases, with 24 caption lines. The user approved
the music-backed 16–48 second opening preview; the full song retains that voice
and phrasing. The
recorded vocal is used locally to measure words, articulation, pitch and phrasing;
it is not copied into the mouth channel or passed through a robotic voice filter.
Consonants are short, sustained vowels stay connected, and diphthongs glide late.
Measured continuous pitch preserves the recording's slides and vibrato. The
voice uses an adult body blend of 0.65 female, pressure 7.5, brightness 0.48,
breathiness 0.055 and no random pitch drift.

The quiet final refrains were checked with a second local transcription pass and
phonetic emissions. The initial recognition confused those words with a different
sentence. All repeated refrains remain, with source-measured level automation
for the fade. The same automation is included when rebuilding the singer.

The original guitar and bass accompaniment stays at its original speed and pitch.
Sung sections use locally separated instrumental audio. Instrumental passages
restore the supplied recording, with crossfades outside vocal tails. Resampling
and constant gain provide playback compatibility and headroom. Separation can
leave faint vocal traces; transcription and pronunciation remain approximate.
Original recordings, analysis stems, model caches and working previews remain
local, outside the repository.

Audio and mouth telemetry share the 48 kHz synthesis clock. The existing solo
singer presentation supplies synchronized lyrics, mouth animation, independent
music/voice controls, seeking and WAV export. Existing song and scene assets are
preserved byte for byte.

## Rebuild

```sh
bun tools/render-prepared-voice.ts cry-me-a-river lead
bun run content:manifest
bun run test --timeout 15000
bun run typecheck
bun run build:static --base=/chimera-song-mouth/
```

The score contains the complete timed phonetics, pitch contour and fade. Rebuilding
the physical singer requires ffmpeg, but no source recording or analysis model.
The media version is `cry-me-a-river-20261111`.

Validation covers full-duration audio, audible phrases, quiet rests, finite moving
telemetry, synchronized asset lengths and mix headroom, alongside repository
tests, typechecking, a static build and live file verification. Twenty-four sampled
waveform pitch checks stayed within 20.2 cents of the planned melody. Browser playback,
layout and recording checks are not performed because browser access was
previously declined.
