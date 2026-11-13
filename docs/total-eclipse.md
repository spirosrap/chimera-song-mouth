# Bonnie Tyler — Total Eclipse of the Heart

Open `?scene=total-eclipse`. The complete supplied official video is reconstructed as a 5:34 performance with original instrumental accompaniment and two physical mouth-engine singers. This is the second selection in [the sentimental sequence](sentimental-selections.md). The owner asked to pause after each completed performance.

## Singing and timing

The unchanged physical engine generates Bonnie’s lead and the answering voice through `planPart` → `planPerformance` → `renderPart`. Neither synthesized channel contains recorded singer samples, voice cloning, a vocoder or an effect applied to the original vocals. No engine, calibration or judge code changes are required.

The owner approved the 78–111 second duet-to-chorus preview: “Sounds good—use this.” Its voice settings and phrasing are retained. The full score contains 492 lead words and 54 answering words, with 631 and 71 sung syllables respectively.

The supplied recording provides locally transcribed words, articulation windows and continuous pitch measurements. Separate phone alignments allow the two voices to overlap. Complete consonants remain short and audible, vowels hold the measured notes, and diphthongs glide late. The lead uses a 0.72 female body blend, pressure 7.8, brightness 0.56, breathiness 0.03 and tension 0.54. The answering mouth uses the adult male body, pressure 7.5, brightness 0.49, breathiness 0.025 and tension 0.52. Neither has random pitch drift. These two parts represent the featured lead and answering choir; individual recorded harmony layers are not separately reconstructed.

The original music remains at its supplied speed and source clock. The instrumental opening is retained, followed by continuous vocal separation through the rests and ending. Faint recorded-vocal traces may remain. Stereo audio and physical telemetry share the 48 kHz synthesis clock, with snapshots at exactly 20 Hz. Pitch tracking, words and timbre remain approximate.

## Scene

The source was inspected across its complete duration. The reconstruction includes a moonlit gothic school exterior and tower, arched windows, candles and a dressing table, a staircase and balcony, a white belted dress, windblown blonde hair, reaching and outstretched arms, billowing red curtains, twelve clothed dancers with glowing eyes, a tumbling sequence, and the daylight courtyard with school uniforms, a dark suit and a handshake gesture. Camera cuts follow the supplied video approximately. The source video itself is not embedded.

All room changes, costumes, gestures, hair, curtains, dancers, eyes, fades and camera positions use absolute source time. Backward seeks restore the scene directly. The player retains two voice-model leases. The stage borrows those models and disposes only its own graphics; supporting dancers do not allocate voice models.

## Rebuilding and validation

Seven assets contain the scene/captions/cameras, explicit phonetic score, stereo mix, original instrumental backing, two compressed physical telemetry files and credits. Input recordings, separated stems, analysis caches and model weights remain local and outside this repository.

```sh
bun tools/render-total-eclipse-scene.ts
bun run content:manifest
bun run verify:content
```

The included score, backing, WASM and ffmpeg suffice for rebuilding. Checks cover the complete scene and both singers, valid physical phones, audible phrases, finite sample-clock telemetry, independent voice bodies, deterministic seeking, curtains and dancers, balcony placement, portrait and landscape mouth framing, and borrowed-model ownership. All 490 earlier public assets must remain byte-identical; the resulting manifest contains 497 files.

Native geometry projections provide layout inspection. Browser, Playwright and layout-lint access remain declined in this project. Browser/GPU playback and recording/export interaction remain unverified.

The full render is 334.299 seconds, with 16,046,371 stereo frames and 6,686 telemetry frames per mouth. All 33 lead phrases and 17 answering phrases are audible, with finite articulation and exact 20 Hz snapshot clocks. The decoded MP3 peaks at 0.922. All 490 previous public assets remain byte-identical.

Forty-eight sampled held-vowel waveform windows match the planned fundamental within 38.26 cents. One raw YIN estimate at 38.591 seconds selected the answering voice’s stronger second harmonic. Independent autocorrelation and spectral analysis confirmed a 381.584 Hz fundamental within 3 cents of the plan; the raw estimator report is retained locally. This review changed no audio, engine code or speech judge.


The 73 captions retain complete sung phrases when the two voices overlap. Repeated lead entries start new captions, so an answering call cannot truncate an entire later sentence; the 34-second lead passage has an explicit regression check.

Validation passed 144 native tests (two existing ignores), 332 Bun tests across 84 files, and the four Eclipse tests rerun after the final caption adjustment. TypeScript, the 497-file content manifest and the subfolder production build passed. Local HTTP checks matched every built public asset and served the direct scene route, application bundles and all seven new scene assets.
