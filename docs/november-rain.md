# Guns N’ Roses — November Rain

Open `?scene=november-rain`. The complete supplied official video is reconstructed as a 9:17 procedural performance, with original instrumental music, one physical lead and an answering physical outro voice. The source video itself is not embedded.

## Singing and source timing

The unchanged physical airway generates both singers through `planPart` → `planPerformance` → `renderPart`. The generated tracks contain no source singer samples, voice clone, vocoder or vocal effect. No engine, calibration or judge code changed.

The user approved the 480–522 second outro preview. The lead uses the adult male physical body, pressure 7.7, brightness 0.55, breathiness 0.03, tension 0.54 and no random pitch drift. The answering voice uses a 0.72 female blend, pressure 7.4, brightness 0.51, breathiness 0.03 and tension 0.5. The lead contains 327 words and 403 syllables in 51 connected phrases; the answering part contains 30 words and 36 syllables in eight phrases. Corrected source words are aligned locally to dictionary phones, with complete consonants, held vowels, late diphthong glides and measured continuous pitch.

Original instrumental accompaniment and guitar solos remain at the supplied speed and on their source clock. The original nonvocal opening is preserved before separation becomes continuous; faint recorded-vocal traces and separation artifacts may remain. The stereo mix and 20 Hz physical telemetry share the 48 kHz synthesis clock. Pronunciation, pitch tracking, harmony and timbre remain approximate.

## The performance

The supplied video was inspected across its full duration. The procedural reconstruction includes the piano concert and orchestra, blue bedroom, candlelit wedding, veil, ring and kiss, desert church and top-hatted guitarist, bar, reception and storm, cake dive, funeral and casket, umbrella procession, hearses, cemetery and red roses at the grave. Decorative figures are clothed and allocate no additional voice models.

All locations, costumes, gestures, hair movement, story action, fades and cameras use absolute source time. Seeking restores the scene directly. The player retains two voice-model leases; the stage borrows them and disposes only its own graphics. Portrait and landscape close-ups keep the working mouth framed.

## Rebuilding and validation

Seven assets include the scene/captions/cameras, explicit phonetic scores, stereo mix, original instrumental accompaniment, two compressed telemetry tracks and credits. Input recordings, separated analysis stems, models and caches remain local and are excluded from the repository.

```sh
bun tools/render-november-rain-scene.ts
bun run content:manifest
bun run verify:content
```

The included scores, backing, WASM and ffmpeg suffice for rebuilding. Tests cover the complete performance, audible physical phrases, quiet opening and ending, finite sample-clock telemetry, deterministic restoration of all nine locations, wedding/storm/grave motion, framing and borrowed-model ownership. All 555 earlier public assets must remain byte-identical; the new manifest contains 562 files.

The full render is 557.210952 seconds, with 26,746,126 stereo frames and 11,145 finite telemetry frames per voice. All 51 lead phrases and eight answering phrases are audible; the decoded MP3 peaks at 0.643. All 555 previous public files remain byte-identical. Two sampled vowel attacks produced unstable single-window pitch estimates; adjacent stable portions of the same physical vowels verified the planned pitch within 38.87 and 7.59 cents. Neither the audio nor the pitch judges were changed to bypass those attacks.

Validation passed 385 Bun tests across 96 files, TypeScript, the 562-file content manifest and the production build. Local HTTP checks matched every built asset and served the direct scene route, application bundles and all seven new files. Chromium playback, seeking, canvas rendering and recorder availability passed without console errors. Native projections and browser screenshots were inspected in landscape and portrait. The browser’s real-time video export was not run; this scene follows the other performances’ built-in recorder pattern rather than adding a pre-encoded MP4.

The unchanged scene-clarity listening aid reported a 47.9% word-error rate over isolated caption excerpts. Sustained vowels and some consonants remain limitations for automatic recognition. This is a listening diagnostic rather than a pronunciation-quality pass; the user’s approved outro voices are retained.

Likeness, singing and staging remain approximate.
