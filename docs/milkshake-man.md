# Go-Jo · Milkshake Man (Eurovision 2025 Live)

A procedural CHIMERA physical-voice music video scene reconstructing Australia's Eurovision 2025 live staging of **Go-Jo — "Milkshake Man"** (`196.97s`).

## Voices
- **Go-Jo (`milk-gojo`)**: Male physical pop-disco tenor (`female: 0.16`) phonemized with CMUdict (`tools/lib/english-phones.ts`), split diphthongs, crisp consonants, measured F0 contour, and explicit French IPA for *"crème brûlée"*.
- **Dancer (`milk-dancer`)**: Female physical voice (`female: 0.90`) performing the *"Ah, ah, ah"* hooks, *"Sh-sh-shake me good"*, the French bridge *"Excusez-moi, monsieur. Avez-vous du lait pour moi?"*, and the *"Yum, yum!"* call-and-response.

## 3D Eurovision Stage (`src/ui/render/milkshake-man.ts`)
- Retro 1970s woodgrain CRT TV opener and closing frame (`milk-tv`)
- Pink/green striped diner curtains & handheld glass blender (`milk-diner`)
- Towering glowing center-stage milkshake blender & twin `MILKSHAKE MAN` signs (`milk-blender`)
- Dynamic optical checkerboard LED floor cycling through black & white, neon lime, electric blue arena lasers, fiery amber, pink smoke clouds, neon star wall, red-and-black milk-splash overhead, and colossal berry/milk-wave climax (`milk-checker`, `milk-blue`, `milk-susan`, `milk-lime`, `milk-amber`, `milk-smoke`, `milk-stars`, `milk-red-splash`, `milk-fruit`, `milk-shirtless`, `milk-finale`)
- Go-Jo's three live outfit reveals: white milkman jumpsuit -> sparkly baby-blue sleeveless jumpsuit -> shirtless finale with red neck scarf

## Rebuild
```bash
bun tools/render-milkshake-scene.ts
bun run content:manifest
```
