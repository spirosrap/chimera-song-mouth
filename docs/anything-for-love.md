# Meat Loaf — I’d Do Anything for Love

Open `?scene=anything-for-love`. The complete supplied official video is reconstructed as a 7:41 scene, including its cinematic opening and ending, original accompaniment and two physical mouth-engine singers. This is the third performance in [the sentimental sequence](sentimental-selections.md). Pause after the completed performance before starting the next one.

## Singing and source clock

The unchanged physical engine generates the lead and closing duet through `planPart` → `planPerformance` → `renderPart`. Neither synthesized channel contains recorded singer samples, voice cloning, a vocoder or an effect applied to the recorded vocals. No engine, calibration or speech-judge code changes are required.

The owner approved the 337–388 second closing-vow and duet preview: “Sounds good—use this.” The full performance retains its physical bodies and voice settings. It has 568 lead words and 107 answering words, with 676 and 137 sung syllables in 47 and eight connected phrases respectively.

Words are transcribed locally from the supplied recording, with independent recognition over the original mix and isolated passages. Ambiguous recognizer errors were checked against [the composer’s published script](https://jimsteinman.com/scripts/Bat2100Script.pdf); the supplied recording’s edit, duet and ad-libs remain the performance source. The script contains additional theatrical material that is not inserted here. A misrecognized final consonant in the second verse is corrected to its intended nasal articulation at the same source time.

Dictionary phones are independently aligned for the two singers. Complete consonants, held vowels and late diphthong glides follow the source phrasing. Continuous measured pitch retains slides and vibrato rather than rounding the singing to MIDI notes. The lead uses the adult male body, pressure 7.8, brightness 0.54, breathiness 0.03 and tension 0.54. The answering voice uses a 0.72 female body blend, pressure 7.8, brightness 0.59, breathiness 0.025 and tension 0.54. Neither has random pitch drift or vocal effects.

Original music and nonverbal effects remain at the supplied speed. The nonvocal cinematic opening is preserved, followed by continuous vocal separation through the rests and ending. Faint recorded-vocal traces may remain. The two voices represent the featured lead and closing duet, rather than separately reconstructing each recorded harmony layer. Pronunciation, pitch tracking and likenesses remain approximate.

The stereo audio and mouth telemetry use the same 48 kHz synthesis clock, with physical snapshots at exactly 20 Hz. Complete captions keep their own sung windows when voices overlap. The opening text is a silent stage direction, not a synthesized spoken line.

## Staging

The full source was inspected across its duration. The reconstruction follows the motorcycle and helicopter chase, foggy forest and castle, the cracked mirror and physical reflection, beast-like facial accessories and long hair, black clothing and an ornate chair in the candlelit hall, the woman in a white dress, bedroom and floating bed, shattered glass, detectives in glasses with flashlights, the transformation and sunset motorcycle escape. Supporting figures are clothed. The original video itself is not embedded.

All locations, poses, riding, reclining, bed movement, mask fade, rain, mist, rotor motion, shards and camera cuts use absolute source time. Backward seeks restore the scene directly. The player retains two voice-model leases. The stage borrows those models; the mirror’s third physical head reuses the lead model. Only stage-owned graphics are disposed. Portrait and landscape close-ups follow each singer’s head while seated, riding and reclining.

## Rebuilding and validation

Seven assets include the scene/captions/cameras, explicit phonetic score, full stereo mix, original accompaniment, two compressed physical telemetry files and credits. Input video, separation stems, analysis caches and model weights stay local and outside the repository.

```sh
bun tools/render-anything-for-love-scene.ts
bun run content:manifest
bun run verify:content
```

The included score, backing, WASM and ffmpeg suffice to rebuild the physical voices, mix and synchronized movement. Checks cover the full source duration, the opening and final duet, both independent voices, valid physical phones, audible phrases, quiet opening, finite sample-clock telemetry, deterministic seeking, mirror and vehicle visibility, floating bed and transformation, head framing and borrowed-model ownership. All 497 earlier public assets must remain byte-identical; the new manifest contains 504 files.

Native geometry projections support layout inspection. Browser, Playwright and layout-lint access remain declined in this project. Browser/GPU playback and recording/export interaction remain unverified.

The full render is 460.941 seconds, with 22,125,169 stereo samples per channel and 9,219 physical telemetry frames per mouth. All 47 lead and eight answering phrases are audible. The decoded MP3 peaks at 0.917. The scene contains 90 caption windows (including its silent opening card) and 42 source-time camera cuts. All 497 previous public assets remain byte-identical.

Forty-four sampled held-vowel waveform windows—24 from the lead and 20 from the shorter answering part—match the planned fundamental within 50.11 cents. Three raw YIN estimates were biased by strong harmonics or a changing period; independent autocorrelation and spectral analysis verified those fundamentals. Raw estimator reports are retained locally. This review changed neither audio nor speech judges. One dense phrase boundary is moved by 13.65 milliseconds to keep all phones complete and sequential.

The unchanged scene-clarity listening aid completed on all 89 sung caption excerpts over the original accompaniment. English Whisper marked 303 of 675 words as errors (44.9%). This is a listening diagnostic rather than a pronunciation-quality pass: sustained singing, short clipped responses and some consonants remain difficult for automatic recognition. The owner-approved voices are retained.

Validation passed 144 native tests (two existing ignores), 336 Bun tests across 85 files, TypeScript, the 504-file content manifest and the subfolder production build. Native geometry projections were inspected using the actual new telemetry. Local HTTP checks matched all built public assets and served the direct scene route, application bundles and all seven new scene assets.
