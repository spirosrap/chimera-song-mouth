# Handoff to another agent

## Goal

Host this complete CHIMERA edition on a new independent hosting account, preserving every existing song, movie scene, mouth animation and download. Work from this repository, not the original upstream repository, which does not contain this edition’s media.

## Access

This repository is public. Anyone can view, clone or download it without signing in. Another agent only needs the repository URL to read the code and media. Pushing changes still requires the owner’s GitHub connection or a collaborator invitation under Settings → Collaborators. No credentials are stored in the project.

## First commands

```sh
bun install --frozen-lockfile
bun run verify:content
bun run build:static
```

This uses the included precompiled WASM engine. Publish the entire generated `dist/` folder; see [DEPLOYMENT.md](DEPLOYMENT.md). The latest release also has a prebuilt website ZIP. A hosting account connection is a separate step from repository access.

## Preserve

- Twenty-two songs in `src/band/library.ts`, including all prepared files in `public/band/`.
- All fifteen film and TV scenes, the Fool me once speech, the two Apollo scenes and all sixty-three concert and music-video performances in `src/scene/library.ts` and `public/scenes/`, including the existing A Few Good Men MP4 download.
- The `?solo=1` player, Greek pronunciation/whistling and the robotic finger-click hand.
- MEGALOVANIA’s retained model leases and shared WebGL renderer; do not revert these, or some of the 24 heads disappear.
- Solo playback’s prepared audio buffer; routing it back through the overloaded live solver previously produced silent playback.
- Gzipped `.tele.gz` assets, stereo instrumental backing and independent mixer controls.
- Existing song IDs, scene IDs and default selection. Complete links are in `CONTENT.md`.
- The speech's single-speaker `press` setting, synchronized gestures and original excerpt pauses; see `docs/fool-me-once.md`.
- Πάμε στη Χονολουλού’s complete Greek recording, physical lyric and wordless singing, original music, island singer, palms, waves and boat. Preserve its single borrowed model, source timing and instrumental break; see [the song notes](docs/pame-sti-honolulu.md).
- Lose Yourself’s original music, approved clear rap voice, source-timed lyric highlighting and rainy city presentation; see `docs/lose-yourself.md`.
- Hello’s full supplied music video, original accompaniment, physical singing and dialogue, performing-arts school, cream jacket, curls and moustache, acting students, corridor, dance and art studios, telephone, grand piano and clay portrait. Keep all four borrowed models, the overlapping dialogue and singing, source clock and final face-touch; see [the scene notes](docs/hello.md).
- I Will Always Love You’s complete supplied Whitney Houston video, unaccompanied physical opening, original accompaniment, navy suit and short curls, warm microphone, dark theater, seated lounge, cabin, snow and airport farewell. Preserve the full final held vowel and upward run through about 270 seconds, source clock and one borrowed model; see [the scene notes](docs/always-love-you.md).
- Un-Break My Heart’s full supplied Toni Braxton video, original music, approved physical contralto, warm home memories, motorcycle opening, blue pool, mirror and bedroom, seated staircase grief, white halter gown and curly bob, populated theatre orchestra, moving bows, spotlights and gilded closing curtains. Keep its retained physical model, complete held ending and source clock; see [the scene notes](docs/unbreak-my-heart.md).
- Take On Me’s complete supplied a-ha video, physical lead and chorus replies, original music, local graphite-on-paper rendering, motorcycle race, comic-book café, wink and reaching hand, two-world window and band, wrench-wielding rivals, paper escape and bin climb, apartment, sketch-to-human doorway transformation and closing cover. Four heads borrow two retained models; the girl stays vocally silent. Preserve source time and all preceding media; see [the scene notes](docs/take-on-me.md).
- Where the Wild Roses Grow’s full supplied Nick Cave/Kylie video, approved independent physical duet and original music, floating face-up pose, white slip dress and white shirt, rose portraits, reeds, snake and final rose. Two heads borrow two retained models; overhead cameras explicitly restore their up vector on seeks. Shared-refrain lower harmony is estimated. Preserve all preceding media; see [the scene notes](docs/wild-roses.md).
- Sledgehammer’s complete supplied video, approved physical lead/backing calls and original music, microscopic opening, miniature train, speaker/chalkboard/clay/fruit transformations, cardboard doors, chicken theatre, dance floor and crowd, moving furniture, light figure and closing credit period. Four heads borrow two retained models. Keep the separate nine-frame prop clock, continuous mouth telemetry, source-time seeking and all preceding media; see [the scene notes](docs/sledgehammer.md).
- Ashes to Ashes’s complete supplied official edit, approved physical lead and original music, ruffled Pierrot and pointed cap, memory cards, pink shoreline/cliffs, dark-clad procession and yellow bulldozer, padded room/shadowed chair, monochrome astronaut and attendants, dark water, blue hoses and older woman. Four physical heads share one retained singer. Preserve the full instrumental ending, exact source clock, direct seeking and all preceding media; see [the scene notes](docs/ashes-to-ashes.md).
- Baby Come Back’s complete supplied Player performance, owner-approved physical lead and three estimated backing registers, original instrumental opening and ending, five physical band heads, blue shirt and dark vest, red bassist, white guitarist, blue keyboard player, blond drummer, twin keyboards, guitars, drums, amplifiers and camera cuts. Keep four retained singing models; the drummer borrows a neutral frame and remains vocally silent. Preserve source time and preceding content; see [the scene notes](docs/player-baby-come-back.md).
- Human Behaviour’s complete supplied Björk video, owner-approved physical singing and source-phone calls, original music, miniature forest, giant plush bear, hunter, cabin and cereal bowl, moth and bulb, night road and blue car, floating water portrait, astronaut, tiny singer in the bear and final green world. Five head graphics borrow one retained singer; absolute source time restores the bear, moth, car and camera up-vector. Preserve all preceding assets; see [the scene notes](docs/human-behaviour.md).
- Sweet Dreams’ complete supplied Eurythmics video, owner-approved physical singing and wordless calls, continuous original music, orange hair and suit, boardroom/globe, analogue keys/live monitor, gold records, cows, red dress and dotted blindfold, cellos, field, boat and bedside cassette ending. Five head graphics share one retained singer. Preserve the full fading audio after the source picture ends, including its unfinished last line; see [the scene notes](docs/sweet-dreams.md).
- Walking on Broken Glass’s complete supplied Annie Lennox video, owner-approved physical singing, continuous original accompaniment, red hood and embroidered gown, powdered wigs, fans, candlelit party and jealous guests, corridor quarrel, spiral stairs and carried finale. Preserve the one borrowed singer, source clock, the clear stair/final camera paths and every preceding media asset; see [the scene notes](docs/walking-broken-glass.md).
- The Wild Boys’ complete supplied Duran Duran video, owner-approved physical singing and repeated calls, continuous original music, industrial factory and maze, mechanical head/monitors, rotating windmill and bound singer, water, cages, platforms, drums, guitar, bass, keyboard and punk dancers. Three heads borrow one retained singer. Preserve absolute source time, quiet instrumental gaps, monitor boundary and clear rotating head; see [the scene notes](docs/wild-boys.md).
- Lullaby’s complete supplied Cure video, owner-approved physical singing, spoken ending and original music, long instrumental opening, iron bed and striped pyjamas, pillows/red blanket, window hands, gradual cobwebs, wall figure and giant spider, trapped body and swallowing imagery, and red-uniform band. Three heads borrow one retained singer. Preserve true web opacity and empty early web buffers, source timing, instrumental silence and clear bed mouth; see [the scene notes](docs/lullaby.md).
- I Want to Break Free’s complete supplied Queen video, physical singing, original music and intact synth/dance break, pink sleeveless top, bob and moustache, animated upright vacuum, three household costumes, patterned living room, stairs, kitchen, terraced roofs, blue-lit crowd, cave, white box and ballet lift/roll. Three heads share one retained singer. Preserve source time and all preceding assets; see [the scene notes](docs/break-free.md).
- Απορώ αν αισθάνεσαι tipsy’s complete supplied Greek/English mashup, approved physical refrain/hook, original accompaniment, spoken greetings and Greek ending, long-haired singer, handheld mic, red scarf and fringed waistcoat, organ, pink-shirted bassist, red guitar, drums and audience. One retained model drives the singer. Preserve the original instrumental window, Greek vowel quality, English dictionary phones, source clock and all preceding assets; see [the scene notes](docs/aporo-tipsy.md).
- Nothing Compares 2 U’s complete supplied Sinéad O’Connor video, physical lead, original music, intimate portrait, cropped hair, black high collar, restrained expressions and tears, formal garden paths, fountain, balustrade, statues, walking figure, double exposure and full long instrumental ending. Both physical heads share one retained model. Keep the source clock and every preceding asset; see [the scene notes](docs/nothing-compares.md).
- Rock Me Amadeus’s full Falco video, German physical lead and two physical chorus registers, original music, Vienna title postcard, black coach, tuxedo and black bow tie, coloured Mozart wig, brocade coat and white cravat, period courtiers, biker bar, motorcycles and final praying hands. Keep the three retained models; tuxedo and wig share the lead. Preserve absolute source time and every preceding asset; see [the scene notes](docs/rock-me-amadeus.md).
- Wuthering Heights’s complete red-dress video, approved physical high lead, original music and full long guitar/dance ending, flowing red sleeves and skirt, black belt, long hair and fringe, red flower, earrings, windswept field and tall pine grove. Preserve the single retained model, source-timed hands, spins and receding ending; see [the scene notes](docs/wuthering-heights.md).
- Stay’s complete supplied Shakespears Sister video, approved contrasting physical singers, original music, cropped-haired lead and glittering dark visitor, blue pillars, Earth and stars, brass bed, silent patient, luminous curtain tunnel, struggle, revival and final embrace. Keep both retained model leases; the silent patient borrows the lead model. Preserve source time and the approved duet; see [the scene notes](docs/shakespears-stay.md).
- I’ll Make Love to You’s complete Boyz II Men video, four approved physical singers, two native clear-speech voices, original music and room sound, security visit, keypad, silver writing lamp, letter, ivory outfits, cap and cane, staircase, blue portraits, vanity and final reading. Preserve all six model leases, the exact approved quartet, the source clock and the native control plans in `dialogue.json`; see [the scene notes](docs/ill-make-love-to-you.md).
- My Heart Will Go On’s complete anniversary alternate video, approved physical lead, original music including the instrumental opening/outro, ivory lace gown and pearl earrings, curved ship’s bow, sunset ocean, windblown hair, starry close-ups and double exposure. Both physical heads share one retained voice model. Keep the source clock, approved chorus and original edition (no film-story scenes); see [the scene notes](docs/my-heart-will-go-on.md).
- Hero’s complete supplied Enrique Iglesias video, original accompaniment, approved physical lead, red beanie and sunglasses, cream convertible, desert escape, chapel and typewriter, lovers, courtyard confrontation, rain, police lights and cradling ending. Keep its one borrowed model, source clock and exact approved chorus; see [the scene notes](docs/hero.md).
- Bon Jovi — Always’s complete supplied video, original accompaniment, physical English lead, shaggy blond hair, dark clothing, vintage microphone, city/market opening, dusty convertible, apartment, party, bedroom, painting loft, explosion, emergency street and turquoise studio. Keep its one borrowed model and absolute source clock; see [the scene notes](docs/bon-jovi-always.md).
- November Rain’s complete supplied film, original instrumental music and guitar solos, physical lead and answering outro voice, concert piano, orchestra, wedding, desert church, reception storm, funeral, umbrellas, cemetery and grave roses. Keep both borrowed models and the absolute source clock; see [the scene notes](docs/november-rain.md).
- Mas Que Nada’s complete supplied vintage performance, original accompaniment, physical Brazilian Portuguese lead, period singer, vintage microphone, Sérgio at the piano, second singer, jungle foliage and band. Keep its one borrowed model and absolute source clock; see [the scene notes](docs/mas-que-nada.md).
- Je t’aime’s complete supplied studio video, French physical lead, green warehouse, updo, hoop earrings, purple feathers, patterned dress, limousine, square light rigs and three visual copies. All three heads borrow one retained voice model; see [the scene notes](docs/je-taime.md).
- Fade Into You’s full Mazzy Star video, original music and one restrained physical singer, blue-lit band, long hair, desert flannel and sunglasses, railway, car, stairs and birds. Keep its borrowed model and source clock; see [the scene notes](docs/fade-into-you.md). The Mazzy Star interlude and all six sentimental selections are complete and live.
- Making Love Out of Nothing at All’s complete Air Supply video, original music, two physical voices, blue-lit duo, white vintage car, street, picnic, petrol station, diner and closing silhouettes. Preserve both borrowed models, overlapping calls and source clock; see [the scene notes](docs/making-love.md).
- I’d Do Anything for Love’s complete Meat Loaf video, original music, two physical singers, motorcycle/helicopter chase, forest and castle, cracked mirror, beast-like face and black clothing, woman in white, ornate chair, floating bed, detectives, transformation and sunset escape. The mirror borrows the lead model; retain two model leases and absolute source time. See [the scene notes](docs/anything-for-love.md).
- Total Eclipse of the Heart’s complete Bonnie Tyler video, original music, two physical singers, gothic school, white dress and blonde curls, balcony, billowing red curtains, twelve clothed dancers, glowing eyes and daylight courtyard. Keep its two borrowed model leases and absolute source clock; see [the scene notes](docs/total-eclipse.md).
- Said I Loved You…But I Lied’s full Michael Bolton video, physical singer, original music, windblown curls, three outfits, sunset fire, canyon, cave, lovers and horses. Keep its one retained model and absolute source timing; see [the scene notes](docs/said-i-loved-you.md). The requested sentimental selections are listed in [the sequence](docs/sentimental-selections.md).
- What’s He Building?’s complete Tom Waits recording, physical narrator and original soundscape, with the imagined flickering workshop, covered machine and opaque moving shadow. The input video is a cover still; retain the proposed staging and the one borrowed model. See [the scene notes](docs/whats-he-building.md).
- Autumn Leaves’s complete Nat King Cole television performance, original accompaniment, physical singer and monochrome garden, suit, tie and woven chair. Keep the airway monochrome without changing shared model data; see [the scene notes](docs/autumn-leaves.md).
- Once in a Lifetime’s full music video, approved physical spoken and sung voice, original music, dark suit, bow tie, glasses, strange choreography, repeated figures and flowing water. Keep its five heads on one retained model and all motion on the source clock; see [the scene notes](docs/once-in-a-lifetime.md).
- Stonehenge’s complete video, approved physical singer, original accompaniment, source-timed words, curly hair, studio, kitchen, bedroom, car, stone circle and sunset. Keep its single retained model and source clock; see `docs/stonehenge.md`.
- Vitas’s complete The 7th Element video, original accompaniment, physical Russian phrases and vocalise, approved lateral tongue flutter, silver costume, disco circles, checkerboard dancers and gestures. Keep the eight rolling passages audible and generated by the airway, not source samples; see `docs/vitas-7th-element.md`.
- Céline Dion’s complete extended It’s All Coming Back to Me Now video, physical lead, original music and storm, mansion, bedroom, mirror, curtains, ghost and closing doorway. Keep the single retained model shared by singer and reflection; see `docs/celine-coming-back.md`.
- O Superman’s complete music video, approved physical lead and ha pulse, source-timed repeated engine cells, circular light, masked hand shadows, keyboard, silhouette and long outro. Keep its two model leases and absolute telemetry clock; see `docs/o-superman.md`.
- Mahna Mahna’s complete trio sketch, three independent physical singers, original music, nonsense calls, all answering syllables, walk-offs, Kermit’s telephone and the balcony ending. Keep its six leased models and explicit source timing; see `docs/mahna-mahna.md`.
- Frontier Psychiatrist’s complete surreal theatre video, six physical sample voices, original music and nonverbal effects, measured beats, source-aligned chopped samples, approved pronunciation and seven foreground heads. Keep the turtle’s borrowed model ownership; see `docs/frontier-psychiatrist.md`.
- Celentano’s complete classroom performance, physical lead and answering voices, original music and harmonica, teacher, students, desks, globe, measured beat, harmonica player and standing finale; see `docs/celentano.md`.
- The Truman Show’s complete supplied ending, seven physical dialogue voices, shared timing map, painted sky, boat, stairs and door, control room and monitors, viewers, farewell bow, exit and closing guard exchange; see `docs/truman-show.md`.
- Good Will Hunting’s complete park conversation, approved physical Sean voice, distinct Will voice, shared timing map, original background, cap and beard, bench, pond, swans and walk-away ending; see `docs/good-will-hunting.md`.
- Interstellar’s TARS humor-setting scene, three physical voices, four helmeted crew, actual robot airway display, joke indicator, 100% → 75% readout and stage separation. Keep its shared source/performance timing map; see `docs/tars.md`.
- The Big Lebowski’s four distinct physical voices, separated dialogue turns, original opening song/background, bowling action, five characters and doorstep flashback; keep the shared source/performance timing map. See `docs/big-lebowski.md`.
- Blade Runner’s full rainy rooftop rescue and monologue, approved physical Roy voice, silent Deckard, dove flight and quiet ending; see `docs/tears-in-rain.md`.
- Реченька’s complete Russian physical performance, original music, dock and boat, river/forest scenery, dancers and kneeling ending; see `docs/rechenka.md`.
- SOS’s full Dimash concert clip, approved French physical voice, original music, populated TV stage, gestures and camera cuts; see `docs/dimash-sos.md`.
- Nessun Dorma’s complete concert performance and extended finale, with Italian physical tenor/choir, original orchestra and a populated opera stage; see `docs/nessun-dorma.md`.
- Apollo 13’s oxygen tank failure, five radio voices from NASA’s transcripts and the flight director’s loop, with the pauses shortened; see `docs/apollo-13.md`.
- The Apollo 11 landing on the mission clock, three radio voices from NASA’s transcripts, the lander driven by the called heights and speeds; see `docs/apollo-11.md`.
- The Wizard of Oz throne room, five mouths, staged from the public-domain book; the great Voice is the little man’s airway enlarged; see `docs/wizard-of-oz.md`.
- The complete Sagan explanation, Flatland figures and dimensional models; see `docs/sagan-dimensions.md`.
- The Cuckoo’s Nest ward, four speaking mouths, seated group and nurses’ closing reaction; see `docs/cuckoos-nest.md`.
- The Matrix waiting room, three physical voices, bending spoon and handoff; see `docs/matrix-spoon.md`.
- The Arrival dusk field, Ian’s physical dialogue and Louise’s silent reaction; see `docs/arrival.md`.
- The Contact beach, two physical speakers, original background, captions and absolute-time gestures; see `docs/contact.md`.
- The Project Hail Mary karaoke setting, prepared singing, original accompaniment and silent listener; see `docs/project-hail-mary.md`.

