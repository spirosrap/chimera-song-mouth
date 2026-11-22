# PinkPantheress + Zara Larsson · Stateside (Official Video)

A procedural CHIMERA physical-voice music video scene reconstructing the Y2K pop-art duet video for **PinkPantheress & Zara Larsson — "Stateside"** (`193.17s`).

## Voices
- **PinkPantheress (`state-pink`)**: Airy British pop soprano (`female: 0.94`) phonemized with CMUdict (`tools/lib/english-phones.ts`), split diphthongs, crisp consonants, and measured F0 contour.
- **Zara Larsson (`state-zara`)**: Bold Swedish pop lead (`female: 0.88`) trading verses, choruses, and duet hooks with PinkPantheress.

## 3D Pop-Art Stage (`src/ui/render/stateside.ts`)
- London night *"FANCY that"* red display window with streetlamps & postbox (`state-london`)
- Crimson British tartan boutique with gold frames, pop-art red lips & overhead dance floor (`state-plaid`, `state-overhead`)
- Zara's glowing aqua seashell window & hot-pink tropical souvenir boutique (`state-sweden`, `state-tropical`)
- Royal-blue tartan Polaroid frame & floating `AIR MAIL` postcards (`state-blue-tartan`, `state-airmail`)
- Y2K polka-dot & glowing hibiscus duet backdrops (`state-polka`, `state-hibiscus`, `state-duet`)

## Rebuild
```bash
bun tools/render-stateside-scene.ts
bun run content:manifest
```
