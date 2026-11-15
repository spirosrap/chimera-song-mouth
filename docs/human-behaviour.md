# Björk — Human Behaviour

Open `?scene=human-behaviour`. The complete owner-supplied official video, approximately 4:15 including its quiet ending, is reconstructed with original accompaniment and actual physical mouth-engine singing. The owner approved the validated 32–64 second preview: “Sounds good—use this version.” Pause after this finished performance before continuing the earlier list.

## Physical singing and calls

The unchanged CHIMERA airway generates the voice through `planPart` → `planPerformance` → `renderPart`. The generated channel contains no recorded singer samples, voice clones, vocoders or effects applied to original vocals. Mouth telemetry is captured during synthesis.

Local recognition of the supplied video and isolated vocal provides rough word windows. Lyrics are corrected before dictionary-phone alignment. Recognizer hallucinations over the instrumental and quiet sections are rejected. Complete consonants, connected vowels, late diphthong glides and measured continuous source pitch preserve the English phrasing. The low repeated refrains are reconstructed rather than omitted because the recognizer treats them as background music.

Seven nonverbal passages use task-local phonetic recognition of the isolated source. Recovered vowels and intervening consonants are mapped to phones already supported by the physical engine, joined at source-aligned anchors and driven by measured pitch and breath. These are generated articulations, not playback of the recorded calls or invented English sentences. The source-phone recovery is approximate. Their one-syllable carrier words in the prepared melody are not semantic lyrics; scene captions honestly label them `[Wordless call]`.

The score includes 119 corrected words, 217 dictionary syllables and 26 additional source-phone syllables: 243 notes and 36 connected physical phrases in total. Thirty lyric lines and seven call captions follow the source. The lead uses female body blend 0.75, pressure 7.8, brightness 0.50, tension 0.54 and breathiness 0.025, with zero random drift and no added vibrato. Recorded doubles are not independently reconstructed. Transcription, pronunciation, timing, source-phone mapping and melody recovery remain approximate.

Original accompaniment stays continuous at the supplied speed. Uniform gain, resampling and MP3 encoding apply; faint original vocal traces and separation artifacts may remain. No presumed instrumental interval is restored from the full source: the film’s instrumental passages include quiet vocal loops and calls. Audio is 48 kHz and mouth snapshots follow the exact 20 Hz source clock.

## The bear’s miniature world

The source was inspected throughout, with additional costume, bear, cabin, astronaut and bulb views. The procedural reconstruction follows the miniature night forest, branching trunks, foliage, ferns and glowing wooden cabin; giant plush bear with rounded ears, muzzle, dark nose, jaw, limbs and fur strokes; hunter with cap, beard, glasses and checked clothing; night road, blue car and headlights; striped metallic-looking dress, loose brown hair and fuzzy cardigan; cabin, cereal bowl and spoon, chair, checked table, window, curtains, bottle and antlers; moth and hanging light bulb; blue water and floating portrait; astronaut, helmet and gloves, moon and Earth; little singer in the bear’s purple belly and the closing green world.

Five separate physical head graphics share one retained voice model and one recorded generated performance. The forest, seated cabin, floating, astronaut and belly looks never own or dispose the borrowed singer. Three decorative bear graphics serve the forest, belly and final-world tableaux. Other figures are decorative proxies. The source’s inset, near-4:3 film image guides the presentation; its large outer black border is not reproduced.

The bear, hunter, moth, car, ripples, foliage, costumes and cameras derive from absolute source time, so seeking restores each set directly. The floating portrait uses an explicit overhead up-vector, and every later view restores its own up-vector. A foreground canopy that initially covered the bear’s face was cleared; ray-based regression checks keep both eyes visible. Only this stage’s lines use normal blending and depth testing, preserving other scenes’ neon materials. Disposal releases stage-owned graphics, geometry and materials, without changing shared model data.

Costumes, sets, scale, gestures, transitions and likenesses are stylized approximations. The original film, source pictures, logos and watermark are not embedded. The woodland fight, shrinking, moon travel and belly view are procedural tableaux rather than exact filmed choreography.

## Rebuilding and validation

The six prepared files contain the explicit phonetic score, instrumental backing, full mix, compressed telemetry, source-timed scene/captions/cameras and credits. Source video, stems, model weights and analysis remain private outside the repository.

```sh
bun tools/render-human-behaviour-scene.ts
bun run content:manifest
bun run verify:content
```

The prepared score, backing, tracked WASM and ffmpeg suffice to rebuild the voice, mix and mouth movements. Preserve all 667 preceding public files byte-for-byte; the updated manifest contains 673 files.

Browser, Playwright and layout-lint access remain declined in this chat. Native projections and geometry tests do not verify browser/GPU playback or real-time recording/export interaction.

The complete performance lasts 255.397982 seconds, with 12,259,104 exact decoded audio frames and 5,108 mouth snapshots. All 36 physical phrases are audible; the generated channel is silent in the instrumental bookends and confirmed gaps. The decoded mix peaks at 0.5469, with no clipping, missing samples or extra MP3 end padding. The score has 243 notes, 37 captions and 34 source-time camera cuts.

The unchanged scene-clarity listening aid reported 97 errors among 133 normalized caption words (72.9%) over all 37 excerpts. This includes the nonverbal caption labels, which are not sung words, and British/American spelling differences. It is a listening diagnostic, not an intelligibility pass. The owner approved the actual 32-second preview, and its voice settings remain unchanged. The judge was not edited.

Validation passed 187 native tests (two existing ignored), 459 Bun tests across 113 files and the four final focused scene checks. The focused checks cover complete audible phrases, exact source-clock telemetry, instrumental silence, direct seeking, five graphics on one retained model, phone and landscape head framing, clear bear eyes and hunter framing/occlusion, overhead camera restoration and unchanged shared neon materials. Native projections were inspected across all sets and close-up/mobile views; these are not browser screenshots. Final hunter face polish was followed by the focused checks and a fresh TypeScript/content-verified production build. All 667 preceding public assets remain byte-identical.

Local HTTP checks matched all 673 built media files to the manifest and served the direct route, app bundles and six new scene files correctly.

## Live release

Application commit `b9fdbd5` is live at [Human Behaviour](https://agenticspiros.com/chimera-song-mouth/?scene=human-behaviour). All 17 changed files uploaded successfully, with the entry page last. Live verification matched 162 files, including the six new scene assets, app bundles and twenty-one preserved performances, plus the direct scene route. The temporary publish job was removed. All earlier prepared content remains preserved. Browser/GPU playback and recording remain untested for this scene.
