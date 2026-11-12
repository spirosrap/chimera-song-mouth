# Nessun Dorma — opera concert

The complete supplied Andrea Bocelli concert video is available at
`?scene=nessun-dorma`, alongside the previous thirteen scenes and twenty songs.
Playback lasts 271.698 seconds, including the extended Turandot finale, applause
and a short voice release. Existing prepared media is preserved byte for byte.

CHIMERA synthesizes a tenor and a separate choir voice through the physical
mouth engine. Explicit Italian phonemes replace English G2P: pure vowels,
doubled consonants, alveolar trills, the palatal lateral and affricates follow
source-aligned syllables. The prepared score has 101 words, 194 syllables and
27 phrases. Source pitch and vibrato follow the recording, with one corrected
second-harmonic tracking error on the finale's first “te.” Long notes are retained.

The opening preview was accepted after removing an original-vocal entrance:
the separated orchestra now runs throughout the entire sung section, including
rests and breaths. It never switches to the original recording between phrases.
The first weak final vowel was aligned before the second entrance instead of
being stolen by it. The original mix returns only for the applause, after the
vocal ending. Separation can still leave faint traces in the orchestra; the
generated voice channels contain only the physical model's output.

The concert includes a choral finale beyond the usual aria. The Italian wording
was checked against the [PBS concert transcript](https://www.pbs.org/video/andrea-bocelli-live-in-central-park-tx6aj8/).
Choir texture, pronunciation and staging are approximations of the reference.

## Staging and assets

The `opera` setting contains a full-body tenor with short gray hair, a dark suit
and a stand microphone. Blue columns and a warm cornice frame 24 seated string
and brass players, score stands, timpani, a conductor, 16 choir figures and an
audience. The choir figures share the generated chorus's articulation level;
the tenor's detailed airway uses telemetry from the actual audio synthesis.
Lightweight procedural ensemble geometry avoids allocating a separate physical
model or WebGL context for every extra.

Automatic cameras alternate between the tenor, choir, conductor, orchestra and
whole stage. The same views can be selected manually. Bows, conducting, playing
and applause depend on absolute time, so they work after pausing or seeking.
The existing synchronized subtitles, WAV download and video recording/export
paths apply to the new scene.

The seven prepared files are `scene.json`, `performance.json`, `mix.mp3`,
`backing.mp3`, `tenor.tele.gz`, `chorus.tele.gz` and `credits.txt`. Input video,
separation stems, model weights and analysis caches remain local.

## Rebuild and verification

```sh
bun tools/render-opera-scene.ts
bun run content:manifest
bun run test --timeout 15000
bun run typecheck
bun run build:static --base=/chimera-song-mouth/
```

Rebuilding needs the prepared score, accompaniment and ffmpeg. It does not need
the original video or analysis models. Verification covers finite audio, audible
phrases, quiet rests, synchronized telemetry, captions, distinct casts/cameras,
desktop/mobile framing, backwards seeking, resource disposal and preservation of
existing content. Staging is reviewed with native geometry projections.
Browser playback, layout and recording QA were not repeated because browser
access was previously declined.
