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
- All fifteen film and TV scenes, the Fool me once speech, the two Apollo scenes and all seventy-six concert and music-video performances in `src/scene/library.ts` and `public/scenes/`, including the existing A Few Good Men MP4 download.
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

bad guy is live at
<https://agenticspiros.com/chimera-song-mouth/?scene=bad-guy>.
Runtime `3784b09e7dccb6cc82d523c3f858399518187a10` was pushed before all 17 changed files uploaded successfully
with `DEPLOY_EXIT=0`, media first and entry page last. Live HTTP checks matched
322 files, including every current app bundle, six new scene assets and 44
preserved performances, plus the clean direct route. The temporary upload job
and plist were removed. All 817 preceding public media remain byte-identical;
the manifest contains 823 files. Required checks passed 195 native tests (two
existing ignored), 570 Bun tests across 138 files, TypeScript, content/WASM
verification, production build, built hashes and local HTTP delivery. Thirty
native geometry projections and all performer-cut phone/desktop head-clearance
checks cover the visual reconstruction. Manual camera fallback tests cover this
video and the three preceding additions. Only documentation changed after the
verified build. Browser playback, export and layout remain untested because
access remains declined in this chat.

## MONTERO addition · 16 November 2026

The full supplied Lil Nas X video is added at `?scene=montero`, with the approved
physical narration, singing, rap and actual nasal humming over original music.
Nine role graphics borrow one retained singer. Keep Eden and serpent, inscribed
tree, flowers and pink guitar, blue wigs and pink fur, trial and chains, ascent
and wings, turning/inverted pole descent and passing windows, lava, spires,
throne, clothed dance, horn transfer and winged ending. The decorative defeated
figure leaves the final portraits. Preserve absolute source time, world-space
pole grips, all performer-cut phone/desktop head clearance including costume
ornaments, and scene-catalog camera fallback. Scenic/detail cuts intentionally
omit the singer. Preserve all 829 public files and 64 concert/music-video
performances. See [the notes](docs/montero.md). Raw film, frames, stems and model
caches stay private. Browser playback/export/layout remain untested because
access remains declined in this chat.

MONTERO is live at
<https://agenticspiros.com/chimera-song-mouth/?scene=montero>.
Runtime `7081183c06ee7439069f91657999191b1a954a5b` was pushed before all 17 changed files uploaded successfully
with `DEPLOY_EXIT=0`, media first and entry page last. Live HTTP checks matched
328 files, including every current app bundle, six new scene assets and 45
preserved performances, plus the clean direct route. The temporary upload job
and plist were removed. All 823 preceding public media remain byte-identical;
the manifest contains 829 files. Required checks passed 195 native tests (two
existing ignored), 574 Bun tests across 139 files, TypeScript, content/WASM
verification, production build, built hashes and local HTTP delivery. Thirty-seven
native geometry projections and performer-cut phone/desktop head-clearance
checks include owned costume ornaments. Only documentation changed after the
verified build. Browser playback, export and layout remain untested because
access remains declined in this chat.

## Taste addition · 16 November 2026

The full supplied Sabrina Carpenter video is added at `?scene=taste`, with the owner-approved physical singing, opening lullaby, calls and distinct final reply voice over original instrumental music and retained effects. Eleven costume graphics borrow two retained performers. Preserve the vanity, blonde blue-dress singer, dark-haired rival, balcony, pink hospital gown, nurse and clinicians, lounge, feathered stairs, pool, funeral and coffee cups. Source time restores all props and roles; every visible performer head is checked against opaque sets and costume ornaments at phone and desktop framing. Keep all 836 public files and 65 concert/music-video performances. See [the scene notes](docs/taste.md). Raw film, frames, stems and analysis caches remain private.

Taste is live at
<https://agenticspiros.com/chimera-song-mouth/?scene=taste>.
Runtime `db2ca9335002289ef5542b709e685f2d8a5ae814` was pushed before all 18 changed files uploaded successfully
with `DEPLOY_EXIT=0`, media first and entry page last. Live HTTP checks matched
335 files, including every current app bundle, seven new scene assets and 46
preserved performances, plus the clean direct route. The temporary upload job
and plist were removed. All 829 preceding public files remain byte-identical;
the manifest contains 836 files. Required checks passed 195 native tests (two
existing ignored), 578 Bun tests across 140 files, TypeScript, content/WASM
verification, production build, built hashes and local HTTP delivery. Forty-six
native geometry projections and final hospital/lounge/prop reviews accompany
all-visible-performer phone/desktop head framing and opaque-mouth-ray checks.
Only documentation changed after the verified build. Browser playback, export
and layout remain untested because access remains declined in this chat.

