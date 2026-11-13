# Air Supply — Making Love Out of Nothing at All

Open `?scene=making-love`. This addition follows the complete supplied 4:53 official video, retaining its original accompaniment and replacing the featured singing with two physical mouth-engine parts. It is the fourth selection in [the sentimental sequence](sentimental-selections.md). Pause after completion before starting Lara Fabian.

The supplied edit runs 292.733968 seconds; the prepared performance adds a 0.35-second release. The source recording, not a longer album version, determines the beginning, repeated refrains and ending. All preceding selections and media remain intact.

## Physical singing

Both parts use the unchanged `planPart` → `planPerformance` → `renderPart` physical airway. They contain no recorded singer samples, voice clone, vocoder or effect applied to the original vocals. Local transcription and constrained dictionary-phone alignment supply complete consonants, sustained vowels and late diphthong glides. The two channels separate the lead’s overlapping “making love” calls from the lower answering refrain. The polyphonic refrain’s upper and lower registers are source-derived estimates; this is not an independent isolation of every recorded harmony.

The lead contains 405 words and 484 syllables in 45 physical phrases; the response contains 125 words and 150 syllables in 29 phrases. The lead body has a 0.15 female blend, pressure 7.8, brightness 0.55, breathiness 0.028 and tension 0.54. The lower response uses the adult male body, pressure 7.4, brightness 0.44, breathiness 0.035 and tension 0.54. Neither has random pitch drift or added vibrato. Continuous source pitch preserves slides and vibrato. Breath gradually diminishes during the source fade.

The owner approved the validated 123–173 second music-backed preview: “Sounds good—use this.” Its voice controls and phrasing remain in the complete performance. Original accompaniment stays at the supplied speed and source clock. Continuous vocal separation follows the nonvocal opening, including the instrumental break and ending; faint original-vocal traces and separation artifacts may remain. Lyrics, harmony, pitch tracking and pronunciation remain approximate.

## Complete video scene

The stage follows the source’s blue-lit duo: short curls, blue shirt and olive vest for the lead; swept fair hair, cream shirt and an acoustic guitar for the answering performer. A drummer, keyboard player, amplifiers, cymbals and blue light fans populate the background. The romantic montage includes the white vintage car and moving door, brick warehouse street, picnic, car interior, petrol station, diner table with red cups, and the approaching profiles in the closing silhouettes. Supporting figures are clothed. The source video itself is not embedded.

All locations, car arrival, door movement, people, guitar strumming, gestures, lights, closing profiles and camera cuts use absolute source time. Pausing or seeking restores the scene directly. The player holds two model leases; the stage borrows both models and disposes only its own graphics. Each head uses its own synthesized telemetry. Portrait cameras frame the singer or guitarist; manually selecting either performer returns to the blue stage.

## Rebuild and checks

Seven files contain the scene, explicit phonetic score, full stereo mix, original accompaniment, two compressed physical telemetry tracks and credits. The raw video, analysis caches, separated stems and model weights remain outside Git.

```sh
bun tools/render-making-love-scene.ts
bun run content:manifest
bun run verify:content
```

The included prepared score, backing, WASM and ffmpeg suffice to rebuild the physical voices and mix. Tests cover the complete duration and ending, both physical voices, overlapping calls, finite sample-clock telemetry, the independent original backing, source-time room changes, car and door seeking, close-up framing and borrowed-model ownership. All 509 preceding public files must remain byte-identical; the new manifest contains 516 files.

Forty-seven measurable held-vowel waveform windows agree with their planned pitch within 32.39 cents. One raw YIN estimate chose a strong second harmonic; independent autocorrelation and spectral analysis verified its fundamental. Another sampled window lies in the near-silent source fade (RMS 0.000599) and has no measurable periodic fundamental; its raw estimate is retained and is not reported as an in-tune measurement. These checks changed neither audio nor speech judges.

Native geometry projections support staging and framing review. Browser, Playwright and layout-lint access remain declined in this project. Browser/GPU playback and live video recording/export interaction remain unverified.

The complete render contains 14,068,031 samples per channel and 5,862 telemetry frames per mouth. All 45 lead and 29 answering phrases have measured audio activity; the decoded mix peaks at 0.920092. There are 76 caption windows and 34 source-time camera cuts. All 509 previous public files remain byte-identical. Native projections were inspected using the actual two new telemetry tracks at landscape and phone sizes.

The unchanged scene-clarity listening aid completed on all 76 sung caption excerpts over the original music. English Whisper counted 343 errors against 530 reference words (64.7%). Sustained singing, overlapping calls and the quieter answering refrain challenge this automatic recognition. This is a listening diagnostic, not a pronunciation-quality pass; the owner-approved voices remain unchanged.

The opening transition reaches the continuously separated instrumental at 19.2 seconds, before the first source word at approximately 19.82 seconds. The unseparated nonvocal opening ends at 18.8 seconds, with a 0.4-second handoff. This avoids copying the source singer’s prefix into the prepared backing. The correction leaves both generated voices, their score and telemetry unchanged.

Validation passed 144 native tests (two existing ignores), 344 Bun tests across 87 files, TypeScript, the 516-file manifest, the subfolder production build and local HTTP checks of every built public asset, the direct scene route, app bundles and all seven new scene files. The four scene tests and asset/build checks passed again after the opening-only backing correction. The compiled WASM provenance is unchanged.
