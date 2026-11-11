# Arrival — meeting you

The complete user-supplied 29-second clip is available at `?scene=arrival`.
Prepared playback lasts 29.68 seconds including the final release. All eighteen
songs, the five preceding movies and the speech remain available.

Ian's dialogue is generated through CHIMERA's physical airway engine. Louise is
a silent listener, as in the supplied clip. The score contains 33 words in four
phrases, including the very quiet closing line that automatic voice detection
missed. The closing articulation starts around 22.9 seconds, preserving the
hesitation before it. The score's stored phonemes and word anchors supply the
actual mouth movement; no recorded actor voice or voice filter is used in the
generated channel.

The speech uses explicit consonant and vowel durations, natural word spacing,
and time taken from the available pauses. A lower, softer delivery and different
phrase pitch targets retain expression after the clarity pass. The question has
a larger pitch excursion, and the final “you” carries the emphasis. The engine
and calibration tables are unchanged.

The original stereo background is retained, with separated accompaniment around
dialogue and crossfades back to the source outside those windows. Separation may
leave faint vocal traces. The original input video, stems, models and analysis
caches are excluded from the repository.

## Staging and files

The independent `arrival` setting has one speaking character and a silent,
animated Louise. Ian has short, tousled hair and an olive jacket; Louise has long
hair and a darker jacket. The dusk sky, distant hills, field camp, tents, vehicles
and lights follow the supplied setting. Ian looks up and then turns toward Louise.
The final camera shows her reaction. The clip ends before an embrace, so none is
added. Wide and individual camera options remain available.

All poses use absolute playback time and remain stable through pause and seek.
Ian borrows the mounted voice-model lease; the setting owns and disposes Louise's
neutral model. Existing subtitles, audio download and live video recording
controls are reused.

Six files provide the complete scene: `scene.json`, `performance.json`, `mix.mp3`,
`backing.mp3`, `ian.tele.gz` and `credits.txt`. The telemetry is captured from the
same synthesis as the audio. The shared dialogue planner and quiet-introduction
renderer preserve Contact's previous plans exactly; its prepared media do not
change.

## Rebuild and validation

```sh
bun tools/render-arrival-scene.ts
bun run content:manifest
bun run test --timeout 15000
bun run typecheck
bun run build:static --base=/chimera-song-mouth/
```

Rebuilding requires ffmpeg, the stored score and backing, without the original
video or analysis models. Checks cover all dialogue phrases, silent pauses,
closing-line alignment, physical articulation, telemetry clocks, camera timing,
desktop/mobile head framing, backwards seeking, model ownership, disposal and
preservation of the preceding public assets. Native geometry projections support
staging review. Browser playback, layout and recording QA remain unverified
because browser access was previously declined.
