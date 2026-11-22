# RAYE feat. Hans Zimmer — Click Clack Symphony. (`?scene=click-clack-symphony`)

Procedural CHIMERA physical-voice reconstruction of **RAYE — "Click Clack Symphony." feat. Hans Zimmer** (official music video directed by Dave Meyers).

## Physical Voices
- `cc-raye` — **RAYE** (`female: 0.90`): British jazz/soul lead vocal across intimate spoken-sung intro, soaring orchestral choruses, and hillside finale.
- `cc-choir` — **Girls Squad & Choir** (`female: 0.94`): call-and-response hooks (`"Send the call out"`, `"Click-click-click clack symphony"`) and choral affirmations.
- `backing` — Demucs `htdemucs` Hans Zimmer orchestral instrumental accompaniment (`backing.mp3`).

## 3D Stage (`src/ui/render/click-clack.ts`)
- B&W musical-staff globe (`cc-globe`)
- Moody London manor parlor & gravity-tilted hall (`cc-parlor`, `cc-gravity`)
- Tufted teal pillow sofa (`cc-sofa`) & crimson Friday-night neon sign (`cc-neon`)
- South London terraced street, floating musical eighth-notes & piano-key crosswalk (`cc-street`, `cc-piano-walk`)
- Giant flying musical eighth-note soaring over London & medieval castle (`cc-flight`)
- Golden-hour English hilltop downs & scarlet feather coat (`cc-downs`, `cc-feathers`).

## Rebuild
```bash
bun tools/render-click-clack-scene.ts
bun run content:manifest
bun run verify:content
bun test tests/click-clack.test.ts
```
