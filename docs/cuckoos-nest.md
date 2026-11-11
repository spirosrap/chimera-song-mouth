# One Flew Over the Cuckoo’s Nest — you’re not crazy

The complete user-supplied 62.18-second clip is available at `?scene=cuckoos-nest`.
Prepared playback lasts 62.53 seconds including the final release. All eighteen
songs, seven preceding movies and the speech remain available.

CHIMERA's physical airway engine generates McMurphy, Billy and the short patient
replies. Four prepared voice tracks cover 130 words in 22 phrases. The brief
affirmations use explicit nasal articulation rather than dropping tokens the
dictionary cannot pronounce. Martini's assent uses two breath pulses with sealed
lips, an open nasal route and a rising second hum, avoiding an unintended spoken
vowel between the hums. Billy's four repeated words and the original
hesitations remain separate from McMurphy's more emphatic delivery.

The pronunciation pass gives consonants and stressed vowels explicit durations,
balances natural spacing with source word anchors, and uses available pauses
where a phrase needs more room. Adjacent clauses share their speaking interval
when a short question would otherwise be squeezed too tightly. The source word
anchors remain stored in the score. Captions and mouth movement follow the
generated speech. No engine or calibration tables changed.

Original room ambience and background reactions are retained, with separated
accompaniment around featured dialogue. Separation may leave faint vocal traces.
No recorded actor voice or voice filter is used in the generated voice channels.
The original video, stems, models and analysis caches are excluded from the repo.

## Staging and files

The independent `ward` setting contains nine seated characters, wooden chairs,
ward windows, radiators, a notice board, clock and flowers. McMurphy's blue collar,
Cheswick's glasses, Scanlon's beard, patient clothing, nurses' caps, clipboard and
pen follow the supplied clip. McMurphy gestures, Billy looks down during his
hesitant response, the patients react, Cheswick withdraws behind his clothing,
and the final camera shows the two nurses.

The four speakers use the actual synthesis telemetry. Five silent listeners use
neutral mouth articulation and source-timed poses. The scene borrows the mounted
speaker model leases and owns one shared neutral nurse model. Pause and backwards
seek preserve the gestures. Existing subtitles, audio download and live video
recording controls are reused.

Nine files provide the complete scene: `scene.json`, `performance.json`,
`mix.mp3`, `backing.mp3`, four `.tele.gz` tracks and `credits.txt`. All telemetry
tracks cover the full scene clock, including silent intervals.

## Rebuild and validation

```sh
bun tools/render-cuckoo-scene.ts
bun run content:manifest
bun run test --timeout 15000
bun run typecheck
bun run build:static --base=/chimera-song-mouth/
```

Rebuilding requires ffmpeg, the stored score and backing, without the source
video or analysis models. Checks cover complete dialogue, brief replies,
repeated words, physical articulation, audible phrases, silent pauses, telemetry
clocks, phrase releases, camera timing, desktop/mobile framing, grounded feet,
seeking, model ownership and disposal. Native geometry projections support
staging review. All 296 preceding public files are preserved byte for byte.

Browser playback, layout and recording QA remain unverified because browser
access was previously declined.