- The Phantom of the Opera’s complete supplied Nightwish concert, approved physical duet and high vocalise, original music and applause, Finnish Kiitos, gold coat and yellow handheld microphone/stand, long-haired bassist with split beard, guitar, white keyboards, bandana drummer, blue/purple/red lights and waving crowd. Five heads borrow two retained singers. Keep source-time poses, supported high-register validation, side masks and all previous content; see [the scene notes](docs/nightwish-phantom.md).

- I Believe in a Thing Called Love’s complete supplied Darkness video, approved physical lead and calls, original music, heart bath, purple bedroom and cupids, white glam catsuit, flower crown and two-tone hair, pink moon and crab, floating faces and boulder, amplifier walls, silver band/saucer, red alarm lighting, tentacles and guitar lasers. Four physical head graphics borrow one retained singer; other musicians are decorative proxies. Preserve source time, original guitar ending and all preceding assets; see [the scene notes](docs/darkness-love.md).

- Crucified’s complete supplied film, approved three physical voices, original music, crowns and ornate clothes, hall, mirror, violin, bath, bonnet and golden cage; preserve independent retained singers and source-time staging. See [the notes](docs/crucified.md).
- Go West’s complete supplied film, approved lead and answering physical chorus, original music, blue/yellow uniforms and star hats, red statues, rings, stairway, city, arrows, marching figures and stars; preserve both retained singers and source time. See [the notes](docs/go-west.md).

