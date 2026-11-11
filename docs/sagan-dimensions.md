# Cosmos — Carl Sagan and the fourth dimension

The complete user-supplied 7:23 clip is available at `?scene=sagan-dimensions`.
CHIMERA generates the narration through its physical airway model. The head
replays the actual articulator telemetry, synchronized with captions and the
original background. No recorded narrator voice is used in the generated
channel; separation may leave faint traces in the background.

The independent `cosmos` setting recreates the tan jacket, burgundy shirt,
buttoned chair, green desk, lamp and framed print. Flatland figures move on the
desk, the apple touches and intersects their plane, the square rises and returns,
and the cube casts its flat shadow. A rotating four-dimensional cube is projected
into three dimensions with sixteen vertices and thirty-two edges. These motions
and the source camera cuts use absolute scene time, so seeking and pausing do
not change their position. The presenter borrows the mounted voice-model lease.

The pronunciation score retains source word anchors, explicit consonants and
stressed-vowel durations. The timing helper preserves those explicit durations,
including the approved opening. Short source pauses separate phrases. The supplied
clip ends during the next sentence; its ending is preserved, with a short voice
release appended. All preceding songs and scenes remain unchanged, including the concurrent
Wizard of Oz addition. The approved audio was prepared with engine revision
`2b72526`; the app also includes the later upstream engine updates in `712eee6`.

Six prepared files contain the scene: `scene.json`, `performance.json`,
`mix.mp3`, `backing.mp3`, `sagan.tele.gz` and `credits.txt`. The original video,
separation stems, analysis models and caches are excluded from the repository.

## Rebuild

```sh
bun tools/render-sagan-scene.ts
bun run content:manifest
bun run test --timeout 15000
bun run typecheck
bun run build:static --base=/chimera-song-mouth/
```

Rebuilding uses the stored phonetic score and background, without the source
video or analysis models. Checks cover full dialogue, physical gestures,
telemetry and caption clocks, dimensional geometry, camera framing, pause and
seek consistency, and disposal. Native geometry projections support visual
review. Browser playback, layout and recording QA remain unverified because
browser access was previously declined.

The isolated-caption speech check misheard 183 of 949 words (19.3%); it is a
listening aid without sentence context, not a guarantee of intelligibility.
The owner accepted the revised opening and the corrected “large” pronunciation.
