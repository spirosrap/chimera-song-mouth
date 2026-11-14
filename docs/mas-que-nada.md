# Sérgio Mendes — Mas Que Nada

Open `?scene=mas-que-nada`. The complete supplied vintage performance is reconstructed with original accompaniment and one physical Brazilian Portuguese lead. The source video itself is not embedded.

## Singing and source timing

The unchanged physical airway generates the featured singer through `planPart` → `planPerformance` → `renderPart`. The generated track contains no source singer samples, voice clone, vocoder or vocal effect. No engine, calibration or judge code changed.

The user approved the 86–131 second preview. The lead uses a 0.72 female blend, pressure 7.4, brightness 0.53, breathiness 0.028, tension 0.5 and no random pitch drift. The score contains 142 words and 250 explicit Brazilian Portuguese syllables in 16 connected phrases, with 1,313 continuous pitch/breath points. Portuguese vowels, nasal vowels, tap, uvular r, palatal nasal and lateral are represented explicitly rather than guessed through the English dictionary. Local constrained phone alignment locates articulations; continuous pitch preserves the source phrasing.

Original accompaniment remains at the supplied speed and on its source clock. The instrumental opening is retained before the first sung phrase, followed by continuously separated accompaniment. Separation may leave faint recorded-vocal traces. The stereo mix and 20 Hz physical telemetry share the 48 kHz synthesis clock. Pronunciation, pitch tracking and timbre remain approximate.

## The performance

The supplied video was inspected across its full duration. The sepia reconstruction includes a long-haired physical singer in a period dress, vintage microphone, Sérgio at the piano, a second singer, lush jungle foliage and band figures. Decorative people allocate no additional voice models.

All locations, costumes, gestures, hair movement, foliage, fades and cameras use absolute source time. Seeking restores the scene directly. The player retains one voice-model lease; the stage borrows it and disposes only its own graphics. Portrait and landscape close-ups keep the working mouth framed.

## Rebuilding and validation

Six assets include the scene/captions/cameras, explicit Portuguese phonetic score, stereo mix, original accompaniment, compressed telemetry and credits. Input recordings, separated analysis stems, models and caches remain local and are excluded from the repository.

```sh
bun tools/render-mas-que-nada-scene.ts
bun run content:manifest
bun run verify:content
```

The included score, backing, WASM and ffmpeg suffice for rebuilding. Tests cover the complete performance, audible physical phrases, quiet opening and ending, finite sample-clock telemetry, deterministic scene restoration, portrait and landscape framing, and borrowed-model ownership. All 586 earlier public assets must remain byte-identical; the new manifest contains 592 files.

The full render is 155.784376 seconds, with 7,477,679 stereo frames and 3,116 finite telemetry frames. All 16 phrases are audible; the decoded MP3 peaks at 0.705. All 586 previous public files remain byte-identical. The 138.583-second vowel attack is aperiodic, so its single-window pitch estimate is unstable; adjacent stable portions of the same physical vowel verify the planned pitch within 24.75 cents. Neither the audio nor the pitch judges were changed to bypass that attack.

Validation passed 395 Bun tests across 98 files, TypeScript, the 592-file content manifest and the production build. Local HTTP checks matched every built asset and served the direct scene route, application bundles and all six new files. Chromium playback, seeking, canvas rendering and recorder availability passed without console errors. Browser screenshots were inspected in landscape and portrait. The browser’s real-time video export was not run; this scene follows the other performances’ built-in recorder pattern rather than adding a pre-encoded MP4.

The unchanged English-only scene-clarity listening aid reported a 99.3% word-error rate on isolated Portuguese caption excerpts. Its fixed English decoder and normalization are unsuitable for evaluating Portuguese singing; this is recorded as a diagnostic limitation, not a pronunciation-quality result. The user’s approved voice is retained.

Likeness, singing and staging remain approximate.
