# Saja Boys · Soda Pop (KPop Demon Hunters)

A procedural CHIMERA physical-voice music video scene reconstructing the Netflix official lyric video for **Saja Boys — "Soda Pop"** (`180.33s`).

## Voices
- **Jinu (`soda-jinu`)**: Smooth male K-pop lead tenor (`female: 0.22`) singing English verses/choruses via CMUdict (`tools/lib/english-phones.ts`) and Korean Hangul lines via CHIMERA's native Korean front end.
- **Abby & Baby (`soda-rap`)**: Rhythmic male pop-rap airway (`female: 0.14`) delivering the fast Verse 2/3 English & Korean rap lines (*"Lookin' like snacks"*, *"Uh, make me wanna flip the top"*).
- **Romance & Mystery (`soda-chorus`)**: Bright high K-pop male harmony voice (`female: 0.28`) singing the pre-chorus, dreamy bridge, and *"My little soda pop"* hooks.

## 3D Seoul Street Stage (`src/ui/render/soda-pop.ts`)
- Magenta demon-smoke entrance reveal (`soda-smoke`)
- Sunlit Seoul street plaza with `FIRST RUN` glass storefronts, green street trees & floating fizzy soda bubbles (`soda-plaza`)
- Dreamy pastel bokeh halo backdrop for close-ups and the Korean bridge (`soda-pastel`, `soda-bridge`, `soda-ending`)
- Elevated circular plaza pedestal & neon magenta/cyan climax (`soda-pedestal`, `soda-neon`)

## Rebuild
```bash
bun tools/render-soda-pop-scene.ts
bun run content:manifest
```