## SKIBIDI addition · 17 November 2026

The complete supplied Little Big video is added at `?scene=skibidi`, with original music and actual physical English singing and source-timed nonsense syllables. Nine costume graphics share one captured featured performance and borrow one retained model. Preserve the reciprocal chest-level fists, bent wrists, alternate knee lifts and heel taps; street, rooster, pram and baby, aerobics trio, pub, bathroom, overhead bed dance, park, alley crowd and giant reveal. Source time restores every pose and prop, and the bed camera restores its up vector. Every visible physical head passes native phone/desktop framing and opaque-mouth-ray checks. Keep all 842 public files and 66 concert/music-video performances. See [the scene notes](docs/skibidi.md). Raw source film, frames, stems and analysis caches stay private.

SKIBIDI is live at
<https://agenticspiros.com/chimera-song-mouth/?scene=skibidi>.
Runtime `4a7762ec6c5e4b0abfbcd01ee38958744dca3d25` was pushed before all 17 changed files uploaded successfully
with `DEPLOY_EXIT=0`, media first and entry page last. Live HTTP checks matched
341 files, including every current app bundle, six new scene assets and 47
preserved performances, plus the clean direct route. The temporary upload job
and plist were removed. All 836 preceding public files remain byte-identical;
the manifest contains 842 files. Checks passed 195 native tests (two existing
ignored), 582 Bun tests across 141 files, TypeScript, content/WASM verification,
production build, built hashes and local HTTP delivery. The full test-script
components ran in separate processes to stay inside the command time limit.
Forty-eight distinct native geometry projections cover all source cuts and six
phone views; all visible physical heads pass framing and opaque-mouth-ray
checks, including costume ornaments. Only documentation changed after the
verified build. Browser playback, export and layout remain untested because
access remains declined in this chat.

## Manchild addition · 17 November 2026

The complete supplied Sabrina Carpenter video is added at `?scene=manchild`, with original music and actual physical English singing. Nine costume graphics borrow one retained singer. Desert hitchhiking, strange vehicles, chandelier van, tanker, wagon stunt, pool hall, diner and fridge, motel, lily pond, wheeled armchairs, telephone, dry-land jet ski, party, pigs, dog, falling car, orca, hairdryer and the long sunset-road ending use absolute source time. Preserve all 848 public files and 67 concert/music-video performances. See [the scene notes](docs/manchild.md). Browser playback/export/layout remain untested because access remains declined.

Manchild is live at
<https://agenticspiros.com/chimera-song-mouth/?scene=manchild>.
Runtime `7e457ae42ab375131451402e165aebffac94e3bc` was pushed before all 17 changed files uploaded successfully
with `DEPLOY_EXIT=0`, media first and entry page last. Live HTTP checks matched
347 files, including every current app bundle, six new scene assets and 48
preserved performances, plus the clean direct route. The temporary upload job
and plist were removed. All 842 preceding public files remain byte-identical;
the manifest contains 848 files. Checks passed 195 native tests (two existing
ignored), 586 Bun tests across 142 files, TypeScript, content/WASM verification,
production build, built hashes and local HTTP delivery. The full test-script
components ran in separate processes to stay inside the command time limit.
Sixty-three native geometry projections cover all 57 source cuts and six phone
views. All visible physical heads pass framing and opaque-mouth-ray checks
at three points in every source cut on phone and desktop, including costume
ornaments. Only documentation changed after the verified build. Browser
playback, export and layout were not retested because access remains declined
in this chat.

## Aperture addition · 17 November 2026

The complete supplied Harry Styles video is added at `?scene=aperture`, with the owner-approved physical singing, opening telephone exchange and original music. Main and mirror graphics borrow one retained model; the receptionist borrows the other. Keep the patterned collar, quiff and stubble, night room, bed/chair and phone, mirror, green corridors, reception and bell, city tower, stranger and bag, escalators, curved stairs and tumble, laundry collision, drink, lift/inversion, dance, planter, lounge and return. Absolute source time restores all props and poses. Preserve all 855 public assets and 68 concert/music-video performances. See [the scene notes](docs/aperture.md). Browser playback/export/layout remain untested because access remains declined.

