# Eurythmics — Sweet Dreams (Are Made of This)

Open `?scene=sweet-dreams`. The complete owner-supplied official video and recording, approximately 3:34 including the fading audio tail, is reconstructed with original accompaniment and actual physical mouth-engine singing. The owner approved the validated 39.25-second, two-excerpt audition covering the main words and higher middle section: “Sounds good—use this version.” Pause after this finished performance before continuing the earlier list.

## Physical singing

The unchanged CHIMERA airway generates the voice through `planPart` → `planPerformance` → `renderPart`. The generated channel contains no recorded singer samples, voice clones, vocoders or effects applied to original vocals. Mouth telemetry is captured during synthesis.

Recognition of the supplied video and isolated vocal supplies rough word windows. Corrected words are aligned to dictionary phones; complete consonants, connected vowels, late diphthong glides and measured continuous source pitch preserve the English phrasing. The higher head-up passage was checked separately because the initial full-track recognizer missed it. The source's incomplete last repetition stays incomplete; no extra final word is invented.

Four wordless passages use locally recovered source phones mapped to articulations already supported by the physical engine. These are synthesized calls, not playback of the original singer or invented English sentences. Their carrier words in the prepared melody are not semantic lyrics; captions label them `[Wordless call]`. Phone recovery remains approximate.

The score includes 272 corrected words, 346 dictionary syllables and nine additional source-phone syllables: 355 notes and 29 connected physical phrases. Forty-five lyric lines and four call captions follow the source. One lead uses female body blend 0.62, pressure 7.8, brightness 0.48, tension 0.54 and breathiness 0.025, with zero random drift and no added vibrato. Recorded doubles are not independently reconstructed. Transcription, pronunciation, source-phone mapping, timing and melody recovery remain approximate.

Original instrumental accompaniment stays continuous at the supplied speed. Uniform gain, resampling and MP3 encoding apply; faint original vocal traces and separation artifacts may remain. No interval is restored from the complete source recording. Audio is 48 kHz and mouth snapshots follow the exact 20 Hz source clock.

The original picture goes black before the recording finishes. The reconstruction holds the bedroom/wake-up tableau under the remaining repeated, fading words, preserving the full supplied audio. The final breath contour follows that fade rather than extending the voice beyond it.

## Boardroom, cows and the dream

The source was inspected throughout, including costume, hands, cow muzzle, monitor, strings, outdoor set and bedside details. The procedural reconstruction follows the orange cropped hair, black suit, pale shirt, patterned tie, black gloves and pointer; dark red boardroom, long table, globe and procedural projector image; gold record plaques and two-person compositions; wooden analogue synthesizer, moving keys, knobs, hands and CRT with a live physical mouth; cows and pasture; red dress, curly dark hair and dotted blindfold; two cello players and moving bows; lying on the table; outdoor boardroom and herd; boat, water and reeds; pale bedroom, wake-up pose, cassette player and pressing hand.

Five separate physical head graphics share one retained singer and one generated performance. The boardroom, field/boat, blindfolded strings, bed and monitor looks never own or dispose the borrowed voice model. Seven cow rigs and seven Dave proxies are decorative animated figures. Cellos, costume, limbs, keys, cow heads/legs/tails, bows, globe, water, hands and cameras derive from absolute source time, so backward seeking restores each view. The source's inset near-4:3 film guides the presentation; its large outer black border is not reproduced.

Close-up fixes keep foreground boardroom heads and the globe out of the cow-muzzle composition, remove costume/body geometry from the monitor face, and tilt cello necks away from the physical singer's face. The blindfold renders over the wire eyes. Every camera restores its own up-vector after the overhead bed/table views. Only this stage's lines use normal blending and depth testing; shared neon materials remain unchanged. Disposal releases stage-owned graphics without disposing shared model data.

Costumes, scale, scenery, gestures, transitions and likenesses are stylized approximations. The film, photographs, projected source footage and logos are not embedded. Procedural tableaux do not reproduce exact filmed choreography.

## Rebuilding and validation

The six prepared files contain the explicit phonetic score, instrumental backing, full mix, compressed telemetry, source-timed scene/captions/cameras and credits. Source video, stems, model weights and analysis remain private outside the repository.

```sh
bun tools/render-sweet-dreams-scene.ts
bun run content:manifest
bun run verify:content
```

The prepared score, backing, tracked WASM and ffmpeg suffice to rebuild the voice, mix and mouth movement. Preserve all 673 preceding public files byte-for-byte; the updated manifest contains 679 files.

The complete performance lasts 214.414762 seconds, with 10,291,909 exact decoded audio frames and 4,289 mouth snapshots. All 29 physical phrases are audible, including the final fading words. The decoded mix peaks at 0.91194, with no clipping, missing samples or extra MP3 end padding. The scene has 49 captions and 32 source-time camera cuts.

Browser, Playwright and layout-lint access remain declined in this chat. Native projections and geometry tests do not verify browser/GPU playback or real-time recording/export interaction.

The unchanged scene-clarity listening aid reported 155 errors among 280 normalized caption words (55.4%) over all 49 excerpts. This includes the nonverbal labels, which are not sung words. It is a listening diagnostic, not an intelligibility pass. The owner approved the actual two-excerpt audition, and its voice settings remain unchanged. The judge was not edited.

Validation passed 187 native tests (two existing ignored), 463 Bun tests across 114 files, TypeScript, content/WASM verification and the production build. Four focused scene tests cover the full source tail, 29 audible physical phrases, exact-clock articulation, direct backward seeking, five graphics on one retained model, phone/landscape head and glove framing, the monitor head/body boundary, cello/face occlusion and unchanged shared neon materials. Native geometry projections were inspected across 27 complete-set, close-up and phone views; these are not browser screenshots. All 673 preceding public assets remain byte-identical.

Local HTTP checks matched all 679 built media files to the manifest and served the direct route, app bundles and six new scene files correctly.

## Live release

Application commit `57baea0` is live at [Sweet Dreams](https://agenticspiros.com/chimera-song-mouth/?scene=sweet-dreams). All 17 changed files uploaded successfully, with the entry page last. Live verification matched 168 files, including the six new scene assets, app bundles and twenty-two preserved performances, plus the direct scene route. The temporary publish job was removed. All earlier prepared content remains preserved. Browser/GPU playback and recording remain untested for this scene.
