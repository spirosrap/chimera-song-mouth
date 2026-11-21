# KATSEYE · Gabriela (Official MV)

A procedural CHIMERA physical-voice music video scene reconstructing the 90s Latin telenovela official video for **KATSEYE — "Gabriela"** (`293.36s`).

## Voices
- **KATSEYE Lead (`gab-lead`)**: Female physical pop airway (`female: 0.92`) singing the English verses, pre-chorus, and *"Hands off, Gabriela"* hooks using CMUdict (`tools/lib/english-phones.ts`), split diphthongs, crisp consonants, and measured F0 pitch contour.
- **Daniela (`gab-daniela`)**: Female physical airway (`female: 0.86`) delivering the Spanish bridge (*"Él llegó conmigo y conmigo se va..."*) with explicit Spanish IPA and executive telenovela lines.
- **CEO Gabriela (`gab-boss`)**: Female physical airway (`female: 0.78`) delivering the opening boardroom CEO monologue and closing wine-desk outro.

## 3D Telenovela Stage (`src/ui/render/gabriela.ts`)
- 90s Gabriela Enterprises corporate tower against blue sky & clouds (`gab-tower`)
- Mahogany CEO boardroom with chrome uplight pillars, conference table, sunlit and midnight-blue Venetian blinds (`gab-boardroom`, `gab-boss`, `gab-blinds`, `gab-red-office`, `gab-table-dance`)
- Peach telenovela mansion parlor with crystal chandelier and neon magenta/cyan ballroom lighting (`gab-mansion`, `gab-ballroom`)
- Sunlit red-rose garden wedding arch with luxury white SUV crash (`gab-wedding`)
- 90s *"KATFIGHT: SPAGHETTI AND TEARS!"* talk-show stage with rose-petal crowd shower (`gab-talkshow`, `gab-crowd`)
- Glowing red cursive *"Gabriela"* neon title outro (`gab-outro`)

## Rebuild
```bash
bun tools/render-gabriela-scene.ts
bun run content:manifest
```