Aperture is live at
<https://agenticspiros.com/chimera-song-mouth/?scene=aperture>.
Runtime `573e04d6a21268d07a46d2322e1fff75b5047018` was pushed before all 18 changed files uploaded successfully
with `DEPLOY_EXIT=0`, media first and entry page last. Live HTTP checks matched
354 files, including every current app bundle, seven new scene assets and 49
preserved performances, plus the clean direct route. The temporary upload job
and plist were removed. All 848 preceding public media files remain byte-identical;
the manifest contains 855 files. Checks passed 195 native tests (two existing
ignored), 590 Bun tests across 143 files, final focused pose/camera tests,
TypeScript, content/WASM verification, production build, built hashes and local
HTTP delivery. Full test-script components ran in separate processes to stay
inside command time limits. Sixty-five native geometry projections cover all
59 source cuts and six phone views, with the final supported lift reviewed
again. All visible physical heads pass framing and opaque-mouth-ray checks
at three points in every source cut on phone and desktop, including costume
ornaments. The full-screen fade is deliberately excluded from those rays.
Only documentation changed after the verified build. Browser playback, export
and layout were not retested because access remains declined in this chat.

## DENIAL IS A RIVER addition

The full supplied Doechii video is added at `?scene=denial-river` with original music and four actual physical channels: rap, brighter inner voice, opening phrase and unvoiced breathing exercise. Preserve all 864 public assets and 69 concert/music-video performances. Ten costume/role graphics borrow three retained models; decorative guests and crew are independent. Keep the sitcom rooms, flowers, kitchen/knife/cucumber, refrigerator, changing outfits, guests, window gag, telephone, fisheye portrait, exposed flats, cameras/boom, audience and collapsing smoky finale. Every source-time transform restores after seeks. See [the scene notes](docs/denial-river.md). Browser playback/export/layout remain untested because access remains declined.

DENIAL IS A RIVER is live at
<https://agenticspiros.com/chimera-song-mouth/?scene=denial-river>.
Runtime `b7909759e5184bd3bb535bc09657cc8fc84c87a5` was committed and pushed before
all 20 changed files uploaded successfully with `DEPLOY_EXIT=0`, media first
and entry page last. Live HTTP verification matched 363 files, including all
current app bundles, nine new scene assets and 50 preserved performances,
plus the clean direct route. The temporary upload job and plist were removed.
All 855 preceding public files remain byte-identical; the manifest contains
864 files and 69 concert/music-video performances. Validation passed 195 native
tests (two existing ignored), all 594 Bun tests across 144 files in four bounded
batches, focused source-timing/pose/camera checks, TypeScript, content/WASM,
production build, all built hashes and local HTTP delivery. Forty-seven native
geometry projections cover all 41 source cuts and six phone views. All visible
physical heads pass framing and opaque-mouth-ray checks at three points per
cut on phone and desktop, including costume ornaments; intentional full-screen
fades are excluded. The kitchen guest stays in the visible kitchen and restores
to the living-room couple shot on seeks. Only documentation changed after the
verified build. Browser playback/export/layout were not retested because access
remains declined in this chat. The unchanged caption-level clarity aid is a
documented diagnostic, not an intelligibility pass; the approved preview is the
listening reference.

## STORM addition

The complete supplied GENER8ION school film is added at `?scene=storm` with original music and two actual physical performances: featured singing/scene shout/callbacks and rhythmic calls/wordless interlude. Four costume/role graphics borrow two retained models. Keep the school facade and banner, uniforms, courtyard and pitch, corridor and lockers, canteen props, dining hall and pool table, rooftop trolley, class portrait and night steps, with the 96 instanced classmates and coordinated routine. Source time restores all instance matrices and poses; invalidate moved instance bounds for mouth-ray tests. Preserve all 871 public files and 70 concert/music-video performances. See [the scene notes](docs/storm.md). Browser playback/export/layout remain untested because access remains declined.

STORM is live at <https://agenticspiros.com/chimera-song-mouth/?scene=storm>.
Runtime `2b424b2d0c94083abd1450bde8699f67bd0c6dd7` was committed and pushed before the corrected batch
of 15 files uploaded successfully with `DEPLOY_EXIT=0`, media first and entry
page last. The initial 18-file batch also completed successfully. The final
live HTTP check matched all 370 checked files, including every current app
bundle, seven STORM assets and 51 preserved performances, plus the clean direct
route. Both temporary upload jobs and plists were removed. All 864 public files
from before STORM remain byte-identical; the manifest contains 871 files and
70 concert/music-video performances.

