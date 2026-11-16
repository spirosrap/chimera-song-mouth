# CHIMERA · Vocal Band & Movie Scenes

Complete portable edition of the CHIMERA mouth app: **twenty-two songs, fifteen film and TV scenes, one speech, two Apollo missions, sixty-two concert and music-video performances, the single-mouth player, and all prepared media used by the website**.

Based on [Jameson Hodge’s CHIMERA](https://github.com/jamesondh/chimera-vocal-synth). The Rust/WebAssembly physical voice engine, React interface, mouth animation and generated scene environments are included. This independent repository has no dependency on the previous ChatGPT Site or its account. The voice model’s sources are listed in [docs/architecture.md](docs/architecture.md#references-and-credits).

## Start here

- **Another agent taking over:** read [HANDOFF.md](HANDOFF.md).
- **Move to a new host:** read [DEPLOYMENT.md](DEPLOYMENT.md).
- **Update from the original CHIMERA:** read [UPSTREAM.md](UPSTREAM.md).
- **Included songs, scenes and media:** see [CONTENT.md](CONTENT.md).
- **Earlier implementation notes:** see [EDITION-NOTES.md](EDITION-NOTES.md). References there to media being ignored describe the earlier workspace; this repository tracks the complete prepared media.

## The original project’s vision & scope

From upstream’s README. It governs the engine and the single-mouth app. This edition deliberately goes beyond points 6 and 7: it tracks the prepared song and scene media the owner asked for (see [MEDIA-RIGHTS.md](MEDIA-RIGHTS.md)) and stages multi-voice scenes.

1. **One instrument**: a physically modeled voice (lungs, vocal folds, throat, mouth). No
   samples, no neural audio.
2. **The web app is the primary surface**: anyone should be able to make songs in it without
   an LLM's help. Mobile is the likely next surface. The plugin (CLAP/VST3/AU) still ships, but
   it's secondary.
3. **As realistic as we can make it**: the main push is to see how close the simulation gets to
   a real voice. The robotic, Vocaloid-like sound people like today stays playable as a preset
   ([#93](https://github.com/jamesondh/chimera-vocal-synth/issues/93)).
4. **Languages enter through one shared front-end design**, not one-off hacks. Each needs a
   native speaker's check and must leave English unchanged.
5. **The design language (the vector display) is settled**; the look within it can still evolve.
6. **Nothing copyrighted in git**; MIT; a deterministic, real-time-safe engine.
7. **Not now**: a DAW or sequencer, a light theme, MPE, multi-voice dialogue.

## Run locally — Bun only

Install [Bun](https://bun.sh/), then:

```sh
gh repo clone spirosrap/chimera-song-mouth
cd chimera-song-mouth
bun install --frozen-lockfile
bun run verify:content
bun run dev:static
```

Open the address printed by Vite (normally `http://127.0.0.1:5317`). The precompiled voice engine is included, so Rust is unnecessary when running or deploying the current edition.

## Build for any static host

```sh
bun install --frozen-lockfile
bun run build:static
```

Publish **all of `dist/`** at the root of an HTTPS website. No backend, API key, database, paid voice service, or separate media bucket is required. Media comes from this repository, not GitHub raw-file URLs. Importing a song in the single-mouth player stays in the visitor’s browser.

A ready-built `chimera-website.zip` is also attached to the latest GitHub release. Unzip it and deploy its contents directly if the hosting service accepts prebuilt websites.

## Change the engine or run the full tests

Install Rust/Rustup as well as Bun, then:

```sh
rustup target add wasm32-unknown-unknown
bun install --frozen-lockfile
bun run test
bun run typecheck
bun run build
```

`build` rebuilds the Rust engine; `build:static` uses the tracked WebAssembly binary. After changing Rust, commit the rebuilt `src/wasm/chimera.wasm` alongside its source. Do not reuse a `target/` directory from another checkout. See [AGENTS.md](AGENTS.md) for engine and animation contracts.

## Prepare a MusicXML arrangement

The upstream score converter reads `.mxl` or `.musicxml` files and prepares a part for `chimera render notes`:

```sh
bun tools/musicxml-to-notes.ts score.mxl                  # list the score's parts
bun tools/musicxml-to-notes.ts score.mxl P1 --out p1.json  # convert one part
```

It uses the included WebAssembly engine and pronunciation dictionary. Repeats, alternate endings and tied notes are handled; `--spell word=respelling` resolves lyrics that do not fit the notes. This is an arrangement-preparation tool, separate from the website's MIDI importer. See the tool's introductory comments for its supported score features.

## Media storage

All 592 public files are tracked in ordinary Git, including MP3 stems, compressed mouth telemetry, prepared scores, captions, credits, fonts, the dictionary and the existing subtitled MP4. `MEDIA-MANIFEST.json` records their sizes and SHA-256 hashes; a static build verifies it first. No Git LFS setup or secondary download is needed.

After intentionally adding or replacing public assets, run `bun run content:manifest`, inspect the changes, and commit the new manifest with the files. Do not regenerate the manifest to conceal missing assets.

Original source recordings from the Music/Videos folders, temporary processing files, model downloads and caches are not required to run the site and are not included. All content currently available through the app is included.

## License and credits

The software retains the upstream [MIT license](LICENSE) and Jameson Hodge’s copyright notice. Included third-party fonts and dictionary retain their own license files. Song and movie material is separately credited and is not relicensed as MIT; see [MEDIA-RIGHTS.md](MEDIA-RIGHTS.md).

## Rodehihi — Δεν ξανακάνω φυλακή

The tenth selection, `?song=rodehihi-den-xanakano-fylaki`, adds the complete 3:12 supplied Rodehihi performance. The original stereo instrumental backing, breaks and long ending remain at their original speed. Vocal separation is used only around the sung phrases; the instrumental intro and ending use the source mix directly, with a common gain for headroom. No original lead vocal is intentionally mixed in; faint separation remnants may remain.

A CHIMERA mouth sings the three verses and repeated refrains. The updated performance uses sound-by-sound estimates from the supplied vocal instead of converting the lyrics into standard Greek pronunciation. Explicit consonant/vowel durations and a continuous source pitch and emphasis contour preserve more of this singer’s accented delivery, slides and held vowels. Phonetic recognition is approximate; this is physical robotic singing, not a copy of the singer’s voice. Greek captions remain correctly spelled. Editing the lyrics returns to ordinary text-based planning; changing the body keeps the source performance. Singer and backing have independent mute/solo and level controls, and the full mix can be downloaded as WAV.

The prepared score, two MP3 channels, compressed mouth telemetry and credits are in `public/band/rodehihi-den-xanakano-fylaki/`. All nine earlier songs, the default selection and both movie scenes remain.

For the existing Sites host’s archive limit, builds can set `CHIMERA_EXTERNAL_MOVIE_DOWNLOAD=https://github.com/spirosrap/chimera-song-mouth/releases/download/v1.0.0/for-x.mp4`. This makes the existing courtroom video download use the identical, checksum-verified release attachment and omits that duplicate MP4 from the hosted archive. Ordinary builds retain the local MP4 and are self-contained. Song playback always uses the local prepared assets.

## Country Roads

`?song=country-roads` adds the complete supplied 3:15 John Denver recording as one generated singer over separated original instrumental music. It uses the CMUdict pronunciation, timed syllable and held-vowel approach described in the quoted demo, with source-aligned words and melody. The large head and scrolling green notes/yellow rendered-pitch trace share the actual audio clock, including pause and seek. All eleven earlier songs and three scenes remain.

This edition also includes the full supplied Dimash SOS concert, with an approved French physical singer, original music and a populated stage with synchronized microphone gestures, lights and camera cuts. Open `?scene=dimash-sos`; see [the concert notes](docs/dimash-sos.md).

Реченька adds the full supplied live performance as a scene with Russian physical singing, original accompaniment, river scenery, a dock and boat, shadow dancers and reaction cameras. Open `?scene=rechenka`; see [the scene notes](docs/rechenka.md).

The complete supplied **Big Lebowski** bowling sequence is available at `?scene=big-lebowski`, with four physical voices, five characters, rolling ball and pins, a doorstep flashback, the original opening song and background sound. See [the scene notes](docs/big-lebowski.md).

The complete supplied **Blade Runner · Tears in Rain** rooftop sequence is available at `?scene=tears-in-rain`, with physical dialogue, the original background soundtrack, a rainy rooftop rescue and the dove’s flight. See [the scene notes](docs/tears-in-rain.md).

The complete supplied **Interstellar — TARS humor setting** scene is available at `?scene=tars`, with three physical voices, four helmeted crew in the Ranger cabin, TARS’s working airway display, joke light, changing humor setting and rocket separation. See [the scene notes](docs/tars.md).

The complete supplied **Good Will Hunting — the park bench** conversation is available at `?scene=good-will-hunting`, with two physical voices, original background music and ambience, the pond and swans, Sean’s cap and beard, Will’s reactions and the quiet walk-away ending. See [the scene notes](docs/good-will-hunting.md).

The complete supplied **The Truman Show — the exit** ending is available at `?scene=truman-show`: seven physical dialogue voices, original music and effects, the painted sky, sailboat, staircase, exit door, broadcast control room and viewers. The farewell bow, exit and closing guard exchange remain. See [the scene notes](docs/truman-show.md).

The complete supplied **Celentano — Prisencolinensinainciusol** classroom performance is available at `?scene=celentano`: physical nonsense singing, original music and harmonica, the teacher with glasses and a blue tie, answering students, desks, globe, clapping and dancing. See [the scene notes](docs/celentano.md).

The complete supplied **The Avalanches — Frontier Psychiatrist** music video is available at `?scene=frontier-psychiatrist`: six physical voices, original music, gold curtains, orchestra, cowboys, ghosts, turtle, parrot and scratched-record finale. See [the scene notes](docs/frontier-psychiatrist.md).

The complete supplied **The Muppet Show — Mahna Mahna** sketch is available at `?scene=mahna-mahna`: a physical singing trio, original accompaniment, orange hair and glasses, two pink Snowths, scat walk-offs, telephone and balcony ending. See [the scene notes](docs/mahna-mahna.md).

The complete supplied **Laurie Anderson — O Superman** music video is available at `?scene=o-superman`: physical words and ha pulse, original instrumental bed, circular light, hand shadows, red silhouette, keyboard and abstract ending. See [the scene notes](docs/o-superman.md).

The complete supplied **Céline Dion — It’s All Coming Back to Me Now** extended video is available at `?scene=celine-coming-back`: physical lead, original music, storm, motorcycle, candlelit mansion, bedroom, mirror, flowing curtains, ghostly lover and closing doorway. See [the scene notes](docs/celine-coming-back.md).

The complete supplied **Vitas — The 7th Element** video is available at `?scene=vitas-7th-element`: mouth-engine singing and tongue flutter, original music, silver costume and headpiece, coloured disco circles, checkerboard dancers and audience. See [the scene notes](docs/vitas-7th-element.md).

The complete supplied **Ylvis — Stonehenge** video is available at `?scene=stonehenge`: original music, physical singing, a TV studio, kitchen, bedroom, car, dramatic gestures, stone circle and sunset. See [the scene notes](docs/stonehenge.md).

The complete supplied **Talking Heads — Once in a Lifetime** video is available at `?scene=once-in-a-lifetime`: original music, physical verses and refrains, a dark suit, bow tie and glasses, strange dance movements, repeated figures and flowing water. See [the scene notes](docs/once-in-a-lifetime.md).

The complete supplied **Nat King Cole — Autumn Leaves** performance is available at `?scene=autumn-leaves`: original music and a physical singer, presented in black and white with a suit, patterned tie, garden foliage and a woven chair. See [the scene notes](docs/autumn-leaves.md).

The complete supplied **Tom Waits — What’s He Building?** recording is staged at `?scene=whats-he-building`: physical narration, original eerie soundscape and an imagined flickering workshop with covered machinery and unexplained shadows. See [the scene notes](docs/whats-he-building.md).

The complete supplied **Michael Bolton — Said I Loved You…But I Lied** video is staged at `?scene=said-i-loved-you`, with original accompaniment, a physical singer, sunset fire, canyon rocks, a dark cave, lovers and horses. See [the scene notes](docs/said-i-loved-you.md).

The complete supplied **Bon Jovi — Always** video is staged at `?scene=bon-jovi-always`, with original accompaniment, a physical English lead, vintage microphone, city and dusty-road opening, apartment, party, painting loft, explosion, emergency street and turquoise art studio. See [the scene notes](docs/bon-jovi-always.md).

The complete supplied **Guns N’ Roses — November Rain** film is staged at `?scene=november-rain`, with original instrumental music, a physical lead and answering outro voice, concert piano, wedding, desert guitar, reception storm, funeral, cemetery and grave roses. See [the scene notes](docs/november-rain.md).

The complete supplied **Enrique Iglesias — Hero** video is staged at `?scene=hero`, with original music, approved physical singing, red beanie and sunglasses, petrol station, cream convertible, golden desert, chapel, lovers, confrontation and rain-soaked final embrace. See [the scene notes](docs/hero.md).

The complete supplied **Céline Dion — My Heart Will Go On** anniversary alternate video is staged at `?scene=my-heart-will-go-on`, with original music, approved physical singing, ivory lace gown, curved ship’s bow, sunset ocean, windblown hair, starry close-ups and overlapping singer images. See [the scene notes](docs/my-heart-will-go-on.md).

The complete supplied **a-ha — Take On Me** video is staged at `?scene=take-on-me`, with original music, physical lead and chorus replies, graphite lines and pencil shading, motorcycle race, colour café and comic book, reaching hand, two-world window, band, wrench-wielding pursuers, paper escape, apartment and sketch-to-human doorway ending. See [the scene notes](docs/take-on-me.md).

The complete supplied **Nick Cave & Kylie Minogue — Where the Wild Roses Grow** video is staged at `?scene=wild-roses`, with original music, two physical singing voices, dark river and reeds, a floating red-haired woman in a white slip dress, Nick kneeling on the bank, rose-filled portraits, hands, snake and the final rose at her lips. See [the scene notes](docs/wild-roses.md).

The complete supplied **Peter Gabriel — Sledgehammer** video is staged at `?scene=sledgehammer`, with original music, physical lead and backing calls, microscopic opening, giant face and miniature train, clay and fruit transformations, cardboard room, dancing chickens, wallpapered dance floor, moving furniture and a final figure of lights. Prop movement steps at nine frames per second while the mouth follows the physical articulation. See [the scene notes](docs/sledgehammer.md).

The complete supplied **David Bowie — Ashes to Ashes** video is staged at `?scene=ashes-to-ashes`, with original music and physical singing, ruffled Pierrot, pink shoreline, memory cards, dark-clad procession and yellow bulldozer, padded room and wooden chair, monochrome astronaut, dark water and the closing walk with the older woman. Four physical heads share one retained model. See [the scene notes](docs/ashes-to-ashes.md).

The complete supplied **Απορώ αν αισθάνεσαι tipsy** mashup is staged at `?scene=aporo-tipsy`, with original music, Greek mouth-engine singing and speech, the English hook, long-haired singer and handheld microphone, retro rock band, organ, red guitar, pink-shirted bassist, drums and seated audience. See [the scene notes](docs/aporo-tipsy.md).

The complete supplied **Sinéad O’Connor — Nothing Compares 2 U** video is staged at `?scene=nothing-compares`, with original music, a physical singer in an intimate portrait, cropped hair, black high collar, restrained expressions and tears, formal garden paths, fountain, statues, balustrade, walking figure and slow double exposures, including the full long garden outro. See [the scene notes](docs/nothing-compares.md).

The complete supplied **Falco — Rock Me Amadeus** video is staged at `?scene=rock-me-amadeus`, with original music, three physical vocal parts, Vienna postcard, black coach, tuxedo and coloured Mozart wig, brocade coat, white cravat, period courtiers, neon biker bar, motorcycles and final prayer. See [the scene notes](docs/rock-me-amadeus.md).

The complete supplied **Kate Bush — Wuthering Heights** red-dress video is staged at `?scene=wuthering-heights`, with the approved physical lead, original music, windswept field and pine grove, long hair, face-framing hands, red flowing sleeves and skirt, black belt, turns and full receding dance ending. See [the scene notes](docs/wuthering-heights.md).

The complete supplied **Shakespears Sister — Stay** video is staged at `?scene=shakespears-stay`, with original music, two approved contrasting physical singers, the star-filled bedside room, Earth, brass bed, dark visitor, luminous curtain tunnel, struggle, revival and final embrace. See [the scene notes](docs/shakespears-stay.md).

The complete supplied **Boyz II Men — I’ll Make Love to You** video is staged at `?scene=ill-make-love-to-you`, with original music, four approved physical chorus voices, a physical spoken opening, security keypad, writing desk and silver lamp, ivory outfits, staircase, blue portraits, candles and final letter reading. See [the scene notes](docs/ill-make-love-to-you.md).

The complete supplied **Sérgio Mendes — Mas Que Nada** performance is staged at `?scene=mas-que-nada`, with original accompaniment, a physical Brazilian Portuguese lead, period singer, vintage microphone, Sérgio at the piano, second singer, jungle foliage and band. See [the scene notes](docs/mas-que-nada.md).

The complete supplied **Player — Baby Come Back** performance is staged at `?scene=player-baby-come-back`, with original music, four physical singers and five band heads, blue-shirted lead in a dark vest, red bassist, white guitarist, blue keyboard player, blond drummer, twin keyboards, guitars, drums, amplifiers, microphone profiles and source-time camera cuts. See [the scene notes](docs/player-baby-come-back.md).

The complete supplied **Queen — I Want to Break Free** video is staged at `?scene=break-free`, with original music, physical mouth-engine singing, pink sleeveless top, dark bob and moustache, moving upright vacuum cleaner, patterned home and stairs, kitchen, other costumed household figures, blue-lit crowd and central white-box ballet. See [the scene notes](docs/break-free.md).

The complete supplied **Björk — Human Behaviour** video is staged at `?scene=human-behaviour`, with original music, physical singing and unusual wordless calls, miniature night forest and giant plush bear, wooden cabin and cereal bowl, moth and hanging bulb, hunter and road, floating water portrait, moon journey, tiny singer inside the bear and closing little green world. See [the scene notes](docs/human-behaviour.md).

The complete supplied **Eurythmics — Sweet Dreams (Are Made of This)** video is staged at `?scene=sweet-dreams`, with original music, physical singing and wordless calls, orange cropped hair and black suit, boardroom and globe, analogue synth and live monitor, record plaques, cows, blindfolded red-dress cello scenes, outdoor table, boat and bedside cassette ending. See [the scene notes](docs/sweet-dreams.md).

The full **Nightwish — The Phantom of the Opera** live video is staged at `?scene=nightwish-phantom`, with the approved physical duet and high ending, original music, gold coat and yellow microphone, long-haired bassist, guitar, white keyboards, drums, concert lights and waving crowd. Five band heads borrow two singers. See [the scene notes](docs/nightwish-phantom.md).

The complete supplied **Annie Lennox — Walking on Broken Glass** video is staged at `?scene=walking-broken-glass`, with original music, physical singing, red hood and embroidered gown, powdered wigs and fans, candlelit party, chandelier, jealous guests, corridor quarrel, spiral staircase and carried finale. See [the scene notes](docs/walking-broken-glass.md).

The complete supplied **Duran Duran — The Wild Boys** video is staged at `?scene=wild-boys`, with original music, physical singing and calls, industrial factory, mechanical head and monitors, rotating windmill and bound singer, water and splashes, platforms and cages, band, punk dancers, coloured beams and closing rain. See [the scene notes](docs/wild-boys.md).

The complete supplied **The Cure — Lullaby** video is staged at `?scene=lullaby`, with original music, physical singing and spoken ending, iron bed, striped pyjamas, white pillows and red blanket, window hands, lace and cobwebs, wall figure, giant spider, trapped figure and swallowing imagery, plus a web-covered band. See [the scene notes](docs/lullaby.md).

The complete supplied **The Darkness — I Believe in a Thing Called Love** video is staged at `?scene=darkness-love`: original music, the approved physical falsetto, heart bath, purple bedroom, pink alien world, crab, giant faces, amplifier walls, silver spaceship band, monster tentacles and guitar lasers. See [the scene notes](docs/darkness-love.md).

**Army of Lovers — Crucified** (`?scene=crucified`) adds the ornate trio, crowns, bath, mirror, violin and cage; **Pet Shop Boys — Go West** (`?scene=go-west`) adds the blue/yellow duo, statues, stairway, procession and stars. Both keep original music and use the approved physical voices. See [Crucified](docs/crucified.md) and [Go West](docs/go-west.md).

**Dead or Alive — You Spin Me Round** (`?scene=spin-round`) adds the purple velvet and eye-patch costumes, mirror ball, picture frame, arm choreography, flags and confetti. **Radiohead — No Surprises** (`?scene=no-surprises`) adds the close singer, transparent helmet, reflected lights and source-timed rising/draining water. Both preserve original music and use their approved physical voices. See [Spin](docs/spin-round.md) and [No Surprises](docs/no-surprises.md).

**Michael Jackson — Remember the Time** (`?scene=remember-time`) adds the complete Egyptian short film, four physical voices, royal dialogue, entertainers, magic, market chase, balcony and dance. **Peter Gabriel — Shock the Monkey** (`?scene=shock-monkey`) adds the office and ritual double, scattered papers, projector, monkey, forest and water. Both keep original music and the approved mouth-engine vocals. See [Remember](docs/remember-time.md) and [Shock](docs/shock-monkey.md).
