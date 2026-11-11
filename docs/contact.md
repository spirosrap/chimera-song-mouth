# Contact — first contact

The complete user-supplied beach clip is available at `?scene=contact`. Playback
lasts 299.19 seconds, including a short release after the source ending. The long
musical opening remains intact; the first dialogue begins around 1:50. All
eighteen songs, the four preceding movies and the speech remain available.

Both Ellie and the visitor in her father's form speak through CHIMERA's physical
airway engine. The prepared score contains 229 words across 47 phrases. Dictionary
phonemes, source word anchors and natural speech timing supply the articulation;
the dialogue is not a recorded-voice effect. The engine, calibration tables and
other performances are unchanged.

The user reviewed several exchanges and approved the final pronunciation after
identifying Ellie's “I was unconscious” as the remaining difficult passage.
Her phrasing now gives consonants and diphthongs more time, uses a fuller vowel
in “was,” and explicitly times the syllables of “unconscious.” The score blends
mostly natural phoneme spacing with source anchors. Extra time stays inside the
available pauses; the visitor retains the more source-aligned delivery. These
choices are stored in the score and survive a rebuild.

The stereo background preserves the original music, surf and ambience. Around
dialogue it uses locally separated accompaniment with crossfades; outside those
windows it returns to the original source. Separation may leave faint speech
traces. Neither generated voice channel uses recorded actor audio or voice cloning.

## Scene and files

The independent `beach` setting requires Ellie and the visitor. Ellie wears a
wireframe flight suit, headset and braid. The visitor has a tan shirt. The scene
includes palms, a curved shoreline, moving waves, stars and a spiral galaxy.
The arrival, embrace, seated conversation, falling sand and hand touch follow
absolute playback time. Pausing and backwards seeking do not accumulate motion.
Five camera views cover the whole scene, each speaker, the sky and the hands.
The automatic cuts follow the supplied clip.

Seven prepared files are included: `scene.json` contains captions and cuts,
`performance.json` contains the reproducible phonetic score, `mix.mp3` and
`backing.mp3` provide the audio, the two `.tele.gz` files record the actual mouth
articulation, and `credits.txt` describes the reconstruction. The source video,
analysis stems, models and caches are excluded.

Each head borrows its mounted voice-model lease. The beach releases its own
geometry without disposing those borrowed models. The setting uses the existing
subtitle, audio download and live video recording controls.

## Rebuild and validation

```sh
bun tools/render-contact-scene.ts
bun run content:manifest
bun run test --timeout 15000
bun run typecheck
bun run build:static --base=/chimera-song-mouth/
```

Rebuilding needs ffmpeg, the prepared score and backing, with no original video
or analysis models. The render helper skips the silent introduction and pads
neutral mouth telemetry on the same 50 ms clock. The final mix is trimmed by
sample count, preserving its complete duration.

Checks cover complete phrase audio, quiet rests, physical closures and frication,
telemetry timing, captions, camera cuts, desktop/mobile head framing, backwards
seeking, geometry disposal and preservation of all preceding public assets.
Native geometry projections are used for staging review. Browser playback,
layout and recording QA remain unverified because browser access was previously
declined.
