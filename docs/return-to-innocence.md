# Enigma · Return To Innocence (Official Video)

A procedural CHIMERA physical-voice music video scene reconstructing Julien Temple's iconic reverse-time official video for **Enigma — "Return To Innocence"** (`294.34s`).

## Voices
- **Angel X (`enigma-angel`)**: Soaring male tenor (`female: 0.14`) singing the English lead verses and choruses with CMUdict (`tools/lib/english-phones.ts`), split diphthongs, crisp consonants, and measured F0 contour.
- **Sandra (`enigma-sandra`)**: Breathy whispered female voice (`female: 0.90`) delivering *"Love — Devotion / Feeling — Emotion"*.
- **Amis Elder Chant (`enigma-chant`)**: Resonant male chant voice (`female: 0.08`) performing the iconic pentatonic Amis chant (*"Hai-yo-i-yo-i-na-ho-yan..."*) with explicit sustained vowels.

## 3D Reverse-Time Stage (`src/ui/render/return-to-innocence.ts`)
- Sepia Spanish orchard with crimson apples levitating backwards into the tree (`enigma-orchard`, `enigma-apples`)
- Candlelit Spanish cathedral altar & vigil flames (`enigma-church`, `enigma-candles`)
- Misty blue ocean surf (`enigma-sea`), Mediterranean vineyard & stone village pasture (`enigma-vineyard`, `enigma-pasture`)
- Reverse wedding doorway, candlelit lovers & snow-capped Sierra Nevada valley (`enigma-wedding`, `enigma-lovers`, `enigma-mountain`)
- Misty silver-birch forest with luminous white unicorn/horse (`enigma-unicorn`, `enigma-ending`), sunlit cottage window, vintage bicycle & baptism (`enigma-cottage`, `enigma-bicycle`, `enigma-baptism`)

## Rebuild
```bash
bun tools/render-enigma-scene.ts
bun run content:manifest
```
