# Mazzy Star — Fade Into You

Open `?scene=fade-into-you`. The complete supplied 261.108390-second official video gains a 0.35-second release. The original accompaniment stays at the supplied speed and the featured singing comes from CHIMERA’s unchanged physical airway. All preceding selections remain intact. This interlude precedes the remaining Lara Fabian and Whitney Houston performances in [the current sequence](sentimental-selections.md).

## Physical singing

The full score contains 125 words, 150 syllables and 24 physical phrases. Locally aligned dictionary phones keep complete consonants, held vowels and late diphthong glides; continuous source-derived pitch preserves the gentle phrasing. The owner approved the validated 92–127 second preview, “Sounds good—use this.” Its voice controls remain: female blend 0.78, pressure 7.6, brightness 0.47, breathiness 0.045 and tension 0.52, without added vibrato or random drift.

The generated voice contains no recorded singer samples, clone, vocoder or effect applied to the source vocals. Original music hands off to continuously separated accompaniment before the singing; instrumental rests and the full ending remain. Faint recorded vocal traces and separation artifacts may remain. Words, pitch estimation, pronunciation and likeness are approximate.

## Video scene

The blue-lit band accompanies a long-haired singer at the microphone in a pale blouse and long skirt. The edit visits dusty desert scenery, red flannel and sunglasses, railway and moving freight train, a dark car with passengers, sunlit stairs and birds leaving the power lines. Band members, trees and the brick wall complete the locations. The source video itself is not embedded.

Rooms, gestures, train position, birds and camera cuts derive from absolute source time. Pausing and seeking restore them directly, including an early manual train selection. One retained physical model is borrowed by the stage; only owned graphics are disposed. Portrait views frame the singer.

## Rebuild and validation

Six tracked files contain the full scene, explicit phonetic score, original backing, stereo mix, compressed physical telemetry and credits. Raw input video, separated stems, models and analysis caches remain local and outside Git.

```sh
bun tools/render-fade-into-you-scene.ts
bun run content:manifest
bun run verify:content
```

The complete render has 12,550,003 samples per channel and 5,230 telemetry frames. All 24 phrases have measured audio activity; the quiet opening and instrumental interlude remain silent in the synthesized channel. The decoded mix peaks at 0.919962. All 516 preceding public files remain byte-identical; the new manifest contains 522 files. Eighteen caption windows and nineteen source-time camera cuts follow the source edit.

Twenty-four measurable waveform windows agree with their planned fundamental within 19.97 cents. The unchanged scene-clarity listening aid counted 85 errors against 125 words (68.0%) in sustained singing over the original music; this diagnostic is not a pronunciation-quality pass. The approved voice remains unchanged.

Regression tests cover the full score and ending, genuine physical phones, quiet rests, finite sample-clock telemetry, deterministic source locations, early train seeks, sunglasses, close-up framing and borrowed-model ownership. Native geometry projections were inspected with the actual new telemetry at landscape and phone sizes. Browser, Playwright and layout-lint access remain declined; browser/GPU playback and recording/export interaction are unverified.

Validation passed 144 native tests (two existing ignores), 348 Bun tests across 88 files, TypeScript, the 522-file manifest, the subfolder production build and local HTTP checks of all built public media, the direct scene route, app assets and six new scene files. Tracked WASM provenance is unchanged.

Deployed on 13 November 2026 from application commit `b1aae81`, pushed to `main`. All 16 changed files uploaded with exit status 0. HTTP SHA-256 checks verified 228 live files, including the six new scene assets, app bundles, direct route and preserved songs/scenes. The temporary publish job was removed. [Open Fade Into You](https://agenticspiros.com/chimera-song-mouth/?scene=fade-into-you).
