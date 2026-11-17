# Joost — Europapa

Route: `?scene=europapa`.

The complete supplied video runs 201.735 seconds, with a 0.35-second release.
The owner approved the validated 24-second MP3 at source 53–77 seconds.
The full score retains its exact voice settings, phrases and continuous pitch.
One actual physical CHIMERA airway produces 49 phrases and 523 syllable events:
English introduction, Dutch lead, German and Italian lines, rapid pa refrains,
shouts and quiet closing tribute. Original instrumental music stays continuously
at the supplied speed. Source doubles are represented by one lead, rather than
independently reconstructed layers. Faint separation traces may remain.

Local eSpeak pronunciation dictionaries supply IPA text only; no eSpeak audio is
used. Dutch /ʋ/, /ɣ/, /x/, /ø/, /œ/ and /y/ use existing engine articulations.
The central rounded /ɵ/, which the current engine recognizes without sound, is
approximated by its supported close-mid rounded /ø/. Source-aligned complete
phones, connected vowels and measured continuous pitch drive physical synthesis.
No original vocal sample, clone, vocoder or recording effect substitutes for it.
Timing, transcription, pronunciation, articulation and pitch remain approximate.
Mouth telemetry is captured on the exact 20 Hz audio sample clock.

Four costume graphics borrow one retained model: pointed blue shoulders and
tie, giant black cowboy hat, white vest and glasses, and black guitar outfit.
Thirty-three source-timed cuts follow the title, windmill landscape, podium and
offset twin microphones, European flags, rural signs and apartment facade,
cluttered bedroom, blue-curtain dance, scooter and canal road, dinner with pizza
and fruit, rotating Dutch windmill and band, sunset silhouettes, library, rave,
night road, quiet firelit family tribute, photographs and ending dedication.
Friends, musicians and family are decorative proxies. All transforms restore
from absolute source time after seeks. Disposing graphics preserves the
player-owned physical model. Scenes, gestures and likenesses are stylized.
Source video, frames, brands, sponsor logos, raw stems, weights and analysis
caches stay private; the six prepared public scene files are self-contained.

Rebuild from the prepared score and backing with
`bun tools/render-europapa-scene.ts`, then `bun run content:manifest`.
The approved version is `europapa-20261117` for scene metadata, audio and telemetry.
All 871 preceding public assets remain byte-identical. The manifest contains
877 files, and the scene library has 71 concert/music-video performances.

Validation passed 195 native tests (two existing ignored), 602 unique Bun tests
across 146 files, five final focused geometry/camera tests, TypeScript and
content/WASM verification. The unchanged 256-step beat test exceeded its default
five-second deadline during concurrent CPU load and passed alone in 3.814 seconds.
No existing test assertions or timeouts changed. Thirty-eight native projections
cover 33 cuts and five phone views; head bounds and opaque-mouth rays cover each
cut at its start, middle and end on phone and desktop. Every physical phrase is
audible and telemetry is finite with exact clocks. Decoded MP3 length matches all
9,700,079 samples per stereo channel, with no extra padding and peak below 0.92.

Browser
playback, export and layout remain untested because browser access is declined
in this chat. Native Three projections and phone/desktop head-framing and
opaque-mouth-ray checks review the actual scene geometry instead.

Source: the owner-supplied official video,
<https://www.youtube.com/watch?v=gT2wY0DjYGo>.
Dutch transcription corrections were cross-checked against the recording and
[the official broadcaster text](https://www.eurovision.de/news/Songtext-Joost-Klein-Europapa,lyrics792.html).

Europapa is live at <https://agenticspiros.com/chimera-song-mouth/?scene=europapa>.
Runtime `d2a7fd9d661ac7b82cefac0e09c202a41eebb2b5` was committed and pushed before all 17 changed files uploaded
successfully with `DEPLOY_EXIT=0`, media first and entry page last. The final live
HTTP check matched all 376 checked files, including the current app bundles,
six Europapa assets and 52 preserved performances, plus the clean direct route.
The temporary upload job and plist were removed. All 871 preceding public files
remain byte-identical; the manifest contains 877 files and the library has 71
concert/music-video performances. Browser playback, export and layout were not
retested; native geometry, audio, telemetry and HTTP checks provide the evidence.
