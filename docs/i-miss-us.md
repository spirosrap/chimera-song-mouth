# Joost, Tommy Cash & Käärijä — I MISS US (`?scene=i-miss-us`)

Procedural CHIMERA physical-voice reconstruction of **JOOST, TOMMY CASH, KÄÄRIJÄ — "I MISS US"** (official music video).

## Physical Voices
- `miss-joost` — **Joost Klein** (`female: 0.14`): boyband lead, Malmö verse, and spoken studio banter.
- `miss-tommy` — **Tommy Cash** (`female: 0.08`): Basel verse and soulful chorus lines.
- `miss-kaarija` — **Käärijä** (`female: 0.06`): Liverpool verse, 90s boom-bap rap breakdown, and chorus harmonies.
- `backing` — Demucs `htdemucs` instrumental accompaniment (`backing.mp3`).

## 3D Stage (`src/ui/render/i-miss-us.ts`)
- Vintage chrome studio microphones & crimson bokeh (`miss-mics`)
- Starry Basel night & rainy Malmö street (`miss-night`)
- Cloudy Nordic lakeside beach (`miss-lake`)
- Curved crimson grid boyband chamber (`miss-red-grid`)
- Candlelit grand piano stage (`miss-piano`)
- Pouring rain with translucent umbrellas (`miss-rain`)
- 90s graffiti brick alley & red DJ turntables (`miss-graffiti`)
- Folding-chair garage with vintage teal muscle car (`miss-garage`)
- Mountain highway sidecar motorcycle (`miss-sidecar`), airport tarmac jetliner (`miss-tarmac`), and *POP Times* `"Euroboys are back!"` finale (`miss-ending`).

## Rebuild
```bash
bun tools/render-i-miss-us-scene.ts
bun run content:manifest
bun run verify:content
bun test tests/i-miss-us.test.ts
```
