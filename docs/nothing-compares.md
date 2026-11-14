# Sinéad O’Connor — Nothing Compares 2 U

Open `?scene=nothing-compares`. The complete supplied 5:08 official video is reconstructed with original instrumental accompaniment, one physical mouth-engine singer and the intimate portrait/garden presentation. The 55–87 second preview includes the first refrain. Pause after the finished performance before starting another selection.

## Physical singing and source timing

The unchanged CHIMERA airway generates the featured singer through `planPart` → `planPerformance` → `renderPart`. The vocal contains no recorded singer samples, clone, vocoder or effect applied to recorded vocals. Physical mouth telemetry is captured in the same synthesis run.

Local recognition on the supplied original mix provides an initial transcript. The missing departure word, the arms/reminder line and the flowers line are corrected before phonetic alignment, with isolated-vocal checks for difficult sustained words. A local phonetic CTC model aligns dictionary consonants and vowels to the supplied recording. Complete consonants, held vowels, late diphthong glides and measured continuous pitch preserve connected phrasing. Blank recognition frames do not become artificial pauses.

The prepared singer uses female body blend 0.62, pressure 7.8, brightness 0.50, tension 0.54, breathiness 0.025, zero random drift and no added vibrato. The complete score has 209 words, 273 syllables and 31 connected phrases. Short subtitle lines remain separate from the longer connected airway phrases. One featured lead is reconstructed rather than every recorded double. Transcription, pronunciation and pitch tracking remain approximate. No shared engine, calibration, dictionary, golden files or judges are changed.

Original instrumental music remains continuous at the supplied speed. The final singing ends around 4:25; the complete long garden-and-music outro remains. Faint vocal separation traces may remain. The stereo mix uses 48 kHz and physical snapshots use the exact 20 Hz sample clock.

## Portrait, expressions and garden

The supplied video was inspected across its duration. The scene follows the close portrait against black, close-cropped scalp hair and black high collar, restrained turns and lowered eyes, source-timed tears and the late garden superpositions. Formal paths, bare autumn trees, clipped conical hedges, wall fountain with flowing water, stone balustrade and urns, draped statue and a walking figure in a long dark coat replace a generic concert stage.

The close physical head follows the camera to retain the portrait framing. The walking head remains in the garden. Both borrow one retained voice model. Source-time pose keys control the turns, nods and eyelids; deterministic blinks, walking, tears, water and camera cuts restore directly after seeking. Stage-owned line colors and material opacity control the slow double exposure, preserving the model cache and recorded articulation. Repeated dissolves restore their original brightness rather than cumulatively darkening. Landscape uses the supplied 4:3 frame; portrait close-ups adapt to screen width.

The stage disposes only its own graphics and borrows the model for its mounted lifetime. Scenery, likenesses and expressions are stylized approximations; the source film itself is not embedded.

## Rebuilding and verification

Six prepared files include the explicit phonetic score, original backing, full stereo mix, one compressed telemetry stream, scene/captions/cameras and credits. Input video, separated stems, local analysis and model weights stay private and outside the repository.

```sh
bun tools/render-nothing-compares-scene.ts
bun run content:manifest
bun run verify:content
```

The prepared score, backing, tracked WASM and ffmpeg suffice to rebuild the voice, mix and synchronized mouth movement. Preserve all 613 preceding public assets byte-for-byte; the updated manifest contains 619 files.

Browser, Playwright and layout-lint access remain declined in this chat. Native projections and geometry checks do not verify browser/GPU playback or real-time recording/export interaction.

The full performance lasts 308.502018 seconds, including a 350 ms physical release, with 14,808,097 stereo frames and 6,171 snapshots. The decoded mix peaks at 0.8224; every physical phrase is audible and the voice is silent during the long instrumental ending. The scene has 34 subtitle lines and 15 source-time camera cuts.

The unchanged scene-clarity listening aid completed on 34 captions over the original music and marked 98 of 209 words as errors (46.9%). Sustained sung vowels and isolated short captions are difficult for this recognizer. This is a listening diagnostic, not an intelligibility pass; the supplied phonetic timing and preview settings are retained.

Validation passed 187 native tests (two existing ignored), 426 Bun tests across 105 files, TypeScript, all 619 public hashes and the unchanged WASM provenance. The subfolder production build and local HTTP checks cover every built media file, the direct route, app bundles and all six new files. Native projections were inspected for the tight portrait, lowered eyes, tears, paths, fountain, terrace, walking figure, statue, double exposure and landscape/portrait ending. Browser/GPU playback and real-time recording remain unverified.
