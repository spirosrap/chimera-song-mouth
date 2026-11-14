# Nick Cave & Kylie Minogue — Where the Wild Roses Grow

Open `?scene=wild-roses`. The complete supplied 4:32 official video, including its instrumental opening and quiet ending, is reconstructed with original instrumental music and two physical singers. The owner approved the 60.5–101 second duet preview: “Sounds good—use this version.” Pause after the finished performance before starting another selection.

## Physical duet

The unchanged CHIMERA airway generates both vocal parts through `planPart` → `planPerformance` → `renderPart`. The generated channels contain no recorded singer samples, clones, vocoders or effects applied to source vocals. Mouth telemetry is captured during synthesis.

The supplied recording provides rough word windows and measured continuous melody. The locally corrected transcription preserves the alternating verses and shared refrains, including a local explicit pronunciation of Elisa Day. A phonetic CTC model aligns complete dictionary consonants and vowels. Connected phrases, held vowels and late diphthong glides preserve the source phrasing instead of turning recognition blanks into pauses.

Kylie uses body blend 0.8, pressure 7.7 and brightness 0.54; Nick uses body blend 0, pressure 7.2 and brightness 0.38. Both use tension 0.54, breathiness 0.03, zero random drift and no added vibrato. Each voice contains 235 words and 272 syllables. Kylie has 24 connected phrases and Nick 26. Nick’s shared refrains use a softer estimated lower-octave harmony from the higher lead. This is an approximation, not an independent recovery of every recorded duet harmony. Solo verse registers follow the measured source. Transcription, pronunciation, timing and pitch tracking remain approximate.

Original instrumental accompaniment remains continuous at the supplied speed, including the opening, instrumental sections and ending. Faint recorded-vocal separation traces may remain. The stereo mix is 48 kHz and snapshots follow the exact 20 Hz source clock.

## The river and rose portraits

The supplied film was inspected across its duration. The procedural sequence follows the dark river, moving reflections, reeds, willows, red hair and white slip dress, Nick’s white short-sleeved shirt and folded kneeling legs, ring and forearm markings, soft rose-filled portraits, floating face-up pose, hands covering his eyes and touching her face, snake crossing the gown, final red rose at her lips, closed eyes and empty river ending. No graphic injury is depicted.

Kylie’s face-up anatomy and floating cloth rotate together. Overhead cameras explicitly use an up vector along the river, then restore upright framing for Nick and the garden. Scene-local normal blending keeps physical anatomy legible against the brighter garden, while dark river anatomy and the shared neon renderer retain their normal maximum blending. Poses, water, cloth, snake, rose, fades and camera edits derive from absolute source time, so seeking restores them directly. Landscape retains the source 4:3 frame, with named close-ups adapting to mobile.

Both heads borrow separately retained voice models. Disposal frees only stage-owned head graphics, geometry and materials. Scenery, likenesses, costumes and gestures are stylized approximations. The original source film itself is not embedded.

## Rebuilding and verification

Seven prepared files include the explicit two-part phonetic score, original backing, full mix, two compressed telemetry streams, scene/captions/cameras and credits. Raw input video, stems, analysis and model weights remain private outside the repository.

```sh
bun tools/render-wild-roses-scene.ts
bun run content:manifest
bun run verify:content
```

The prepared score, backing, tracked WASM and ffmpeg suffice to rebuild the physical voices, mix and mouth movement. Preserve all 626 preceding public files byte-for-byte; the updated manifest contains 633 files.

Browser, Playwright and layout-lint access remain declined in this chat. Native scene projections and geometry checks do not verify browser/GPU playback or real-time recording/export interaction.

The full performance lasts 272.348549 seconds with 13,072,731 source-clock audio frames and 5,447 mouth snapshots per singer. The decoded mix peaks at 0.9228. Every generated vocal phrase is audible and the instrumental opening is silent in both generated voice channels. The decoded mix and backing retain the exact PCM extent without extra end padding. There are 42 subtitle lines and 31 source-time camera cuts.

The unchanged scene-clarity listening aid completed on all 42 captions over the original music and synthesized duet. It marked 227 of 351 caption words as errors (64.7%). Shared refrains, held vowels and the two overlapping registers remain difficult for this recognizer. This is a listening diagnostic, not an intelligibility pass; retain the owner-approved preview settings and prepared explicit phones.

Validation passed 187 native tests (two existing ignored) and 435 Bun tests across 107 files. Focused checks cover the complete duet, source-clock telemetry, silent instrumental opening, all audible phrases, deterministic cloth/snake/hand/rose poses and seeking, upright and overhead desktop/mobile head framing, decorative-plant occlusion, local garden blending and borrowed-model ownership. The tracked WASM retains its unchanged provenance.

Native scene projections were inspected for the rose garden, upright and face-up portraits, kneeling Nick, hands, snake, overhead river tableau, final rose, empty ending and mobile close-ups. These are geometry projections, not browser/GPU screenshots.

TypeScript, all 633 public hashes, unchanged WASM verification, the subfolder production build and local HTTP checks passed. Every built media file matches the manifest, and the direct scene route, application bundles and all seven new scene files serve correctly. All 626 preceding assets remain byte-identical. Browser/GPU playback, layout lint and real-time recording remain unverified because browser access is declined.

## Live release

Application commit `7a6ef67` is live at [Where the Wild Roses Grow](https://agenticspiros.com/chimera-song-mouth/?scene=wild-roses). All eighteen changed files uploaded successfully, with the entry page last. HTTP verification matched 122 live files byte-for-byte, including all seven new assets, app bundles and fifteen preserved performances, plus the direct scene route. The temporary publish job was removed. Browser/GPU playback and real-time recording remain unverified in this chat.
