# Included content

Every prepared media file below is tracked in this repository. All 357 public files have SHA-256 checksums in `MEDIA-MANIFEST.json`. Durations are approximate; some include a short release.

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
| Blue Moon — Frank Sinatra | 2:52 | `?song=blue-moon` | One physical mouth singing a timed phonetic score, original orchestral backing and synchronized captions |
| Mr. Sandman | 2:26 | `?song=mr-sandman-quartet` | Original-lyrics quartet with physical mouth voices, rhythmic bum-bum bass, captions, microphone and four harmonic graphs |
| Be My Baby — The Ronettes | 2:40 | `?song=be-my-baby` | Original instrumental recording, one physical lead and two answering mouths with separate lyrics |
| Life on Mars? — David Bowie | 4:03 | `?song=life-on-mars` | Original instrumental recording, one physical singer, source-timed melody and synchronized words |
| Starman — David Bowie | 4:18 | `?song=starman` | Original instrumental recording, physical singer, full sung ending and synchronized words |
| Space Oddity — David Bowie | 5:05 | `?song=space-oddity` | Original instrumental recording, physical singer and overlapping robotic launch countdown |
| Cry Me a River — Julie London | 2:58 | `?song=cry-me-a-river` | Original guitar and bass accompaniment, physical singer and synchronized words |
| Smile — Nat King Cole | 2:56 | `?song=smile` | Original orchestral accompaniment, physical singer and synchronized words |
| Lose Yourself — Eminem | 5:27 | `?song=lose-yourself` | Original music, physical rap voice, rainy city background and word-by-word highlighting |

Each song’s `public/band/<id>/` directory contains the prepared score, MP3 channels and compressed mouth telemetry as applicable. Non-voice channels such as the instrumental backing and finger clicks do not need telemetry. Credits accompany the adapted content. Small Hours has no source recording: its score is written in `src/band/smallHours.ts`, and `bun tools/render-band-song.ts small-hours` (needs ffmpeg; about seven minutes on 16 cores) rebuilds its twelve channels and telemetry from the engine. Mr. Sandman is the newly requested original-lyrics quartet; Night Train Radio remains a separate selection with its newly written words.

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

Blue Moon uses the same prepared phonetic singing path as Country Roads.
Its lead and animation come from the physical engine; its original orchestral
backing stays on the recording’s clock. See [the song notes](docs/blue-moon.md).

Mr. Sandman uses four physical singers and a complete prepared phonetic score.
See [the quartet notes](docs/mr-sandman-quartet.md) before regenerating it; the
opening must retain each distinct bum-bum attack and the bass continues under
the words. All previous prepared media remain unchanged.

Be My Baby adds three physical singers over the original instrumental recording.
See [the song notes](docs/be-my-baby.md) for the independent lead and backing
phrases, source timing, fading ending and regeneration instructions.

Life on Mars? retains the full supplied recording and adds a physical singer with
source-aligned phonetics and continuous pitch. See [the song notes](docs/life-on-mars.md).

Starman retains the full instrumental recording with one physical singer and all six cycles of the sung ending. See [the song notes](docs/starman.md).

Space Oddity preserves the full original music, with separate physical mouths for the singer and overlapping launch countdown. See [the song notes](docs/space-oddity.md).

Cry Me a River retains the complete supplied Julie London recording’s accompaniment, with one physical singer following its melody and phrasing. See [the song notes](docs/cry-me-a-river.md).

Smile preserves the complete supplied Nat King Cole recording’s original orchestra, with one physical mouth singing the words. See [the song notes](docs/smile.md).

## Movie scenes and speeches

