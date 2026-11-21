# ROSALÍA feat. Björk & Yves Tumor — “Berghain”

A stylized procedural CHIMERA reconstruction of the music video **“Berghain”** by ROSALÍA featuring Björk and Yves Tumor (duration: 206.77s).

## Scene Overview
- **Setting:** `berghain` (Berlin apartment domestic chore room with iron, steam, coffee cup, a seated 14-piece solemn orchestra, and an 8-figure German choir in black robes).
- **Characters:**
  - `berghain-rosalia` (Soprano physical airway voice, dark braided hair, black dress, domestic ironing chores and soaring aria).
  - `berghain-bjork` (Physical airway voice, avant-garde white gown, celestial headdress, divine intervention prayer).
- **Structure:**
  - `0:00 - 26.50`: Orchestral prelude, chore sounds (iron steam, sink, domestic hum).
  - `26.50 - 47.60`: Standing German choir entry (*"Seine Angst ist meine Angst, Seine Wut ist meine Wut..."*).
  - `51.80 - 75.00`: Rosalía Verse 1 in German (*"Die Flamme dringt in mein Gehirn ein..."*), high soprano operatic aria (~703 Hz).
  - `82.50 - 116.00`: Rosalía Verse 2 Spanish aria (*"Yo sé muy bien lo que soy / Ternura pa'l café / Solo soy un terrón de azúcar..."*).
  - `120.20 - 172.00`: Björk Bridge (*"This is divine intervention / The only way to save us is through divine intervention..."*).
  - `173.00 - 206.77`: Yves Tumor outro / orchestral strings resolution (*"Till you love me..."*).

## Synthesis & Assets
- **Audio Extraction:** High-resolution 48 kHz stereo extraction from source MP4.
- **Vocal Separation:** Demucs HTDemucs separation isolating the backing orchestral accompaniment and choir into `backing.mp3`.
- **F0 & Phonetics:** Continuous pitch contour extraction with 50ms hop analysis across 1083 voiced points for Rosalía and 814 points for Björk.
- **Physical Voice Synthesis:** CHIMERA physical vocal tract simulation (`renderPart` via WebAssembly) generating full telemetry tracks (`berghain-rosalia.tele.gz`, `berghain-bjork.tele.gz`) and mixed audio (`mix.mp3`).
- **3D Procedural WebGL Stage:** Fully interactive Three.js environment (`src/ui/render/berghain.ts`) rendering the Berlin apartment, ironing steam puffs, solemn orchestra with music stand lamps, standing choir, and dynamic multi-camera cuts.
