# Michael Bolton — Said I Loved You…But I Lied

Open `?scene=said-i-loved-you`. The complete supplied official video is included as a 5:03 staged performance, with original accompaniment and a physical mouth singer. This is the first of the six sentimental selections requested by the user; the remaining order is recorded in [the sequence](sentimental-selections.md).

## Singing and source timing

The unchanged physical airway generates the foreground singer through `planPart` → `planPerformance` → `renderPart`. The generated track contains no source singer samples, voice clone, vocoder or vocal effect. No engine, calibration or judge code changed.

The user approved the 76–108 second chorus preview: “Sounds good—use this.” The full performance retains its physical body, voice settings and phrasing. The score contains 280 words and 304 syllables in 35 connected phrases, with 2,821 pitch/breath points. Local recognition is checked against the supplied recording in overlapping excerpts, including the quiet opening, recurring choruses and closing ad-libs. Dictionary phones are aligned to the source vocal. Consonants retain articulation time, vowels sustain the measured notes, diphthongs glide late, and continuous pitch preserves slides and vibrato. The complete musical opening remains before the first sung line. The final sung word is checked against the vocal envelope so recognition cannot cut its sustain short.

The singer uses the adult male physical body, pressure 7.5, brightness 0.52, breathiness 0.04, tension 0.52 and no random pitch drift. The reference provides timing and melody measurements; the engine generates the voice. Layered recorded parts are represented by one featured physical singer, rather than independently cloned voices.

Original accompaniment remains at the supplied speed and on its source clock. Separation stays continuous after the opening, including vocal rests and the ending, and may leave faint recorded-vocal traces. The stereo mix and 20 Hz physical telemetry share the 48 kHz synthesis clock. Pronunciation, pitch tracking and timbre remain approximate.

## The performance

The supplied video was inspected across its full duration. The reconstruction includes the stormy opening, sunset and fire, brown coat and white open collar, blue shirt and jeans on the canyon rocks, dark cave and black clothing, windblown curls, reaching and heart-clutching gestures, clothed lovers, white transition and closing horse silhouettes. The horses use opaque filled geometry so they remain dark against the sunset; flame shapes and wire lines animate together. Camera cuts follow the source approximately. The source video itself is not embedded.

All locations, costumes, gestures, hair movement, fire, cloud motion, fades and cameras use absolute source time. Seeking restores the scene directly. The player retains one voice-model lease; the stage borrows it and disposes its own graphics. Decorative lovers and horses do not allocate further voice models. Portrait and landscape close-ups keep the working mouth in view.

## Rebuilding and validation

Six assets include the scene/captions/cameras, explicit phonetic score, stereo mix, original accompaniment, compressed telemetry and credits. Input recordings, separated analysis stems, models and caches remain local and are excluded from the repository.

```sh
bun tools/render-said-i-loved-you-scene.ts
bun run content:manifest
bun run verify:content
```

The included score, backing, WASM and ffmpeg suffice for rebuilding. Checks cover full content, audible physical phrases, quiet opening/ending, finite sample-clock telemetry, deterministic scene restoration, fire and horse visibility, framing and borrowed-model ownership. All 484 earlier public assets must remain byte-identical; the new manifest contains 490 files.

Native projections provide layout inspection. Browser, Playwright and layout-lint access remain declined in this project; browser/GPU playback and recording/export interactions remain unverified. Likeness, singing and staging are approximate.

The full render is 303.069 seconds, with 14,547,291 stereo frames and 6,062 finite telemetry frames. All 35 phrases are audible; the decoded MP3 peaks at 0.669. Twenty-four sampled held-vowel waveform windows remain within 37.7 cents of the planned pitch. All 484 previous public files remain byte-identical.

The unchanged scene-clarity listening aid completed. On isolated caption excerpts over the original accompaniment, English Whisper marked 95 of 280 words as errors (33.9%). Sustained vowels and some consonants remain limitations for automatic recognition. This is a listening diagnostic rather than a pronunciation-quality pass; the user’s approved chorus voice is retained.

Validation passed 144 native tests (two existing ignores), 328 Bun tests across 83 files, TypeScript, the 490-file content manifest and the subfolder production build. Local HTTP checks served the direct scene route, application bundles and all six new assets with matching bytes.

Deployed on 2026-11-13 from application commit `8064247` to [Said I Loved You…But I Lied](https://agenticspiros.com/chimera-song-mouth/?scene=said-i-loved-you). All 16 changed files uploaded successfully, with the entry page last. HTTP checks matched 196 live files, including all six new assets, app bundles and preserved content. The direct scene route serves the deployed entry page.
