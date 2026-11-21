# Included content

Every prepared media file below is tracked in this repository. All 1013 public files have SHA-256 checksums in `MEDIA-MANIFEST.json`. Durations are approximate; some include a short release.

## Songs

| Selection | Duration | Route | Presentation |
| --- | --- | --- | --- |
| House of the Rising Sun | 2:49 | `?song=house-of-the-rising-sun` | Seven voices; default |
| All Made of Air | 0:35 | `?song=all-made-of-air` | Original seven-voice piece |
| Neon Current | 3:03 | `?song=neon-current` | Original wordless electronic choir |
| BICEP — Glue | 4:30 | `?song=bicep-glue` | Nine-mouth wordless remake; synthesized vocal, connected harmonies and shuffled percussion |
| Night Train Radio | 2:26 | `?song=night-train-quartet` | Mr. Sandman tune; newly written words; quartet |
| Συννεφούλα | 2:15 | `?song=synnefoula` | Wireframe singer with hat, guitar and microphone; Greek vocals and mouth whistles over original instrumental backing |
| MEGALOVANIA | 2:36 | `?song=megalovania` | 24 pitched mouths following the reference's singers, octaves and DA/DUM/OOH syllables |
| BICEP — Apricots | 4:09 | `?song=bicep-apricots` | Original vocal sample with nine mouths playing the accompaniment |
| Τα παιδιά του Πειραιά | 3:19 | `?song=ta-paidia-tou-peiraia` | Greek robotic singer, instrumental backing and animated finger clicks |
| Rodehihi — Δεν ξανακάνω φυλακή | 3:12 | `?song=rodehihi-den-xanakano-fylaki` | Robotic Greek singer following the source phrasing, original instrumental backing and complete ending |
| Small Hours | 3:31 | `?song=small-hours` | Original wordless electronic piece for twelve mouths |
| Country Roads | 3:15 | `?song=country-roads` | One robotic singer, original instrumental backing and synchronized melody graph |
| Blue Moon — Frank Sinatra | 2:52 | `?song=blue-moon` | One physical mouth singing a timed phonetic score, original orchestral backing and synchronized captions |
| Mr. Sandman | 2:26 | `?song=mr-sandman-quartet` | Original-lyrics quartet with physical mouth voices, rhythmic bum-bum bass, captions, microphone and four harmonic graphs |
| Be My Baby — The Ronettes | 2:40 | `?song=be-my-baby` | Original instrumental recording, one physical lead and two answering mouths with separate lyrics |
| Life on Mars? — David Bowie | 4:03 | `?song=life-on-mars` | Original instrumental recording, one physical singer, source-timed melody and synchronized words |
| Starman — David Bowie | 4:18 | `?song=starman` | Original instrumental recording, physical singer, full sung ending and synchronized words |
| Space Oddity — David Bowie | 5:05 | `?song=space-oddity` | Original instrumental recording, physical singer and overlapping robotic launch countdown |
| Cry Me a River — Julie London | 2:58 | `?song=cry-me-a-river` | Original guitar and bass accompaniment, physical singer and synchronized words |
| Smile — Nat King Cole | 2:56 | `?song=smile` | Original orchestral accompaniment, physical singer and synchronized words |
| Lose Yourself — Eminem | 5:27 | `?song=lose-yourself` | Original music, physical rap voice, rainy city background and word-by-word highlighting |
| Πάμε στη Χονολουλού — Κώστας Μπέζος | 3:07 | `?song=pame-sti-honolulu` | Original music, Greek mouth-engine singing and wordless calls, island singer, palms, waves and boat |

Each song’s `public/band/<id>/` directory contains the prepared score, MP3 channels and compressed mouth telemetry as applicable. Non-voice channels such as the instrumental backing and finger clicks do not need telemetry. Credits accompany the adapted content. Small Hours has no source recording: its score is written in `src/band/smallHours.ts`, and `bun tools/render-band-song.ts small-hours` (needs ffmpeg; about seven minutes on 16 cores) rebuilds its twelve channels and telemetry from the engine. Mr. Sandman is the newly requested original-lyrics quartet; Night Train Radio remains a separate selection with its newly written words.

The six other songs with lyrics now use explicit sung phoneme timing following
the Country Roads refinement. See [the phrasing notes](docs/lyric-song-phrasing.md)
for the preserved accompaniment, Greek accent and whistle behavior.

MEGALOVANIA now follows Radixán's MIDIlovania score and the supplied video's
24-mouth settings. See [the arrangement notes](docs/megalovania-reference.md)
before rebuilding its voices; the older fakt13 arrangement had different parts.

Apricots retains the original stereo vocal sample selected by the user, with nine
physical mouths providing the accompaniment. See [the arrangement notes](docs/apricots-arrangement.md)
for the source timing, preserved recording and regeneration instructions.

Glue keeps its vocal and every instrument synthesized by the mouths, as selected
by the user. See [the Glue arrangement notes](docs/glue-arrangement.md) for the
connected vocal, stable pitch lanes and separate kick/clap parts.

Blue Moon uses the same prepared phonetic singing path as Country Roads.
Its lead and animation come from the physical engine; its original orchestral
backing stays on the recording’s clock. See [the song notes](docs/blue-moon.md).

Mr. Sandman uses four physical singers and a complete prepared phonetic score.
See [the quartet notes](docs/mr-sandman-quartet.md) before regenerating it; the
opening must retain each distinct bum-bum attack and the bass continues under
the words. All previous prepared media remain unchanged.

Be My Baby adds three physical singers over the original instrumental recording.
See [the song notes](docs/be-my-baby.md) for the independent lead and backing
phrases, source timing, fading ending and regeneration instructions.

Life on Mars? retains the full supplied recording and adds a physical singer with
source-aligned phonetics and continuous pitch. See [the song notes](docs/life-on-mars.md).

Starman retains the full instrumental recording with one physical singer and all six cycles of the sung ending. See [the song notes](docs/starman.md).

Space Oddity preserves the full original music, with separate physical mouths for the singer and overlapping launch countdown. See [the song notes](docs/space-oddity.md).

Cry Me a River retains the complete supplied Julie London recording’s accompaniment, with one physical singer following its melody and phrasing. See [the song notes](docs/cry-me-a-river.md).

Smile preserves the complete supplied Nat King Cole recording’s original orchestra, with one physical mouth singing the words. See [the song notes](docs/smile.md).

## Movie scenes and speeches

