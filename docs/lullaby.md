# The Cure — Lullaby

Open `?scene=lullaby`. The complete owner-supplied official video and recording, approximately 4:10, is reconstructed with original accompaniment and actual physical mouth-engine vocals. The owner approved the validated 42.85-second, two-excerpt audition covering the opening vocal and later threat: “Sounds good—use this version.” Pause after this performance before starting another selection.

## Physical voice and source timing

The unchanged CHIMERA airway generates the voice through `planPart` → `planPerformance` → `renderPart`. The generated channel contains no recorded singer samples, cloning, vocoders or effects applied to the original singer. Mouth snapshots are captured during synthesis.

The supplied recording has a long instrumental opening: the vocal stem becomes active around 1:02. Both that opening and the later instrumental passages remain intact. Recognition hallucinations over those stretches were rejected. Hushed words were corrected using the supplied recording, isolated-source and original-source recognition, then aligned to dictionary phones. Complete consonants, connected vowels and late diphthong glides retain the clearer approach used in the earlier songs. Continuous measured source pitch drives the singing. The whispered spoken ending uses estimated low speech intonation because its voicing could not be measured reliably. Transcription, pronunciation, timing, melody and intonation remain approximate.

The score has 197 words, 265 dictionary syllables/notes and 17 connected physical phrases. Twenty-four lyric captions and 33 camera cuts follow the source clock. The approved lead uses female body blend 0.18, pressure 7.4, brightness 0.43, tension 0.54 and breathiness 0.06, with zero random drift and no added vibrato. The spoken ending uses reduced breath and follows the final vocal fade. Recorded doubles are not independently reconstructed.

Original instrumental music stays continuous at the supplied speed. Uniform gain, resampling and MP3 encoding apply; faint original vocal traces and separation artifacts may remain. No interval is restored from the complete source recording. Audio is 48 kHz and mouth snapshots follow the exact 20 Hz source clock.

## Bedroom and nightmare

The source was inspected throughout, with additional bed, window hands, wall figure, band, cocoon, mouth and final struggle views. The procedural reconstruction follows the iron bed and curved rails; striped pyjamas, tousled dark hair and dark eye makeup; white pillows, red blanket and sheet; bedside lamp, clock, washstand, window, lace and wallpaper; hands behind the glass; growing cobwebs; wall figure and looming eight-legged spider; the blue-lit trapped figure and swallowing mouth imagery; and four cobweb-covered red-uniform musicians with bass, guitar, snare and brass. The giant spider and oral portal are stylized interpretations of the film's imagery.

Three physical head graphics share one retained singer: the reclining bed figure, wall/predator figure and trapped figure. The band members are decorative animated proxies. The mouth close-up uses the actual physical head at close range. Clothes, limbs, fingers, spider legs, hands, duvet breathing, webs, band gestures, colours and cameras derive from absolute source time, so paused and backward seeks restore each view. Overhead views explicitly restore the camera up-vector. The presentation follows the source's 4:3 framing and adapts to phones.

Web fades use actual material opacity. Early bed and body webs emit no segments; zero-brightness lines previously became black marks under normal blending. Regression checks preserve their absence and gradual arrival. Bed props and spider legs leave the physical mouth clear. Stage-owned materials and graphics are released on disposal; the borrowed voice model stays with `MovieStage`, and shared neon materials remain unchanged.

Costumes, likenesses, sets, acting, gestures, choreography, spider and swallowing imagery are approximate. The source film, frames, photographs and logos are not embedded.

## Rebuild and checks

Six prepared files contain the explicit phonetic score, original backing, full mix, compressed telemetry, source-timed scene/captions/cameras and credits. Source video, separated stems, recognition models and analysis remain private outside the repository.

```sh
bun tools/render-lullaby-scene.ts
bun run content:manifest
bun run verify:content
```

The prepared score, backing, tracked WASM and ffmpeg suffice to rebuild the voice, mix and mouth movement. All 698 preceding public files remain byte-identical; the new manifest contains 704 files.

The complete performance lasts 250.196712 seconds, with 12,009,443 exact decoded audio frames and 5,004 mouth snapshots. All 17 physical phrases are audible. Both MP3s retain the exact extent without extra decoded padding. Instrumental stretches are vocally silent, and the decoded mix peaks at 0.91091 without clipping.

Browser, Playwright and layout-lint access remain declined in this chat. Native geometry projections and tests do not verify browser/GPU playback or real-time recording/export interaction.

The unchanged scene-clarity listening aid reported 119 errors among 198 normalized caption words (60.1%) over 24 excerpts. It is a listening diagnostic, not an intelligibility pass. The owner approved the actual two-excerpt audition, and the voice settings remain unchanged. The judge was not edited.

Validation passed 187 native tests (two existing ignored), 481 Bun tests across 118 files, TypeScript, content/WASM verification and the production build. Four focused tests cover full audible phrases, exact-clock telemetry, long instrumental silence, gradual true-opacity webs, empty early web buffers, direct seeking, three heads sharing one retained model, phone/desktop framing, clear bed mouth rays and overhead-camera restoration. Twenty-six native geometry views were inspected after the web fade fix; these are not browser screenshots. Shared model ownership and other scenes' neon materials remain unchanged.

Local HTTP checks matched all 704 built media files to the manifest and served the direct route, app bundles and six new scene files correctly. All 698 earlier media files remain byte-identical.

## Live release

Application commit `55f2070` is live at [Lullaby](https://agenticspiros.com/chimera-song-mouth/?scene=lullaby). All 17 changed files uploaded with the entry page last. Live verification matched 193 files, including six new scene assets, app bundles and twenty-six preserved performances, plus the direct scene route. The temporary publish job was removed. Browser/GPU playback and real-time recording remain untested for this scene.