- You Spin Me Round’s complete supplied video, approved physical voice, original music, purple velvet and eye-patch costumes, portrait frame, mirror ball, extra-arm choreography, band, flags, ribbons and confetti. Preserve the corrected opening rest, three borrowed head graphics and source time; see [the notes](docs/spin-round.md).
- No Surprises’ complete supplied helmet take, approved quiet physical singing and original music, corrected opening words, short hair, transparent glass and reflections, rising water, submerged hold, drain and relieved ending. Preserve the single borrowed singer, mouth visibility and source clock; see [the notes](docs/no-surprises.md).

- Remember the Time’s complete supplied Egyptian short film, approved physical lead and three dialogue roles, original music, royal court, entertainers, cloak and magic, guards, market chase, balcony, kiss, dance and disappearance. Eleven physical head graphics borrow four retained models. Preserve all words, approved estimated closing calls, instrumental dance break and source time; see [the notes](docs/remember-time.md).
- Shock the Monkey’s complete supplied film, approved physical singing, original music, dark office and ritual double, desk, scattered papers, projector, animal, flowers, forest, water and gestures. Five physical head graphics borrow one retained singer. Preserve source time and all preceding assets; see [the notes](docs/shock-monkey.md).

## Platform independence

This is a static React/Vite site with a Rust engine already compiled to WebAssembly. There is no server component and no service credential requirement for playback. The previous `.openai/hosting.json` was omitted intentionally: do not reattach this copy to the old Site. Deployment to a new host should create a separate website.

