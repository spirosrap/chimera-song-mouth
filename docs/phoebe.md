# Audrey Hobert — “Phoebe”

A stylized procedural CHIMERA reconstruction of the official music video **“Phoebe”** by Audrey Hobert (duration: 234.03s).

## Scene Overview
- **Setting:** `phoebe` (Pacific coastline & sea stacks, wood-paneled cabin with fireplace, bedside lamp & lace curtains, pink-lily gravestone meadow, sunny diner booth, redwood highway & white cargo van, coastal bluff, neon-green hoodie river fishing for $100 bills, starry `"I LOVE YOU"` night sky, twilight blue ocean portrait, dusk beach cyan lightsaber kick, and golden sunset ocean silhouette).
- **Character:**
  - `phoebe-audrey` — Female physical airway voice (`female: 0.90`), long strawberry-blonde hair, navy dress / neon lime-green hoodie / sunglasses, with scene-reactive props (cabin papers, fishing rod & hooked $100 bill, glowing cyan lightsaber).

## Synthesis & Assets
- **Audio Separation:** Demucs HTDemucs separation isolating the acoustic/indie-pop accompaniment into `backing.mp3`.
- **Alignment & Phonetics:** Offline Whisper word-level timestamps combined with official lyrics, CHIMERA's `EnglishG2P`, and 25ms-hop measured F0 pitch tracking.
- **Physical Voice Rendering:** `tools/render-phoebe-scene.ts` generates `phoebe-audrey.tele.gz` and mixes with `backing.mp3` into `mix.mp3`.
- **3D WebGL Stage:** [src/ui/render/phoebe.ts](file:///home/spiros/Work/chimera-song-mouth/src/ui/render/phoebe.ts) (`PhoebeStage`) supporting 16 camera perspectives across desktop and mobile viewports.
