# Lionel Richie — Hello

Open `?scene=hello`. The complete supplied official video lasts 326.124263 seconds; the physical reconstruction includes a short release for 326.474263 seconds. This is an additional selection; all previous prepared songs and scenes remain unchanged.

## Voice and original music

Four physical airway voices cover Lionel's singing and teaching, Laura's acting and sculpture conversation, Tony's acting, and the messenger. The owner approved the validated 95–122 second first-chorus preview: “Sounds good—use this.” Its lead uses a 0.08 female body blend, pressure 7.6, brightness 0.49, breathiness 0.028 and tension 0.54. The other voices have independent body settings and source pitch. All voices have no random drift or added vibrato.

The prepared singing uses corrected source words, locally aligned dictionary phones, complete consonants, sustained vowels, late diphthong glides and measured continuous pitch. Dialogue uses the engine’s clear-speech planner paced within the source pauses, with a stable spoken register and enough breath to keep short syllables audible. Explicit speech durations remain intact through `clearPhrases` with `CLEAR_SPEECH_TIGHT`. The generated channels contain no recorded voice samples, cloning, vocoder or effects applied to a recorded singer. The mouth telemetry is recorded during physical synthesis.

The supplied video places parts of the opening verse and a later refrain underneath actors' dialogue. Separate tracks preserve those overlaps. Short volume fades lower the sung track under foreground dialogue, and captions follow the active actor; the complete sung words remain in the score. The two quieter opening lines use approximate word windows before phone alignment. Pitch estimates, timing and pronunciation are approximate. The owner-approved chorus is the reference for the lead sound.

Continuous separated accompaniment and room sound begin at zero, retain the supplied speed, and extend to the full ending. No original-vocal opening is copied into the backing. Vocal separation can leave faint recorded voices or other artifacts. Original video, stems, models and analysis caches remain private and outside Git.

## Full school scene

The cream jacket, striped shirt, curls and moustache accompany the acting lesson, seated students and grand piano. The scene continues through a locker corridor, art studio and easels, mirrored dance rehearsal, the telephone and bedroom, the piano in the empty auditorium, and the final clay portrait. The artist reaches toward the teacher's face during the reveal. The spoken introduction, dialogue during the song, telephone calls, messenger and ending are retained.

Camera cuts, gestures, seated posture, room selection and the face-touch gesture derive from absolute source time. Pausing and seeking restore them directly. Four retained voice models belong to the mounted scene feed; the stage borrows them and disposes only its own graphics. The original video itself is not embedded.

## Rebuilding and checks

Nine tracked scene files contain the full performance score, scene data, original backing, mixed audio, four compressed telemetry tracks and credits.

```sh
bun tools/render-hello-scene.ts
bun run content:manifest
bun run verify:content
```

Regression checks cover the complete duration and final line, four physical scores, exact audio/telemetry clocks, quiet inactive actors, all locations, seated posture, repeatable seeking, portrait framing and borrowed model ownership. All 534 preceding public assets must remain byte-identical; the new manifest contains 543 files.

Browser, Playwright and layout-lint access remain declined. Browser/GPU playback and recording/export interaction are unverified; native geometry projections and HTTP delivery checks are separate evidence.

The complete render has 15,670,765 samples per channel and 6,530 telemetry frames per voice. All 82 phrases contain audio activity; the quietest has RMS 0.055713. The decoded stereo mix peaks at 0.919825. All 534 earlier public assets remain byte-identical. The scene includes 61 non-overlapping caption windows and thirty source-time camera cuts.

Twenty-four measurable waveform windows agree with the planned fundamental within 24.24 cents. One raw YIN estimate selected the second harmonic; independent autocorrelation and spectral peaks verified that window within 4.76 cents. Raw and reviewed estimates are retained privately. The approved chorus’s prepared phonemes, timing, continuous pitch and voice settings match the final score exactly.

Native projections using all four new telemetry tracks were inspected across all seven locations, the face-touch and portrait layouts. These are geometry checks, not browser/GPU playback verification.

The initial listening diagnostic exposed weak spoken passages despite the approved singing. Dialogue was regenerated through the clear-speech planner, keeping the source music clock and every approved sung phrase unchanged. Individual speech excerpts were checked again independently; the long opening explanation and the previously lost question became substantially easier for the recognizer to follow. Proper names and some brief exchanges remain approximate.

The final unchanged English recognition diagnostic misheard 143 of 436 caption words (32.8%), down from 215 of 433 (49.7%) before the speech repair. Caption boundaries changed to follow the repaired dialogue, so these totals are not a controlled benchmark. The diagnostic remains a listening aid, not an intelligibility pass; short exchanges, names and singing underneath actors remain imperfect.

Final required checks passed: 187 native tests, two existing ignored tests, and 377 Bun tests across 94 files with no failures. TypeScript, the 543-file content verification, production build and local HTTP checks also passed. The direct route, its bundled code and all nine new scene files served with the expected bytes. Browser playback and recording remain unverified.