| Scene | Duration | Route | Included files |
| --- | --- | --- | --- |
| A Few Good Men — courtroom | 2:08 | `?scene=a-few-good-men` | Synthetic dialogue mix, four voice telemetry tracks, captions, shots, scene data and existing subtitled H.264/AAC `for-x.mp4` |
| The Princess Bride — Cliffs of Insanity | 2:20 | `?scene=princess-bride` | Synthetic dialogue mix, three voice telemetry tracks, captions, shots and scene data |
| 2001: A Space Odyssey — HAL 9000’s memory core | 3:07 | `?scene=hal-9000` | Synthetic dialogue and song mix, two voice telemetry tracks, captions, shots and scene data |
| Fool me once — George W. Bush | 0:25 | `?scene=fool-me-once` | One synthetic speaker, a wireframe press-conference setting, timed gestures, captions and close/wide cameras |
| Project Hail Mary — karaoke | 2:23 | `?scene=project-hail-mary` | Physical singing over original music, synchronized captions, handheld microphone, animated listener, audience and three cameras |
| Contact — first contact | 4:59 | `?scene=contact` | Two physical voices over original music and surf, synchronized captions, beach, palms, galaxy, gestures and five camera views |
| Arrival — meeting you | 0:30 | `?scene=arrival` | Physical dialogue over original background audio, synchronized captions, dusk field camp, Ian’s turn and Louise’s silent reaction |
| The Matrix — there is no spoon | 1:11 | `?scene=matrix-spoon` | Three physical voices over original background audio, synchronized captions, green waiting room, bending spoon, handoff and reflected face |
| One Flew Over the Cuckoo’s Nest — you’re not crazy | 1:03 | `?scene=cuckoos-nest` | Four physical voices over original room ambience, synchronized captions, nine seated characters, ward, gestures and nurses’ reaction |
| The Wonderful Wizard of Oz — the discovery of Oz, the Terrible | 3:12 | `?scene=wizard-of-oz` | Five physical voices with no source clip, the great Voice as the little man’s enlarged airway, synthetic hall, roar and falling screen, captions, shots and scene data |
| Cosmos — Carl Sagan’s fourth dimension | 7:24 | `?scene=sagan-dimensions` | Physical narration, original background, captions, desk, Flatland shapes, apple sections, cube and tesseract |
| Apollo 11 — the Eagle has landed | 4:20 | `?scene=apollo-11` | Three physical radio voices with no source recording, lines on the mission clock, the lander following the called heights and speeds, lunar surface, cabin and Houston sets, captions, shots and scene data |
| Apollo 13 — Houston, we’ve had a problem | 3:20 | `?scene=apollo-13` | Five physical voices with no source recording (crew, CapCom and flight director), the bang, alarm and venting on the scene clock, spacecraft, cabin and Mission Control sets, captions, shots and scene data |
| Реченька — Diana Ankudinova | 3:48 | `?scene=rechenka` | Physical Russian singer, original accompaniment, captions, patterned dress, dock and boat, forest/water lights, dancers, judges and audience |
| Good Will Hunting — the park bench | 4:48 | `?scene=good-will-hunting` | Two physical voices, original music and park ambience, synchronized subtitles, bench, cap and beard, pond, swans, trees and the walk-away ending |
| Celentano — Prisencolinensinainciusol | 3:45 | `?scene=celentano` | Two physical singers, original band and harmonica, teacher and answering class, twelve desks, globe, classroom set, clapping and dancing |
| The Avalanches — Frontier Psychiatrist | 4:18 | `?scene=frontier-psychiatrist` | Six physical sample voices, original music, gold curtains, orchestra, drummer, cowboys, ghosts, human-headed turtle, parrot and scratched-record finale |
| The Muppet Show — Mahna Mahna | 2:37 | `?scene=mahna-mahna` | Three physical singers, original music, orange-haired lead, two pink Snowths, walk-offs, Kermit and telephone, balcony punchline |
| Laurie Anderson — O Superman | 8:28 | `?scene=o-superman` | Physical lead and repeated ha, original instrumental bed, circular light, hand shadows, red silhouette, keyboard and abstract ending |
| Céline Dion — It’s All Coming Back to Me Now | 7:39 | `?scene=celine-coming-back` | Physical lead, original music and storm, motorcycle, candlelit mansion, bedroom, mirror, curtains and ghostly lover |
| Vitas — The 7th Element | 4:10 | `?scene=vitas-7th-element` | Physical Russian phrases, high vocalise and tongue flutter, original music, silver costume, disco circles, checkerboard dancers and audience |
| Ylvis — Stonehenge | 3:56 | `?scene=stonehenge` | Physical singing, original music, TV studio, kitchen, bedroom, car, stone circle and sunset |
| Talking Heads — Once in a Lifetime | 3:45 | `?scene=once-in-a-lifetime` | Physical verses and refrains, original music, suit, strange movements, multiplying figures and water |
| Nat King Cole — Autumn Leaves | 2:39 | `?scene=autumn-leaves` | Physical singer, original music and black-and-white garden performance |
| Tom Waits — What’s He Building? | 3:21 | `?scene=whats-he-building` | Physical narration, original soundscape, imagined flickering workshop, machinery and shadows |
| Michael Bolton — Said I Loved You…But I Lied | 5:03 | `?scene=said-i-loved-you` | Physical singing, original music, sunset fire, canyon, cave, lovers and horses |
| Bonnie Tyler — Total Eclipse of the Heart | 5:34 | `?scene=total-eclipse` | Original music, physical lead and answering mouth, gothic school, staircase and balcony, windblown curtains, glowing-eyed dancers and daylight courtyard |
| Meat Loaf — I’d Do Anything for Love | 7:41 | `?scene=anything-for-love` | Original music, two physical singers, motorcycle chase, gothic castle, cracked mirror, floating bed, detectives and sunset escape |
| Air Supply — Making Love Out of Nothing at All | 4:53 | `?scene=making-love` | Full video, original music, two physical voices, blue-lit duo, white car, street, picnic, petrol station, diner and silhouettes |
| Mazzy Star — Fade Into You | 4:21 | `?scene=fade-into-you` | Complete blue-stage and desert video scene, restrained physical singer, original accompaniment, railway, car, stairs and birds |
| Lara Fabian — Je t’aime | 5:00 | `?scene=je-taime` | Complete supplied studio video, original music, physical French singer, green warehouse, limousine and three visual copies |
| Whitney Houston — I Will Always Love You | 4:34 | `?scene=always-love-you` | Complete supplied video, original music and physical vocal, unaccompanied opening, theater, cabin, snow and airport farewell |
| Lionel Richie — Hello | 5:26 | `?scene=hello` | Original music, four physical singing/dialogue voices, performing-arts school, drama class, lockers, dance rehearsal, telephone, piano and clay portrait |
| Toni Braxton — Un-Break My Heart | 4:33 | `?scene=unbreak-my-heart` | Physical lead, original accompaniment, motorcycle, home memories, pool, mirror, bedroom, staircase, white-gown theatre finale, orchestra, audience and closing curtains |
| Guns N’ Roses — November Rain | 9:17 | `?scene=november-rain` | Complete supplied film, original instrumental music, physical lead and answering voice, wedding, desert guitar, reception storm, funeral, cemetery and grave roses |
| Enrique Iglesias — Hero | 4:23 | `?scene=hero` | Physical lead, original accompaniment, red beanie, station, convertible, desert, chapel, lovers, confrontation and rain-soaked cradling ending |
| Céline Dion — My Heart Will Go On | 4:41 | `?scene=my-heart-will-go-on` | Complete anniversary alternate video, physical lead, original music, ivory lace gown, curved ship’s bow, sunset ocean, windblown hair, stars and overlapping singer images |
| Boyz II Men — I’ll Make Love to You | 4:20 | `?scene=ill-make-love-to-you` | Full supplied video, original music, four physical singers, two physical opening speakers, security visit, writing desk, ivory outfits, staircase, blue portraits, candles and final letter |
| Sérgio Mendes — Mas Que Nada | 2:36 | `?scene=mas-que-nada` | Complete supplied vintage performance, original accompaniment, physical Portuguese lead, period singer, piano, second singer, jungle and band |
| Shakespears Sister — Stay | 3:58 | `?scene=shakespears-stay` | Full supplied video, original music, two contrasting physical singers, blue bedside chamber, Earth, brass bed, silent patient, curtain tunnel, struggle, revival and embrace |
| Kate Bush — Wuthering Heights · red dress | 4:30 | `?scene=wuthering-heights` | Complete supplied Version 2, original music, physical lead, red dress and flowing sleeves, long hair, expressive hands, spins, pine grove, windswept field and full long closing dance |
| Falco — Rock Me Amadeus | 3:44 | `?scene=rock-me-amadeus` | Complete supplied video, original music, three physical vocal parts, Vienna postcard, black coach, tuxedo, coloured Mozart wig, brocade and cravat, court, biker bar, motorcycles and prayer |
| Sinéad O’Connor — Nothing Compares 2 U | 5:08 | `?scene=nothing-compares` | Complete supplied video, original music, physical lead, intimate black-background portrait, cropped hair and high collar, tears, formal garden, fountain, statues, balustrade, walking figure, double exposures and full long garden outro |
| a-ha — Take On Me | 4:04 | `?scene=take-on-me` | Complete supplied video and ending, original music, physical lead and chorus replies, graphite paper world, motorcycle race, café and comic, reaching hand, two-world window, pursuers, paper escape and apartment transformation |
| Nick Cave & Kylie Minogue — Where the Wild Roses Grow | 4:32 | `?scene=wild-roses` | Complete river video and quiet ending, original music, two physical singers, red hair and white slip dress, kneeling Nick, rose portraits, reeds, snake and rose at her lips |
| Peter Gabriel — Sledgehammer | 5:45 | `?scene=sledgehammer` | Complete supplied video, original music, physical lead and backing calls, stop-motion train, clay and fruit faces, cardboard room, dancing chickens, dance floor, furniture and light figure |
| David Bowie — Ashes to Ashes | 3:37 | `?scene=ashes-to-ashes` | Complete supplied video, original music, physical singing, ruffled Pierrot, pink shoreline and cliffs, memory cards, dark-clad procession, yellow bulldozer, padded room, astronaut and water, final walk |
| Απορώ αν αισθάνεσαι tipsy | 2:04 | `?scene=aporo-tipsy` | Complete supplied Greek/English mashup, physical singing and speech, original instrumental music, retro long-haired singer, microphone, organ, guitar, bass, drums and audience |
| Player — Baby Come Back | 4:10 | `?scene=player-baby-come-back` | Original music, four physical singers, five-player vintage stage, twin keyboards, guitars, drums and source-time camera cuts |
| Queen — I Want to Break Free | 4:32 | `?scene=break-free` | Complete supplied video, original music, physical singer, pink top and bob, moving vacuum cleaner, costumed household, kitchen and stairs, blue-lit crowd and central ballet |
| Björk — Human Behaviour | 4:15 | `?scene=human-behaviour` | Full supplied video, physical singing and wordless calls, original music, miniature forest and giant plush bear, cabin, moth, road, water and moon journey |
| Eurythmics — Sweet Dreams (Are Made of This) | 3:34 | `?scene=sweet-dreams` | Full supplied video, physical singing and calls, original music, boardroom, cows, synth/monitor, red-dress cellos, field, boat and cassette ending |
| Annie Lennox — Walking on Broken Glass | 3:59 | `?scene=walking-broken-glass` | Full supplied video, physical singing, original music, red hood and gown, powdered-wig party, jealous guests, corridor quarrel, spiral stairs and carried ending |
| Duran Duran — The Wild Boys | 4:13 | `?scene=wild-boys` | Full supplied video, physical singing/calls, original music, industrial factory, mechanical head and monitors, rotating windmill, water, cages, band and punk dancers |
| The Cure — Lullaby | 4:10 | `?scene=lullaby` | Full supplied bedroom video, physical singing/spoken ending, original music, iron bed, striped pyjamas, spider and webs, window hands, trapped figure and web-covered band |
| The Darkness — I Believe in a Thing Called Love | 3:52 | `?scene=darkness-love` | Full supplied spaceship video, physical lead and calls, original music, heart bath, purple bedroom, pink moon/crab, floating faces, amplifier walls, glam band, monster tentacles and guitar lasers |
| Army of Lovers — Crucified | 3:34 | `?scene=crucified` | Three physical voices, original music, crowns and ornate costumes, red-curtained hall, mirror, violin, bath, bonnet and golden cage |
| Pet Shop Boys — Go West | 4:52 | `?scene=go-west` | Two physical voices and original music, blue/yellow uniforms and star hats, Statue of Liberty, floating rings, giant stairs, city, arrows, procession and star tunnel |
| Michael Jackson — Remember the Time | 9:19 | `?scene=remember-time` | Complete Egyptian short film, four physical voices, original music, pyramids, throne room/dialogue, entertainers, magic, market chase, royal balcony and choreography |
| Peter Gabriel — Shock the Monkey | 4:04 | `?scene=shock-monkey` | Physical singer and original music, office and ritual double, desk and papers, projector, monkey, flowers, forest, water and uneasy choreography |
| Dead or Alive — You Spin Me Round | 3:17 | `?scene=spin-round` | Physical lead and original music, purple velvet/eye-patch costumes, gold portrait frame, mirror ball, arm choreography, band, flags, ribbons and confetti |
| Radiohead — No Surprises | 3:48 | `?scene=no-surprises` | Quiet physical singer and original music, close portrait inside the transparent helmet, reflected lights, rising water, submerged hold, drain and relieved ending |
| Soundgarden — Black Hole Sun | 5:20 | `?scene=black-hole-sun` | Hilltop band, strange suburb, kitchen and television lounge, warped smiles, pool, fiery black hole and rising debris; original music and physical singing |
| Genesis — Land of Confusion | 5:29 | `?scene=land-confusion` | Spitting Image-style puppet band, brass bed, chimp, nightmare jungle, dinosaurs, political screens, Superman, crowd and wrong bedside button; original music and three physical voices |
| Robbie Williams — Rock DJ | 4:17 | `?scene=rock-dj` | Circular roller rink, skaters and DJ booth, industrial fans, tattoos, peeling anatomy panels, red muscle and dancing skeleton; original music and physical singing |
| Kate Bush — Babooshka | 3:31 | `?scene=babooshka` | Carved double bass, veiled black bodysuit, gold warrior costume, striped sleeves and closing dance; original music and physical singing |
| Electric Six — Danger! High Voltage | 3:42 | `?scene=danger-voltage` | Green portrait room, fireplace, glowing costumes, moose ride and saxophone finale; original music and two physical voices |
| R.E.M. — Losing My Religion | 4:54 | `?scene=losing-religion` | Amber room, chair and floor gestures, mandolin band, giant wings, blue garden, workshop and red curtains; original music and physical singing |
| Beck — Loser | 3:53 | `?scene=beck-loser` | Sunny pavement, monochrome coffin and guitar, busker, white suit, red graveyard dancers, cars, stage fire and dog; original music and two physical voices |
| Tommy Cash — Espresso Macchiato | 3:13 | `?scene=espresso-macchiato` | Two suits and coffee cups, split-screen dance, half-and-half outfit, giant ingredients, security puppeteers, swing and flying beans; original music and physical vocals |
| ROSÉ & Bruno Mars — APT. | 2:54 | `?scene=apt` | Pink studio, two physical singers, drums, microphones, paper portraits, star glasses, silhouettes, guitars and dance; original music |
| Lady Gaga — Abracadabra | 4:30 | `?scene=abracadabra` | Red queen and spiked hat, white corset and flowing cape, industrial hall, 32 dancers, floor poses, circles and lifts; original music and physical singing |
| Billie Eilish — bad guy | 3:26 | `?scene=bad-guy` | Torn yellow paper, oversized costumes, toy car and riders, pigeons/cereal, desert, goggles, spiral, water bags and red push-up room; original music and physical voice |
| Lil Nas X — MONTERO (Call Me by Your Name) | 3:10 | `?scene=montero` | Eden and serpent, pink guitar, blue wigs and pink fur, trial and chains, wings, inverted pole descent, lava, throne and final horns; original music and physical vocals |
| Sabrina Carpenter — Taste | 3:18 | `?scene=taste` | Vanity, bedroom, balcony, pink hospital gown and nurse, lounge, feathered staircase, pool confrontation, funeral and coffee-cup walk; original music and two physical mouth-engine voices. |
| Little Big — SKIBIDI | 3:13 | `?scene=skibidi` | Bent wrists and knee lifts, street, rooster, pram, aerobics trio, pub, bathroom, overhead bed dance, park, alley crowd and giant; original music and physical mouth-engine singing and chant. |
| Sabrina Carpenter — Manchild | 3:56 | `?scene=manchild` | Surreal desert road trip, nine outfits, strange vehicles, chandelier van, tanker, pool hall, motel, lily pond, wheeled armchairs, telephone, jet ski, pigs, dog, falling car, orca and sunset road; original music and one actual physical singer |
| Harry Styles — Aperture | 5:51 | `?scene=aperture` | Night hotel room, telephone, mirror, empty reception, stranger, escalators and spiral stairs, laundry, surreal lift and inverted dance, planter and return; original music and two actual physical voices |
| Doechii — DENIAL IS A RIVER | 2:44 | `?scene=denial-river` | Changing sitcom rooms, flowers, kitchen, guests, costume changes, telephone, exposed studio and smoky collapse; original music and physical rap, dialogue, opening voice and breathing |
| GENER8ION — STORM starring Yung Lean | 7:34 | `?scene=storm` | Uniforms, school grounds, corridor, canteen, dining hall, rooftop trolley, class portrait and coordinated night routine; original music, physical featured voice and rhythmic calls |
| Joost — Europapa | 3:22 including release | `?scene=europapa` | Dutch physical lead, original music, blue pointed suit, podium, cowboy hat, scooter, dinner, windmill band, rave and quiet family tribute |
| Eminem — Houdini | 4:57 | `?scene=houdini` | Original music and effects, physical featured vocal and three dialogue roles, portal, comic panels, superhero, roadster, rooftop showdown and 24 clones |
| A$AP Rocky — Tailor Swif | 3:14 | `?scene=tailor-swif` | Approved physical rap, original music and effects; carpet car, bathroom, surreal apartment, tiny fridge people, padded giant, dog office, bathtub ride, gym and absurd playground |
| bbno$ — two | 2:17 | `?scene=bbno-two` | Original music, physical rap and two choir registers, complete procedural video, captions, cuts and three telemetry tracks |
| JENNIE — like JENNIE | 3:02 | `?scene=like-jennie` | Original music, physical English/Korean vocals, full capsule/dance/capybara scene, captions, cuts and telemetry |
| BABYMETAL × Electric Callboy — RATATATA | 3:42 | `?scene=ratatata` | Original music, three physical vocal tracks, full office/karaoke/disco-ball scene, captions, cuts and telemetry |
| Lady Gaga — The Dead Dance | 4:47 | `?scene=dead-dance` | Original music, physical singing, full doll-forest and moonlit dance scene, captions, cuts and telemetry |
| Sabrina Carpenter — Tears | 5:03 | `?scene=sabrina-tears` | Original music, three physical voices, full haunted-house party and comic ending, captions, cuts and telemetry |
| Doja Cat — Demons | 3:45 | `?scene=doja-demons` | Original music, physical rap and answers, full haunted-house scene, captions, cuts and telemetry |
| Childish Gambino — Lithonia | 2:01 | `?scene=lithonia` | Original music, physical singing and reactions, full studio and woods scene, captions and telemetry |
| LOOK MUM NO COMPUTER — Eins, Zwei, Drei | 3:29 | `?scene=eins-zwei-drei` | Original synth backing, physical English and German voices, full office and pizza scene, captions and telemetry |
| KATSEYE — Gnarly | 2:22 | `?scene=gnarly` | Original backing, three physical voices, full six-performer scene, captions and telemetry |
| Sabrina Carpenter — House Tour | 3:34 | `?scene=house-tour` | Full mansion video and getaway, original backing, three physical voices, captions and telemetry |
| Chappell Roan — The Subway | 4:31 | `?scene=the-subway` | Full New York video edit, original backing, physical lead and closing announcement, captions and telemetry |
| Charli xcx — SS26 | 2:52 | `?scene=ss26` | Full runway and backstage edit, original backing, two physical voices, captions and telemetry |
| OK Go — Love | 4:22 | `?scene=ok-go-love` | Full station edit, moving robot arms, live mirror effects, original backing, three physical voices, captions and telemetry |
| Akylas — Ferto | 3:29 | `?scene=ferto` | Original instrumental, full physical vocals, pixel platformer, Aegean island, castle, moon, lava, Vienna and concert levels |
| Lady Gaga & Doechii — RUNWAY | 2:58 | `?scene=runway` | Complete supplied video, original backing, two physical voices, ballroom, red studio, twin-head suit, crystal catwalk and scorecards |
| Nightwish — The Phantom of the Opera | 4:44 | `?scene=nightwish-phantom` | Original music and audience; two physical singers, high vocalise, gold coat, yellow microphone, five band heads, concert lights and crowd |
| Bon Jovi — Always | 6:06 | `?scene=bon-jovi-always` | Complete supplied video, original music and physical lead, vintage microphone, city, dusty road, apartment, party, loft, fire and turquoise art studio |
| The Truman Show — the exit | 5:15 | `?scene=truman-show` | Seven physical dialogue voices, original music and effects, painted sky, sailboat, stairs, exit, control room, viewers and closing exchange |
| Interstellar — TARS humor setting | 0:42 | `?scene=tars` | Three physical voices, original launch background, four helmeted crew, rectangular TARS with working airway display, joke light, humor setting, rocket separation and subtitles |
| The Big Lebowski — The Jesus | 4:25 | `?scene=big-lebowski` | Four physical voices, original opening song and background, bowling, five characters, doorstep flashback and subtitles |
| Blade Runner — Tears in Rain | 3:45 | `?scene=tears-in-rain` | Physical Roy voice, silent Deckard, original soundtrack, rainy rooftop rescue, dove flight and subtitles |
| SOS — Dimash concert | 4:05 | `?scene=dimash-sos` | Physical French singer, original music, captions, dark suit, hand microphone, moving lights, band, audience and camera cuts |
| Nessun Dorma — opera concert | 4:32 | `?scene=nessun-dorma` | Physical Italian tenor and choir, original orchestra, extended finale, captions, conductor, musicians and audience |

