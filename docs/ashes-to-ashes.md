# David Bowie — Ashes to Ashes

Open `?scene=ashes-to-ashes`. The complete supplied official 4K edit, approximately 3:37 including its instrumental ending, is reconstructed with original instrumental music and one physical singer. The owner approved the 35–81 second verse/chorus preview: “Sounds good—use this version.” Pause after the finished performance before starting another selection.

## Physical voice

The unchanged CHIMERA airway generates the lead through `planPart` → `planPerformance` → `renderPart`. The generated channel contains no recorded singer samples, clones, vocoders or effects applied to source vocals. Mouth telemetry is captured during synthesis.

The supplied recording supplies rough word windows and measured continuous pitch. The local transcription is corrected before phonetic alignment, including the fast first verse, Major Tom refrains and repeated ending. A phonetic CTC model aligns complete dictionary consonants and vowels. Connected phrases, held vowels and late diphthong glides preserve the source phrasing instead of turning recognition blanks into singing pauses. The source’s lower chorus and higher verses remain on the measured contour, smoothed without note quantization.

The lead uses female body blend 0.22, pressure 7.8, brightness 0.52, tension 0.54 and breathiness 0.025, with zero random drift and no added vibrato. It contains 255 words, 324 syllables and 31 connected phrases. Every recorded vocal double is not independently reconstructed. Transcription, pronunciation, timing and melody recovery remain approximate.

Original instrumental accompaniment stays continuous at the supplied speed, including the opening, transitions and full instrumental ending. Faint recorded-vocal separation traces may remain. The stereo mix is 48 kHz and mouth snapshots follow the exact 20 Hz source clock.

## The Pierrot and the bulldozer

The supplied film was inspected across its duration, with closer inspection of the costumes, procession, room and astronaut sequence. The procedural scene follows the pink shoreline and rust-coloured cliffs, ruffled Pierrot with pale makeup and pointed cap, memory cards, three dark/light-clad companions and a large yellow bulldozer, older woman, padded room and wooden chair, diagonal window shadows, unpainted portrait, monochrome astronaut and attendants, dark water and raised hands, blue hoses and the closing walk and memory.

The bulldozer has tracks, wheels, blade, hydraulic arms, cab, exhaust and a decorative operator. Its scale and position keep the cab visible behind the procession. Memory cards show simple procedural figures rather than source pictures. The water scene hides the submerged legs and lower costume details. Camera framing includes the tall cap on desktop and mobile, and source-time poses, tracks, waves, cards, room changes and ending restore directly after seeking.

The clown, patient, astronaut and unpainted portrait use four separate head graphics sharing one retained voice model and recorded vocal performance. Other figures are decorative proxies. The monochrome scene modifies only stage-owned draw buffers; shared model data and other neon scenes remain untouched. Disposal frees stage-owned graphics, geometry and materials without disposing the borrowed model.

Colours, clothes, props, gestures, scene transitions and likenesses are stylized approximations. The original film itself is not embedded. The final layered image is represented by a staged memory overlap rather than an exact optical recreation of the original solarized film effects.

## Rebuilding and verification

Six prepared files include the explicit phonetic score, original backing, full mix, compressed telemetry, scene/captions/cameras and credits. Raw video, stems, model weights and analysis stay private outside the repository.

```sh
bun tools/render-ashes-to-ashes-scene.ts
bun run content:manifest
bun run verify:content
```

The prepared score, backing, tracked WASM and ffmpeg suffice to rebuild the voice, mix and mouth movements. Preserve all 640 preceding public files byte-for-byte; the updated manifest contains 646 files.

Browser, Playwright and layout-lint access remain declined in this chat. Native geometry projections and tests do not verify browser/GPU playback or real-time recording/export interaction.

The full performance lasts 217.061837 seconds with 10,418,969 source-clock audio frames and 4,342 mouth snapshots. The decoded mix peaks at 0.9306. All 31 physical phrases are audible; the generated channel is silent during the instrumental opening and closing section. The decoded mix and backing retain the exact PCM extent without extra end padding. There are 43 subtitle lines and 29 source-time camera cuts.

The unchanged scene-clarity listening aid completed on all 43 captions over the original music. It marked 193 of 255 words as errors (75.7%); one line was recognized exactly. The fast first verse and switching vocal registers remain difficult for this recognizer. This is a listening diagnostic, not an intelligibility pass; retain the owner-approved preview settings and prepared explicit phones.

Validation passed 187 native tests (two existing ignored), 443 Bun tests across 109 files, four final focused scene checks, TypeScript, all 646 public hashes, unchanged WASM provenance and the subfolder production build. The focused checks cover complete audible phrases, instrumental silence, exact mouth clocks, direct seeking, a visible bulldozer and procession, submerged legs, cap attachment and framing on desktop/mobile, borrowed-model ownership and shared renderer isolation.

Native projections were inspected for the shoreline, Pierrot, memory card, cliffs, procession and bulldozer, patient and padded room, portrait, monochrome astronaut and attendants, water, blue hoses, older woman, ending, memory overlap and mobile framing. These are native projections, not browser/GPU screenshots. All 640 preceding public files remain byte-identical. Browser/GPU playback, layout lint and real-time recording remain unverified because browser access is declined.

Local HTTP checks matched all 646 built media files to the manifest and served the direct scene route, app bundles and all six new scene files correctly.

## Live release

Application commit `c40dbe8` is live at [Ashes to Ashes](https://agenticspiros.com/chimera-song-mouth/?scene=ashes-to-ashes). All seventeen changed files uploaded successfully, with the entry page last. HTTP verification matched 135 live files byte-for-byte, including all six new assets, app bundles and seventeen preserved performances, plus the direct scene route. The temporary publish job was removed. Browser/GPU playback and real-time recording remain unverified in this chat.
