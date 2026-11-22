# Doechii — Anxiety (`?scene=anxiety`)

Procedural CHIMERA physical-voice reconstruction of **Doechii — "Anxiety"** (official music video directed by James Mackel).

## Physical Voices
- `anx-lead` — **Doechii (Lead)** (`female: 0.90`): expressive mezzo-soprano sung hooks, rhythmic hip-hop verses, and spoken bridge.
- `anx-echo` — **Inner Anxiety (Echo & Replies)** (`female: 0.94`): call-and-response whispers, interlude cues (`"Quiet on the set, please"`), and layered hook counters (`"Can't let it conquer me"`, `"Marco / Polo"`).
- `backing` — Demucs `htdemucs` instrumental accompaniment (`backing.mp3`).

## 3D Stage (`src/ui/render/anxiety.ts`)
- **Bougainvillea Bedroom Window (`anx-window`):** Ivy and magenta bougainvillea framing the white mullioned window, mandala tapestry, and hot-pink drawers.
- **Mansion Hallway & Sunroom (`anx-hallway`, `anx-sunroom`):** Backlit corridor, arched sunlit windows, and wooden chaise lounge.
- **Twins Couch (`anx-twins`):** Navy sofa flanked by two powder-blue twin sisters with white bows.
- **Flaming Kitchen & Gotye Wall (`anx-kitchen`, `anx-gotye`):** Roaring stove flames and geometric pastel-triangle homage wall.
- **Piano Parlor (`anx-parlor`):** Dim grand piano room warmed by a flickering hearth fire.
- **Suburban Lawn & Giant Elephant (`anx-lawn`):** Golden-hour hedges and a giant gray elephant walking behind the lawn (*"Like an elephant is standing on me"*).
- **Cul-de-Sac Flash-Mob & Overhead Kaleidoscope (`anx-street`, `anx-overhead`):** Vintage black convertible, sixteen synchronized street dancers, and a bird's-eye finale.

## Rebuild
```bash
bun tools/render-anxiety-scene.ts
bun run content:manifest
bun run verify:content
bun test tests/anxiety.test.ts
```
