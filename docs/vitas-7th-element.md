# Vitas — The 7th Element

Open `?scene=vitas-7th-element`. The complete supplied video lasts 249.301 seconds. The prepared scene includes its original audio timeline and a 350 ms release, for 249.639456 seconds (approximately 4:10). It is added alongside the existing collection.

## Physical vocal and tongue flutter

The featured vocal uses `planPart` → `planPerformance` → `renderPart`, with the existing physical airway and unchanged WASM. Source-aligned acoustic phoneme landmarks and a continuous pitch contour supply Russian phrases, rhythmic nonsense, rapid improvisation and the final high vocalise. The score has 60 connected phrases and 6,523 pitch/breath points. The performer uses a female blend of 0.48 and child blend of 0.04; these tract settings shape the synthetic voice, rather than cloning the source singer. There are no vocal effects or recorded samples in this channel.

The user rejected the first preview’s tongue sound. Acoustic recognition had treated several rolling sounds as gaps, leaving missing vocal intervals. A first correction alternated native alveolar taps and vowels, but the closure suppressed the synthetic flutter to about 0.031 RMS. The approved mouth-only revision alternates native lateral tongue movements and open vowels at approximately 15 Hz, preserving airflow and raising that passage’s physical RMS to about 0.172. The user’s response was “Yes—use this approach.” The same articulation is used across all eight rolling passages; the second high chorus is measured 90 seconds after the first. It is the mouth’s own approximation of the trick, not the original tongue recording.

The score retains the high wordless ending through 232.4 seconds. Phoneme recognition’s unreliable high-register tokens and a hallucinated closing subtitle credit are excluded. Captions show the clear Russian phrases, approximate vocalise and rolling passages, without inventing English lyrics for the nonsense.

## Original accompaniment

The original stereo music stays at the supplied speed, with no opening offset. Demucs supplies a continuous instrumental bed. A second cached Mel-band Roformer separation targets the two rolling choruses and final high vocalise; its instrumental output is blended at the original source times around those passages. This reduces the risk of the recorded tongue sound masking the physical attempt. Separation can still leave residual vocal traces; the generated voice itself contains no source audio. No original vocal mix is restored between phrases.

## Scene and ownership

The video was inspected at 32 points. The procedural scene reconstructs the silver fitted suit, high ribbed collar, fluted shoulders, sculpted dark-silver headpiece, coloured circles on the floor and backdrop, four tall checkerboard/striped dancers, side railings, star decorations, sweeping lights and a waving audience. Source-timed raised arms, open-arm poses, turns and leaning accompany the camera cuts. The final arms-open pose and hand-on-hip/raised-arm movement follow the reference approximately. The physical airway remains visible inside the head.

Only the singer owns a physical model lease. Decorative figures do not synthesize extra voices. The stage borrows that model and disposes only its own graphics. Poses, lighting and audience movements use absolute time so pause and backward seek restore the scene.

## Rebuilding and checks

Six prepared files are included: scene/captions/cameras, explicit performance, stereo mix, original instrumental bed, compressed mouth telemetry and credits. Raw source media, analysis files, models and intermediate stems are excluded.

```sh
bun tools/render-vitas-scene.ts
bun run content:manifest
bun run verify:content
```

The included score, backing and WASM plus ffmpeg are sufficient for a rebuild. Recorded telemetry timestamps use exact sample-frame time. Tests cover the full scene, audible lateral flutter, physical score bounds, voiced ending, silent instrumental tail, clocks, finite geometry, deterministic seeking, portrait/landscape head framing and borrowed-model ownership. All earlier prepared assets must remain unchanged.

Native projected views support visual inspection. Browser, Playwright and layout-lint access remain declined in this project; GPU playback and recording/export interactions are not verified. Pronunciation, pitch tracking and the stylized staging remain approximate.

Final validation: 144 native tests passed (two existing ignores), all 308 Bun tests passed across 78 files, and the four Vitas tests passed again against the cleaned final mix. TypeScript checks, the 460-file content manifest and the subfolder production build passed. All 454 earlier public files remain byte-identical. The decoded stereo mix contains 11,982,694 frames at 48 kHz, peaks at 0.926 and has no clipping; the voice has 4,993 finite telemetry frames on the exact 20 Hz recorded clock. The approved preview's voice, body and tongue articulation were compared with the full score and retained.
