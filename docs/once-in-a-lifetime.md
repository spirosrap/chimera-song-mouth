# Talking Heads — Once in a Lifetime

Open `?scene=once-in-a-lifetime`. The complete supplied official music video is included as a 225.05-second scene, with a short final engine release. All existing songs and scenes remain alongside it.

## Physical voice and original music

The user approved the 28-second preview spanning a spoken verse and the first sung refrain: “Sounds good—use this.” The full performance retains its male physical body, voice parameters, source pitch and phone timing. CHIMERA's existing `planPart` → `planPerformance` → `renderPart` path generates the featured voice. There are no vocal samples, voice clones, vocoders or voice effects in the synthesized track, and no engine, calibration or judge changes.

The prepared score has 418 words, 553 syllables and 85 phrases, 2,427 pitch/breath points and 5,017 planned gestures. Local recognition and phoneme alignment use the supplied recording; a separate pass recovers the opening and first refrain that whole-track recognition missed. Dictionary phones use `clearPhrases` with `CLEAR_SPEECH_TIGHT` as natural-duration guidance. Spoken words blend those durations with source alignment; singing gives held time to vowels. Consonant minima are allocated within each word's own window rather than shifting a whole fast phrase earlier. Alignment groups cannot consume the preceding group's phones. Diphthongs hold the main vowel before a short glide.

Original accompaniment remains on the source clock and at the original speed. The instrumental opening is retained through 26 seconds and blended into separation before the vocal entrance. Separation then stays continuous, including rests and the ending; it may leave faint recorded-vocal traces. Layered refrains are represented by one physical performer rather than separate recorded singer clones. The stereo mix and 20 Hz mouth telemetry use the same 48 kHz sample clock.

## The scene

The full supplied video was inspected across 32 source frames. The reconstruction includes the dark suit, pale shirt, bow tie, browline glasses, short hair, stiff knees, chopping arms, hands at the temples, backward lean, repeated figures, monochrome dance projection, blue-green water and the final small floating performer. The brief shirt-only close-up is retained. Thirty-one automatic cuts follow the source approximately; manual performer, water, copies and projection views are available. The original video is not embedded.

All poses, copies, water motion, visibility and fades depend on absolute scene time, so seeking does not depend on previous playback. `MovieStage` retains one physical model, shared by the lead and four visual copies. The stage borrows that model and disposes only its own graphics. Portrait and landscape close-ups keep the working mouth in view.

## Rebuilding and validation

The six included assets are the scene/captions/cameras, explicit performance score, stereo mix, original instrumental backing, compressed physical telemetry and credits. Original input media, separated analysis stems, models and caches are excluded.

```sh
bun tools/render-once-in-a-lifetime-scene.ts
bun run content:manifest
bun run verify:content
```

The score, backing, included WASM and ffmpeg suffice for a rebuild. Checks cover full content, physical phrase audibility, telemetry clock, opening/ending silence, seek restoration, finite geometry, head framing and borrowed-model ownership. All 466 previous public assets must remain byte-identical; the new manifest contains 472 files.

Native projected views provide layout inspection. Browser, Playwright and layout-lint access remain declined in this project, so browser/GPU playback and recording/export interaction are unverified. Pronunciation, melody tracking, likeness and choreography remain stylized approximations.

The final audio contains 10,802,378 stereo frames and 4,501 finite telemetry frames. Every phrase is audible, the decoded MP3 peak is 0.917, and a shared headroom trim preserves the preview’s voice-to-music balance. The approved voice parameters and full source-timed score are retained.

The unchanged scene-clarity listening aid completed on the final render. English Whisper marked 306 of 418 words as errors (73.2%) on isolated caption excerpts over the music. Some short fragments, consonants and repetitions remain hard for automatic recognition. This diagnostic is not a pronunciation-quality pass; the user’s approval applies to the preview, and the full render keeps that voice without judge-driven retuning.

Validation passed 144 native tests (two existing ignores), 316 Bun tests across 80 files, TypeScript and the subfolder production build. The final assets also passed all four scene tests, the 472-file manifest and local HTTP checks for the direct route, app bundles and six new assets. The later rocks-and-stones line retains the source word “Under”; the approved preview’s body, voice, phrases and pitch/breath contour remain unchanged.

Deployed on 2026-11-12 from application commit `4e09ced` to [Once in a Lifetime](https://agenticspiros.com/chimera-song-mouth/?scene=once-in-a-lifetime). All 16 changed files uploaded successfully, with the entry page last. HTTP verification matched 178 live files, including all six new assets, application bundles and preserved content. The direct scene route serves the deployed entry page.