The 3D environments, characters, camera behavior and browser recording/export code are part of the source. All reconstructed scenes offer live video recording; only A Few Good Men currently has a pre-encoded MP4 download.

Project Hail Mary recreates the complete supplied karaoke clip. The physical singer
performs Sign of the Times and the closing spoken line, while the original music
and room ambience stay on the source clock. See [the scene notes](docs/project-hail-mary.md).

Contact includes the complete supplied beach scene and its long musical opening,
with Ellie and the visitor in her father’s form. See [the scene notes](docs/contact.md).

Arrival recreates the complete supplied “meeting you” clip, including its quiet
closing line and pauses. See [the scene notes](docs/arrival.md).

The Matrix recreates the complete supplied spoon scene, including the boy’s
demonstration, Neo’s attempt and the final invitation. See [the scene notes](docs/matrix-spoon.md).

Akylas — Ferto pairs the original instrumental with a full physical vocal
performance in Greek, Spanish, French and English. Mouth motion and captions
follow the performance through the arcade levels. See [the scene notes](docs/ferto.md).

Lady Gaga & Doechii — RUNWAY pairs the original instrumental with two physical
voices: Lady Gaga sings the verses, choruses and outro, and Doechii raps the
pre-choruses, verse 2 and bridge callouts. Staging follows the black-and-white
ballroom, red studio, twin-head suit, porcelain teapot gown and crystal spiked
catwalk. See [the scene notes](docs/runway.md).

