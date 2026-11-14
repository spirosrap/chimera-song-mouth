# Shakespears Sister — Stay

Open `?scene=shakespears-stay`. The complete supplied 3:58 official video is reconstructed with its original instrumental accompaniment, two contrasting physical singers and a procedural bedside scene. The owner approved the 108–144 second duet preview: “Sounds good—use this.” Pause after the finished performance before beginning another selection.

## Physical duet

The unchanged CHIMERA engine generates both singers through `planPart` → `planPerformance` → `renderPart`. The generated voice channels contain no recorded singer samples, voice clone, vocoder or effect applied to recorded vocals. Physical mouth telemetry is captured during the same synthesis run.

Local original-mix and isolated-vocal recognition supplies the transcription. Short independent ending excerpts replace recognizer repetition loops; the repeated calls remain separate articulations. CMU dictionary phones are aligned to the isolated vocal with a local phonetic CTC model. Complete consonants, held vowels and late diphthong glides follow the source, with continuous measured pitch retaining slides and vibrato. The source timing, not blank CTC frames, determines phrase holds and rests.

Marcella's high pleading voice uses female body blend 0.82 and brightness 0.57. Siobhan's lower answering voice uses blend 0.28 and brightness 0.43. Both use pressure 7.8, tension 0.54, breathiness 0.025 and zero random drift or added vibrato. The approved settings and score remain unchanged for the full render. There are 108 lead words in 120 sung syllables and 59 answering words in 62 syllables. These two parts represent the featured singers, rather than every overdub in the recording. Pronunciation and pitch tracking remain approximate.

Original music remains continuous at the supplied speed, including the instrumental opening, bridge and ending. Vocal separation is applied across the whole recording; faint recorded-vocal traces may remain. The exact source audio duration plus a 350 ms physical release determines the performance length. Audio uses 48 kHz; recorded mouth snapshots use the exact 20 Hz sample clock.

## Visual reconstruction

The full supplied video was inspected across its duration. The scene follows the dark blue bedside chamber, tall pillars, stars and Earth, brass bed, white sheets and silent patient. Marcella has short swept hair and a white-trimmed black dress. Siobhan has long dark curls, a gold-accented sparkling outfit, splayed hands and the luminous blue-white curtain tunnel. The bedside struggle disturbs the sheet; the patient rises for the final embrace, and the closing tunnel fades to black. Supporting figures are clothed. Likenesses and staging are stylized approximations.

The two singing heads have independent retained model leases. The silent patient's head borrows the lead model and never plays another singer's vocal telemetry. The stage disposes only its own graphics. Poses, curtain movement, Earth rotation, sheet motion and 31 camera cuts depend on absolute source time, so backwards seeks restore them directly. Close-ups follow each moving head; landscape uses the source's near-4:3 pillarbox and portrait uses responsive framing.

## Rebuilding and verification

Seven prepared files include the explicit phonetic score, original backing, complete stereo mix, two gzipped telemetry streams, scene/captions/cameras and credits. Raw source video, isolated stems, local analysis and model weights stay outside the repository.

```sh
bun tools/render-shakespears-stay-scene.ts
bun run content:manifest
bun run verify:content
```

The retained score, backing, precompiled WASM and ffmpeg suffice to rebuild the audio and physical telemetry. Preserve all 592 previous public assets byte-for-byte; the updated manifest contains 599 files.

Browser, Playwright and layout-lint access remain declined in this chat. Native scene projections and geometry checks do not verify browser/GPU playback or real-time recording/export interactions.

The finished audio contains 11,437,675 stereo frames (238.284875 seconds), with 4,766 physical snapshots per singer and 26 caption windows. Every prepared phrase has nonzero output and both silent bookends and telemetry clocks are checked. The decoded mix peaks at 0.9139. All 592 preceding public assets, including the separately completed Mas Que Nada addition, are preserved byte-for-byte.

A local waveform review sampled 24 held-vowel windows per singer. Forty-seven of 48 are within 60 cents after independent period review of one second-harmonic YIN estimate. A short lead entry at 189.477 seconds remains an uncertain 62.61-cent diagnostic outlier with lower waveform periodicity; it is retained without changing the approved voice or claiming a complete pitch-quality pass. The unchanged scene-clarity listening aid completed on all 26 captions and marked 52 of 167 words as errors (31.1%), particularly the repeated high finale. This is a listening diagnostic, not an intelligibility pass; the approved duet remains unchanged.

Combined validation with the separately completed Mas Que Nada addition passed 187 native tests (two existing ignored), 414 Bun tests across 102 files, TypeScript, all 599 media/WASM checks, the subfolder production build and local HTTP checks of the scene route, application bundles and all seven new files. Focused native checks cover both audible physical voices, source clocks, backwards seeking, sheet motion, revival, responsive framing and borrowed-model ownership. The tracked WASM retains its unchanged provenance.
