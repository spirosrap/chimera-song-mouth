# Blade Runner — Tears in Rain

Open `?scene=tears-in-rain`. The full user-supplied 225.42-second rooftop clip is preserved, with a short audio release: the opening ledge sequence, Roy’s leap and rescue, his monologue, the dove’s release and the quiet closing reaction.

The `rooftop` setting adds an industrial roof with riveted girders, pipes, vents, brickwork, a cyan/red neon sign, distant windows, rain, mist and puddle ripples. Roy has short pale hair, a bare wireframe torso and dark trousers; Deckard wears a coat. Their positions, the rescue grip, seated poses, Roy’s bowed head and the dove’s wingbeats follow the clip clock. Six camera choices include the characters, ledge, dove and sky. Automatic cuts follow the source with wider views for the staged action.

The user approved the second 24-second preview after requesting clearer pronunciation. Roy’s complete score uses that voice: explicit consonants, natural phoneme spacing, `clearPhrases` with `CLEAR_SPEECH_TIGHT`, source word anchors and restrained pitch contours. Particular attention went to the consonant clusters and proper names. There are 59 spoken words, 15 physical phrases and eight readable caption lines. The mouth replays the actual physical synthesis telemetry; no recorded actor voice, cloning model or vocal filter supplies the generated speech.

Deckard is a silent animated listener. His neutral engine telemetry never opens a speech gate. Both characters hold model leases for the mounted scene lifetime; the shared renderer remains in use. Rain and the dove are deterministic at an absolute time, so pause and backward seek reproduce the same state.

Original music, rain and nonverbal action sounds remain in the stereo soundtrack. Separated background beds replace the original dialogue through the spoken passages, including the pauses within the monologue. Separation can leave faint residual speech. Visual likeness, timing and pronunciation are stylized approximations. This is a reconstructed scene rather than an embedded source video.

Seven prepared assets in `public/scenes/tears-in-rain/` supply the complete mix, background track, physical performance score, scene data/captions/cuts, Roy telemetry, silent Deckard telemetry and credits. All 369 previous public files remain unchanged. Raw input recordings, stems, model weights and analysis caches stay outside the repository.

Regenerate Roy’s voice, mix and articulation from the included score, preserving Deckard’s neutral telemetry:

```sh
bun tools/render-tears-in-rain.ts
bun run content:manifest
bun run verify:content
```

This requires ffmpeg and the included WASM binary. It does not need the original video or downloaded analysis models. Check the output before publishing.

Validation covers full audio/telemetry clocks, audible phrases, silent gaps, finite unclipped audio, actual articulations, the silent listener, complete scene data, mobile/desktop camera framing, deterministic rain/rescue/flight, model ownership and resource disposal. Native SVG projections inspect the staging. Full native/Bun tests, typecheck, content hashes, a static subfolder build and live HTTP checks cover integration. Browser playback, layout and video export were not tested because browser access was declined for this project.