Validation passed 195 native tests (two existing ignored) and the complete
598-test Bun suite across 145 files in bounded batches with an isolated fixed-
deadline percussion retry. The phonetic correction and versioned loading were
followed by 27 passing targeted tests across seven files, TypeScript,
content/WASM verification, production build, all built hashes and HTTP delivery
using the versioned media URLs. Existing percussion assertions were unchanged;
only catalog expectations and new STORM regression checks were added. The
single earlier-verse word uses /s t ɔ ɹ m/; approved 330–364 phrases, pitch
contours and voice settings remain unchanged. Only documentation changed after
the verified build. Sixty-three native projections cover the 57 source views
and six phone views, with final prop views reviewed again. All physical heads
pass phone/desktop framing and opaque-mouth rays at three points per cut; all
96 classmates pass the school-background ray check in the wide formation.
Intentional full-screen fades are excluded. Browser playback/export/layout
were not retested because access remains declined in this chat. The unchanged
caption-level clarity aid remains a documented diagnostic, not an
intelligibility pass; the owner-approved preview is the listening reference.

## Europapa addition

The complete supplied Joost Klein video is added at `?scene=europapa` with original instrumental music and one actual physical performance. Four costume graphics share the retained model. Preserve language-specific prepared IPA, Dutch rounded vowels and fricatives, rhythmic pa syllables, German/Italian lines and quiet spoken tribute. Keep the pointed blue suit, cowboy hat, glasses/vest and guitar looks, podium and offset microphones, flags and rural signs, scooter and canal road, dinner, windmill band, sunset, rave, firelit family and ending dedication. All transforms restore from source time. See [the scene notes](docs/europapa.md). All 871 preceding public assets remain unchanged.

Europapa is live at <https://agenticspiros.com/chimera-song-mouth/?scene=europapa>.
Runtime `d2a7fd9d661ac7b82cefac0e09c202a41eebb2b5` was committed and pushed before all 17 changed files uploaded
successfully with `DEPLOY_EXIT=0`, media first and entry page last. The final live
HTTP check matched all 376 checked files, including the current app bundles,
six Europapa assets and 52 preserved performances, plus the clean direct route.
The temporary upload job and plist were removed. All 871 preceding public files
remain byte-identical; the manifest contains 877 files and the library has 71
concert/music-video performances. Browser playback, export and layout were not
retested; native geometry, audio, telemetry and HTTP checks provide the evidence.

## Houdini addition

The complete supplied Eminem video is added at `?scene=houdini`. Four physical airways generate the featured voice and Paul, Dre and driver dialogue over the original instrumental music and retained effects. Nine costume/role graphics borrow four retained models. Preserve the prepared rapid phonetics and continuous source prosody, young/modern/superhero/hybrid looks, portal, source-time comic borders, moving city, roadster and steering, store and trophies, guests, climb and rooftop collision, lightning and 24 distinct decorative clones. Source time restores all transforms. See [the scene notes](docs/houdini.md). All 877 preceding public files remain unchanged.

Houdini is live at <https://agenticspiros.com/chimera-song-mouth/?scene=houdini>.
Runtime `7ac2e68d7eeeca25334a5fc636e33b9e6143a634` was committed and pushed before all 20 changed files uploaded
successfully with `DEPLOY_EXIT=0`, media first and entry page last. The final live
HTTP check matched all 385 checked files, including the current app bundles,
nine Houdini assets and 53 preserved performances, plus the clean direct route.
The completed upload job and plist were removed. All 877 preceding public files
remain byte-identical; the manifest contains 886 files and 72 concert/music-video
performances. New-scene/native/content/build/HTTP checks passed. Two unchanged
synthesis tests retain the documented five-second timing failures; browser
playback, export and layout were not retested.

## Tailor Swif addition

The full supplied A$AP Rocky video is added at `?scene=tailor-swif`. Keep the approved clearer physical rap from the second 52–80 second preview, source-aligned complete consonants, fuller vowels and continuous reference prosody. Five costume graphics borrow one retained model. Preserve the carpet-lined car, bathroom and pipe man, courtyard sedan, apartment cabinet, tiny fridge people, horse heads, padded giant, dog office, wheeled bathtub, gym tower, weightlifting dog, worker and lamb, tyre stack, burning armchair, playground and closing kitchen vignettes. All transforms restore from source time. See [the scene notes](docs/tailor-swif.md). All 886 preceding public files remain unchanged.

Deployment verified on 2026-11-17 at
<https://agenticspiros.com/chimera-song-mouth/?scene=tailor-swif> for runtime
`59091b89a2425ef45b45707b917ba1e6c3472a94`. The publishing helper uploaded 17 files and exited zero;
its completed one-shot job and launch plist were removed. All 391 live hashes
match the production build, including six new scene assets, 54 preserved
performances and the current application bundles. The clean direct scene route
also matches the new index. All 886 preceding public assets remain byte-identical.
The manifest contains 892 public files and the library 73 concert/music-video
performances. All 610 Bun tests/148 files and 195 native tests passed (two existing
ignored). Browser playback, export and layout were not retested.