Apollo 13 uses NASA’s transcripts as well, with the silences shortened and ten minutes skipped.
See [the scene notes](docs/apollo-13.md) for what is and is not from the record.

The Apollo 11 landing uses NASA’s transcripts of the crew and CapCom, not a recording.
See [the scene notes](docs/apollo-11.md) for the mission clock and what drives the picture.

The Wonderful Wizard of Oz is staged from the public-domain book, not from any film.
See [the scene notes](docs/wizard-of-oz.md) for how one airway speaks at two sizes.

One Flew Over the Cuckoo’s Nest recreates the complete supplied ward conversation,
including its brief replies and final reaction. See [the scene notes](docs/cuckoos-nest.md).

The speech is a short excerpt from an official public-domain presidential address.
Its voice is generated by the physical mouth; the pauses and gestures are staged
by hand. See [the speech notes](docs/fool-me-once.md) for sources and rebuilding.

The HAL 9000 scene has no source clip: its line starts are timed by hand from the script and every line’s end is the engine’s own. `bun tools/render-hal-scene.ts` (needs ffmpeg) rebuilds its mix, telemetry, captions and shots from the engine; the room’s modules, light and cameras follow `src/scene/core.ts`. “Daisy Bell” is entered as notes and slows and falls in pitch as it is sung. Original movie source video/audio is not needed for playback and is not served.

