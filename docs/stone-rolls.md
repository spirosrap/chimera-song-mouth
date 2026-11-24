# OK Go — A Stone Only Rolls Downhill (`?scene=stone-rolls`)

Full-length 3D CHIMERA music-video staging (`236.52s`) reconstructing the 64-phone mosaic progression of OK Go's *A Stone Only Rolls Downhill*.

## Visual Architecture (`src/ui/render/stone-rolls.ts`)
- **23 camera cuts across 7 procedural sets** (`STONE_SHOTS` in `src/scene/stone-rolls.ts`):
  1. `table`: Concrete slab opening card (*"64 Videos on 64 Phones"*), multiplying from 1 → 2 → 4 yellow-bumper vertical smartphones, Damian reaching across the bezel, 4-color linked arm chain with red apple, yellow/green split sweater, and bucket-hat harmonies.
  2. `grid12`: 2×6 twelve-phone grid with bare-arm diagonal lattices, color-coded chevron corridors, bucket-hat blocks, and studio tiles.
  3. `droste`: Luminous ceramic-tiled studio cycling green, yellow, and brick behind 5 hollow nested horizontal phone-inside-phone Droste frames gripped from above and below, spinning into a recursive vortex.
  4. `wall35`: 5×7 thirty-five horizontal smartphone wall flanked by white power strips and tangled white USB charging cables — animating through the 20-arm OK Go color-sleeved radial starburst, woven tartan plaid, pink/green matrix, three-column trio mosaic (green / chestnut / yellow), flickering brick/green/yellow mosaic, and electric green/pink climax checkerboard.
  5. `wall64`: Grand 8×8 sixty-four-phone colorful mosaic reveal.
  6. `studio`: Quiet real-life white studio pull-out with paneled double door.
  7. `black`: Final black credits fade.

## Audio & Physical Voices (`tools/render-stone-rolls-scene.ts`)
- **Backing:** Demucs `htdemucs` instrumental stem (`public/scenes/stone-rolls/backing.mp3`, 48 kHz stereo 192 kbps).
- **Voices:** Two CMUdict-timed physical CHIMERA vocal tracts (`stone-lead` for Damian Kulash, `stone-harmony` for answering refrains and upper-third band harmonies), rendered in parallel active windows and mixed with gentle vocal EQ, compression, and brickwall limiting into `public/scenes/stone-rolls/mix.mp3`.
- **Regenerate:** `bun tools/render-stone-rolls-scene.ts`