## two addition

The full supplied bbno$ video is added at `?scene=bbno-two`. Keep the approved 18–46 second preview's physical rap and the two generated choir registers, original music, source timing and all three retained models. Preserve the church choir, pink suit, sauna, forest, excavator, dentist, wired helmet, cowboy/scouts, lifted truck, wedding, football and grass roll, milk and tiled wall, restaurant/priest, cloning band, bread hat, sheep, money carpet, leather dance, lemon eyes and clown boat. Eighteen costumes borrow three airways; other figures are animated proxies. See [the scene notes](docs/bbno-two.md). All 892 preceding public assets remain byte-identical.

Deployment verified on 2026-11-17 at
<https://agenticspiros.com/chimera-song-mouth/?scene=bbno-two> for runtime
`dded913655c3bbd1767bf7536312034359b51dcc`. The publishing helper uploaded 19 files and exited zero;
its completed one-shot job and launch plist were removed. All 399 live hashes
match the production build, including eight new scene assets, 55 preserved
performances and the current application bundles. The clean direct scene route
also matches the new index. All 892 preceding public assets remain byte-identical.
The manifest contains 900 public files and the library 74 concert/music-video
performances. All 614 Bun tests/149 files and 195 native tests passed (two existing
ignored). Browser playback, export and layout were not retested.

## like JENNIE addition

The complete supplied video is added at `?scene=like-jennie`. Keep the approved 47-second English/Korean preview controls and original accompaniment. Four costumes borrow one retained physical airway. Preserve the red spacesuit and open helmet, capsule and hatch, floating bean and fingers, beige cap and braids, chrome spires and ceiling lights, 64 dancers, source-time lines/rings/overhead/floor formations, digital columns, red return, stormy landscape, translucent fire, capybara, blue flower and final animal close-up. Foreground extras leave a clear camera corridor; overhead caps use an owned translucent cutaway and ceiling lights leave overhead shots. All transforms and material state restore after seeks. Source doubles are represented by the lead; pronunciation and choreography remain approximate. See [the scene notes](docs/like-jennie.md). All 900 preceding public assets remain unchanged.

Deployment verified on 2026-11-17 at
<https://agenticspiros.com/chimera-song-mouth/?scene=like-jennie> for runtime
`c1cec75fa7938a9b2fdf9aca3564c8d1610675c4`. The publishing helper uploaded 17 files and exited zero;
its completed one-shot job and launch plist were removed. All 405 live hashes
match the production build, including six new scene assets, 56 preserved
performances and the current application bundles. The clean direct scene route
also matches the new index. All 900 preceding public assets remain byte-identical.
The manifest contains 906 public files and the library 75 concert/music-video
performances. All 618 Bun tests/150 files and 195 native tests passed (two existing
ignored). Browser playback, export and layout were not retested.

## RATATATA addition

The full supplied video is added at `?scene=ratatata`. Preserve the approved three physical vocal tracks and original accompaniment. Five costumes borrow three retained model leases: Nico, Kevin and the female lead. Keep the open mirrored helmet fronts, piped suits, angular iridescent dresses, crowns and ponytails, office invasion and ducking workers, second wall crash, neon couch/drinks/microphones, giant mirrored globe, electric arcs, sparks, five-person choreography, lasers and confetti. All transforms and visibility restore from source time. Explicit per-song Japanese phones and the portable render tool accompany the score. Source doubles, screams, pronunciation and gestures are approximate. All 906 preceding public files must remain byte-identical. See [scene notes](docs/ratatata.md).


RATATATA deployment proof: runtime `880f0083f9fdd922cbc96728e6a25fd29a9245ab` was committed and pushed, then all 19 changed files uploaded successfully (media first, index last; publisher exit 0). The direct [RATATATA route](https://agenticspiros.com/chimera-song-mouth/?scene=ratatata), current app bundles, all eight new scene files and fifty-seven preserved performances were verified against local SHA-256 values: 413 live files matched. The task's completed publisher job and its plist were removed; other jobs were untouched.

The manifest contains 914 public files and the library 76 concert/music-video performances. All 906 preceding assets remain byte-identical. All four new-scene tests, 1,006 head/ray combinations, 77 native projections, 195 native tests (two existing ignored), native/WASM voice parity, typecheck, content verification, static build and local HTTP checks pass. The 622-test/151-file Bun inventory has 620 passes after isolated reruns; two existing physical-render tests still exceed their unchanged 5,000 ms limits (Country Roads held vowels and the 256-step beat). Browser playback/export, Playwright and layout lint were not retested under the standing user instruction.