Prepared media and dictionary URLs resolve from the Vite base path. The existing agenticspiros.com installation uses `/chimera-song-mouth/`; build it with `bun run build:static --base=/chimera-song-mouth/`. HTTPS or localhost is required for browser media/worker features. Preserve MIME types and ordinary binary delivery of `.wasm` and `.tele.gz` files.

## Verification and limits

`MEDIA-MANIFEST.json` covers every public asset. `bun run verify:content` checks its hashes and validates the compiled WASM binary. `bun run test` needs Rust and runs the full upstream/native and Bun checks; `bun run typecheck` checks the TypeScript.

The exported code and assets were checked with unit/native tests, a static production build, full asset checksums and source/export byte comparisons. Browser interaction, visual layout and recording QA were unavailable in the source session because browser access was declined. Do not describe those as verified; inspect playback and downloads after the new deployment.

Read `AGENTS.md` before changing the engine. `EDITION-NOTES.md` retains detailed implementation history and prior validation limitations.

Read `UPSTREAM.md` when importing changes from the original CHIMERA repository.
The last imported upstream revision is recorded in `PROVENANCE.json`; this
independent export uses reviewed cherry-picks rather than an unrelated-history merge.

The six other lyric songs now use prepared phoneme timing like Country Roads.
Read `docs/lyric-song-phrasing.md` before regenerating them: retain the prepared
JSON, Rodehihi's accent phones, Συννεφούλα's whistle gestures and the unchanged
instrumental/finger-click channels.

