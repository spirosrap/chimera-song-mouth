# Electric Callboy — “ELEVATOR OPERATOR”

A stylized procedural CHIMERA reconstruction of **“ELEVATOR OPERATOR”** by Electric Callboy featuring Uke Bosse (duration: 198.69s, 145 BPM).

## Scene Overview
- **Setting:** `elevator` (Night brick alley with amber streetlamps and glowing elevator portal, brushed-steel elevator cabin with signature angular white LED strips, high-speed elevator shaft, illuminated 3x3 "ELEVATOR OPERATOR" button panel, blinding white room, glowing blue aquarium floor, electric blue rave club with lasers and metal band stage, backlit white LED operator halo, and zero-gravity floating cabin finale).
- **Characters:**
  - `elev-nico` — Clean tenor physical voice (`female: 0.19`), beige trench coat, striped retro polo, dark mullet & mustache.
  - `elev-kevin` — Heavy rock & breakdown physical voice (`female: 0.03`), dark jacket over orange-striped shirt, retro dark-rimmed glasses, dark mullet & mustache.
  - `elev-operator` — Deep baritone physical hook & lift announcer (`female: 0.0`), fluffy white fur coat, silver disco shirt, blonde mullet & wire glasses.

## Synthesis & Assets
- **Audio Separation:** Demucs HTDemucs separation isolating the metalcore/eurodance instrumental accompaniment into `backing.mp3`.
- **Alignment & Phonetics:** Offline Whisper word-level alignment combined with official lyrics, CHIMERA's built-in `EnglishG2P` phonemizer, and 25ms-hop F0 pitch tracking.
- **Physical Voice Rendering:** `tools/render-elevator-scene.ts` synthesizes all three independent physical airway models (`elev-nico.tele.gz`, `elev-kevin.tele.gz`, `elev-operator.tele.gz`) and mixes them with `backing.mp3` into `mix.mp3`.
- **3D WebGL Stage:** [src/ui/render/elevator-operator.ts](file:///home/spiros/Work/chimera-song-mouth/src/ui/render/elevator-operator.ts) (`ElevatorOperatorStage`) with 16 camera perspectives across desktop and mobile aspect ratios.
