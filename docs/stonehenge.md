# Ylvis — Stonehenge

Open `?scene=stonehenge`. The full supplied 235.541-second music video becomes a 235.87-second prepared scene, including a short release after the audio. It is added alongside all existing songs and scenes.

## Singing and source timing

The user approved the first 28-second chorus preview: “Sounds good—use this.” Its male body, voice settings and connected phonetics are retained in the full performance. The existing physical airway generates every foreground phrase through `planPart` → `planPerformance` → `renderPart`; the generated voice contains no original vocal samples, vocoder or audio effects. No engine, calibration or speech-judge code changed.

The locally transcribed score contains 357 words, 441 syllables, 34 connected phrases, 2,864 source-pitch/breath points and 5,156 planned gestures. Dictionary phonemes are aligned to the supplied vocal, consonants retain articulation time, and diphthongs hold their initial vowel before a short glide. The video's own subtitles resolve recognition errors in the food names, stone-age verse and car exchange. The brief opening hum in the final exchange is given a voiced nasal syllable. The conversational verses, belted questions and closing response all use one physical singer with source-driven pitch and breath; recorded overdubs are not separately cloned.

Original accompaniment stays at the supplied speed with no opening offset. The instrumental introduction is retained up to nine seconds and crossfaded into the separated backing before the first vocal entrance. Separation then remains continuous, including rests and the sunset ending. It can retain faint source-vocal traces; none are deliberately restored. The mix and mouth telemetry share an exact 48 kHz sample clock, with telemetry at 20 Hz.

## Staging

The reference was inspected across its full duration, including the embedded subtitles and detailed domestic and car shots. The procedural reconstruction includes the TV studio's desk, sofa, lamps, camera and audience; curly hair, suit and white shirt; exaggerated open-arm and pointing gestures; the kitchen and silent companion; bed and lamps; car interior, headlights and roadside caravan; an incomplete stone circle with inner trilithons; and a quiet sunset. Camera cuts and locations follow source time approximately. The supplied video itself is not embedded.

Poses, fog, location visibility and the closing fade use absolute time. The lying figures rotate along the bed rather than falling outside it. The singer's single model is retained by `MovieStage`; the stage borrows it and disposes only its own graphics. Decorative people do not allocate additional voice models. Portrait and landscape close-ups keep the physical head in view, including the bedroom and car.

## Rebuilding and validation

Six prepared assets are included: scene/captions/cameras, explicit performance, stereo mix, original instrumental backing, compressed telemetry and credits. Source recordings, model weights, analysis caches and intermediate stems are excluded.

```sh
bun tools/render-stonehenge-scene.ts
bun run content:manifest
bun run verify:content
```

The included score, backing, WASM and ffmpeg suffice for a rebuild. The final source render has 4,718 finite telemetry frames and 11,321,760 stereo audio frames; its decoded MP3 peaks at 0.713. All 460 earlier public assets remain byte-identical. Tests cover complete content, audible phrases, source-clock telemetry, silent ending, deterministic seeks, finite geometry, framing and borrowed-model ownership.

Native projected views support visual inspection. Browser, Playwright and layout-lint access remain declined in this project; browser/GPU playback and recording/export interactions are not verified. Character likeness, pronunciation, pitch tracking and staging are approximate.

Validation: 144 native tests passed (two existing ignores), 312 Bun tests passed across 79 files, and TypeScript, the 466-file manifest and the subfolder production build passed. Local HTTP checks served the direct route, application bundles and all six new assets correctly. The complete score's approved chorus articulation, pitch contour and voice settings match the preview exactly.

The unchanged scene-clarity listening aid also completed. On individually cropped captions over the music, English Whisper marked 192 of 357 reference words as errors (53.8%); fast lines, short cropped fragments and the car response remain limitations of the stylized delivery. This is not a pronunciation-quality pass. The user's listening approval applies to the chorus, and no judge-driven retuning was substituted for that approved voice.

Deployed on 2026-11-12 from application commit `75ca4ff` to [the Stonehenge scene](https://agenticspiros.com/chimera-song-mouth/?scene=stonehenge). All 16 changed files uploaded successfully, with the entry page last. HTTP checks verified 172 live files, including all new scene assets, the application bundles and preserved content; the direct scene route serves the deployed entry page.
