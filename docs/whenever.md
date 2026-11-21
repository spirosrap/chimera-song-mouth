# Megan Thee Stallion — “Whenever”

A stylized procedural CHIMERA reconstruction of the official music video **“Whenever”** by Megan Thee Stallion (duration: 166.39s).

## Scene Overview
- **Setting:** `whenever` (Retro wood-paneled waiting room with CRT TV and surreal fish-headed patients, glass-walled reception booth lined with office phones, giant glowing wall aquarium tank, stark black-and-white void studio, burnt-orange Western desert with vintage red Cadillac and zig-zag `"WHENEVER"` road sign, black-and-white checkered chessboard with giant white chess knight, giant glossy black 8-ball on emerald pool felt, and crashed-Cadillac waiting room finale).
- **Character:**
  - `whenever-megan` — Female rap/vocal physical airway (`female: 0.85`), styling adapts per set (copper bob & white-lapel blazer with dual landline handsets in the reception booth, sky-high black ponytail in the monochrome white-void studio, giant gold-`"M"` cowboy hat in the Western desert).

## Synthesis & Assets
- **Audio Separation:** Demucs HTDemucs separation isolating the hip-hop/trap instrumental into `backing.mp3`.
- **Alignment & Phonetics:** Offline Whisper word-level timestamps combined with CHIMERA's `EnglishG2P` phonemizer and 25ms-hop measured F0 vocal contours.
- **Physical Voice Rendering:** `tools/render-whenever-scene.ts` generates `whenever-megan.tele.gz` and mixes with `backing.mp3` into `mix.mp3`.
- **3D WebGL Stage:** [src/ui/render/whenever.ts](file:///home/spiros/Work/chimera-song-mouth/src/ui/render/whenever.ts) (`WheneverStage`) supporting 12 camera perspectives across desktop and mobile viewports.