Lose Yourself adds the full supplied 5:27 recording with original instrumental music, a physical rap voice, a generated rainy city background, a circular mouth and synchronized word highlighting. Open `?song=lose-yourself`; see [the rap notes](docs/lose-yourself.md).

## Single-mouth player

`?solo=1` includes the song/MIDI import player and original CHIMERA controls. Imports happen in browser memory and are not uploaded. All required engine code, fonts, dictionary and rendering assets are included.

## Scope of the export

This is the complete content of the running app, rather than a backup of the computer’s Music and Videos folders. Raw input recordings, source-separation stems used only for analysis, ASR models, temporary render files, development toolchains and caches are excluded. No external source recording is required to replay the prepared songs or scenes.

The Sagan scene includes the complete supplied 7:23 clip, with a brief final voice release.
See [the scene notes](docs/sagan-dimensions.md).

Nessun Dorma includes the full supplied concert video, including the extended Turandot finale and applause. The separate opera setting has blue columns, a tenor at a stand microphone, a conductor, seated strings and brass, a choir and an audience. See [the scene notes](docs/nessun-dorma.md).

SOS adds the complete supplied Dimash concert clip in its own televised stage setting. The approved French physical singer follows the source melody, with original instrumental music, populated stage, gestures, camera cuts and captions. See [the concert notes](docs/dimash-sos.md).

Реченька includes the full supplied live performance, including the wordless passage, kneeling boat ending and applause, in a new river stage setting. See [the scene notes](docs/rechenka.md).

Blade Runner includes the complete supplied 3:45 Tears in Rain sequence: rooftop rescue, Roy’s physical dialogue, silent Deckard, original soundtrack, rain and dove release. Open `?scene=tears-in-rain`; see [the scene notes](docs/tears-in-rain.md).

The Big Lebowski includes the complete 4:25 bowling excerpt, with the uploader’s endcard omitted. Four physical voices take separate turns; staging, original background and cameras follow the adjusted dialogue timing. Open `?scene=big-lebowski`; see [the scene notes](docs/big-lebowski.md).

Interstellar adds the complete supplied TARS humor-setting exchange. Three physical voices take separate turns; the 39.45-second source becomes a 42.14-second performance to give TARS clearer speech. The Ranger cabin, four crew, robot display and launch exterior follow the adjusted dialogue clock. See [the scene notes](docs/tars.md).

Good Will Hunting includes the complete supplied park-bench conversation, with only the promotional endcard removed. Sean and Will speak through two physical mouths; the original background, camera cuts and quiet ending follow their shared timing map. Open `?scene=good-will-hunting`; see [the scene notes](docs/good-will-hunting.md).

The Truman Show includes the complete supplied ending, with seven physical dialogue voices, the original music and effects, dome, exit and viewers. Camera cuts, background and movements share the dialogue timing map. Open `?scene=truman-show`; see [the scene notes](docs/truman-show.md).

Prisencolinensinainciusol includes the complete supplied Formula Due classroom performance, including the instrumental break and harmonica finale. The teacher and answering class use physical mouth voices; captions are an approximate phonetic guide to the nonsense sounds. See [the scene notes](docs/celentano.md).

Frontier Psychiatrist includes the complete supplied music video as a surreal theatre scene. Six physical voices follow the chopped samples on the original music clock; seven foreground heads include the turtle borrowing the active voice. See [the scene notes](docs/frontier-psychiatrist.md).

Mahna Mahna includes the complete supplied trio sketch and its introduction, telephone gag and balcony ending. The Snowths have separate physical voices and synchronized answering syllables. See [the scene notes](docs/mahna-mahna.md).

O Superman includes the complete supplied official video as a staged reconstruction. The repeated ha is an engine-generated cell placed at measured source landmarks. See [the scene notes](docs/o-superman.md).

Céline Dion includes the complete supplied extended music video as a stormy mansion scene. The featured voice is generated by the physical mouth engine over the original instrumental bed. See [the scene notes](docs/celine-coming-back.md).