Συννεφούλα now has a wireframe singer with a hat, guitar, moving hands and a
microphone. Read `docs/synnefoula-singer.md` before changing its presentation;
it reuses the existing vocal/whistle telemetry and preserves every audio asset.

The seven-video set is complete and live: Darkness, Crucified, Go West, Remember the Time, Shock the Monkey, You Spin Me Round and No Surprises. See [the verified release](docs/music-video-batch-20261115.md) for all approved controls, prepared assets, checks and deployment scope. Preserve the 752-file manifest and the full 52-performance collection.

## Black Hole Sun addition · 16 November 2026

Soundgarden’s full supplied 5:20 video is added at `?scene=black-hole-sun` with the
owner-approved physical singer and original instrumental music. The strange
suburb, distorted smiles, hilltop band, kitchen, television lounge, pool, black
hole and flying debris use absolute-time procedural graphics. See
[the scene notes](docs/black-hole-sun.md). Preserve the 758-file public baseline
and all fifty-three concert/music-video performances. Source recordings and
analysis remain outside the repository. Browser playback/export/layout were
not retested because access remains declined.

Black Hole Sun is live and verified. Runtime commit `e9fde3a` was pushed and
17 changed files published successfully; 257 live file hashes, the clean route
and 34 preserved performances matched. Full checks passed: 195 native tests
(two existing ignored), 529 Bun tests across 127 files, typecheck, manifest,
production build and local HTTP integration. The following documentation commit
does not change the verified runtime build.

