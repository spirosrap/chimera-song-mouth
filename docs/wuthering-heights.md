# Kate Bush — Wuthering Heights

Open `?scene=wuthering-heights`. The complete supplied 4:30 red-dress video (Version 2) is reconstructed with original instrumental accompaniment, one physical mouth-engine singer and a full outdoor dance scene. The owner approved the 46–72 second refrain preview: “Sounds good—use this.” Pause after the finished performance before starting another selection.

## Singing and source clock

The unchanged CHIMERA engine generates the featured lead through `planPart` → `planPerformance` → `renderPart`. The generated vocal contains no recorded singer samples, voice clone, vocoder or effect applied to recorded vocals. Physical mouth telemetry is captured in the same synthesis run.

Local original-mix and isolated-vocal recognition supplies a rough transcript. The high-register refrains produce recognition loops, so their complete source words are manually corrected before phonetic alignment. Independent melodic recurrence locates the seven refrain entrances; dictionary phones are then aligned to the supplied vocal with a local phonetic CTC model. Heathcliff, Wuthering and wily have explicit dictionary entries. Complete consonants, held vowels and late diphthong glides follow the recording. Continuous measured pitch retains slides and vibrato. The source recording, not recognition blanks, determines sustained singing and genuine rests. A lower-pitched copy is used for transcription analysis only.

The approved singer uses female body blend 0.75, pressure 7.8, brightness 0.55, tension 0.54, breathiness 0.025 and zero random drift or added vibrato. These settings and the complete phonetic score are retained in the full render. There are 257 words, 314 sung syllables and 51 connected phrases. One featured lead is reconstructed rather than every doubled recording layer. Transcription, pronunciation and pitch tracking remain approximate.

Original instrumental music remains continuous at the supplied speed, including the complete guitar and dance outro after the singing ends. Vocal separation is applied across the entire recording; faint recorded-vocal traces may remain. Stereo synthesis uses 48 kHz and mouth snapshots use the exact 20 Hz sample clock. The performance lasts 270.514172 seconds, including a 350 ms physical release, with 12,984,681 audio frames and 5,411 mouth snapshots. The decoded mix peaks at 0.7148; every physical phrase is audible and the singing channel is silent during the long instrumental ending.

## Dance and environment

The complete supplied film was inspected across its duration. The scene follows the red dress and gathered flowing sleeves, black waist belt, red tights and dark shoes, long brown hair and fringe, red flower, hoop earrings, reaching and face-framing hands, turns and spins. A moody green field, tall flat-crowned pines, overcast sky and distant hills replace the usual dark stage. The long closing dance recedes into the field and fades to black.

Source-timed pose keys drive the hands, torso, stepping legs, turns and movement through the field. Skirt flare follows turns; sleeves reshape around the articulated elbows and wrists. Hair and grass move with the wind. Poses, cloth, scenery and 22 camera cuts derive from absolute source time, so pausing and backwards seeking restore them directly. Close-ups track the moving physical head; landscape retains the source's near-4:3 pillarbox, while portrait framing adapts. The figure and choreography are stylized approximations.

The singer borrows one retained voice model for the whole mounted scene. The stage disposes only its own geometry, materials and physical head graphics. Existing shared rendering and model-cache ownership remain unchanged.

## Rebuilding and verification

Six prepared files include the explicit phonetic score, original backing, full stereo mix, one gzipped telemetry stream, scene/captions/cameras and credits. Input video, stems, analysis and model weights stay private and outside the repository.

```sh
bun tools/render-wuthering-heights-scene.ts
bun run content:manifest
bun run verify:content
```

The prepared score, backing, tracked WASM and ffmpeg suffice to rebuild the voice, mix and synchronized mouth movement. Preserve all 599 preceding public assets byte-for-byte; the updated manifest contains 605 files.

Browser, Playwright and layout-lint access remain declined in this chat. Native scene projections and geometry checks do not verify browser/GPU playback or real-time recording/export interaction.

A waveform diagnostic sampled 24 stable planned vowel windows throughout the full singing part. Twenty-three YIN estimates are within 60 cents of the plan; a short entry at 166.726 seconds measures 62.66 cents low, with independent autocorrelation showing the same slight difference. This diagnostic outlier is retained without changing the approved voice or claiming a complete pitch-quality pass.

The unchanged scene-clarity listening aid completed on all 51 captions over the original music and marked 178 of 257 words as errors (69.3%). The high register and repeated sustained refrains are difficult for the recognizer, as they were in the source transcription. This is a listening diagnostic, not an intelligibility pass; the owner-approved voice is retained.

Final validation passed 187 native tests (two existing ignored), 418 Bun tests across 103 files, TypeScript, all 605 public hashes/WASM, the subfolder production build and local HTTP checks of the direct route, application bundles and all six new scene files. All 599 preceding public assets remain byte-identical and the tracked WASM matches its unchanged provenance. Native projections were inspected for the full dance, face/hand views, spins, profile and receding ending in landscape and portrait.

## Live release

Application commit `3e492bf` is live at [Wuthering Heights](https://agenticspiros.com/chimera-song-mouth/?scene=wuthering-heights). All seventeen changed files uploaded successfully with `index.html` last. HTTP verification matched 94 live files byte-for-byte, including all six new assets, application bundles and eleven preserved performances, plus the direct scene route. The temporary publish job was removed. Browser/GPU playback and real-time recording remain unverified in this chat.
