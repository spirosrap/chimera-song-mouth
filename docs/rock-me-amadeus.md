# Falco — Rock Me Amadeus

Open `?scene=rock-me-amadeus`. The complete supplied 3:44 official video is reconstructed with original instrumental accompaniment, three physical vocal parts and the contrasting Mozart court and biker scenes. The owner approved the 61–96 second German rap and layered chorus preview: “Sounds good—use this version.” Pause after the finished performance before starting another selection.

## Physical voices and source timing

The unchanged CHIMERA airway generates the lead, higher chorus and lower chorus through `planPart` → `planPerformance` → `renderPart`. The generated channels contain no recorded singer samples, clones, vocoders or effects on source vocals. Physical mouth telemetry is captured during the same synthesis run.

Local recognition on the supplied original mix and isolated vocal provides a rough German transcript. The repeated processed chorus confuses recognition, so its calls follow the measured source grid: approximately 89.4 BPM and 1.3425 seconds per half-bar. German verses and English calls have explicit language-appropriate phonemes. Task-local eSpeak-NG supplies text IPA only, never audio; the prepared score includes all resulting phones and needs no additional language frontend to play or rebuild. Opening and closing chopped sounds use locally decoded phonetic landmarks instead of invented lyric words. A local phonetic CTC model aligns consonants and vowels to the recording. Complete consonants, held vowels, late glides and measured continuous pitch preserve connected phrasing.

There are 257 lead tokens, 582 sung syllables and 26 connected lead phrases. The two supporting chorus parts each have 357 syllables in 17 phrases. Supporting registers are estimated from the composite recording, rather than independently recovered original harmonies. Transcription, pronunciation and pitch tracking remain approximate. No shared engine, calibration, dictionary, golden files or judges were changed.

The lead body blend is 0.05 female, pressure 7.9 and brightness 0.50. The higher chorus uses 0.28 female, pressure 7.6 and brightness 0.56; the lower chorus uses the male body, pressure 7.9 and brightness 0.42 with a lower register. All use tension 0.54, breathiness 0.025, zero random drift and no added vibrato. The prepared score retains these settings and stereo balance.

The instrumental stem remains continuous at the supplied speed, including the original opening. Faint recorded-vocal separation traces may remain. Duration is 224.654762 seconds, including a 350 ms physical release. The stereo mix contains 10,783,429 frames at 48 kHz; each voice has 4,494 snapshots at the exact 20 Hz clock. The decoded mix peaks at 0.9371. Every physical phrase is audible; the voice channels are silent during the instrumental opening.

## Costumes, people and scenery

The source was inspected across its full duration. The scene follows the blue Vienna title postcard, cathedral tower and Ferris wheel; black horse-drawn coach; bright windowed grand hall with palms, chandelier and courtiers; slick-haired tuxedo Falco with a white shirt and black bow tie; coloured Mozart curls, brocade coat, white cravat, breeches and stockings; powdered wigs, tricorne hats and pastel hoop gowns; neon-lit biker bar, leather-clad extras and motorcycles arriving at court; and the closing praying hands and fade.

The lead alternates between two physical heads sharing one retained model. Two independent retained models supply the chorus. The extras and riders are decorative figures, not additional recorded voices. Short source-timed subtitle lines stay separate from the longer connected airway phrases. Source-time camera cuts, gestures, crowds, coach wheels, motorcycles and prayer restore directly after seeking. Landscape views retain a 4:3 image; portrait close-ups adapt to keep the physical heads framed. Staging, likenesses and choreography are stylized approximations rather than embedded source film.

The stage borrows all three voice models and disposes only its own head graphics, geometry and materials. Existing model leases and shared rendering remain unchanged.

## Rebuilding and verification

Eight prepared files include the three-part phonetic score, original backing, full mix, three compressed telemetry tracks, scene/captions/cameras and credits. Raw input video, stems, analysis, task-local phonetic tools and model weights stay private, outside the repository.

```sh
bun tools/render-rock-me-amadeus-scene.ts
bun run content:manifest
bun run verify:content
```

The prepared score, backing, tracked WASM and ffmpeg suffice to rebuild the voices, mix and synchronized mouth movement. All 605 preceding public assets are preserved byte-for-byte; the updated manifest contains 613 files.

Browser, Playwright and layout-lint access remain declined in this chat. Native projections and geometry checks do not verify browser/GPU playback or real-time recording/export interaction.

Validation passed 187 native tests (two existing ignored), 422 Bun tests across 104 files, TypeScript, all 613 public hashes and the unchanged WASM provenance. The four Falco tests passed again after the final camera/subtitle changes. The subfolder production build and local HTTP checks matched all built media, the direct route, application bundles and eight new scene files. Native projections were inspected for the postcard, costumes, coach, court, bar, prayer and portrait framing. Browser/GPU playback and real-time recording remain unverified.
