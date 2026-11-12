# Interstellar — TARS humor setting

Open `?scene=tars`. The complete supplied 39.45-second clip is reconstructed from the opening rocket view through stage separation. The prepared performance lasts 42.14 seconds, allowing clearer speech and separate turns. All previous songs and scenes remain unchanged.

TARS, Cooper and Doyle speak through three actual CHIMERA physical mouths. The portable score contains 97 words, 13 lines, explicit phoneme durations and word anchors. `clearPhrases` uses `CLEAR_SPEECH_TIGHT`; the voices are generated from the engine, not the original dialogue with effects. Brand and Romilly are silent crew members and borrow Doyle’s model without allocating or disposing another engine.

The user singled out TARS’s pronunciation in the first preview. Longer consonants and vowels, a slightly higher low register and additional phrase time improve clarity while preserving his deadpan delivery. TARS follows a restrained 120–114 Hz contour; Cooper has a warmer middle register and Doyle a lighter voice. The user approved this revised preview. No speech API or actor-voice cloning is used.

Every phrase has at least 150 ms before the next. `sourceTimeline` in the score and `TARS_TIMELINE` in `src/scene/tars.ts` contain the same monotonic mapping. Background audio, cameras and staging use that mapping; physical telemetry always uses performance time. The original launch sound and separated dialogue background remain, retimed with a phase vocoder to preserve pitch. Faint speech traces may remain in separated audio. The opening and closing off-camera status calls are assigned to TARS; speaker attribution and visual staging are approximate.

The wireframe Ranger contains four helmeted crew, pressure suits, harnesses, seats, overhead lighting, windows and instrument panels. TARS has four dark rectangular columns with a live physical airway inside his display, a joke indicator, waveform and humor readout that changes from 100% to 75%. His form is a robot rather than a human head. The exterior shows Earth, the launch stack and the separating stage. Close-up cameras hide unrelated characters and the robot shell so they cannot obstruct a speaker’s helmet. Staging is derived from absolute scene time and stays stable when paused or seeking backwards.

Prepared files are `mix.mp3`, `backing.mp3`, three `.tele.gz` tracks, `performance.json`, `scene.json` and credits. The existing subtitle, camera, seeking and video-recording controls are available. Raw source video, analysis stems, models and caches stay outside the repository.

Rebuild the voices with `bun tools/render-tars.ts`, with FFmpeg installed, then listen and regenerate the media manifest. The prepared score and backing are sufficient without the original source file.

Validation covers the complete clip and dialogue, three physical outputs, separate turns, matching timing maps, telemetry clocks, robot articulation, humor/joke/separation events, camera framing, pause/seek determinism and borrowed-model ownership. Native projected scene images are inspected; browser playback, layout and recording remain untested because browser access was declined. The unchanged isolated-caption Whisper diagnostic misheard 17.3% of words, including numeric formatting and short replies; it is a listening aid, not a claim of perfect intelligibility.

Final checks: 144 native tests passed (2 ignored), 275 Bun tests passed across 70 files, and typecheck, media verification and the production subfolder build passed. All 385 earlier public files are byte-identical; the updated manifest covers 393 files.
