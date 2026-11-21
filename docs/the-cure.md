# Olivia Rodrigo — “the cure”

A stylized procedural CHIMERA reconstruction of the official music video **“the cure”** by Olivia Rodrigo (duration: 314.28s).

## Scene Overview
- **Setting:** `thecure` (Crimson-yarn title surgical tray, symmetrical mint-green hospital corridor with pastel pink `"O R"` double doors, glowing glass chemistry lab, mint-tiled exam room with specimen cabinet and skeleton ribcage X-ray frame with pulsing red heart, vintage corridor microphone and acoustic guitar, retro green ECG oscilloscope monitors, overhead pink hospital bed tangled in crimson yarn with six surgical trays, and the sunlit miniature dollhouse & cardboard moving boxes reveal).
- **Character:**
  - `cure-olivia` — Female pop-rock physical airway voice (`female: 0.91`), pale-pink vintage nurse dress, crisp white nurse cap, dark wavy hair, with scene-reactive props (ribcage X-ray frame, acoustic guitar, crimson unraveling yarn threads, and casual grey sweater/jeans in the moving-boxes epilogue).

## Synthesis & Assets
- **Audio Separation:** Demucs HTDemucs separation isolating the acoustic/pop-rock accompaniment into `backing.mp3`.
- **Alignment & Phonetics:** Offline Whisper word-level timestamps paired with verified official lyrics, CHIMERA's `EnglishG2P`, and 25ms-hop measured F0 vocal contours.
- **Physical Voice Rendering:** `tools/render-the-cure-scene.ts` generates `cure-olivia.tele.gz` and mixes with `backing.mp3` into `mix.mp3`.
- **3D WebGL Stage:** [src/ui/render/the-cure.ts](file:///home/spiros/Work/chimera-song-mouth/src/ui/render/the-cure.ts) (`TheCureStage`) supporting 13 camera perspectives across desktop and mobile viewports.
