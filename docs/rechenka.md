# Реченька — the river stage

Open `?scene=rechenka`. The complete supplied 3:48 Diana Ankudinova live performance is a scene alongside the other concerts. CHIMERA generates the Russian lead over the original stereo accompaniment, with synchronized mouth movement and captions.

The `river` setting reconstructs the long patterned dress and straight hair, hand microphone, wooden dock and boat, blue forest backdrop, flowing water lights, low mist, six shadow dancers, four judges and seated audience. Raised hands, expressive leaning, choreography, the kneeling ending and reaction cameras follow the clip clock. Pausing and seeking restore the same state. Background figures are decorative; the featured singer owns one retained physical model lease.

The user approved the 29-second Russian voice preview. The full score has 68 words, 138 syllables, 22 physical phrases and 18 caption lines; the mouth has 4,569 telemetry frames.

The prepared score uses explicit Russian syllables, central vowels, retroflex fricatives and soft consonants. `palatalized: true` is forwarded to the native planner rather than putting the unsupported decorated consonant into its inventory. The source melody supplies the low register, high notes and long wordless passage. Sustained vowels continue until the vocal release instead of stopping at ASR word-label endpoints. The local transcription was cross-checked for compounds and repetitions against [the published transcription](https://learnsongs.ru/song/diana-ankudinova-rechenka-119047); timing and phonemes come from the supplied recording.

The original vocal mix is never restored between phrases. Instrumental separation continues across the whole singing section; original applause returns after the final voice release. Separation can leave faint vocal traces. The physical voice, dancers and scenery are stylized approximations, not an embedded copy of the reference video. Raw recordings, analysis stems, model weights and caches are excluded.

Six prepared assets are included in `public/scenes/rechenka/`: performance score, scene data/captions/camera cuts, stereo mix, instrumental backing, compressed mouth telemetry and credits. All 363 earlier public files remain unchanged.

To regenerate the physical voice, mix and animation from the included score:

```sh
bun tools/render-river-scene.ts
bun run content:manifest
bun run verify:content
```

This requires ffmpeg and the included WASM engine, without source recordings or model downloads. Check the resulting audio before deploying.

Validation includes complete audio/telemetry clocks, phrase audibility, finite unclipped samples, native soft-consonant gestures, preserved assets, scene validation, camera framing, deterministic seeking, lease ownership, full native/Bun checks, typecheck and a static production build. Native SVG projections are used to inspect staging. Browser playback, layout and recording/export are not tested because browser access was declined in this project.
