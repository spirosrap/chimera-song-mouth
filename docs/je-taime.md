# Lara Fabian — Je t’aime

Open `?scene=je-taime`. This is the complete supplied official studio music video, including its long leader and ending, rather than the separate audience-choir live performance. The source lasts 300.094694 seconds; a 0.35-second release gives 300.444694 seconds. It is the fifth selection in [the sentimental sequence](sentimental-selections.md). All previous selections remain intact.

## Physical French singing

The unchanged physical airway renders 234 corrected words and 288 syllables in 46 connected phrases. Explicit French phones include native nasal controls, front-rounded vowels, complete consonants and the uvular r. Local constrained phone alignment locates each vowel and source-derived continuous pitch preserves the dramatic phrasing. One dense phrase join has a 44.72 ms timing nudge so consonants remain complete. Long held phones are split into adjacent same-phone pieces within the supported ten-second limit.

The body uses a 0.82 female blend, pressure 7.8, brightness 0.58, breathiness 0.027 and tension 0.54, without added vibrato or random pitch drift. There are no recorded singer samples, cloned voice, vocoder or effects on recorded vocals in the generated channel. The original nonvocal opening hands off to continuously separated accompaniment before the singing. Separation artifacts and faint recorded-vocal traces may remain. Pronunciation, source pitch estimates and likeness are approximate.

The owner approved the validated 110–150 second music-backed preview: “Sounds good—use this.” Its voice controls and phrasing remain in the full score.

## Complete studio scene

The green industrial warehouse has glass panel grids, roof trusses, a long black limousine, square nine-bulb lamps and a vintage microphone. The physical performer wears an updo with loose wisps, hoop earrings, purple feather shoulders and a patterned gold/green long dress. Three visual copies appear during the climax, borrowing the same one retained voice model and following the same source-clock telemetry. They do not add extra recorded voices or model ownership.

Gestures, copies, camera cuts and fades derive from absolute source time. Pausing or seeking restores them directly. Portrait views frame the singer, and selecting her hides the extra visual copies. Only owned graphics are disposed. The source video itself is not embedded.

## Rebuild and validation

Six tracked files contain the full scene, explicit phonetic score, original backing, stereo mix, compressed mouth telemetry and credits. Raw video, stems, analysis caches and model weights remain local and outside Git.

```sh
bun tools/render-je-taime-scene.ts
bun run content:manifest
bun run verify:content
```

The full render has 14,421,346 samples per channel and 6,009 telemetry frames. All 46 physical phrases have measured audio activity (minimum RMS 0.123004). The decoded mix peaks at 0.530564 without clipping; its source dynamics remain. All 522 preceding public files remain byte-identical; the manifest contains 528 files. Thirty-six caption windows and twenty source-time camera cuts follow the full supplied edit.

Twenty-four measurable waveform windows agree with planned fundamental pitch within 37.59 cents. Regression tests cover the full source edit and leader, complete native French phones, silent rests, exact telemetry clock, three visual copies, deterministic seeking, portrait framing and borrowed-model disposal. Native geometry projections with the actual new telemetry were inspected at landscape and phone sizes. Browser, Playwright and layout-lint access remain declined; browser/GPU playback and recording/export interaction are unverified.

The unchanged English-only scene-clarity listening aid completed on all 36 French caption excerpts: 243 errors against 244 normalized tokens (99.6%). Its fixed English decoder and ASCII word normalization are unsuitable for evaluating French singing; this is recorded as a diagnostic limitation, not a pronunciation-quality result. The speech judges were not changed.

Validation passed 144 native tests (two existing ignores), 352 Bun tests across 89 files, TypeScript, the 528-file manifest, the subfolder production build and local HTTP checks of all built public media, the direct scene route, app assets and six new scene files. Tracked WASM provenance is unchanged.