| Scene | Duration | Route | Included files |
| --- | --- | --- | --- |
| A Few Good Men — courtroom | 2:08 | `?scene=a-few-good-men` | Synthetic dialogue mix, four voice telemetry tracks, captions, shots, scene data and existing subtitled H.264/AAC `for-x.mp4` |
| The Princess Bride — Cliffs of Insanity | 2:20 | `?scene=princess-bride` | Synthetic dialogue mix, three voice telemetry tracks, captions, shots and scene data |
| 2001: A Space Odyssey — HAL 9000’s memory core | 3:07 | `?scene=hal-9000` | Synthetic dialogue and song mix, two voice telemetry tracks, captions, shots and scene data |
| Fool me once — George W. Bush | 0:25 | `?scene=fool-me-once` | One synthetic speaker, a wireframe press-conference setting, timed gestures, captions and close/wide cameras |
| Project Hail Mary — karaoke | 2:23 | `?scene=project-hail-mary` | Physical singing over original music, synchronized captions, handheld microphone, animated listener, audience and three cameras |
| Contact — first contact | 4:59 | `?scene=contact` | Two physical voices over original music and surf, synchronized captions, beach, palms, galaxy, gestures and five camera views |
| Arrival — meeting you | 0:30 | `?scene=arrival` | Physical dialogue over original background audio, synchronized captions, dusk field camp, Ian’s turn and Louise’s silent reaction |
| The Matrix — there is no spoon | 1:11 | `?scene=matrix-spoon` | Three physical voices over original background audio, synchronized captions, green waiting room, bending spoon, handoff and reflected face |
| One Flew Over the Cuckoo’s Nest — you’re not crazy | 1:03 | `?scene=cuckoos-nest` | Four physical voices over original room ambience, synchronized captions, nine seated characters, ward, gestures and nurses’ reaction |
| The Wonderful Wizard of Oz — the discovery of Oz, the Terrible | 3:12 | `?scene=wizard-of-oz` | Five physical voices with no source clip, the great Voice as the little man’s enlarged airway, synthetic hall, roar and falling screen, captions, shots and scene data |
| Cosmos — Carl Sagan’s fourth dimension | 7:24 | `?scene=sagan-dimensions` | Physical narration, original background, captions, desk, Flatland shapes, apple sections, cube and tesseract |
| Apollo 11 — the Eagle has landed | 4:20 | `?scene=apollo-11` | Three physical radio voices with no source recording, lines on the mission clock, the lander following the called heights and speeds, lunar surface, cabin and Houston sets, captions, shots and scene data |
| Apollo 13 — Houston, we’ve had a problem | 3:20 | `?scene=apollo-13` | Five physical voices with no source recording (crew, CapCom and flight director), the bang, alarm and venting on the scene clock, spacecraft, cabin and Mission Control sets, captions, shots and scene data |
| Nessun Dorma — opera concert | 4:32 | `?scene=nessun-dorma` | Physical Italian tenor and choir, original orchestra, extended finale, captions, conductor, musicians and audience |

The 3D environments, characters, camera behavior and browser recording/export code are part of the source. All fourteen scenes offer live video recording; only A Few Good Men currently has a pre-encoded MP4 download.

Project Hail Mary recreates the complete supplied karaoke clip. The physical singer
performs Sign of the Times and the closing spoken line, while the original music
and room ambience stay on the source clock. See [the scene notes](docs/project-hail-mary.md).

Contact includes the complete supplied beach scene and its long musical opening,
with Ellie and the visitor in her father’s form. See [the scene notes](docs/contact.md).

Arrival recreates the complete supplied “meeting you” clip, including its quiet
closing line and pauses. See [the scene notes](docs/arrival.md).

The Matrix recreates the complete supplied spoon scene, including the boy’s
demonstration, Neo’s attempt and the final invitation. See [the scene notes](docs/matrix-spoon.md).

Apollo 13 uses NASA’s transcripts as well, with the silences shortened and ten minutes skipped.
See [the scene notes](docs/apollo-13.md) for what is and is not from the record.

The Apollo 11 landing uses NASA’s transcripts of the crew and CapCom, not a recording.
See [the scene notes](docs/apollo-11.md) for the mission clock and what drives the picture.

The Wonderful Wizard of Oz is staged from the public-domain book, not from any film.
See [the scene notes](docs/wizard-of-oz.md) for how one airway speaks at two sizes.

One Flew Over the Cuckoo’s Nest recreates the complete supplied ward conversation,
including its brief replies and final reaction. See [the scene notes](docs/cuckoos-nest.md).

The speech is a short excerpt from an official public-domain presidential address.
Its voice is generated by the physical mouth; the pauses and gestures are staged
by hand. See [the speech notes](docs/fool-me-once.md) for sources and rebuilding.

The HAL 9000 scene has no source clip: its line starts are timed by hand from the script and every line’s end is the engine’s own. `bun tools/render-hal-scene.ts` (needs ffmpeg) rebuilds its mix, telemetry, captions and shots from the engine; the room’s modules, light and cameras follow `src/scene/core.ts`. “Daisy Bell” is entered as notes and slows and falls in pitch as it is sung. Original movie source video/audio is not needed for playback and is not served.

Lose Yourself adds the full supplied 5:27 recording with original instrumental music, a physical rap voice, a generated rainy city background, a circular mouth and synchronized word highlighting. Open `?song=lose-yourself`; see [the rap notes](docs/lose-yourself.md).

## Single-mouth player

`?solo=1` includes the song/MIDI import player and original CHIMERA controls. Imports happen in browser memory and are not uploaded. All required engine code, fonts, dictionary and rendering assets are included.

## Scope of the export

This is the complete content of the running app, rather than a backup of the computer’s Music and Videos folders. Raw input recordings, source-separation stems used only for analysis, ASR models, temporary render files, development toolchains and caches are excluded. No external source recording is required to replay the prepared songs or scenes.

The Sagan scene includes the complete supplied 7:23 clip, with a brief final voice release.
See [the scene notes](docs/sagan-dimensions.md).

Nessun Dorma includes the full supplied concert video, including the extended Turandot finale and applause. The separate opera setting has blue columns, a tenor at a stand microphone, a conductor, seated strings and brass, a choir and an audience. See [the scene notes](docs/nessun-dorma.md).
