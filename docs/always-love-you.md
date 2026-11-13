# Whitney Houston — I Will Always Love You

Open `?scene=always-love-you`. The complete supplied official video lasts 274.041905 seconds; the physical performance adds a 0.35-second release for 274.391905 seconds. This completes the sixth selection in [the sentimental sequence](sentimental-selections.md). All previous songs and scenes remain intact.

## Physical singing and the exposed opening

The unchanged physical airway renders 143 corrected source words and 168 syllables in 40 connected phrases. Source-aligned dictionary phones keep complete consonants, sustained vowels and late diphthong glides. Continuous measured pitch preserves slides, vibrato and the dramatic high run. The body uses a 0.82 female blend, pressure 7.8, brightness 0.56, breathiness 0.025 and tension 0.54, with no random drift or added vibrato.

The owner approved the validated 179–219 second music-backed preview: “Sounds good—use this.” Its voice and phrasing remain in the full performance. The synthesized channel contains no recorded singer samples, clone, vocoder or effect applied to recorded vocals.

The source starts with an exposed unaccompanied voice. Continuously separated accompaniment begins at zero; no original-vocal prefix is copied into it. The actual physical first word begins around 2.27 seconds, correcting the ordinary transcript’s late 4.02-second estimate. Instrumental music enters at its original time and stays at its supplied speed. Separation artifacts and faint recorded-vocal traces may remain. Words, pitch estimation, pronunciation and likeness are approximate.

Forced text alignment stopped before the final held vowels had finished. The prepared score extends those vowels along the measured source envelope and pitch through approximately 269.865 seconds, including the final upward run. Adjacent same-phone pieces keep long vowels within the engine’s ten-second per-phone limit. The owner-approved chorus excerpt is unchanged.

## Complete video scene

Short curls, earrings and a navy suit accompany warm microphone close-ups, an empty dark theater with blue curtains and seats, a seated lounge performance, a clothed dancing couple, wooden cabin and bed, snowy trees and an airport farewell with a bodyguard, airplane and boarding steps. The plane moves away during the farewell. The source video itself is not embedded.

All rooms, movements, seated posture, camera cuts and fades derive from absolute source time. Pausing or seeking restores them directly. The stage borrows one retained voice model; it disposes only its own graphics. Portrait close-ups frame the physical singer. The full prepared scene keeps the opening, instrumental break, repeated choruses and complete ending.

## Rebuild and validation

Six tracked files contain the full scene, explicit phonetic score, original backing, stereo mix, compressed physical telemetry and credits. Raw video, separated stems, caches and model weights remain local and outside Git.

```sh
bun tools/render-always-love-you-scene.ts
bun run content:manifest
bun run verify:content
```

Regression tests cover the complete source duration and ending, early unaccompanied entry, physical phones, bounded long vowels, the final high run, quiet instrumental rests, exact telemetry clock, all source locations, seated posture, deterministic airplane seeking, portrait framing and borrowed-model disposal. All 528 preceding public files must remain byte-identical; the new manifest contains 534 files.

Browser, Playwright and layout-lint access remain declined; browser/GPU playback and recording/export interaction are unverified. Native geometry projections and HTTP serving checks provide separate staging and delivery evidence.

The complete render contains 13,170,812 samples per channel and 5,488 telemetry frames. All 40 physical phrases have measured audio activity, with minimum RMS 0.088891. The decoded mix peaks at 0.922299. All 528 earlier public files remain byte-identical. There are 26 caption windows and nineteen source-time camera cuts.

Twenty-four measurable waveform windows agree with planned pitch within 48.14 cents. One raw period estimate selected a strong second harmonic; independent autocorrelation and spectrum analysis verified its fundamental within 11.81 cents. Raw estimates and the independent review are retained. Native projections with the actual new telemetry were inspected at landscape and phone sizes; the seated camera was tightened for legibility.

The unchanged English scene-clarity listening aid completed on 26 sung caption excerpts: 53 errors against 143 words (37.1%). Sustained singing and high notes limit automatic recognition; this diagnostic is not a pronunciation-quality pass. The owner-approved voice remains unchanged. The first forty seconds of decoded backing have RMS 0.000181, compared with 0.127063 for the physical voice, confirming the nearly silent instrumental bed during the exposed opening.

Validation passed 144 native tests (two existing ignores), 356 Bun tests across 90 files, TypeScript, the 534-file media manifest, the subfolder production build and local HTTP checks of all built public files, the direct scene route, app assets and all six new scene files. Tracked WASM provenance is unchanged.
