# Nat King Cole — Autumn Leaves

Open `?scene=autumn-leaves`. The full supplied television performance is included as a 159.337-second scene, including a short engine release. It is added alongside the existing collection. The user chose a recreation of the video and explicitly requested black and white.

## Singing and accompaniment

The user approved the 30-second, music-backed preview from 19–49 seconds: “Sounds good—use this.” Its physical body, voice settings and phonetic phrasing are retained in the full performance. The unchanged airway engine generates the singer through `planPart` → `planPerformance` → `renderPart`. The mouth channel contains no original singer samples, vocoder or voice-clone output; no engine, calibration or judge code changed.

The prepared score contains 117 words, 137 syllables and 27 connected phrases, with 2,771 source pitch/breath points. Dictionary phones are aligned locally to the supplied recording. Consonants retain articulation time, vowels sustain the notes, diphthongs glide late, and source pitch preserves slides and vibrato. The adult male body and voice parameters follow the successful Smile approach: pressure 7.8, brightness 0.60, breathiness 0.025, tension 0.52 and no random pitch drift.

Focused transcription checks recover the first “went,” both complete ending phrases and the second “all,” and resolve recognition errors using the repeated passages in the supplied performance. Vocal envelope and pitch measurements preserve the final held note through about 2:30.7; the complete musical ending follows. No external lyrics were retrieved.

Original accompaniment remains at the source speed and on the same clock. Separation stays continuous after the brief opening, including vocal rests and the final sustain. It can retain faint recorded-vocal traces; source vocals are not deliberately restored. Voice audio, the original music and 20 Hz mouth telemetry share the 48 kHz synthesis clock.

## Black-and-white stage

The supplied video was inspected across its full duration. The scene includes a grey suit, white collar, patterned long tie, pocket square, short hair, gentle hand movements, nods and turns, a dark reed screen, branching garden foliage, flowers in urns and a fan-backed woven chair. The automatic camera starts wide, moves to a close-up and returns wide for the ending; manual chair and garden views are also available. The original video is not embedded.

All colours are monochrome, including the normally coloured physical airway. Desaturation happens only in the stage's own display buffers after each head update. Shared engine/model data and other scenes' colours remain untouched. The player retains one voice-model lease; the stage borrows it and disposes only its own graphics. Poses, fades and camera framing use absolute time and restore after seeking.

## Rebuilding and validation

Six prepared assets include scene/captions/cameras, explicit performance score, stereo mix, original accompaniment, compressed mouth telemetry and credits. The input video, separation stems, model weights and analysis caches remain local and are excluded from the repository.

```sh
bun tools/render-autumn-leaves-scene.ts
bun run content:manifest
bun run verify:content
```

The included score, backing, WASM and ffmpeg suffice for rebuilding. Checks cover both verses, the sustained ending, phrase audibility, finite synchronized telemetry, quiet ending, black-and-white colours, seek restoration, head framing and borrowed-model ownership. All 472 previous public assets must remain byte-identical; the new manifest contains 478 files.

Native projected views provide visual inspection in portrait and landscape. Browser, Playwright and layout-lint access remain declined in this project; browser/GPU playback and recording/export interactions are unverified. Pronunciation, pitch tracking, likeness and staging remain approximate.

The final render contains 7,648,178 stereo frames and 3,187 finite telemetry frames; the decoded MP3 peak is 0.860. All 27 phrases are audible. The 24 sampled held-vowel windows stay within 17.4 cents of the planned waveform pitch. All 472 previous public assets remain byte-identical.

The unchanged scene-clarity listening aid completed. On isolated caption excerpts over the accompaniment, English Whisper marked 55 of 117 words as errors (47.0%). Short fragments and some consonants remain limitations of the stylized voice. This is a listening diagnostic, not a pronunciation-quality pass; the full performance retains the voice the user approved.

Validation passed 144 native tests (two existing ignores), 320 Bun tests across 81 files, TypeScript, the 478-file content manifest and the subfolder production build. Local HTTP checks served the direct scene route, app bundles and all six new files with matching bytes.
