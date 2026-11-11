# Project Hail Mary — karaoke scene

The complete user-supplied 2:23 clip is a separate movie selection at
`?scene=project-hail-mary`. All eighteen songs, the three previous movies and the
speech remain available, with their prepared assets unchanged.

CHIMERA's physical mouth produces the singing and the short closing spoken line.
The prepared score contains 146 words, 182 syllables and 22 connected phrases.
Source-aligned vowel anchors, explicit consonant durations, held vowels and late
diphthong changes preserve the musical phrasing. Pitch targets were reviewed
against the supplied vocal; long vowels can contain note changes. The final
spoken line has a separate speech contour, avoiding applause being mistaken for
vocal pitch. No original singer recording or voice filter is in the generated
voice channel.

The user selected the higher voice after comparing pronunciation previews and a
lower octave. The accepted version gives the opening affricate more release
time, protects short vowels from consonant clusters, and uses clearer diphthong
endings. The repeated opening uses a rounded vowel in “stop,” a centering ending
in “your” and an unstressed vowel in “of.” These are prepared phonetic choices;
the engine and other songs' pronunciation are unchanged.

The stereo accompaniment retains the source speed and room ambience. During
vocal phrases it uses locally separated instrumental audio; outside the vocal
tails it returns to the supplied recording with crossfades. Separation may leave
faint vocal traces in the backing. The original intro, rests, applause and ending
are preserved. Prepared playback lasts 143.13 seconds including a short release.

`performance.json` holds the complete reproducible phonetic score. `mix.mp3`
combines the physical voice and `backing.mp3` with constant gains and headroom.
`singer.tele.gz` captures the actual mouth movements from the same synthesis.
`scene.json` supplies twenty subtitle cues and the camera cuts. Raw input video,
analysis stems, models and caches are not part of the repository.

## Staging

The separate `karaoke` setting has one speaking character and a silent listener.
The singer has shoulder-length hair, a dark outfit and a moving handheld
microphone. The seated listener has glasses, a cardigan, a hand-to-head reaction
and applause. A warm wireframe room includes a bar, bottles, ceiling lights,
porthole, karaoke screen and audience. Wide, singer and listener cameras follow
the supplied scene's cuts; the existing controls also allow a fixed camera.

Poses depend on absolute playback time, so pausing and seeking backwards do not
accumulate hand or microphone motion. The listener's independent neutral model
is owned and disposed by the room; the singer retains the existing mounted model
lease. This setting uses the existing subtitle, audio download and live video
recording paths.

## Rebuild and validation

```sh
bun tools/render-karaoke-scene.ts
bun run content:manifest
bun run test --timeout 15000
bun run typecheck
bun run build:static --base=/chimera-song-mouth/
```

The rebuild needs ffmpeg, the prepared score and backing, with no original video
or analysis models. Checks cover physical closures, complete phrase audio,
silent rests, synchronized telemetry, captions, camera cuts, mobile and desktop
framing, backwards seeking, disposal and preservation of the previous media.
Native geometry projections are used for staging review. Browser playback,
layout and recording QA remain unverified because browser access was previously
declined.
