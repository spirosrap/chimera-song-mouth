# Peter Gabriel — Sledgehammer

Open `?scene=sledgehammer`. The complete supplied 5:45 HD video, including its microscopic opening, instrumental sections, light-figure ending and closing credit period, is reconstructed with original instrumental music, physical lead and estimated backing calls. The owner approved the 90–122 second verse/chorus preview: “Sounds good—use this version.” Pause after the finished performance before starting another selection.

## Physical singing

The unchanged CHIMERA airway generates both parts through `planPart` → `planPerformance` → `renderPart`. The generated channels contain no recorded singer samples, clones, vocoders or effects applied to source vocals. Mouth telemetry is captured in the same synthesis run.

The supplied recording supplies rough word windows and measured continuous pitch. Local recognition is corrected before phonetic alignment, including the repeated ending. A phonetic CTC model aligns complete dictionary consonants and vowels. Connected phrases, held vowels and late diphthong glides preserve the source phrasing instead of turning recognition blanks into singing pauses. The pitch contour is smoothed without note quantization or engine changes.

The lead uses female body blend 0.26, pressure 7.8 and brightness 0.50. The backing uses blend 0.65, pressure 7.5 and brightness 0.44, at a quieter level and slightly right of centre. Both use tension 0.54, breathiness 0.025, zero random drift and no added vibrato. The lead has 239 words, 287 syllables and 42 connected phrases. The backing has 44 words, 58 syllables and 17 phrases. Backing calls and their register are estimated from the polyphonic source rather than independently recovered original singers. Transcription, timing, pronunciation and melody recovery remain approximate.

Original instrumental accompaniment stays continuous at the supplied speed through the opening, instrumental break, dance and fading ending. Faint recorded-vocal separation traces may remain. The stereo mix uses 48 kHz and mouth snapshots follow the exact 20 Hz source clock.

## A procedural stop-motion world

The supplied film was inspected across its full duration and in more detail around the transformations. The sequence follows microscopic cells, eye and mouth close-ups, giant singing face, short dark hair, dark jacket and high white collar, miniature orbiting train and track, clouds and speaker, chalkboard, popcorn and clay toys, upside-down and clay heads, flames and fish, fruit mask and flowers, cardboard doors and found-object room, two dancing chickens and purple-curtain theatre, floral wallpaper and green floor tiles, shirt-sleeved dancing, backing singers and crowd, moving furniture and a final figure made from many points of light.

At the end the original credit period is retained in duration, with simple reconstruction attribution cards. Original video frames and original credit cards are not embedded. Costumes, props, scenery, movement, credits and likenesses are stylized approximations.

A separate source-time nine-frame clock steps prop movement and body poses. The audio and physical mouth articulation retain their continuous recording clock. Props update only when that stepped clock or selected set changes. Seeking restores trains, fruit, doors, chickens, dancers, furniture, lights, upside-down framing and fades directly. Landscape retains the source 4:3 composition; named head close-ups adapt to mobile.

Four physical heads borrow two retained voice models. Portrait and dancing Peter share the lead; two backing figures share the response voice. Other dancers are decorative proxies. Only stage-owned draw buffers, geometry and materials are disposed. Scene-local blending keeps anatomy readable against the brighter sets while preserving the shared neon renderer.

## Rebuilding and checks

Seven prepared files include the explicit phonetic score, original backing, full mix, two compressed telemetry streams, scene/captions/cameras and credits. Raw video, stems, analysis and model weights remain private outside the repository.

```sh
bun tools/render-sledgehammer-scene.ts
bun run content:manifest
bun run verify:content
```

The prepared score, backing, tracked WASM and ffmpeg suffice to rebuild the physical voices, mix and mouth movements. All 633 preceding public files must remain byte-identical; the manifest now contains 640 files.

Browser, Playwright and layout-lint access remain declined in this chat. Native projections and geometry tests do not verify browser/GPU playback or real-time recording/export interaction.

The finished performance lasts 345.398526 seconds, with 16,579,130 source-clock audio frames and 6,908 synchronized mouth snapshots per voice. The decoded mix peaks at 0.8999. All 59 physical phrases are audible; both generated channels remain silent through the instrumental opening and after the singing. The decoded mix and backing retain the exact PCM extent without extra end padding. There are 48 subtitle lines and 29 source-time camera cuts.

The unchanged scene-clarity listening aid completed on all 48 captions over the original music and synthesized responses. It marked 145 of 242 caption words as errors (59.9%); six lines were recognized exactly. Fast consonants, overlapping calls and sustained upper vowels remain difficult for this recognizer. This is a listening diagnostic, not an intelligibility pass; retain the owner-approved preview settings and explicit source phones.

Validation passed 187 native tests (two existing ignored), 439 Bun tests across 108 files, four final focused scene checks, TypeScript, all 640 public hashes, unchanged WASM provenance and the subfolder production build. Checks cover complete audible voice phrases, instrumental silence, exact mouth clocks, stepped props, train-orbit visibility, seeking, upside-down and mobile/cinema head framing, shared renderer isolation and borrowed-model ownership.

Native geometry projections were inspected for the microscopic opening, portrait, train, speaker, chalkboard, popcorn, clay, fish, fruit, cardboard and red rooms, chickens, dance floor, crowd, furniture, light figure, credits and mobile framing. These are native projections, not browser/GPU screenshots. All 633 preceding public assets remain byte-identical. Browser/GPU playback and real-time recording remain unverified.

Local HTTP verification matched all 640 built media files to the manifest and served the direct scene route, application bundles and all seven new scene files correctly.

## Live release

Application commit `470d25e` is live at [Sledgehammer](https://agenticspiros.com/chimera-song-mouth/?scene=sledgehammer). All eighteen changed files uploaded successfully, with the entry page last. HTTP verification matched 129 live files byte-for-byte, including all seven new assets, application bundles and sixteen preserved performances, plus the direct scene route. The temporary publish job was removed. Browser/GPU playback and real-time recording remain unverified in this chat.
