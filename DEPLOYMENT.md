# Independent hosting

## Recommended setup

Keep source and the current prepared media together in this public GitHub repository. Connect the new host to it and publish the static output. At the initial export, public assets total **263,166,339 bytes (250.97 MiB)**; the largest file is the 23,264,211-byte subtitled MP4. All files fit regular GitHub storage, so Git LFS and an external storage account are unnecessary.

GitHub [blocks individual Git files above 100 MiB and recommends repositories under 1 GB](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github). Repeatedly replacing large media will grow Git history; use an external media store if that becomes significant.

## Build from the repository

| Setting | Value |
| --- | --- |
| Project/root directory | Repository root |
| Install | `bun install --frozen-lockfile` |
| Build | `bun run build:static` |
| Publish/output directory | `dist` |
| Bun version used in the export | `1.4.4` |
| Secrets/environment variables | None for playback or build |
| Deployment path | Root of an HTTPS origin |

If the host only has one build-command box, use `bun install --frozen-lockfile && bun run build:static`. Select/install Bun in its build environment. The `vercel.json` includes these commands; other hosts can use the same settings. Rust is only needed when rebuilding the engine from source.

Cloudflare Pages is one suitable option for the current assets: its documented [25 MiB per-file limit](https://developers.cloudflare.com/pages/platform/limits/) is above the largest current file, and this site is far below its file-count limit. Connect the host’s GitHub integration to this repository for automatic builds. Account setup and deployment remain for the next agent; this handoff does not change the existing live website.

## Deploy without a build environment

Download `chimera-website.zip` from this repository’s latest release, verify its checksum against `SHA256SUMS.txt`, and extract it. Upload the **contents**, with `index.html` at the web root. It already contains all compiled JavaScript/WASM, nine songs and both scenes. Do not upload the ZIP itself as the website or omit its `band/`, `scenes/`, `fonts/`, `data/` and `assets/` directories.

Keep the website and media on the same origin. Correct MIME types include `text/javascript` for JS and `application/wasm` for WASM. Serve `.tele.gz` as binary; if a host transparently decompresses it, the loader can detect the already-decompressed data. Avoid rewriting missing media to `index.html`; missing media should return 404. Query-string routes such as `?song=megalovania` need no special rewrite.

## If the collection grows

The next practical split is **GitHub for code + Cloudflare R2 for prepared media**. R2’s [public bucket/custom-domain documentation](https://developers.cloudflare.com/r2/buckets/public-buckets/) describes serving large files. Another agent would then add a configurable media base URL for song/scene fetches and downloads, set CORS for the app origin, copy assets with the manifest checksums, and keep rollback copies. That migration is not required or configured now; simply uploading assets to a bucket would not update the app’s current same-origin URLs.

## Check after deployment

Open the root page and every link in `CONTENT.md`. Start playback with a user click. Check the solo voice, all 24 MEGALOVANIA heads, both Greek backings, the whistle and snapping hand, all movie scenes and the speech with their captions, WAV downloads and the ready MP4. Record a short scene test in the target browser; real-time recording support depends on the browser’s encoders. Only A Few Good Men currently has a pre-encoded MP4; the other scenes use live recording.

The Rodehihi addition brings the library to ten songs. Standard builds still include every media file locally. The older Sites deployment uses the optional `CHIMERA_EXTERNAL_MOVIE_DOWNLOAD` build setting described in the README to keep its archive under 256 MiB; the courtroom MP4 remains in this repository and its original release attachment.

## Existing agenticspiros.com installation

The current independent installation is at `https://agenticspiros.com/chimera-song-mouth/`. Build with `bun run build:static --base=/chimera-song-mouth/`; `BASE_PATH` resolves prepared song/scene and dictionary URLs under that prefix. Upload new media and hashed bundles before `index.html`, preserving unrelated files and prior assets. The established upload helper is on the owner's Mac mini at `/Users/spiros/Projects/chimera-song-mouth-deploy/publish.sh`, with its connection secret kept in Keychain. Its source directory is `/Users/spiros/Projects/chimera-song-mouth-dist`; an optional path-list argument limits uploads. No hosting secrets are in this repository.

The 13 November 2026 prepared-performance release uses application commit `e79d3d7`: Fade Into You, Je t’aime and I Will Always Love You are all live, with 534 prepared public files preserved. Its final live check verified 240 files and the direct route. A concurrent upstream engine import (`14e541d`) was preserved in the repository when the completion notes were rebased; it was not part of this performance deployment. Fourteen focused scene/model-lease checks, TypeScript and the 534-file media/WASM verification passed on the combined repository afterward. Rebuild from the current source before deploying later engine changes; preserve the three owner-approved prepared voices and their telemetry.

The subsequent Hello release on 13 November 2026 uses application commit `29477b8`. It adds the complete supplied 5:26 school video, four physical voices, original accompaniment and the clay-portrait ending. The upload helper completed all 27 changed files successfully, with `index.html` last. All 534 earlier prepared public files are unchanged; the manifest now contains 543. This production build also includes the previously integrated upstream source from `14e541d` (engine revision `153c971`), which was absent from the earlier Whitney deployment. The full combined checks passed: 187 native tests with two existing ignored, 377 Bun tests across 94 files, TypeScript, content verification and the production build. The tracked WASM matches `PROVENANCE.json`.

Hello’s final live check verified 257 files byte-for-byte, including all 27 uploaded files, preserved songs/scenes, and the direct `?scene=hello` route. Upload and live verification both exited successfully. Browser/GPU playback and recording remain unverified because browser access is declined.

The Bon Jovi — Always release on 13 November 2026 uses application commit `641ef44`. It adds the complete supplied 6:06 video as a procedural scene with one approved physical English lead, original accompaniment, captions and six prepared assets. The change was rebased onto the Hello release without replacing its media; the manifest now contains 549 public files. The combined checks passed 381 Bun tests across 95 files, TypeScript, content verification, production build and local HTTP. The upload helper accepted all 26 changed files, with `index.html` last. Live verification matched 32 files byte-for-byte, including Bon Jovi, Hello, application bundles and preserved Whitney media, and the direct `?scene=bon-jovi-always` route. Local Chromium playback, seeking and recorder availability passed without console errors. The deployed browser connection was refused in this environment, so live browser playback and real-time recording are not claimed as verified.

The Bon Jovi visual revision (`d66ce2d`, 13 November 2026) is live at the existing `?scene=bon-jovi-always` route. It changes character rendering, acting, lighting and camera edits while preserving the approved mix, backing, vocal score, lyrics/captions and mouth telemetry byte-for-byte. Only `scenes/bon-jovi-always/scene.json` changes among the 549 prepared public files, and only its camera shots change. All twelve uploads and 32 live file checks succeeded, including preserved Bon Jovi, Hello and Whitney media and the direct route. Combined validation passed 187 native tests (two existing ignored), 382 Bun tests across 95 files, TypeScript, content verification, production build and local HTTP checks. Browser/GPU playback and layout lint were not rerun because browser access remains declined in this chat.

The Un-Break My Heart addition (`fd93646`, 13 November 2026) is live at `?scene=unbreak-my-heart`. It includes the complete supplied 4:33 video, original accompaniment and the owner-approved physical lead, with the motorcycle opening, home memories, pool, mirror, bedroom, seated staircase grief and white-gown orchestra finale. All seventeen uploads and 38 live checksum checks succeeded, including the direct route, six new files, app bundles and preserved Bon Jovi, Hello and Whitney media. All 549 earlier public assets remain byte-identical; the manifest contains 555 files. Required validation passed 187 native tests (two existing ignored), 387 Bun tests across 96 files, TypeScript, content verification, production build and local HTTP checks. The tracked WASM matches its unchanged provenance. Native composition checks do not verify browser/GPU playback or real-time recording; those were not retested because browser access remains declined in this chat.

The November Rain addition (`b189ada`, 14 November 2026) is live at `?scene=november-rain`. It reconstructs the complete supplied 9:17 film with an approved physical lead and answering outro voice, original instrumental music and guitar solos, wedding, desert church, reception storm, funeral, cemetery and grave roses. Its seven new assets include two physical telemetry tracks. The manifest contains 562 public files. Combined validation passed 391 Bun tests across 97 files, TypeScript, content verification, production build and local HTTP. All 25 changed files uploaded with `index.html` last; live verification matched 31 files, including November Rain, Un-Break My Heart, application bundles and preserved Whitney media, plus the direct scene route. Local Chromium playback, seeking and recorder availability passed without console errors. Live browser playback and real-time recording were not retested.

The Hero addition (`d596a24`, 14 November 2026) is live at `?scene=hero`. It reconstructs the complete supplied 4:23 video with the approved physical lead and original accompaniment, station, convertible, desert, chapel, lovers, confrontation and rain-soaked cradling ending. All seventeen changed files uploaded with `index.html` last; live verification matched 51 files, including Hero, app bundles and five preserved performances, plus the direct route. All 562 earlier public assets remain byte-identical; the manifest contains 568 files. Validation passed 187 native tests (two existing ignored), 396 Bun tests across 98 files, TypeScript, content verification, production build and local HTTP. The tracked WASM matches its unchanged provenance. Native compositions cover the seven sets, portrait and cinema framing, seeking and borrowed-model ownership. Browser/GPU playback, layout lint and real-time recording were not retested because browser access remains declined in this chat. The temporary publish job was removed.

The My Heart Will Go On addition (`404be4e`, 14 November 2026) is live at `?scene=my-heart-will-go-on`. It follows the complete supplied 4:41 anniversary alternate edit with an approved physical lead, original music, ivory lace gown, curved ship’s bow, sunset ocean, windblown hair, stars and double exposure. Both physical heads share one retained voice model. All seventeen changed files uploaded with `index.html` last; live verification matched 63 files, including the new performance, app bundles and seven preserved performances, plus the direct route. All 568 earlier public assets remain byte-identical; the manifest contains 574 files. Validation passed 187 native tests (two existing ignored), 401 Bun tests across 99 files, TypeScript, content verification, production build and local HTTP. The tracked WASM matches its unchanged provenance. Native projections cover all views, hands, seeking, portrait framing and borrowed-model ownership. Browser/GPU playback, layout lint and real-time recording were not retested because browser access remains declined in this chat. The temporary publish job was removed.

The I’ll Make Love to You addition (`4a52839`, 14 November 2026) is live at `?scene=ill-make-love-to-you`. It follows the complete supplied 4:20 video with an approved physical quartet, two native clear-speech opening voices, original accompaniment, security visit, keypad, writing desk and silver lamp, ivory outfits, cap/cane, staircase, blue portraits, vanity and final letter. All six physical models remain borrowed for the mounted scene. The dialogue’s native control plans are included in `dialogue.json`. All twenty-three changed files uploaded with `index.html` last; live verification matched 75 files, including the new scene, app bundles and eight preserved performances, plus the direct route. All 574 earlier public assets remain byte-identical; the manifest contains 586 files. Validation passed 187 native tests (two existing ignored), 406 Bun tests across 100 files, TypeScript, content verification, production build and local HTTP. The tracked WASM matches its unchanged provenance. Native projections cover all sets, hand/prop poses, seeking, 4:3/portrait framing and model ownership. Browser/GPU playback, layout lint and real-time recording were not retested because browser access remains declined in this chat. The temporary publish job was removed.

The Mas Que Nada addition (`39ae919`, 14 November 2026) is live at `?scene=mas-que-nada`. It reconstructs the complete supplied 2:36 vintage performance with an approved Brazilian Portuguese physical lead, original accompaniment, period singer, vintage microphone, Sérgio at the piano, second singer, jungle foliage and band. Six new assets include the explicit Portuguese phonetic score and one telemetry track. The manifest contains 592 public files. Combined validation passed 410 Bun tests across 101 files, TypeScript, content verification, production build and local HTTP. All 41 changed files uploaded with `index.html` last; live verification matched 47 files, including Mas Que Nada, Hero, My Heart Will Go On, Boyz II Men, application bundles and preserved Whitney media, plus the direct scene route. Local Chromium playback, seeking and recorder availability passed without console errors. Live browser playback and real-time recording were not retested. The temporary publish job was removed.

The Stay addition (`6939b70`, 14 November 2026) is live at `?scene=shakespears-stay`. It follows the complete supplied 3:58 video with the approved contrasting physical duet, original accompaniment, blue bedside chamber, Earth and stars, brass bed, luminous curtain tunnel, struggle, revival and final embrace. The separate Mas Que Nada release was integrated and all 592 preceding public assets remain byte-identical; the updated manifest contains 599 files. Validation passed 187 native tests (two existing ignored), 414 Bun tests across 102 files, TypeScript, content/WASM verification, production build and local HTTP checks. All eighteen changed files uploaded with the entry page last, and live checks matched 88 files, including the seven new assets, app bundles, ten preserved performances and the direct route. The temporary publish job was removed. Browser/GPU playback, layout lint and real-time recording were not retested because browser access remains declined in this chat.

The Wuthering Heights addition (`3e492bf`, 14 November 2026) is live at `?scene=wuthering-heights`. It reconstructs the complete supplied 4:30 red-dress Version 2 with the approved physical high lead, original music and full long guitar/dance ending, reaching hands, turns, red flowing sleeves and skirt, black belt, long hair and fringe, flower, earrings, windswept field and pine grove. All 599 preceding public assets remain byte-identical; the manifest contains 605 files. Validation passed 187 native tests (two existing ignored), 418 Bun tests across 103 files, TypeScript, content/WASM verification, production build and local HTTP. All seventeen changed files uploaded with the entry page last, and live checks matched 94 files, including the six new assets, app bundles, eleven preserved performances and the direct route. The temporary publish job was removed. Browser/GPU playback, layout lint and real-time recording were not retested because browser access remains declined in this chat.

The Rock Me Amadeus addition (`4e7d051`, 14 November 2026) is live at `?scene=rock-me-amadeus`. It follows the complete supplied 3:44 Falco video with the owner-approved physical German lead and layered chorus, original music, Vienna postcard, coach, tuxedo, coloured Mozart wig, brocade coat and cravat, powdered courtiers, biker bar, motorcycles and final prayer. Three retained models serve four physical heads. All 605 preceding public assets remain byte-identical; the manifest contains 613 files. Validation passed 187 native tests (two existing ignored), 422 Bun tests across 104 files, final focused scene checks, TypeScript, content/WASM verification, production build and local HTTP. All nineteen changed files uploaded with the entry page last, and live checks matched 102 files, including eight new assets, app bundles, twelve preserved performances and the direct route. The temporary publish job was removed. The unchanged English-only scene-clarity aid is unsuitable for German and is documented as a diagnostic limitation. Browser/GPU playback, layout lint and real-time recording were not retested because browser access remains declined in this chat.

The Nothing Compares 2 U addition (`b20620e`, 14 November 2026) is live at `?scene=nothing-compares`. It follows the complete supplied 5:08 Sinéad O’Connor video with the owner-approved physical lead, original music and full long instrumental ending, intimate black-background portrait, cropped hair and high collar, restrained expressions and tears, formal garden paths, fountain, balustrade, statue, walking figure and slow double exposures. Two physical heads share one retained model. All 613 preceding public assets remain byte-identical; the manifest contains 619 files. Validation passed 187 native tests (two existing ignored), 426 Bun tests across 105 files, TypeScript, content/WASM verification, production build and local HTTP. All seventeen changed files uploaded with the entry page last, and live checks matched 108 files, including six new assets, app bundles, thirteen preserved performances and the direct route. The temporary publish job was removed. The unchanged scene-clarity aid remains a documented listening diagnostic rather than an intelligibility pass. Browser/GPU playback, layout lint and real-time recording were not retested because browser access remains declined in this chat.

The Take On Me addition (`8977f23`, 14 November 2026) is live at `?scene=take-on-me`. It reconstructs the complete supplied 4:04 a-ha video with the owner-approved physical lead and chorus replies, original music, graphite-on-paper motorcycle race, colour café and comic, wink and reaching hand, two-world window and band, wrench-wielding rivals, paper escape and bin climb, apartment transformation, reunion and closing cover. Four physical heads borrow two retained models; the girl stays vocally silent. Normal-blended ink belongs only to this stage and preserves the shared neon renderer. All 619 preceding public assets remain byte-identical; the manifest contains 626 files. Validation passed 187 native tests (two existing ignored), 431 Bun tests across 106 files, final focused scene checks, TypeScript, content/WASM verification, production build and local HTTP. All eighteen changed files uploaded with the entry page last, and live checks matched 115 files, including seven new assets, app bundles, fourteen preserved performances and the direct route. The temporary publish job was removed. The unchanged scene-clarity aid is documented as a listening diagnostic rather than an intelligibility pass. Browser/GPU playback, layout lint and real-time recording were not retested because browser access remains declined in this chat.

The Where the Wild Roses Grow addition (`7a6ef67`, 14 November 2026) is live at `?scene=wild-roses`. It follows the complete supplied 4:32 Nick Cave/Kylie Minogue video with the owner-approved independent physical duet, original instrumental accompaniment, floating white slip dress and red hair, kneeling white-shirted Nick, dark river and reeds, rose portraits, hand gestures, snake, final rose and empty-water ending. Two heads borrow two retained models; shared-refrain lower harmony is estimated. Overhead cameras restore their up vector on seeks and the scene-local garden blending preserves other neon scenes. All 626 preceding public assets remain byte-identical; the manifest contains 633 files. Validation passed 187 native tests (two existing ignored), 435 Bun tests across 107 files, focused framing/occlusion/seeking/ownership checks, TypeScript, content/WASM verification, production build and local HTTP. All eighteen changed files uploaded with the entry page last, and live verification matched 122 files, including seven new assets, app bundles, fifteen preserved performances and the direct route. The temporary publish job was removed. The unchanged clarity aid remains a documented listening diagnostic rather than an intelligibility pass. Browser/GPU playback, layout lint and real-time recording were not retested because browser access remains declined in this chat.

The Sledgehammer addition (`470d25e`, 15 November 2026) is live at `?scene=sledgehammer`. It reconstructs the complete supplied 5:45 Peter Gabriel video with the owner-approved physical lead and estimated backing calls, original instrumental music, microscopic opening, giant face and angled miniature-train orbit, speaker/chalkboard/clay/fish/fruit transformations, cardboard rooms, dancing chickens, wallpapered dance floor and crowd, furniture, light figure and closing attribution period. Four heads borrow two retained models. Nine-frame source-time prop motion stays separate from the recorded articulation clock; direct seeking restores every set and upside-down framing. All 633 preceding public assets remain byte-identical; the manifest contains 640 files. Validation passed 187 native tests (two existing ignored), 439 Bun tests across 108 files, four final focused scene checks, TypeScript, content/WASM verification, production build and local HTTP. All eighteen changed files uploaded with the entry page last, and live verification matched 129 files, including seven new assets, app bundles, sixteen preserved performances and the direct route. The temporary publish job was removed. The unchanged clarity aid is documented as a listening diagnostic rather than an intelligibility pass. Browser/GPU playback, layout lint and real-time recording were not retested because browser access remains declined in this chat.

The Ashes to Ashes addition (`c40dbe8`, 15 November 2026) is live at `?scene=ashes-to-ashes`. It follows the complete supplied 3:37 David Bowie official edit with the owner-approved physical voice, original instrumental music and ending, ruffled Pierrot and pointed cap, pale makeup and memory cards, pink shoreline/cliffs, dark-clad procession and large yellow tracked bulldozer, padded room and shadowed chair, unpainted portrait, monochrome astronaut and attendants, dark water, blue hoses and the closing walk with the older woman. Four head graphics share one retained model. Cap attachment, mobile/cinema framing, submerged costume visibility and direct source-time seeking are covered by focused checks. All 640 preceding public assets remain byte-identical; the manifest contains 646 files. Validation passed 187 native tests (two existing ignored), 443 Bun tests across 109 files, four final focused scene checks, TypeScript, content/WASM verification, production build and local HTTP. All seventeen changed files uploaded with the entry page last, and live verification matched 135 files, including six new assets, app bundles, seventeen preserved performances and the direct route. The temporary publish job was removed. The unchanged clarity aid is documented as a listening diagnostic rather than an intelligibility pass. Browser/GPU playback, layout lint and real-time recording were not retested because browser access remains declined in this chat.

The Απορώ αν αισθάνεσαι tipsy addition (`17acdaf`, drum-camera correction `3149e8d`, 15 November 2026) is live at `?scene=aporo-tipsy`. It reconstructs the complete supplied 2:04 Greek/English mashup with the owner-approved physical voice, original accompaniment and intact guitar/organ break, spoken greetings and Greek ending, long-haired singer, handheld microphone, red scarf and fringed waistcoat, pink-shirted bassist, red guitar, organ and playing hands, drums/cymbals, amplifiers and seated audience. Opening/closing cards and the aircraft tableau are stylized procedural replacements. One physical head borrows one retained model; other musicians are decorative proxies. All 646 preceding public assets remain byte-identical; the manifest contains 652 files. Validation passed 187 native tests (two existing ignored), 447 Bun tests across 110 files, TypeScript, content/WASM verification, production build and local HTTP checks. After the final drum-camera correction, all four focused scene tests, TypeScript, build/content and local HTTP checks passed again. All seventeen changed files uploaded with the entry page last, and live verification matched 141 files, including six new assets, app bundles, eighteen preserved performances and the direct route. The temporary publish job was removed. The unchanged English-only clarity aid cannot assess Greek and is documented as a diagnostic limitation rather than an intelligibility pass. Browser/GPU playback, layout lint and real-time recording were not retested because browser access remains declined in this chat.

The Player — Baby Come Back addition (`0547b38`, 15 November 2026) is live at `?scene=player-baby-come-back`. It retains the complete supplied 4:10 vintage performance, original instrumental opening/ending and owner-approved physical lead with three estimated backing registers. Five physical heads show the blue-shirted lead in a dark vest, red bassist, white guitarist, blue keyboard player and blond drummer. Twin keyboards, guitars, bass, drum riser, cymbals, amplifiers, microphones, moving hands and camera cuts follow source time; four retained models serve the singers and the drummer borrows a neutral frame. All 652 preceding public files remain byte-identical; the manifest contains 661 files. Validation passed 187 native tests (two existing ignored), 451 Bun tests across 111 files, four final scene checks, TypeScript, content/WASM verification, production build, all built public hashes and local HTTP checks of the direct route, app bundles and nine new media files. Actual desktop/phone Chromium software-WebGL checks passed loading, play/pause/seeking, camera controls and mobile width with no page errors; pixel inspection verifies that off-camera heads cannot leak through the side masks. The broad unchanged layout lint completed 224 views at eight sizes with one overlapping pair of `k` labels in the untouched solo gestural score and twelve truncation warnings. The unchanged clarity aid misheard 120/239 words and remains a diagnostic, not an intelligibility pass. Full real-time video recording was not retested. All twenty changed files uploaded with the entry page last; live verification matched 150 files, including the new media, app bundles, the direct route and nineteen preceding performances including the Greek mashup. The temporary publish job was removed.

The Queen — I Want to Break Free addition (`1184d75`, 15 November 2026) is live at `?scene=break-free`. It reconstructs the full supplied 4:32 video with the owner-approved actual physical singing, original accompaniment and intact instrumental synth/dance break, terraced rooftops, pink sleeveless top, mini skirt, bob, moustache and earrings, moving upright vacuum, patterned home and open staircase, three other household costumes, newspaper, kitchen, blue-lit crowd, cave, white box and black-and-white ballet pyramid/lift/roll. Three physical head graphics share one retained singer; the other people are decorative proxies. Concurrent Player commits `dd4003f`, `0547b38` and release notes `5c166f7` were incorporated before publication. All 661 preceding public files, including the nine Player assets, remain byte-identical; the manifest has 667 files. Validation passed 187 native tests (two existing ignored), 455 Bun tests across 112 files, four final focused timing/framing/seeking/ownership/upper-lip checks, TypeScript, content/WASM verification, production build and local HTTP checks. All seventeen changed files uploaded successfully with the entry page last; live HTTP checks matched 156 files, including the six Queen assets, app bundles and twenty preserved performances, plus the direct route. The temporary publish job was removed. The unchanged clarity aid remains a documented listening diagnostic rather than an intelligibility pass. Browser/GPU playback, layout lint and real-time recording were not retested for Queen because browser access remains declined in this chat.

The Björk — Human Behaviour addition (`b9fdbd5`, 15 November 2026) is live at `?scene=human-behaviour`. It reconstructs the complete supplied 4:15 video with the owner-approved physical singing and seven source-phone wordless passages, original accompaniment, miniature forest, animated giant plush bear, hunter, cabin and cereal bowl, spoon, moth and bulb, blue car and night road, floating water portrait, astronaut and moon journey, tiny singer in the purple bear belly and closing green world. Five head graphics share one retained singer; three bears and the other figures are decorative proxies. All 667 preceding public files remain byte-identical; the manifest contains 673 files. Validation passed 187 native tests (two existing ignored), 459 Bun tests across 113 files, four final focused timing/framing/seeking/ownership/occlusion checks, TypeScript, content/WASM verification, production build and local HTTP checks. The final hunter face polish was followed by focused checks and a fresh content-verified TypeScript/production build. All seventeen changed files uploaded successfully with the entry page last; live HTTP verification matched 162 files, including six new Björk assets, app bundles and twenty-one preserved performances, plus the direct route. The temporary publish job was removed. The unchanged clarity aid remains a documented diagnostic rather than an intelligibility pass, including penalties for nonverbal labels and spelling variants. Browser/GPU playback, layout lint and real-time recording were not retested for this scene because browser access remains declined in this chat.

The Eurythmics — Sweet Dreams addition (`57baea0`, 15 November 2026) is live at `?scene=sweet-dreams`. It reconstructs the complete supplied 3:34 video and recording with owner-approved physical singing, four source-phone wordless passages, continuous original music, orange cropped hair and black suit, boardroom and globe, moving gloves, analogue synth and live monitor, gold records, cows, blindfolded red-dress cello scenes, outdoor table, boat and cassette wake-up ending. Five head graphics share one retained singer. The complete fading audio continues under the bedroom tableau after the source picture goes black. All 673 preceding public files remain byte-identical; the manifest contains 679 files. Validation passed 187 native tests (two existing ignored), 463 Bun tests across 114 files, four focused timing/framing/seeking/ownership/occlusion checks, TypeScript, content/WASM verification, production build and local HTTP checks. Native projections were inspected across 27 views. All seventeen changed files uploaded with the entry page last; live HTTP verification matched 168 files, including six new scene assets, app bundles and twenty-two preserved performances, plus the direct route. The temporary publish job was removed. The unchanged clarity aid remains a documented listening diagnostic, including penalties for nonverbal labels. Browser/GPU playback, layout lint and recording were not retested because browser access remains declined in this chat.

The Nightwish — The Phantom of the Opera addition (`0d829a3`, 15 November 2026) is live at `?scene=nightwish-phantom`. It reconstructs the complete selected 4:44 official live video with the owner-approved two-voice physical duet and high open-vowel ending, source-timed English words and Finnish Kiitos, original instrumental music and ambient applause. Five physical heads borrow two retained models: gold coat/yellow handheld microphone and separate stand, long-haired bassist with split beard, guitarist, white keyboards and bandana drummer. Blue/purple/red beams, stage truss, backdrop, moving instruments and a waving crowd follow absolute source time. The saved-performance validator accepts a bounded register through 1600 Hz, tested against the unchanged physical source; engine, calibration and WASM remain unchanged. All 679 earlier public files remain byte-identical, including concurrent Human Behaviour and Sweet Dreams additions; the manifest contains 686 files. Validation passed 187 native tests (two existing ignored), the final 469-test Bun suite across 115 files, 31 focused scene/catalog/high-register cases, TypeScript, content/WASM verification, production build, built asset hashes and local HTTP checks. Actual desktop/phone Chromium software-WebGL checks passed playback, pause/seeking, cameras, mobile width and corrected active-microphone/side-mask views without page errors. The unchanged broad layout lint completed 224 views at eight sizes with one old solo-score `k` overlap and twelve truncation warnings; the unchanged English clarity aid misheard 139/169 words and remains a documented diagnostic. Full real-time video recording was not retested. All eighteen deployment files uploaded with the entry page last; live verification matched 175 files, including the direct route, new media/app bundles and twenty-three previous performances. The temporary publish job was unloaded.

The Annie Lennox — Walking on Broken Glass addition (`89fb332`, 15 November 2026) is live at `?scene=walking-broken-glass`. It reconstructs the complete supplied 3:59 video and recording with owner-approved physical singing, continuous original music, red wrapped hood and embroidered gown, gold jewelry/cuffs, powdered wigs, fans and goblets, candlelit party, chandelier, jealous guests, corridor quarrel and embrace, spiral stairwell, descent and carried finale. One retained physical singer is accompanied by seventeen decorative guest proxies. The final camera fixes keep the stair flight and room walls clear of faces and align the foreground rescue with its source cut. All 686 preceding public files remain byte-identical, including Sweet Dreams and Nightwish; the manifest contains 692 files. Validation passed 187 native tests (two existing ignored), 473 Bun tests across 116 files, four focused timing/framing/seeking/ownership/occlusion checks, TypeScript, content/WASM verification, production build, built hashes and local HTTP checks. Twenty native geometry views and five final detail views were inspected. All seventeen changed files uploaded with the entry page last; live HTTP verification matched 181 files, including six new scene assets, app bundles and twenty-four preserved performances, plus the direct route. The seven live Nightwish media files were verified separately and preserved without re-uploading. The temporary publish job was removed. The unchanged clarity aid remains a documented listening diagnostic. Browser/GPU playback, layout lint and real-time recording were not retested because browser access remains declined in this chat.

The Duran Duran — The Wild Boys addition (`14f7f6a`, 15 November 2026) is live at `?scene=wild-boys`. It reconstructs the complete supplied 4:13 video and recording with owner-approved physical singing and calls, continuous original music, industrial factory and maze, mechanical head and shoulder pods, monitors, rotating four-bladed windmill and bound singer, buckled vest and restraints, water/splashes/bubbles, platforms, cages, chains, drums, guitar, bass, keyboard, punk dancers, flames, coloured beams and closing rain. Three physical head graphics borrow one retained singer; twelve other figures are decorative proxies. All 692 preceding public files remain byte-identical; the manifest contains 698 files. Validation passed 187 native tests (two existing ignored), 477 Bun tests across 117 files, four focused timing/framing/seeking/ownership/occlusion cases, TypeScript, content/WASM verification, production build, built hashes and local HTTP checks. Twenty-four native geometry views and four final mechanical-head/monitor views were inspected. All seventeen changed files uploaded with the entry page last; live HTTP verification matched 187 files, including six new scene assets, app bundles and twenty-five preserved performances, plus the direct route. The temporary publish job was removed. The unchanged clarity aid remains a documented listening diagnostic. Browser/GPU playback, layout lint and real-time recording were not retested because browser access remains declined in this chat.

The Cure — Lullaby addition (`55f2070`, 15 November 2026) is live at `?scene=lullaby`. It reconstructs the complete supplied 4:10 video and recording with owner-approved physical singing, spoken ending and original music, including the long instrumental opening. The bedroom includes the iron bed, striped pyjamas, tousled hair and dark eye makeup, white pillows and red blanket, window hands and lace, gradual cobwebs, wall figure, looming spider, trapped singer and swallowing imagery. Four red-uniform band proxies play bass, guitar, snare and brass. Three physical heads borrow one retained singer. Web fades use true material opacity and empty early buffers, with regression coverage for the premature black-mark bug. All 698 earlier public files remain byte-identical; the manifest contains 704 files. Validation passed 187 native tests (two existing ignored), 481 Bun tests across 118 files, four focused timing/framing/seeking/web/ownership/occlusion cases, TypeScript, content/WASM verification, production build, built hashes and local HTTP checks. Twenty-six native geometry views were inspected after the fade fix. All seventeen changed files uploaded with the entry page last; live HTTP verification matched 193 files, including six new scene assets, app bundles and twenty-six preserved performances, plus the direct route. The temporary publish job was removed. The unchanged clarity aid remains a documented listening diagnostic. Browser/GPU playback, layout lint and real-time recording were not retested because browser access remains declined in this chat.

## Verified seven-video release · 15 November 2026

Runtime commit `c11028ff9f728e688924e1ef4b5309f80828b25f` adds the complete Darkness,
Crucified, Go West, Remember the Time, Shock the Monkey, You Spin Me Round and
No Surprises scenes. All seven vocal auditions were approved. The collection now has
52 concert/music-video performances and 752 prepared public files; every one of the
704 preceding media hashes is preserved.

195 native tests passed (two pre-existing ignored), 525 Bun tests across 126 files
passed, and typecheck, content verification, static build and local HTTP checks passed.
The upload completed with 67 changed files, media first and index.html last, and
`DEPLOY_EXIT=0`. Live SHA-256 verification matched 251 files, every current app bundle,
all seven new direct routes and 27 preserved performances. The temporary Mac GUI 501
job was unloaded and removed. Browser playback/layout/export were not retested.
See [the complete release notes](docs/music-video-batch-20261115.md).

## Black Hole Sun · 16 November 2026

Runtime `e9fde3ae43f2282b5dec2c8fdc4f8a4e960f768d` adds the full approved physical-voice performance at
`?scene=black-hole-sun`. The verified 758-file public build preserves all 752
preceding assets. The existing Mac mini uploader published only 17 changed
files, media first and index last, and exited successfully. All 257 checked
live files and the clean new route matched the build, including all current
app bundles and 34 preceding performances. The temporary task launchd job
and plist were removed. No source recording, frame, stem or model cache was
uploaded. See [the scene and validation notes](docs/black-hole-sun.md). Browser
playback/export/layout remain untested in this chat because access was declined.

## Land of Confusion · 16 November 2026

Runtime `a410c9fb01b5d04369a1c0673ffbb47136ffaf5d` adds the full approved physical-voice puppet performance at
`?scene=land-confusion`, including its bedroom dialogue. The verified 766-file
public build preserves all 758 preceding assets. The existing Mac mini uploader
published only 19 changed files, media first and index last, and exited
successfully. All 265 checked live files and the clean new route matched the
build, including every current app bundle and 35 preceding performances. The
temporary task launchd job and plist were removed. No source film, raw frame,
stem or model cache was uploaded. See [the scene notes](docs/land-confusion.md).
Browser playback/export/layout remain untested because access was declined.

## Rock DJ · 16 November 2026

Runtime `6051e2365fff909ae7aaeafc573663e3af48cd71` adds the full approved physical-voice roller-disco performance
at `?scene=rock-dj`, including the skeleton transformation and sung credit
ending. The verified 772-file public build preserves all 766 preceding assets.
The existing Mac mini uploader published only 17 changed files, media first
and index last, and exited successfully. All 271 checked live files and the
clean new route matched the build, including every current app bundle and
36 preceding performances. The temporary task launchd job and plist were
removed. No source film, raw frame, stem or model cache was uploaded. See
[the scene notes](docs/rock-dj.md). Browser playback/export/layout remain
untested because access was declined.

## Babooshka · 16 November 2026

The complete supplied Kate Bush double-bass and warrior-costume video is live
at `?scene=babooshka`, with the owner-approved physical singing and original
music, three delayed title calls and the full instrumental dance ending.
Two physical head graphics borrow one retained singer. The verified 778-file
public build preserves all 772 preceding assets. Runtime commit `a6f8b15`
was pushed before all 17 changed files uploaded successfully, entry page last.
Live verification matched 277 files, including every current app bundle,
the six new scene files and 37 preserved performances, plus the clean direct
route. The temporary publish job was removed. Validation passed 195 native
tests (two existing ignored), 541 Bun tests across 130 files, TypeScript,
content/WASM checks, production build, built hashes and local HTTP delivery.
The unchanged clarity aid is diagnostic; see [the notes](docs/babooshka.md).
Browser playback/export/layout remain untested because access remains declined
in this chat.

## Danger! High Voltage · 16 November 2026

The complete supplied Electric Six video is live at `?scene=danger-voltage`,
with the approved physical duet, original music, repeated closing calls and
instrumental tail. The green drawing room, glowing costumes, dance and embrace,
moose ride and red-curtain saxophone finale use eight graphics borrowing two
retained singers. Runtime commit `073e649` was pushed before all 18 changed
files uploaded successfully, entry page last. All 284 checked live files match,
including every current app bundle, seven new assets and 38 preserved
performances, plus the clean route. The temporary uploader job was removed.
All 778 earlier public files are byte-identical; the manifest contains 785 files.
Validation passed 195 native tests (two existing ignored), 545 Bun tests across
131 files, TypeScript, content/WASM checks, production build, built hashes and
local HTTP delivery. The unchanged clarity aid is diagnostic; see
[the performance notes](docs/danger-voltage.md). Browser playback/export/layout
remain untested because access remains declined in this chat.

## Losing My Religion · 16 November 2026

The full supplied R.E.M. video is live at `?scene=losing-religion`, with the
approved physical singing, original instrumental music, full opening and ending,
62 phrases/captions and 86 camera cues. The amber room and winged scene share
one retained singer; band and allegorical people are clothed animated proxies.
The other sets include the blue garden, masks, symbolic arrows, gold wings,
old angel workshop, flame portrait, red curtains and black winged structure.
Runtime commit `8f2de35` was pushed before all 17 changed files uploaded
successfully, entry page last. Live checks matched 290 files, including every
current app bundle, six new assets and 39 preserved performances, plus the clean
direct route. The temporary uploader job was removed. All 785 earlier public
files remain byte-identical; the manifest contains 791 files. Validation passed
195 native tests (two existing ignored), 549 Bun tests across 132 files,
TypeScript, content/WASM checks, production build, built hashes and local HTTP
delivery. The unchanged clarity aid is diagnostic; see
[the performance notes](docs/losing-religion.md). Browser playback/export/layout
remain untested because access remains declined in this chat.

## Loser · 16 November 2026

The full supplied Beck video is live at `?scene=beck-loser`, with the approved
physical rap, eight Spanish refrains, driver dialogue/asides and continuous
original instrumental music. The cut-up reconstruction includes the yellow
shirt, monochrome portraits, stop-motion coffin, white suit, red graveyard,
stock cars, night stage and departure with guitar case and dog. Seven head
graphics borrow two retained voices. Runtime commit
`28a0c15c1b8b81ee6377680987aad68b9c4193a5` was pushed before all 18 changed
files uploaded successfully (`DEPLOY_EXIT=0`), media first and index last.
Live checks matched 297 files, including every current app bundle, seven new
scene assets and 40 preserved performances, plus the clean direct route.
The temporary upload job and plist were removed. All 791 earlier public files
remain byte-identical; the manifest contains 798 files. Validation passed
195 native tests (two existing ignored), 553 Bun tests across 133 files,
TypeScript, content/WASM checks, production build, built hashes and local HTTP
delivery. Only documentation changed after the verified build. See
[the performance notes](docs/beck-loser.md). Browser playback/export/layout
remain untested because access remains declined in this chat.

## Espresso Macchiato · 16 November 2026

The complete supplied Tommy Cash official video is live at
`?scene=espresso-macchiato`, with original instrumental music and physical
vocals, including the owner-approved clearer English verses. The reconstructed
scene includes the boxes, two suits, split portraits/dance, costume fusion,
giant coffee ingredients, apron/security dancers, lift, swing and flying beans.
Seven physical head graphics share one retained singer. Runtime
`01213a9110d07277926feb1449900269cd611fe4` was pushed before all 17 changed
files uploaded successfully (`DEPLOY_EXIT=0`), media first and index last.
Live checks matched 303 files, including every current app bundle, six new scene
assets and 41 preserved performances, plus the clean direct route. The temporary
upload job and plist were removed. All 798 earlier public files remain
byte-identical; the manifest contains 804 files. Validation passed 195 native
tests (two existing ignored), 557 Bun tests across 134 files, TypeScript,
content/WASM checks, production build, built hashes and local HTTP delivery.
Only documentation changed after the verified build. See
[the performance notes](docs/espresso-macchiato.md). Browser playback/export/layout
remain untested because access remains declined in this chat.

## APT. · 16 November 2026

The full supplied ROSÉ and Bruno Mars video is live at `?scene=apt`, with the
approved physical Korean/English duet, original music and full opening/ending.
The pink studio includes drums and performer swaps, microphones, costumes,
paper heads, star glasses, floor gag, circular views, silhouettes, guitars
and dance. Six physical head graphics borrow two retained models. Runtime
`d8a4cbf7234d120ae4bd4de50c4a4b53d6123b28` was pushed before all 18 changed
files uploaded successfully (`DEPLOY_EXIT=0`), media first and entry page last.
Live checks matched 310 files, including every current app bundle, seven new
scene assets and 42 preserved performances, plus the clean direct route.
The temporary upload job and plist were removed. All 804 earlier public files
remain byte-identical; the manifest contains 811 files. Validation passed
195 native tests (two existing ignored), 561 Bun tests across 135 files,
TypeScript, content/WASM checks, production build, built hashes and local HTTP
delivery. Only documentation changed after the verified build. See
[the performance notes](docs/apt.md). Browser playback/export/layout remain
untested because access remains declined in this chat.

## Abracadabra · 16 November 2026

The complete supplied Lady Gaga video has the owner-approved clearer English
physical voice and original music, red/white costumes, flowing cape, spiked queen
hat and cage, 32 dancers, floor choreography, circles and lifts. Three graphics
borrow one retained model. Absolute source time restores costumes, cloth, poses
and cameras. The rear camera stays inside the hall to avoid its back wall. See
[the performance notes](docs/abracadabra.md).

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

## bad guy · 16 November 2026

The complete supplied Billie Eilish video has the approved physical voice,
spoken opening, singing, calls and red-room ending with original instrumental
music. Six costume graphics borrow one retained singer. Yellow paper, oversized
clothes, toy car and distinct riders, pigeons/cereal, desert, goggles and water
bags, spiral and push-up room follow absolute source time. The manual camera
fallback now reads each scene's catalog, correcting recent videos' courtroom
choices. See [the scene notes](docs/bad-guy.md).

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

## MONTERO · 16 November 2026

The complete supplied Lil Nas X fantasy video has the approved physical
narration, singing, rap and actual nasal humming with original instrumental
music and ambience. Nine role graphics borrow one retained singer. Eden and
serpent, flowers and pink guitar, blue wigs and pink fur, trial and chains,
ascent and wings, inverted pole descent, lava, throne and final horns follow
source time. Pole grips use world coordinates; the decorative defeated figure
leaves the final portraits. See [the scene notes](docs/montero.md).

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

## Taste · 16 November 2026

The complete supplied Sabrina Carpenter horror-comedy video has approved
physical lullaby, singing and calls, distinct closing dialogue and original
instrumental music. Eleven costume graphics borrow two retained performers.
The vanity, bedroom and balcony, pink hospital gown and nurse, gurney and
paddles, lounge and fire, feathered stairs, pool and theatrical prop saw,
black funeral dresses and coffee-cup walk follow source time. Standing nurses
and the intruding singer stay upright; seated gowns cover their posed legs.
All visible physical heads stay clear of opaque sets and costume ornaments.
See [the scene notes](docs/taste.md).

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

## SKIBIDI · 17 November 2026

The complete supplied Little Big video has physical English singing and
explicit rapid nonsense syllables over original instrumental music and
retained effects. Nine costume graphics borrow one retained model. Bent
wrists, chest-height reciprocal fists, raised knees and heel taps follow
132 BPM. Street vignettes, aerobics trio, pub, bathroom, overhead bed, park,
alley crowd and giant rooftop reveal follow source time. The bed camera
restores its up vector and every visible physical head stays clear of opaque
sets and costume ornaments. See [the scene notes](docs/skibidi.md).

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

## Manchild · 17 November 2026

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

## Aperture · 17 November 2026

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

The Zara Larsson — Blue Moon addition (`47f3ea8`, 18 November 2026) is live at `?scene=zara-blue-moon`. It reconstructs the complete supplied 3:14 film with the owner-approved physical lead, original accompaniment, the dusk service lane, the neon motel lot with mermaids and fairies, the fairy flight, the bus shelter, the surf, the seated moonlight shot and the aquarium. The upstream OK Go — Love release was integrated first; the new scene is catalogued after it, and all 991 preceding public assets remain byte-identical. The manifest contains 997 files and 82 concert/music-video performances. Validation passed 667 Bun tests across 162 files, the native workspace suite, TypeScript, content/WASM verification, the base-path production build and local HTTP delivery. All 17 changed files uploaded with the entry page last, and live SHA-256 checks matched every one, plus preserved Love, SS26 and Abracadabra files. Chromium loaded the live route, sought all nineteen inspected timestamps, kept the recorder available and reported no console errors; the preserved Love and SS26 routes also mounted without errors. The temporary publisher job and its plist were removed. Layout lint still reports only the three existing Sing and score canvas-text overlaps.