## Land of Confusion addition · 16 November 2026

Genesis’s full supplied 5:29 Spitting Image video is added at
`?scene=land-confusion`, including bedroom dialogue, with the owner-approved
physical singing and two distinct spoken voices over original music. The brass
bed, chimp and teddy, puppet band and political screens, jungle and dinosaurs,
flying superhero and cape, wrecked office, desert heads, crowd and wrong
NUKE/NURSE button use source-time procedural graphics. Five head graphics borrow
three retained models. See [the scene notes](docs/land-confusion.md). Preserve
the 766-file public baseline and all fifty-four concert/music-video performances.
Source video, frames, stems and model caches remain private. Browser playback,
export and layout remain untested here because access was declined.

Land of Confusion is live and verified. Runtime commit `a410c9f` was pushed
and 19 changed files published successfully; 265 live file hashes, the clean
route and 35 preserved performances matched. Full checks passed: 195 native
tests (two existing ignored), 533 Bun tests across 128 files, typecheck, content
manifest, production build and local HTTP integration. The following notes
commit does not change the verified runtime build.

## Rock DJ addition · 16 November 2026

Robbie Williams’s full supplied 4:17 video is added at `?scene=rock-dj`, including
the sung ending over the closing card. The owner-approved physical rap, singing
and calls play over original instrumental music. The circular hatch, white
stage, roller skaters and wheels, industrial fans, DJ booth and decks, clothes,
tattoos, peeling panels, red anatomy, articulated skeleton and final DJ dance
use source-time procedural graphics. One head graphic borrows one retained
singer. Preserve the 772-file public baseline and all fifty-five concert and
music-video performances. See [the scene notes](docs/rock-dj.md). Original film,
frames, stems and local models remain private. Browser playback, export and
layout remain untested here because access was declined.

Rock DJ is live and verified. Runtime commit `6051e23` was pushed and
17 changed files published successfully; 271 live file hashes, the clean
route and 36 preserved performances matched. Full checks passed: 195 native
tests (two existing ignored), 537 Bun tests across 129 files, typecheck,
content manifest, production build and local HTTP integration. The app
suite and build were repeated after the costume-overlap fix. The following
notes commit does not change the verified runtime build.

## Babooshka addition · 16 November 2026

Kate Bush’s full supplied 3:30 video is added at `?scene=babooshka`, including
three identifiable delayed title calls and the long instrumental dance ending.
The owner approved the physical voice, title pronunciation and high refrain.
Original instrumental music stays at the supplied speed. Two physical head
graphics share one retained singer: the veiled black bodysuit and carved maple
double bass, then the gold warrior costume with crown, boots and moving striped
sleeves. Preserve the final instrument return, exact source clock, title’s
explicit dictionary phones, 778-file public baseline and all fifty-six concert
and music-video performances. See [the scene notes](docs/babooshka.md). Original
video, frames, raw stems and model caches stay private. Browser playback,
export and layout remain untested because access remains declined in this chat.

Babooshka is live and verified. Runtime commit `a6f8b15` was pushed and
all 17 changed files published successfully. Live checks matched 277 files,
including every current app bundle, six new assets and 37 preserved
performances, plus the clean route. The temporary uploader job was removed.
Required checks passed 195 native tests (two existing ignored), 541 Bun tests,
TypeScript, 778 manifest entries, production build and local HTTP delivery.
Only documentation changed after the verified build.

## Danger! High Voltage addition · 16 November 2026

