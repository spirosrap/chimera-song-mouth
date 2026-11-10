# Included content

Every prepared media file below is tracked in this repository. All 224 public files have SHA-256 checksums in `MEDIA-MANIFEST.json`. Durations are approximate; some include a short release.

## Songs

| Selection | Duration | Route | Presentation |
| --- | --- | --- | --- |
| House of the Rising Sun | 2:49 | `?song=house-of-the-rising-sun` | Seven voices; default |
| All Made of Air | 0:35 | `?song=all-made-of-air` | Original seven-voice piece |
| Neon Current | 3:03 | `?song=neon-current` | Original wordless electronic choir |
| BICEP — Glue | 4:30 | `?song=bicep-glue` | Nine-mouth wordless remake; synthesized vocal, connected harmonies and shuffled percussion |
| Night Train Radio | 2:26 | `?song=night-train-quartet` | Mr. Sandman tune; newly written words; quartet |
| Συννεφούλα | 2:15 | `?song=synnefoula` | Wireframe singer with hat, guitar and microphone; Greek vocals and mouth whistles over original instrumental backing |
| MEGALOVANIA | 2:36 | `?song=megalovania` | 24 pitched mouths following the reference's singers, octaves and DA/DUM/OOH syllables |
| BICEP — Apricots | 4:09 | `?song=bicep-apricots` | Original vocal sample with nine mouths playing the accompaniment |
| Τα παιδιά του Πειραιά | 3:19 | `?song=ta-paidia-tou-peiraia` | Greek robotic singer, instrumental backing and animated finger clicks |
| Rodehihi — Δεν ξανακάνω φυλακή | 3:12 | `?song=rodehihi-den-xanakano-fylaki` | Robotic Greek singer following the source phrasing, original instrumental backing and complete ending |
| Small Hours | 3:31 | `?song=small-hours` | Original wordless electronic piece for twelve mouths |
| Country Roads | 3:15 | `?song=country-roads` | One robotic singer, original instrumental backing and synchronized melody graph |

Each song’s `public/band/<id>/` directory contains the prepared score, MP3 channels and compressed mouth telemetry as applicable. Non-voice channels such as the instrumental backing and finger clicks do not need telemetry. Credits accompany the adapted content. Small Hours has no source recording: its score is written in `src/band/smallHours.ts`, and `bun tools/render-band-song.ts small-hours` (needs ffmpeg; about seven minutes on 16 cores) rebuilds its twelve channels and telemetry from the engine. The original full-lyrics Mr. Sandman version was declined and is not in the app; Night Train Radio is the accepted new-lyrics version.

The six other songs with lyrics now use explicit sung phoneme timing following
the Country Roads refinement. See [the phrasing notes](docs/lyric-song-phrasing.md)
for the preserved accompaniment, Greek accent and whistle behavior.

MEGALOVANIA now follows Radixán's MIDIlovania score and the supplied video's
24-mouth settings. See [the arrangement notes](docs/megalovania-reference.md)
before rebuilding its voices; the older fakt13 arrangement had different parts.

Apricots retains the original stereo vocal sample selected by the user, with nine
physical mouths providing the accompaniment. See [the arrangement notes](docs/apricots-arrangement.md)
for the source timing, preserved recording and regeneration instructions.

Glue keeps its vocal and every instrument synthesized by the mouths, as selected
by the user. See [the Glue arrangement notes](docs/glue-arrangement.md) for the
connected vocal, stable pitch lanes and separate kick/clap parts.

## Movie scenes

| Scene | Duration | Route | Included files |
| --- | --- | --- | --- |
| A Few Good Men — courtroom | 2:08 | `?scene=a-few-good-men` | Synthetic dialogue mix, four voice telemetry tracks, captions, shots, scene data and existing subtitled H.264/AAC `for-x.mp4` |
| The Princess Bride — Cliffs of Insanity | 2:20 | `?scene=princess-bride` | Synthetic dialogue mix, three voice telemetry tracks, captions, shots and scene data |
| 2001: A Space Odyssey — HAL 9000’s memory core | 3:07 | `?scene=hal-9000` | Synthetic dialogue and song mix, two voice telemetry tracks, captions, shots and scene data |

The 3D environments, characters, camera behavior and browser recording/export code are part of the source. All three scenes offer live video recording; only A Few Good Men currently has a pre-encoded MP4 download.

The HAL 9000 scene has no source clip: its line starts are timed by hand from the script and every line’s end is the engine’s own. `bun tools/render-hal-scene.ts` (needs ffmpeg) rebuilds its mix, telemetry, captions and shots from the engine; the room’s modules, light and cameras follow `src/scene/core.ts`. “Daisy Bell” is entered as notes and slows and falls in pitch as it is sung. Original movie source video/audio is not needed for playback and is not served.

## Single-mouth player

`?solo=1` includes the song/MIDI import player and original CHIMERA controls. Imports happen in browser memory and are not uploaded. All required engine code, fonts, dictionary and rendering assets are included.

## Scope of the export

This is the complete content of the running app, rather than a backup of the computer’s Music and Videos folders. Raw input recordings, source-separation stems used only for analysis, ASR models, temporary render files, development toolchains and caches are excluded. No external source recording is required to replay the prepared songs or scenes.
