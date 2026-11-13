# Bon Jovi — Always

Open `?scene=bon-jovi-always`. The complete supplied official video is reconstructed as a 6:06 procedural performance, with original accompaniment and one physical English lead. The source video itself is not embedded.

## Singing and source timing

The unchanged physical airway generates the foreground singer through `planPart` → `planPerformance` → `renderPart`. The generated track contains no source singer samples, voice clone, vocoder or vocal effect. No engine, calibration or judge code changed.

The user approved the 78–124 second chorus preview. The full performance preserves its adult male body, pressure 7.6, brightness 0.52, breathiness 0.035, tension 0.53 and zero random pitch drift. The score contains 379 words and 427 syllables in 45 connected phrases, with 3,335 continuous pitch/breath points. Corrected source words are aligned locally to dictionary phones. Consonants retain articulation time, vowels sustain the measured notes, diphthongs glide late, and continuous pitch preserves slides and vibrato. The final sustained “Always” and nonlexical outro are included.

Original accompaniment remains at the supplied speed and on its source clock. The first 37.41 seconds retain the original instrumental opening, followed by a short crossfade into continuous separated accompaniment. Separation may leave faint recorded-vocal traces. The stereo mix and 20 Hz physical telemetry share the 48 kHz synthesis clock. Pronunciation, pitch tracking and timbre remain approximate.

## The performance

The supplied video was inspected across its full duration. The procedural reconstruction includes the balcony market, blonde woman with sunglasses, dusty convertible, apartment and bed, crowded party, dramatic vintage-microphone close-ups, clothed embraces and silhouettes, kitchen and painting-loft argument, Jon on the phone, explosion and fire, emergency vehicles and turquoise art studio. Jon has shaggy blond hair, dark clothing and expressive gestures. Decorative figures are clothed and do not allocate additional voice models.

All locations, costumes, gestures, hair movement, story action, fades and cameras use absolute source time. Seeking restores the scene directly. The player retains one voice-model lease; the stage borrows it and disposes only its own graphics. Portrait and landscape close-ups keep the working mouth framed.

## Rebuilding and validation

Six assets include the scene/captions/cameras, explicit phonetic score, stereo mix, original accompaniment, compressed telemetry and credits. Input recordings, separated analysis stems, models and caches remain local and are excluded from the repository.

```sh
bun tools/render-bon-jovi-always-scene.ts
bun run content:manifest
bun run verify:content
```

The included score, backing, WASM and ffmpeg suffice for rebuilding. Tests cover the complete performance, audible physical phrases, quiet opening and ending, finite sample-clock telemetry, deterministic scene restoration, location visibility, framing and borrowed-model ownership. All 543 earlier public assets must remain byte-identical; the new manifest contains 549 files.

The full render is 366.203605 seconds, with 17,577,774 stereo frames and 7,325 finite telemetry frames. All 45 phrases are audible; the decoded MP3 peaks at 0.918. All 543 previous public files remain byte-identical. Twenty-four sampled held-vowel windows were reviewed. The 191.879-second sample lands on an aperiodic vowel attack, so its raw YIN/autocorrelation measurements are unstable; adjacent stable portions of the same vowel verify the planned pitch within 22.27 cents. Neither the audio nor the pitch judges were changed to bypass that attack.

Validation passed all native tests, 381 Bun tests across 95 files, TypeScript, the 549-file content manifest and the production build. Local HTTP checks matched every built asset and served the direct scene route, application bundles and all six new files. Chromium playback, seeking, canvas rendering and recorder availability passed without console errors. The app-wide layout sweep completed 224 views and reported seven errors and twelve warnings in pre-existing Sing/gestural-score layouts unrelated to this scene; it is not claimed as passing. Native projections and browser screenshots were inspected in landscape and portrait. The browser’s real-time video export was not run; this scene follows the other performances’ built-in recorder pattern rather than adding a pre-encoded MP4.

The unchanged scene-clarity listening aid completed. On isolated caption excerpts over the original accompaniment, English Whisper reported a 63.3% word-error rate. Sustained vowels and some consonants remain limitations for automatic recognition. This is a listening diagnostic rather than a pronunciation-quality pass; the user’s approved chorus voice is retained.

Deployed on 2026-11-13 from application commit `641ef44` to [Bon Jovi — Always](https://agenticspiros.com/chimera-song-mouth/?scene=bon-jovi-always). All 26 changed files uploaded successfully, with the entry page last. Live HTTP checks matched 32 files, including all six new assets, Hello, application bundles and preserved Whitney media. The direct scene route serves the deployed entry page. Local Chromium playback passed; the deployed browser connection was refused in this environment, so live browser playback and real-time recording remain unverified.

Likeness, singing and staging remain approximate.