The complete supplied Electric Six video is added at `?scene=danger-voltage`,
with two approved physical singers, original music, the repeated ending calls
and the full instrumental tail. The green patterned room includes portraits,
fireplace, brass screen, red poodles, armchairs, lamp, roses and gramophone;
clothed glowing costumes, dance and embrace; hunting hats and a moose ride;
red curtains, military jacket, pale horse, chaise and saxophone finale.
Eight physical head graphics borrow two retained singers. Preserve source time,
clear lips during the embrace, foreground flames only in their intended cut,
785 public files and all fifty-seven concert and music-video performances.
See [the performance notes](docs/danger-voltage.md). Original film, frames,
stems and models stay private. Browser playback, export and layout remain
untested because access remains declined in this chat.

Danger! High Voltage is live and verified. Runtime commit `073e649` was pushed;
all 18 changed files published successfully. Live checks matched 284 files,
including every current app bundle, seven new assets and 38 preserved
performances, plus the clean route. The temporary uploader job was removed.
Required checks passed 195 native tests (two existing ignored), 545 Bun tests,
TypeScript, 785 manifest entries, production build and local HTTP delivery.
Only documentation changed after the verified production build.

## Losing My Religion addition · 16 November 2026

The complete supplied R.E.M. video is added at `?scene=losing-religion`,
with the approved physical singing, original music and full opening and ending.
The amber room has a tall window, wooden floor, falling jug and shards, chair
and floor gestures, mandolin band, shadows and a final winged figure. The
other sets include white wings, shadowed caps, a blue garden, bow and symbolic
arrows, masks, gold wings, the old angel workshop, feather bench and flame
portrait, red curtains and black winged structure. Two physical head graphics
borrow one retained singer. Preserve the chair/floor contact, source-time
poses, actual mouth clearance, 791 public files and all fifty-eight concert
and music-video performances. See [the notes](docs/losing-religion.md).
Source film, frames, stems and models stay private. Browser playback, export
and layout remain untested because access remains declined in this chat.

Losing My Religion is live and verified. Runtime commit `8f2de35` was pushed;
all 17 changed files published successfully. Live checks matched 290 files,
including every current app bundle, six new assets and 39 preserved
performances, plus the clean direct route. The temporary uploader job was
removed. Required checks passed 195 native tests (two existing ignored), 549 Bun
tests, TypeScript, 791 manifest entries, production build and local HTTP delivery.
Only documentation changed after the verified production build.

## Loser addition · 16 November 2026

The complete supplied Beck video is added at `?scene=beck-loser`, with approved
physical rap, eight explicit Spanish refrains, dialogue/asides and original
music, including the opening and ending. Sunny yellow-shirt pavement, monochrome
portraits and guitar, stop-motion coffin, woodland busker in an upright box,
white suit and sunglasses, red graveyard dancers, cars and driver, plaid night
performance and flames, drums, shop projections, hillside guitar and departure
with case and dog follow the supplied film. Seven head graphics borrow two
retained voices. Preserve explicit Spanish vowels/taps, exact clocks, source-time
seeking, owned monochrome buffers, 798 public files and all fifty-nine concert
and music-video performances. See [the notes](docs/beck-loser.md). Source film,
frames, stems and models stay private. Browser playback/export/layout remain
untested because access remains declined in this chat.

Loser is live and verified. Runtime commit
`28a0c15c1b8b81ee6377680987aad68b9c4193a5` was pushed; all 18 changed files
published successfully (`DEPLOY_EXIT=0`), media first and index last. Live checks
matched 297 files, including every current app bundle, seven new scene assets
and 40 preserved performances, plus the clean direct route. The temporary
upload job and plist were removed. All 791 earlier public files remain
byte-identical. Required checks passed 195 native tests (two existing ignored),
553 Bun tests across 133 files, TypeScript, 798 manifest entries, unchanged
WASM, production build, built hashes and local HTTP delivery. Only documentation
changed after the verified production build. Browser playback/export/layout
remain untested because access remains declined in this chat.

## Espresso Macchiato addition · 16 November 2026

The complete supplied Tommy Cash video is added at `?scene=espresso-macchiato`,
with original music and physical vocals. The owner approved the clearer English
verse revision while retaining the exaggerated accent and chorus. Cardboard-box
feet, two suits, cups and steam, stacked portraits, split-set dance, extra arms,
two runners and costume fusion, giant cup/milk/sugar, apron dancers, guest,
security dance/lift and puppeteering, swing, bean flight and closing navy suit
follow source time. Seven physical head graphics borrow one retained singer.
Preserve all 804 public files and sixty concert/music-video performances, explicit
phones, quiet windows, exact 20Hz clocks, source-time seeking, reparenting and
owned graphics. See [the notes](docs/espresso-macchiato.md). Original film, frames,
stems and models remain private. Browser playback/export/layout remain untested
because access remains declined in this chat.

