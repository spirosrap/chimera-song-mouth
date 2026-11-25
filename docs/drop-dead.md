# Olivia Rodrigo — drop dead (`?scene=drop-dead`)

Full-length 3D CHIMERA music-video staging (`250.20s`) reconstructing Petra Collins's VHS daydream edit of Olivia Rodrigo's *drop dead* across a crowded dive bar and the Palace of Versailles.

## Visual Architecture (`src/ui/render/drop-dead.ts`)
- **32 camera cuts across 8 procedural sets** (`DROP_SHOTS` in `src/scene/drop-dead.ts`):
  1. `card`: Pastel-pink VHS felt opening and closing cards with sculpted white angel-wing heart flourishes and coquette ribbon crest (spoiler-free).
  2. `bar`: Dimly lit dive bar with overhead violet/amber bokeh string lights, stained-glass bottle grid, neon star sign, swaying bar patrons, and Olivia's long-sleeved white pearl-beaded mini dress.
  3. `bedroom`: Marie Antoinette's crimson-and-gold Rococo bedchamber with pastoral tapestries, crystal chandeliers (including an overhead spinning chandelier shot), red bedside lamp, upholstered royal bed, wired pink Y2K headphones, slate-blue ruffled Chloé babydoll dress with cream bloomers and white knit knee-high socks, and an open laptop flickering electric blue, magenta, and crimson.
  4. `gallery`: The Gallery of Battles with herringbone parquet, colossal gold-framed battle murals, paired Corinthian marble columns, white marble portrait busts, and crimson velvet museum benches.
  5. `staircase`: The Queen's cream-limestone Grand Staircase with checkerboard marble, Classical statues in arched niches, night-sky French windows, and diagonal stone balustrade.
  6. `salon`: Gilded Rococo salon with three crystal chandeliers where the three-piece girl band rocks matching hot-pink electric guitars.
  7. `garden`: Twilight Versailles garden steps, stone balustrade, and shimmering Grand Canal water with a gliding 3D white swan.
  8. `courtyard`: Illuminated Cour d'Honneur cobblestone plaza, gilded `Grille Royale` wrought-iron gate, floodlit brick-and-limestone Palace wings, and the closing instrumental sprawl across the wide limestone steps.

## Audio & Physical Voices (`tools/render-drop-dead-scene.ts`)
- **Backing:** Demucs `htdemucs` instrumental stem (`public/scenes/drop-dead/backing.mp3`, 48 kHz stereo 192 kbps).
- **Voices:** Two CMUdict word-timed physical CHIMERA vocal tracts (`drop-lead` + `drop-harmony`), rendered in parallel active windows and mixed with vocal presence EQ, compression, and brickwall limiting into `public/scenes/drop-dead/mix.mp3`.
- **Regenerate:** `bun tools/render-drop-dead-scene.ts`