Vitas includes the complete supplied video with original accompaniment and physical vocals. The rolling tongue passages use the approved lateral mouth movement, not recorded samples. See [the scene notes](docs/vitas-7th-element.md).

Stonehenge includes the full supplied video with original music, approved physical singing and the domestic-to-monument staging. See [the scene notes](docs/stonehenge.md).

Once in a Lifetime includes the complete supplied official video, with original music and physical spoken verses and sung refrains. The choreography includes a suited performer, repeated figures and the floating ending. See [the scene notes](docs/once-in-a-lifetime.md).

Autumn Leaves includes the complete supplied Nat King Cole television performance, with original music and physical singing in a monochrome garden set. See [the scene notes](docs/autumn-leaves.md).

What’s He Building? stages the full supplied Tom Waits recording as the proposed workshop mystery. The source video is a cover still; the physical narrator and environment are an original procedural interpretation. See [the scene notes](docs/whats-he-building.md).

Said I Loved You…But I Lied includes the complete supplied Michael Bolton video as a staged performance, with original music and physical vocals. See [the scene notes](docs/said-i-loved-you.md).

Πάμε στη Χονολουλού adds the complete supplied recording as a song, with the original accompaniment, physical Greek singing and wordless calls/scat, timed words and an imagined island singer. Open `?song=pame-sti-honolulu`; see [the song notes](docs/pame-sti-honolulu.md).

Air Supply’s complete Making Love Out of Nothing at All video adds two physical singing voices, the original accompaniment and the full romantic montage. See [the performance notes](docs/making-love.md).

Hello includes the complete supplied music video, original accompaniment, physical singing and dialogue, full school story and sculpture reveal. See [the scene notes](docs/hello.md).

Bon Jovi’s complete Always video adds one physical English lead, original accompaniment, source-timed captions and the full procedural romantic montage. See [the performance notes](docs/bon-jovi-always.md).

Un-Break My Heart adds the complete supplied video scene with an approved physical lead and unchanged-speed original accompaniment. Its six prepared files include a source-aligned phonetic score, full mix/backing, physical mouth telemetry, scene/caption/camera data and credits. The source video and analysis caches remain local; see [the performance notes](docs/unbreak-my-heart.md).

November Rain includes the complete supplied film, original instrumental music and guitar solos, physical lead and answering outro voice, full wedding/funeral story and grave roses. See [the performance notes](docs/november-rain.md).

Hero adds the complete supplied film with the approved physical lead and original accompaniment. Its six prepared files contain the full score, backing/mix, synthesized telemetry, scene/captions/camera data and credits. The original video and analysis caches stay local; see [the performance notes](docs/hero.md).

My Heart Will Go On adds the complete supplied anniversary alternate performance. Six prepared files contain the physical score, mix/backing, mouth telemetry, source-timed scene/captions/cameras and credits. Source video and analysis caches remain private; see [the performance notes](docs/my-heart-will-go-on.md).

I’ll Make Love to You adds the complete supplied video with six physical mouths. Twelve prepared files include the four-voice singing score, native dialogue control score, mix/backing, six mouth telemetry tracks, scene/captions/cameras and credits. Input recordings and analysis caches remain private; see [the performance notes](docs/ill-make-love-to-you.md).

Mas Que Nada includes the complete supplied vintage performance, original accompaniment, physical Brazilian Portuguese lead, period singer, Sérgio at the piano, second singer, jungle foliage and band. See [the performance notes](docs/mas-que-nada.md).
Stay adds the complete supplied Shakespears Sister video with two physical singers and seven prepared files: explicit phonetic score, original backing, full mix, two compressed mouth telemetry tracks, scene/captions/cameras and credits. The silent patient shares the lead model. Source recordings and analysis remain private; see [the scene notes](docs/shakespears-stay.md).

Wuthering Heights adds the complete supplied red-dress video with six prepared files: explicit phonetic score, original backing, full mix, one compressed mouth telemetry track, scene/captions/cameras and credits. The figure borrows one retained model; source recordings and analysis remain private. See [the scene notes](docs/wuthering-heights.md).

Rock Me Amadeus adds eight prepared files: explicit three-part phonetic score, original backing, full mix, three compressed telemetry tracks, scene/captions/cameras and credits. Three retained models serve four physical heads; the two lead costumes share one model. The German frontend is task-local score preparation, with no shared engine or dictionary changes. Input video, stems and analysis remain private. See [the scene notes](docs/rock-me-amadeus.md).

Nothing Compares 2 U adds six prepared files: explicit phonetic score, original backing, full mix, one compressed mouth track, scene/captions/cameras and credits. Portrait and garden walker share one retained model. Source video, separated stems and analysis stay private. See [the scene notes](docs/nothing-compares.md).

Take On Me adds seven prepared files: explicit two-part phonetic score, original backing, full mix, two compressed mouth tracks, scene/captions/cameras and credits. Four heads borrow two retained models; the girl uses neutral articulation. The local ink renderer preserves every other scene’s neon materials. Raw source, stems and analysis remain private. See [the scene notes](docs/take-on-me.md).

Where the Wild Roses Grow adds seven prepared files: explicit two-part phonetic score, original backing, full mix, two compressed mouth tracks, scene/captions/cameras and credits. Two physical heads borrow two retained models. Raw source, stems and analysis remain private. See [the scene notes](docs/wild-roses.md).

Sledgehammer adds seven prepared files: explicit lead/backing phonetic score, original instrumental backing, full mix, two mouth tracks, scene/captions/cameras and credits. Four heads borrow two retained models; decorative dancers are proxies. Prop motion steps on a separate nine-frame clock. All raw input and analysis remain private. See [the scene notes](docs/sledgehammer.md).

Ashes to Ashes adds six prepared files: explicit phonetic score, original instrumental backing, full mix, compressed mouth track, scene/captions/cameras and credits. Four physical looks share one retained singer; other figures and card people are decorative proxies. Original input and analysis stay private. See [the scene notes](docs/ashes-to-ashes.md).

Απορώ αν αισθάνεσαι tipsy adds six prepared files: explicit bilingual phonetic score, original backing, full mix, compressed mouth track, scene/captions/cameras and credits. One retained physical singer performs Greek and English; the other musicians and audience are decorative proxies. The original instrumental break is retained as a continuous source window. Source video, stems, models and analysis stay private. See [the scene notes](docs/aporo-tipsy.md).

Baby Come Back adds nine prepared files: four-part physical phonetic score, original instrumental backing, full mix, four mouth tracks, scene/captions/cameras and credits. Five heads borrow four retained singers; the drummer uses neutral articulation. Supporting harmony paths are estimates. All raw input and analysis remain private. See [the scene notes](docs/player-baby-come-back.md).

I Want to Break Free adds six prepared files: explicit phonetic score, original backing, full mix, compressed mouth track, source-timed scene/captions/cameras and credits. Three physical head graphics share one retained voice model. Other household, crowd and ballet figures are decorative proxies. The confirmed instrumental dance sequence is preserved directly from the supplied recording. Raw source video, stems, models and analysis stay private. See [the scene notes](docs/break-free.md).

