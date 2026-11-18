# Akylas · Ferto

Ferto uses a complete physical vocal score over the supplied video's instrumental accompaniment. The score follows the Greek verses and hooks, Spanish and French passages, English pickups, quiet delivery and repeated outro. The final hook repeats on the measured outro beat. The arcade character's mouth motion comes from the engine render, and the scene's captions and movement cues follow the same clock.

The earlier hook only mix left the recorded singer in most of the scene. The new mixer accepts one input, an isolated instrumental. It adds the CHIMERA airway render as the vocal track. A cleanup pass on the separated accompaniment reduces vocal bleed. Separation can still leave faint traces of the recording.

To regenerate the published mix and telemetry from the prepared score, run:

```sh
bun tools/render-ferto-scene.ts /path/to/isolated-instrumental.wav
bun run content:manifest
```

The original video, isolated stems and alignment data stay outside the repository.
