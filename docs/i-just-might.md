# Bruno Mars — “I Just Might”

A stylized procedural CHIMERA reconstruction of the official music video **“I Just Might”** by Bruno Mars (duration: 213.02s, 112 BPM).

## Scene Overview
- **Setting:** `ijustmight` (Curved mahogany wood-slat 1970s lounge studio, terracotta carpet, concentric glowing circular ceiling disco lights shifting through warm amber, rainbow disco, cobalt blue, and crimson red, matching mint-green 70s leisure suits with wide white collars, raised conga & drum risers, twin guitar/bass Brunos, DJ turntable booth with twin floor speakers, trio harmony close-up, and carpet-lounge pose).
- **Characters:**
  - `might-bruno` — Lead Bruno soulful tenor physical airway (`female: 0.22`), mint-green 70s suit, wide white collar, red headband.
  - `might-chorus` — Backing Band Brunos physical harmony airway (`female: 0.14`), shared by the twin guitar & bass Brunos on `"Doo-doo"`, `"(Oh, oh, oh)"`, and `"Whoa, whoa"` responses.

## Synthesis & Assets
- **Audio Separation:** Demucs HTDemucs separation isolating the 1970s funk/disco instrumental into `backing.mp3`.
- **Alignment & Phonetics:** Offline Whisper word-level timestamps combined with verified official lyrics, CHIMERA's `EnglishG2P`, and 25ms-hop measured F0 vocal contours.
- **Physical Voice Rendering:** `tools/render-i-just-might-scene.ts` generates `might-bruno.tele.gz`, `might-chorus.tele.gz`, and `mix.mp3`.
- **3D WebGL Stage:** [src/ui/render/i-just-might.ts](file:///home/spiros/Work/chimera-song-mouth/src/ui/render/i-just-might.ts) (`IJustMightStage`) supporting 10 camera perspectives across desktop and mobile viewports.
