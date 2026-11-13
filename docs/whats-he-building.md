# Tom Waits — What’s He Building?

Open `?scene=whats-he-building`. The complete supplied recording becomes a staged workshop mystery, including its opening and long nonverbal ending. The supplied video is a still Mule Variations cover; the room and characters are an original interpretation of the earlier proposal, rather than scenes shown in that file.

The recovered proposal was an increasingly suspicious narrator obsessing over a neighbour, with a flickering workshop, unexplained shadows and machinery. The staging follows that idea with a physical narrator in a long coat, short rough hair and stubble, peering and listening gestures, a window, a covered mechanism, workbench and vice, hanging tools, shelves of jars, pipes and drifting haze. An opaque human-like shadow moves behind the machine, without revealing what is being built. The shadow uses filled geometry so it can darken the wall; the line kit’s maximum blending cannot produce dark shadows. Automatic camera cuts alternate the narrator and details of the room. Detail views hide the foreground narrator to avoid a near-camera head obscuring the window.

## Physical speech and soundscape

The unchanged physical airway generates all featured narration through `planPart` → `planPerformance` → `renderPart`. The prepared mouth track uses no source voice samples, vocoder, voice clone or effect on the recording. No engine, calibration or speech-judge code changed.

The user approved the opening 8–38 second preview: “Sounds good—use this.” The full performance keeps its voice parameters, physical body and speech timing. The locally transcribed score contains 283 words and 350 syllables in 49 phrases, with 3,202 planned gestures. Dictionary phonemes are aligned to the supplied vocal, with `clearPhrases` and `CLEAR_SPEECH_TIGHT` providing natural speech durations. Within each word, 55% natural-duration guidance and 45% source alignment preserve consonants and the original timing. Pauses remain where the source pauses; diphthongs glide late. The measured speech pitch and energy supply the changing intonation and breath, with an adult male body, pressure 7.2, brightness 0.47, breathiness 0.065, tension 0.44 and no random pitch drift. This is a low mechanical interpretation rather than an imitation of the recorded singer’s throat.

Two focused source checks resolve an ambiguous surname and confirm the unusual place name. The split “ex-wife” token is joined, and a duplicated low-confidence conjunction is removed. No external lyrics or transcript were retrieved.

The original nonverbal soundscape stays at its original speed and on the same clock. The opening is retained before speech, then vocal separation remains continuous through the pauses and ending. Separation may leave faint original speech traces. Prepared audio and 20 Hz physical telemetry share the 48 kHz synthesis clock.

## Timing, ownership and rebuilding

All gestures, light changes, shadow motion, haze, camera positions and fades depend on absolute scene time. Pausing and seeking restore them directly. `MovieStage` retains one voice-model lease; the workshop borrows it and disposes only its own graphics. The mystery is not resolved by the animation.

Six prepared assets include the scene/captions/cameras, explicit phonetic score, stereo mix, original soundscape, compressed telemetry and credits. The source recording, separated analysis stems, model weights and caches remain local and are excluded from the repository.

```sh
bun tools/render-whats-he-building-scene.ts
bun run content:manifest
bun run verify:content
```

The included score, backing, WASM and ffmpeg suffice for rebuilding. Checks cover complete dialogue, audible phrases, quiet opening/ending, finite sample-clock telemetry, opaque shadows, source-time seek restoration, narrator framing and borrowed-model ownership. All 478 previous public assets must remain byte-identical; the new manifest contains 484 files.

Native projections support visual inspection. Browser, Playwright and layout-lint access remain declined in this project; browser/GPU playback and recording/export interactions remain unverified. Speech, timbre, pronunciation and staging are approximate.

The full render is 200.669 seconds, with 9,632,091 stereo frames and 4,014 finite telemetry frames. Every phrase is audible, the decoded MP3 peaks at 0.743, and all 478 earlier public assets remain byte-identical. The final 20-second soundscape and visual ending are retained.

The unchanged scene-clarity listening aid completed. On isolated caption excerpts over the original soundscape, English Whisper marked 98 of 284 normalized reference words as errors (34.5%). This diagnostic splits hyphenated words, hence its extra reference token. Short fragments and low-register words remain limitations. It is a listening aid rather than a pronunciation-quality pass; the approved preview’s voice is retained.

Validation passed 144 native tests (two existing ignores), 324 Bun tests across 82 files, TypeScript, the 484-file content manifest and the subfolder production build. Local HTTP checks served the direct scene route, app bundles and all six new files with matching bytes.
