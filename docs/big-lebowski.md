# The Big Lebowski — The Jesus

Open `?scene=big-lebowski`. This is the complete supplied bowling excerpt (4:24.65), from Jesus’s opening routine through Walter’s closing remark. Only the uploader’s subscription endcard is removed. All earlier songs and scenes remain unchanged.

Four physical mouths generate the Dude, Walter, Donny and Jesus’s dialogue. The prepared score contains 452 words, source word anchors, explicit phonemes and clear-speech durations. `clearPhrases` uses `CLEAR_SPEECH_TIGHT`; the rendered voices are not recordings or voice effects. Liam is a silent fifth character and borrows Walter’s model without allocating another engine.

The first preview’s extended phrases overlapped other replies. The revised score schedules every spoken phrase separately with at least 160 ms between turns. `sourceTimeline` and `src/scene/bowling-timing.ts` retain the same monotonic source/performance mapping, so background audio, camera cuts, actions and captions follow the revised exchange. Telemetry always uses performance time, not the source clock. The opening song is unchanged; the separated dialogue background is retimed with a phase vocoder to preserve pitch.

The user requested voices that sound like different people. The physical casting gives the Dude a relaxed, slightly breathy middle register, Walter a heavier low register, Donny a lighter high register and Jesus a sharper, emphatic middle register. Pitch, body blend, pressure, brightness, breath and tension vary by role. Jesus additionally follows a smoothed source pitch contour and rhetorical breath groups. After reviewing the separated turns and stronger voice contrast, the user approved his revised delivery. No actor-voice cloning or speech API is used.

The wireframe alley contains wooden lanes, gutters, pins, ball returns, scoring consoles, red seats and fluorescent ceiling panels. Jesus has a purple outfit, ponytail, cross and wrist glove; Walter has yellow glasses and a vest; the Dude has long hair, shorts and a beeper. The ball moves from hand to lane, pins topple and Jesus celebrates. The brief outdoor flashback switches the environment and clothing. Source camera cuts, head movement and gestures are approximate reconstructions.

The original opening song, bowling sounds and background remain. A continuous separated bed replaces dialogue passages; faint original speech traces may remain. Source video, separation stems, analysis caches and model weights are not included in the repository.

Prepared files: stereo `mix.mp3`, `backing.mp3`, four compressed physical telemetry tracks, `performance.json`, `scene.json` and credits. The scene offers the existing subtitle, camera, seeking and video-recording controls.

To rebuild the physical voices, run `bun tools/render-big-lebowski.ts` with FFmpeg available, listen, then regenerate the media manifest. The portable score and backing are sufficient; the original input file is not required. Do not replace the dialogue schedule with overlapping source intervals.

Validation includes the full Rust/Bun suite, typecheck, static build, public-asset hashes, audio/telemetry clocks, physical output, dialogue separation, camera framing, flashback visibility, seeking/pause determinism and borrowed-model ownership. Native projected scene images are inspected. Browser playback, browser layout and video recording are not tested because browser access remains declined.

Final checks: 144 native tests passed (2 ignored), 271 Bun tests passed across 69 files, typecheck and the production subfolder build passed. All 376 earlier public assets are byte-identical; the manifest now covers 385 files. The isolated-caption Whisper diagnostic misheard 31.5% of words, including names, Spanish and short interjections; it remains a listening aid, not a claim of perfect intelligibility. The user approved the revised preview.
