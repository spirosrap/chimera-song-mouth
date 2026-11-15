# Queen — I Want to Break Free

Open `?scene=break-free`. The complete owner-supplied official video, approximately 4:32 with its short release, is reconstructed with original accompaniment and actual physical mouth-engine singing. Its opening rooftops, domestic scenes, central dance sequence, returning household, blue-lit crowd and final title period are retained. Pause after finishing this selection before continuing the earlier list.

The owner approved the validated 33-second preview: “Sounds good—use this version.”

## Physical singing and original music

The unchanged CHIMERA airway generates the featured singer through `planPart` → `planPerformance` → `renderPart`. The generated voice channel contains no recorded singer samples, voice clones, vocoders or effects applied to original vocals. The mouth snapshots are captured during synthesis.

Local recognition of the supplied video provides rough word windows. The words are corrected and separately checked at the ending: a complete late refrain missed by the first recognition pass is restored, followed by the repeated calls and final held vowel. Intro/outro recognition hallucinations are rejected. Dictionary phones are aligned with the isolated source using the cached phonetic CTC model. Complete consonants, connected vowels, late diphthong glides and the measured continuous source melody preserve phrasing. Recognition blanks are not automatically turned into singing pauses.

The score has 188 words, 205 syllables, 30 connected physical phrases and 32 source caption lines. The physical lead uses female body blend 0.28, pressure 7.8, brightness 0.48, tension 0.54 and breathiness 0.025, with zero random drift and no added vibrato. The original vocal doubles are not independently reconstructed. Transcription, pronunciation, melody recovery, timing and harmony remain approximate.

Original accompaniment stays continuous at the supplied speed. The confirmed instrumental dance/synth sequence at 132.2–191.2 seconds is restored directly from the source with short boundary fades, preserving that solo rather than playing a damaged separated stem. Featured recorded singing is replaced elsewhere; faint traces and separation artifacts may remain in the instrumental stem. Uniform gain, resampling and MP3 encoding apply. Audio uses 48 kHz, and mouth telemetry follows the exact 20 Hz source clock.

## The domestic scene and ballet

The source was inspected throughout. The procedural reconstruction follows the terraced rooftops and chimneys, pink sleeveless top and dark mini skirt, dark bob, moustache and earrings, upright vacuum with bag, metal handle, wheels and trailing cord, patterned living room, open staircase and banister, sofas, newspaper, television, tea table, clock, framed pictures, lamps and coat stand. The other household figures have curlers and a dressing gown, school uniform and ponytails, or dark older-person clothing, hat, glasses and newspaper. The kitchen has cupboards, sink and a window with a standing figure at the counter.

The later scenes include a blue-lit crowd with small helmet lights, four foreground band figures, a bright distant doorway, cave entrance, white box and black-and-white dance costumes. Source-time poses approximate the human pyramid, lift, roll and moving sheet. These are stylized procedural approximations of the choreography, rather than motion capture. The title period uses simple original lettering instead of copying the source crest/logo.

Three separate physical head graphics show the domestic singer, frontman and dancer while sharing one retained voice model and vocal recording. Other figures are decorative proxies. The household, vacuum, dancers, cloth, crowd and cameras derive from absolute source time, so seeking restores them directly. Landscape retains the source’s 4:3 frame and close-up cameras adapt to phone sizes. Scene-owned line materials use normal blending and depth testing so wallpaper does not draw through clothing; other scenes keep their existing neon materials. Disposal frees stage graphics, geometry and materials without disposing the borrowed singer model.

Costumes, sets, gestures, cuts and likenesses are approximate. The original film, photographs, watermark and logo are not embedded.

## Rebuild and validation

The six prepared files contain the explicit phonetic score, original instrumental backing, full mix, compressed telemetry, scene/captions/cameras and credits. Source video, stems, model weights and analysis stay private outside the repository.

```sh
bun tools/render-break-free-scene.ts
bun run content:manifest
bun run verify:content
```

The prepared score, backing, tracked WASM and ffmpeg suffice to rebuild the voice, mix and mouth movements. Preserve all 661 preceding public files byte-for-byte; the updated manifest contains 667 files.

Browser, Playwright and layout-lint access remain declined in this chat. Native projections and geometry tests do not verify browser/GPU playback or real-time recording/export interaction.

The complete performance lasts 271.768050 seconds, with 13,044,867 decoded source-clock audio frames and 5,436 mouth snapshots. All 30 physical phrases are audible; the generated channel is silent during the instrumental opening, central break and final outro. The decoded mix peaks at 0.8135, without clipping or missing samples; neither MP3 adds extra end padding. The scene contains 32 caption lines and 33 source-time camera cuts.

The owner approved the validated 54–87 second preview: “Sounds good—use this version.” The unchanged English scene-clarity aid ran over all 32 mixed caption excerpts and misheard 74 of 189 normalized words (39.2%). This is a listening diagnostic rather than an intelligibility pass; its judge was not changed.

Validation passed 187 native tests (two existing ignored), 455 Bun tests across 112 files, four final focused scene tests, TypeScript, all 667 public content hashes, unchanged WASM provenance and the subfolder production build. Final geometry checks include physical-head framing on phone/landscape, moustache attachment at the actual upper lip, direct seeking, three graphics sharing one borrowed model and unchanged materials in other scenes. Native projections were inspected across the household, kitchen, vacuum, rooftops, blue crowd, cave, white box, pyramid, lift, cloth roll, newspaper, stairs and close-up/mobile views. These are native projections, not browser screenshots.

The concurrent Player — Baby Come Back addition (`dd4003f`, `0547b38`) was incorporated before the final build. Its nine prepared media files were verified against the live deployment and remain byte-identical. All 661 preceding public files are preserved. Local HTTP checks matched all 667 built assets, app bundles, the direct route and six new Queen scene files. Browser/GPU playback, layout lint and recording remain untested because browser access is declined in this chat.

## Live release

Application commit `1184d75` is live at [I Want to Break Free](https://agenticspiros.com/chimera-song-mouth/?scene=break-free). All 17 changed files uploaded successfully, with the entry page last. Live HTTP verification matched 156 files, including all six new scene files, app bundles and twenty preserved performances, plus the direct route. The temporary publish job and the task’s temporary merge-backup stash were removed. All earlier prepared content, including the concurrent Player performance, remains preserved. Browser/GPU playback and recording remain untested for this Queen scene.
