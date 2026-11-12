# It’s All Coming Back to Me Now — the stormy mansion

Open `?scene=celine-coming-back`. This adds the complete supplied extended Céline Dion music video alongside the existing collection. The video is 459.021 seconds; the decoded audio is 459.000476 seconds. A 350 ms release gives the prepared scene a duration of 459.350476 seconds, approximately 7:39. The storm and motorcycle opening and the quiet ending are retained.

## Physical singing and original music

The featured vocal comes from CHIMERA’s physical airway, through the ordinary `planPart` → `planPerformance` → `renderPart` path. It is not a vocoder, voice clone or filtered original singer. A local separation supplies the original stereo instrumental accompaniment at its original speed. The original storm opening is retained before the singing; a crossfade at 46–47 seconds switches to the separated bed, which stays continuous through every vocal rest and the ending. Faint vocal traces may remain in the accompaniment.

Local recognition and source checks produce 637 words and 744 dictionary syllables. A cached phoneme model aligns consonants and vowel anchors. Complete consonants, held vowels, late diphthong glides and the source’s continuous pitch preserve the delivery. The prepared lead has 47 connected phrases and 5,093 pitch/breath points, within the existing performance and gesture bounds. Weak pitch detections are excluded; no key quantization, tempo change or fixed replacement melody is applied. The arrangement reconstructs the featured lead with one physical singer; the recording’s layered backing choir is not separately reproduced.

The user approved the playable 33-second MP3 chorus preview at source seconds 131–164: “It plays—sounds good, use this.” It includes faster words and sustained high notes. The full render retains those physical voice settings, phoneme durations and melody. Pronunciation, polyphonic pitch tracking and the stylized voice remain approximate.

## Scene

The source video was inspected at 32 points across its full duration. The reconstruction includes the mansion exterior and road, motorcycle and storm, candlelit bedroom, photograph, fireplace, arched hall, side staircase, chandelier, mirror, pale flowing robe, short hair, wind-filled windows, ghostly companion, warmer memories and closing doorway. Camera cuts follow the corresponding source passages. The supplied video is not embedded.

The singer and mirror use the same physical articulation and one retained model lease. The silent companion is a lightweight decorative figure. Rain remains outside or on the windows. Curtains, fire, candles, gestures, the motorcycle, lightning, ghost appearances, door and final fade use absolute source time, so seeking backward restores the scene. The stage releases its own graphics and leaves the borrowed voice model to its owning lease.

## Rebuild and verification

The six prepared files are the scene and captions, explicit performance, mix, instrumental backing, compressed telemetry and credits. Source video/audio, stems, recognition and alignment outputs, model weights, render intermediates and analysis caches remain outside the repository.

```sh
bun tools/render-mansion-scene.ts
bun run content:manifest
```

The rebuild uses the included score, instrumental asset and engine, plus ffmpeg. It needs no original input recording or downloaded model.

Checks cover the complete duration, audible physical phrases, quiet vocal rests, stereo backing, unclipped output, absolute telemetry, scene validation, desktop/portrait framing, finite line buffers, seeking, closing fade and borrowed-model ownership. The full voice has 9,188 telemetry frames. Recorded timestamps use their exact sample-frame clock; the solver’s sub-millisecond look-ahead is not carried into that metadata. A constant 0.905264 headroom trim applies equally to voice and music, preserving their balance. The decoded mix peaks at 0.918541. All 448 earlier public assets remain byte-identical.

Validation passed: 144 native tests (two existing ignored tests), 304 Bun tests across 77 files, TypeScript, all 454 public asset hashes and the static production build for `/chimera-song-mouth/`. A local HTTP check served the direct scene route, app bundles and all six new scene assets correctly. The published score matches the approved preview score exactly except for the constant headroom trim.

The unchanged small.en speech diagnostic reports 256 of 637 words misheard (40.2%), spread across 65 of 74 lines. This is a remaining intelligibility limitation and an imperfect speech-recognition measure of high-register singing, not a pronunciation pass. The user-approved chorus is retained without retuning to the recognizer.

Native projected views are inspected. Browser, Playwright and layout-lint access remain declined in this session; browser playback, GPU rendering and recording/download interaction are not verified.

## Published version

Application commit `4ef49fd` was pushed to `main` and deployed on 2026-11-12. The publisher uploaded 16 changed files, with the entry page last, and exited successfully. HTTP verification matched 160 live files to their expected SHA-256 hashes, including the new scene, app bundles and preserved content. The direct `https://agenticspiros.com/chimera-song-mouth/?scene=celine-coming-back` route serves the updated app. This verifies deployment bytes, not browser playback.