Human Behaviour adds six prepared files: explicit phonetic score, original backing, full mix, compressed mouth track, source-timed scene/captions/cameras and credits. Five physical head graphics share one retained singer. Wordless calls use locally recovered source phones through the unchanged mouth engine. Three bear graphics, hunter and moth are decorative animated figures. Raw video, stems, recognition models and analysis stay private. See [the scene notes](docs/human-behaviour.md).

Sweet Dreams adds six prepared files: explicit phonetic score, original backing, full mix, compressed mouth track, source-timed scene/captions/cameras and credits. Five physical head graphics share one retained singer. Four wordless passages use locally recovered source phones through the unchanged mouth engine. Seven cow figures and seven Dave proxies are animated decoration. The full source audio continues under the wake-up tableau after the original picture fades out. Raw video, stems, recognition models and analysis stay private. See [the scene notes](docs/sweet-dreams.md).

The Phantom of the Opera adds seven prepared files: explicit duet/vocalise phonetic score, original backing, full mix, two mouth tracks, scene/captions/cameras and credits. Five band heads borrow two retained singers; audience figures are decorative instances. The raw source and analysis remain private. See [the scene notes](docs/nightwish-phantom.md).

Walking on Broken Glass adds six prepared files: explicit phonetic score, original backing, full mix, compressed mouth track, source-timed scene/captions/cameras and credits. One retained physical model drives the singer; seventeen visual guest proxies populate the party and later tableaux. Raw video, stems, recognition models and analysis stay private. All preceding content, including Sweet Dreams and the concurrent Nightwish addition, is preserved. See [the scene notes](docs/walking-broken-glass.md).

The Wild Boys adds six prepared files: explicit phonetic score, original backing, full mix, compressed mouth track, source-timed scene/captions/cameras and credits. Three physical head graphics share one retained singer. Twelve punk/band figures are decorative animated proxies. Raw video, separated stems, recognition models and analysis stay private. See [the scene notes](docs/wild-boys.md).

Lullaby adds six prepared files: explicit phonetic score, original backing, full mix, compressed mouth track, source-timed scene/captions/cameras and credits. Three physical heads share one retained singer. Four band members are decorative animated proxies. The original instrumental opening and extended ending are preserved. Raw video, separated stems, recognition models and analysis stay private. See [the scene notes](docs/lullaby.md).

I Believe in a Thing Called Love adds the complete supplied Darkness spaceship video, the approved physical falsetto singer and continuous original instrumental music, including the long guitar ending. Four physical head graphics borrow one retained singer across the bath, bedroom, moon and ship. The source-time scenery includes cupids, a crab, giant faces, boulder, amplifier walls, saucer, tentacle attack and guitar lasers. See [the scene notes](docs/darkness-love.md).

Crucified and Go West add the complete supplied videos with their approved physical voices and original music. Preserve the independent trio and lead/answering chorus, source timing and owned costume graphics around borrowed physical heads. See [Crucified](docs/crucified.md) and [Go West](docs/go-west.md).

You Spin Me Round adds the complete supplied dance video, approved physical voice and original music, with the verified instrumental rest between its opening entries. No Surprises adds the complete supplied helmet take, approved quiet singing and original music, including its corrected opening words and source-timed water sequence. See [Spin](docs/spin-round.md) and [No Surprises](docs/no-surprises.md).

Remember the Time adds the full supplied Egyptian short film, original accompaniment, four approved physical dialogue/singing voices, royal court, entertainers, magic, chase, market, balcony and dance. Two dense closing call passages use approved estimated source phonetics. Shock the Monkey adds the full supplied video with its approved physical voice, original music, office, ritual double, scattered papers, projector, monkey, forest and water. See [Remember](docs/remember-time.md) and [Shock](docs/shock-monkey.md).

Black Hole Sun adds the complete supplied video as an independent scene; see [its scene notes](docs/black-hole-sun.md) for the source-aligned physical voice, suburb reconstruction, approved audition and validation. All preceding public assets remain byte-for-byte preserved.

Land of Confusion adds the full supplied puppet video, including the bedroom dialogue, as an independent scene. See [its scene notes](docs/land-confusion.md). All preceding media remain byte-for-byte preserved.

Rock DJ adds the full supplied roller-disco video as an independent scene; see [its performance notes](docs/rock-dj.md). All preceding public media remain byte-for-byte preserved.

Babooshka adds the full supplied double-bass and warrior-costume video as an independent scene; see [its performance notes](docs/babooshka.md). All preceding public media remain byte-for-byte preserved.

Danger! High Voltage adds the full supplied Electric Six video as an independent scene; see [its notes](docs/danger-voltage.md). All preceding public media remain byte-for-byte preserved.

Losing My Religion adds the full supplied R.E.M. video as an independent performance; see [the scene notes](docs/losing-religion.md). All earlier public media remain byte-for-byte preserved.

Loser adds the full supplied Beck video as an independent scene; see [the performance notes](docs/beck-loser.md). All preceding public media remain byte-for-byte preserved.

Espresso Macchiato adds the complete supplied official video as an independent performance; see [the scene notes](docs/espresso-macchiato.md). All preceding public media remain byte-for-byte preserved.

APT. adds the complete supplied official video with an independent physical duet; see [the scene notes](docs/apt.md). All earlier public media remain byte-for-byte preserved.

Abracadabra adds the complete supplied video with original instrumental music and a physical singer; see [the scene notes](docs/abracadabra.md). Earlier public media remain byte-for-byte preserved.

bad guy adds the complete supplied colourful video with original instrumental music and the approved physical voice; see [the notes](docs/bad-guy.md). All earlier public media remain unchanged.

MONTERO adds the full supplied fantasy video with original music and the approved physical narration, singing, rap and nasal humming; see [the scene notes](docs/montero.md). Earlier public media remain unchanged.

Taste adds the complete supplied horror-comedy video with original music, approved physical singing and distinct closing dialogue. See [the scene notes](docs/taste.md). Earlier prepared media remain unchanged.

SKIBIDI adds the full supplied strange-dance video with original music and an actual physical featured voice. See [the scene notes](docs/skibidi.md). All earlier prepared media remain unchanged.

Manchild adds the complete supplied road-trip video as procedural scenery with original instrumental music and physical mouth-engine singing. See [the scene notes](docs/manchild.md). All preceding prepared media remain unchanged.

Aperture adds the complete supplied hotel film with original instrumental music, the approved physical singing and opening telephone exchange. See [the scene notes](docs/aperture.md). All preceding prepared media remain unchanged.

DENIAL IS A RIVER adds the full supplied sitcom film with original instrumental backing and four mouth-engine channels. See [the scene notes](docs/denial-river.md). All 855 preceding public files remain byte-identical.

STORM adds the complete supplied school film with original instrumental music, physical featured singing and rhythmic responses. See [the scene notes](docs/storm.md). All 864 preceding public files remain byte-identical.

Europapa adds the complete supplied music video with original accompaniment and actual physical Dutch vocals. See [the scene notes](docs/europapa.md). All 871 preceding public files remain byte-identical.

