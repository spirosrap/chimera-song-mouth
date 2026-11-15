# Duran Duran — The Wild Boys

Open `?scene=wild-boys`. The complete owner-supplied official video and recording, approximately 4:13 including the quiet ending, is reconstructed with original accompaniment and actual physical mouth-engine singing. The owner approved the validated 38.55-second, two-excerpt audition covering the first verse and chorus: “Sounds good—use this version.” Pause after this finished performance before continuing the earlier list.

## Physical singing

The unchanged CHIMERA airway generates the featured voice through `planPart` → `planPerformance` → `renderPart`. The generated channel contains no recorded singer samples, cloning, vocoders or effects applied to the original singer. Mouth telemetry is captured during synthesis.

Recognition of the supplied video and isolated vocal supplies rough word windows. Corrected words are aligned to dictionary phones; complete consonants, connected vowels, late diphthong glides and measured continuous source pitch preserve the English phrasing. Intro and middle calls were inspected separately with local speech and phone recognition. Repetitive recognizer hallucinations over the instrumental section were rejected. The quiet repeated calls use reduced breath rather than the full chorus level. The fading, incomplete last refrain stays incomplete. Recorded doubles and overlapping backing layers are not independently reconstructed. Transcription, pronunciation, call recovery, timing and melody remain approximate.

The score has 241 corrected words, 294 dictionary syllables/notes and 40 connected physical phrases. Fifty-one lyric captions and 34 camera cuts follow the source clock. The lead keeps the approved female body blend 0.22, pressure 8.0, brightness 0.50, tension 0.54 and breathiness 0.025, with zero random drift and no added vibrato. Source-relative breath is reduced in the quieter intro and middle calls, then follows the ending fade.

Original instrumental accompaniment stays continuous at the supplied speed. Uniform gain, resampling and MP3 encoding apply; faint original vocal traces and separation artifacts may remain. No interval is restored from the complete source recording. Audio is 48 kHz and mouth snapshots follow the exact 20 Hz source clock.

## The industrial dream

The source was inspected throughout, including the mechanical head and monitors, windmill straps, drums, cage, dancers and final group. The procedural reconstruction follows the blue industrial wasteland and tiled maze opening; mechanical head, shoulder pods, neck, hoses and ribbed machine; two monitors with original procedural imagery, including a white-shirted physical portrait with handheld microphone; rotating four-bladed wooden/metal windmill and strapped singer; buckled vest, trousers, boots and wrist restraints; water, ripples, splashes and bubbles; scaffold platforms, pipes, chains and catwalks; caged bass and keyboard players, guitar and drums; seven punk dancers, coloured beams, flames and closing rain.

Three physical head graphics share one retained singer: windmill, mechanical head and monitor portrait. Twelve other band/punk figures are decorative animated proxies and do not generate extra voices. The film's monitor footage is replaced by procedural graphics. The source's large mechanical face is interpreted as another physical mouth display for the same featured voice.

The windmill carries the complete bound figure, including its head, through the rotation and toward the water. Close-up cameras follow the rotating head; splash and bubble cues derive from its height. Machinery, platform sway, limbs, hair, hands, cymbals, flames, water, rain, monitor feed and cameras derive from absolute source time, so direct backward seeks restore each tableau. The presentation follows the source's 4:3 framing and adapts to phones.

Only stage-owned lines use normal blending and depth testing; shared neon materials remain unchanged. All three graphics borrow the same voice model. Disposal frees owned graphics and leaves the model lease with `MovieStage`. The monitor bust and microphone stay within the screen, and the rotating windmill frame stays behind the mouth.

Machinery, scenery, costume, acting, choreography, transitions and likenesses are stylized approximations. The source film and monitor footage, frames, photographs and logos are not embedded. The physical underwater display is visual staging; the airway's acoustics are unchanged.

## Rebuilding and validation

The six prepared files contain the explicit phonetic score, instrumental backing, full mix, compressed telemetry, source-timed scene/captions/cameras and credits. Source video, separated stems, recognition models and analysis stay private outside the repository.

```sh
bun tools/render-wild-boys-scene.ts
bun run content:manifest
bun run verify:content
```

The prepared score, backing, tracked WASM and ffmpeg suffice to rebuild the voice, mix and mouth movement. All 692 preceding public files remain byte-identical. The new manifest contains 698 files.

The performance lasts 253.122426 seconds, with 12,149,877 exact decoded audio frames and 5,063 mouth snapshots. Both MP3s retain the exact sample extent with no extra decoded padding. All 40 physical phrases are audible, the instrumental gaps remain vocally quiet and the decoded mix peaks at 0.60827 without clipping.

Browser, Playwright and layout-lint access remain declined in this chat. Native geometry projections and tests do not verify browser/GPU playback or real-time recording/export interaction.

The unchanged scene-clarity listening aid reported 154 errors among 241 normalized caption words (63.9%) over all 51 excerpts. It is a listening diagnostic, not an intelligibility pass. The owner approved the actual two-excerpt audition, and its voice settings remain unchanged. The judge was not edited.

Validation passed 187 native tests (two existing ignored), 477 Bun tests across 117 files, TypeScript, content/WASM verification and the production build. Four focused scene tests cover the complete audible phrases, exact-clock telemetry, quiet instrumental gaps, absolute seeking, three heads sharing one retained model, phone/desktop rotating-head framing, monitor boundaries, clear windmill mouth views and unchanged shared neon materials. Twenty-four native geometry views were inspected, followed by four final mechanical-head/monitor close-ups after the head-scale adjustment. These are not browser screenshots. All 692 earlier media files remain byte-identical.

Local HTTP checks matched all 698 built media files to the manifest and served the direct route, app bundles and six new media files correctly.

## Live release

Application commit `14f7f6a` is live at [The Wild Boys](https://agenticspiros.com/chimera-song-mouth/?scene=wild-boys). All 17 changed files uploaded with the entry page last. Live verification matched 187 files, including six new media assets, app bundles and twenty-five preserved performances, plus the direct scene route. The temporary publish job was removed. Browser/GPU playback and real-time recording remain untested for this scene.
