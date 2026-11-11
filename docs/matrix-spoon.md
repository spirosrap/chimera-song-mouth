# The Matrix — there is no spoon

The complete user-supplied 70.70-second clip is available at `?scene=matrix-spoon`.
Prepared playback lasts 71.05 seconds including the final release. All eighteen
songs, six preceding movies and the speech remain available.

CHIMERA's physical airway engine generates Neo, the spoon boy and the Oracle's
assistant. Their eight phrases contain 47 words. The quiet opening “Do not” was
recovered from the isolated vocal and aligned around 23.98 seconds; automatic
voice detection initially missed it. Stored phonemes use explicit consonant and
vowel durations, natural spacing blended with source word anchors, and available
pauses to keep words intelligible. Distinct body blends, pitches and accents
preserve the three roles. The user approved the dialogue preview without further
voice changes. No engine or calibration tables changed.

The original stereo background is retained, with separated accompaniment around
speech and crossfades back to the source outside those windows. Separation may
leave faint dialogue traces. No recorded actor voice or voice filter is used in
the generated voice channels. The original video, stems, models and analysis
caches are excluded from the repository.

## Staging and files

The independent `matrix` setting includes a green waiting room, patterned rug,
curtains, chairs, cabinet, books and a pile of bent spoons. The boy has a bald
head and robe, Neo has short hair and a dark coat, and the assistant appears at
the doorway for her closing invitation. The spoon rises, bends during the boy's
demonstration, passes to Neo as he sits, and bends again during his attempt.
Camera cuts follow the clip, with separate floor and spoon views and manual
wide/character views.

The final spoon close-up shows a reflected wireframe face. This is a stylized
visual echo using Neo's existing mouth model and telemetry, not an optical
reflection simulation. The close-up hides the full-size Neo to avoid a second
face showing through the wireframe bowl. His normal views remain intact.

All prop and body poses use absolute playback time, including pause and backwards
seek. The scene borrows three mounted voice-model leases and releases only its
own geometry. Existing subtitles, audio download and live video recording
controls are reused.

Eight files provide the complete scene: `scene.json`, `performance.json`,
`mix.mp3`, `backing.mp3`, three `.tele.gz` tracks and `credits.txt`. All three
telemetry tracks run on the full scene clock, including the silent opening and
ending, and come from the same synthesis as the audio.

## Rebuild and validation

```sh
bun tools/render-matrix-scene.ts
bun run content:manifest
bun run test --timeout 15000
bun run typecheck
bun run build:static --base=/chimera-song-mouth/
```

Rebuilding requires ffmpeg, the stored score and backing, without the original
video or analysis models. Checks cover all phrases, silent pauses, opening-word
alignment, physical articulation, telemetry clocks, camera timing, desktop/mobile
head and reflection framing, deterministic spoon/handoff motion, backwards seeks,
model ownership and disposal. The standalone mix matches the approved prepared
mix within 1.4e-7. Native geometry projections support staging review. All 288
preceding public files are preserved byte for byte.

Browser playback, layout and recording QA remain unverified because browser
access was previously declined.