Europapa is live at <https://agenticspiros.com/chimera-song-mouth/?scene=europapa>.
Runtime `d2a7fd9d661ac7b82cefac0e09c202a41eebb2b5` was committed and pushed before all 17 changed files uploaded
successfully with `DEPLOY_EXIT=0`, media first and entry page last. The final live
HTTP check matched all 376 checked files, including the current app bundles,
six Europapa assets and 52 preserved performances, plus the clean direct route.
The temporary upload job and plist were removed. All 871 preceding public files
remain byte-identical; the manifest contains 877 files and the library has 71
concert/music-video performances. Browser playback, export and layout were not
retested; native geometry, audio, telemetry and HTTP checks provide the evidence.

Houdini adds the full supplied comic-book video with actual physical rap, refrain and scene dialogue over the original music. See [the scene notes](docs/houdini.md). All 877 preceding public files remain byte-identical.

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

Tailor Swif adds the complete supplied surreal video with approved physical rap over the original music. See [the scene notes](docs/tailor-swif.md). All 886 preceding public files remain byte-identical.

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

bbno$ — two adds the complete supplied surreal costume film with approved physical rap and choir over original music. See [the scene notes](docs/bbno-two.md). All 892 preceding public files remain byte-identical.

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

like JENNIE adds the complete supplied capsule, dance and capybara video with approved physical English/Korean vocals over original music. See [the scene notes](docs/like-jennie.md). All 900 preceding public files remain byte-identical.

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


RATATATA deployment proof: runtime `880f0083f9fdd922cbc96728e6a25fd29a9245ab` was committed and pushed, then all 19 changed files uploaded successfully (media first, index last; publisher exit 0). The direct [RATATATA route](https://agenticspiros.com/chimera-song-mouth/?scene=ratatata), current app bundles, all eight new scene files and fifty-seven preserved performances were verified against local SHA-256 values: 413 live files matched. The task's completed publisher job and its plist were removed; other jobs were untouched.

The manifest contains 914 public files and the library 76 concert/music-video performances. All 906 preceding assets remain byte-identical. All four new-scene tests, 1,006 head/ray combinations, 77 native projections, 195 native tests (two existing ignored), native/WASM voice parity, typecheck, content verification, static build and local HTTP checks pass. The 622-test/151-file Bun inventory has 620 passes after isolated reruns; two existing physical-render tests still exceed their unchanged 5,000 ms limits (Country Roads held vowels and the 256-step beat). Browser playback/export, Playwright and layout lint were not retested under the standing user instruction.


The Dead Dance deployment proof: runtime `ef7d121f49c2360f1f159001cfda680bfdd7ca72` was committed and pushed, then all 17 changed files uploaded successfully (media first, index last; publisher exit 0). The direct [The Dead Dance route](https://agenticspiros.com/chimera-song-mouth/?scene=dead-dance), current app bundles, all six new scene files and fifty-eight preserved performances match their local SHA-256 values: 419 live files were verified. The task's completed publisher job and its plist were removed; other jobs were untouched.

The manifest contains 920 public files and the library 77 concert/music-video performances. All 914 preceding assets remain byte-identical. All 626 Bun tests/152 files and 195 native tests pass (two existing native tests ignored), including native/WASM parity. The four new scene tests include 426 head/ray combinations; 84 offline geometry projections were inspected. Typecheck, content verification, static build, exact audio/mouth clocks and local HTTP checks pass. Browser playback/export, Playwright and layout lint were not retested under the standing user instruction.

Tears deployment proof: runtime `61917d7b53d98bbac1c4590884d4d9d03d82aea9` was committed and pushed, then all 19 changed files uploaded successfully (media first, index last; publisher exit 0). The direct [Tears route](https://agenticspiros.com/chimera-song-mouth/?scene=sabrina-tears), current app bundles, all eight new scene files and fifty-nine preserved performances match local SHA-256 values: 427 live files were verified. The task's completed publisher job and plist were removed; other jobs were untouched.

The manifest contains 928 public files and the library 78 concert/music-video performances. All 920 preceding assets remain byte-identical. All 630 Bun tests/153 files and 195 native tests pass (two existing native ignored), including native/WASM parity. All 418 head/ray checks pass; 78 native projections were inspected. Typecheck, content verification, production build, exact audio/mouth clocks and local HTTP checks pass. Browser playback/export, Playwright and layout lint were not retested under the standing user instruction.

Demons deployment verified for runtime `abbe08aee754dc0b864eda5a2e628fc461740ecb`. The helper uploaded all 18 changed files, with media first and the index last. SHA-256 checks match 434 live files, including the direct [Demons route](https://agenticspiros.com/chimera-song-mouth/?scene=doja-demons), current bundles, seven new scene files and 60 preserved performances. The completed publisher job and its plist were removed.

The library has 79 concert and music-video performances and 935 public files. All 928 preceding public files match their previous hashes. All 634 Bun tests pass across 154 files after isolated reruns. All 195 native tests pass with two existing ignored, including native and WebAssembly voice parity. Typecheck, production build and local HTTP delivery pass. The 119 physical phrases use 4,519 mouth frames per voice on the same clock as 10,844,305 audio samples per channel. All 402 framing and lip-ray checks pass across 83 source cuts on desktop and phone. Reviewed 88 offline scene projections. Browser playback and export were not retested.

Lithonia deployment verified for runtime `633019ae8158c1c8ecf658ea8e6aadbf79541ebb`. The publisher uploaded all 19 changed files with media first and the index last. SHA-256 checks match 442 live files, including the [Lithonia route](https://agenticspiros.com/chimera-song-mouth/?scene=lithonia), current bundles, eight new scene files and 61 preserved performances. Removed the completed publisher job and its plist.

The library has 80 concert and music-video performances and 943 public files. The 935 preceding files match their previous hashes. All 638 Bun tests pass across 155 files after an isolated rerun. All 195 native tests pass with two existing ignored. Typecheck, native and WebAssembly parity, production build and local HTTP delivery pass. The 39 physical phrases share a source clock with 2,421 snapshots per voice and 5,810,065 audio frames. All 390 framing and lip-ray checks pass across 44 cuts and two viewport sizes. Inspected 49 offline projections. Browser playback and export were not retested.

The library has 82 concert and music-video performances and 997 public files. The 991 preceding files match their previous hashes. All 662 Bun tests pass across 161 files and all 195 native tests pass, including native and WebAssembly parity. Typecheck, content verification and the production build pass; the base-path build at `/chimera-song-mouth/` served the scene, mix and mouth telemetry with no 404s and no console errors while seeking all nineteen inspected timestamps. The one physical phrase set carries 49 cues, 66 source cuts and 2,114 pitch points through 3,888 mouth frames on the same clock as 9,328,943 audio frames per channel. Layout lint reports the three existing Sing and score canvas-text overlaps and nothing in this scene.

Blue Moon deployment verified for runtime `47f3ea8`. The publisher uploaded all 17 changed files with media first and the entry page last. SHA-256 checks match every uploaded file, including the [Blue Moon route](https://agenticspiros.com/chimera-song-mouth/?scene=zara-blue-moon), the current bundles and the six new scene assets; the preserved `ok-go-love` mix and scene, `ss26` scene and `abracadabra` mix also match their local hashes. The completed publisher job and its plist were removed.