Espresso Macchiato is live and verified. Runtime
`01213a9110d07277926feb1449900269cd611fe4` was pushed; all 17 changed files
published successfully (`DEPLOY_EXIT=0`), media first and index last. Live checks
matched 303 files, including every current app bundle, six new scene assets and
41 preserved performances, plus the clean direct route. The temporary upload
job and plist were removed. All 798 earlier public files remain byte-identical.
Required checks passed 195 native tests (two existing ignored), 557 Bun tests
across 134 files, TypeScript, all 804 manifest entries, unchanged WASM,
production build, built hashes and local HTTP delivery. Only documentation
changed after the verified production build. Browser playback/export/layout
remain untested because access remains declined in this chat.

## APT. addition · 16 November 2026

The complete supplied ROSÉ and Bruno Mars video is added at `?scene=apt`, with
original music and two independent physical singers. The owner approved the
duet audition. Keep the Korean opening, explicit 아파트 and 건배 phones, English
verses, bridge, shared chant registers and answering calls. The pink studio has
leather jackets, white shirts, blonde curls, cap/sunglasses, red plaid, drums,
microphones, drummer swaps, paper heads, star glasses, cheek kiss and floor gag,
circular views, flags, bow, clapperboard, silhouettes, guitars and dance ending.
Six graphics borrow two retained singers. Preserve the source clock, paper crop,
silhouette buffer ownership, actual lip clearance, all 811 public assets and
sixty-one concert/music-video performances. See [the notes](docs/apt.md).
Raw source film, frames, stems and model caches remain private. Browser
playback/export/layout remain untested because access remains declined in this chat.

APT. is live and verified. Runtime
`d8a4cbf7234d120ae4bd4de50c4a4b53d6123b28` was pushed; all 18 changed files
published successfully (`DEPLOY_EXIT=0`), media first and entry page last.
Live checks matched 310 files, including every current app bundle, seven new
scene assets and 42 preserved performances, plus the clean direct route.
The temporary upload job and plist were removed. All 804 earlier public files
remain byte-identical. Required checks passed 195 native tests (two existing
ignored), 561 Bun tests across 135 files, TypeScript, all 811 content hashes,
unchanged WASM, production build, built hashes and local HTTP delivery.
Only documentation changed after the verified build. Browser playback/export/layout
remain untested because access remains declined in this chat.

## Abracadabra addition · 16 November 2026

The full supplied Lady Gaga video is added at `?scene=abracadabra`, with original
instrumental music and the owner-approved clearer English physical singer. Keep
the announcement, title/Latin-style hooks, vocalise, quiet ending, 32 dancers,
white hood/corset/cape and train, red queen with spiked hat on the cage, red
costume, rows and circles, floor poses and lifts. Three graphics borrow one
retained model. Preserve exact source time, cloth/wardrobe seeking, camera up
restoration and the all-cut phone/desktop head-clearance regression. The rear
camera must stay inside the hall rather than behind its wall. All 811 preceding
media are unchanged; the current collection is 817 public files and sixty-two
concert/music-video performances. See [the notes](docs/abracadabra.md). Raw film,
frames, stems, model weights and analysis caches stay private. Browser playback,
export and layout remain untested because access remains declined in this chat.

Abracadabra is live at
<https://agenticspiros.com/chimera-song-mouth/?scene=abracadabra>.
Runtime `5add86118d8541071eae9074e5fd56364252ed23` is pushed. The Mac mini uploader published all 17
changed files with `DEPLOY_EXIT=0`, media first and entry page last. Live HTTP
checks matched 316 files, including all current app bundles, six new scene
assets and 43 preserved performances, plus the clean direct route. The temporary
upload job and plist were removed. All 811 earlier public media remain
byte-identical; the manifest contains 817 files. Verification passed 195 native
tests (two existing ignored), 565 Bun tests across 136 files, TypeScript,
content/WASM checks, production build, built hashes and local HTTP. All-cut
phone/desktop native head-clearance checks cover the background occlusion
regression. Only documentation changed after the verified build. Browser
playback, export and layout remain untested because access remains declined
in this chat.

## bad guy addition · 16 November 2026

The full supplied Billie Eilish video is added at `?scene=bad-guy`, with the
owner-approved physical voice, spoken opening, singing, calls and red-room
ending, plus original instrumental music. Six looks borrow one retained model.
Keep the yellow paper, blue-ended hair and oversized clothes, bruised knees,
teal room, toy car and four distinct riders, pigeons and cereal, red desert,
snorkel goggles, water bags, floral spiral, lamps and push-up ending. Preserve
absolute source time, camera up restoration, cycle visibility and all-cut native
head-clearance checks. The paper opening, knees and blackout intentionally omit
the face. Manual camera fallbacks use the current scene catalog, fixing recent
videos' courtroom choices. Preserve all 823 public files and 63 concert/music-video
performances. See [the notes](docs/bad-guy.md). Raw film, frames, stems and model
caches remain private. Browser playback/export/layout remain untested because
access remains declined in this chat.
