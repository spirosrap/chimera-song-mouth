# Player — Baby Come Back

The scene uses the complete supplied 640 × 480 performance (about 4:10), including its long instrumental opening and guitar/drum ending. The source recording is private in the owner's Videos folder. It is not embedded in the site or committed to Git.

Five physical heads represent the five musicians: blue-shirted lead in a dark vest and pale trousers, red-shirted bassist, white-jacketed guitarist, blue keyboard player and blond drummer. The stage includes the two keyboards, three front microphones and keyboard microphone, guitars and bass, drum riser, toms, kick, cymbals, amplifiers, monitors and cables. Source-time camera cuts, profile views, hands, strumming and drumsticks accompany the performance. Scenery, likenesses and shot timing are stylized approximations.

Four independently rendered CHIMERA voices sing the lead and supporting refrains. The drummer remains vocally silent and borrows a neutral head frame from the lead model. Supporting registers are estimated from the combined source vocal spectrum, not independently recovered original singers. The owner approved the 29-second first-chorus preview. Complete aligned consonants, held vowels, late diphthong glides and continuous source pitch use the existing physical engine without engine/calibration changes. There are no source-vocal samples, clones or vocal effects in the generated channels. The original instrumental accompaniment stays continuous at the supplied speed; faint separation traces may remain.

`public/scenes/player-baby-come-back/` contains the scene, performance score, original-music backing, complete mix, four compressed mouth-telemetry tracks and credits. Telemetry uses the exact 20 Hz audio clock. Each visual head borrows a retained model lease owned by `MovieStage`; stage disposal frees graphics only. All poses and camera targets derive from absolute source time, including backwards seeks and pause.

Rebuild using `bun tools/render-player-baby-come-back-scene.ts`, then verify the complete audio before updating the content manifest. The rebuild uses the existing instrumental MP3 and physical score; raw recordings, local transcription, separated stems, pitch/phone models and analysis caches stay outside the repository.

Focused checks cover the full duration, independent physical parts, every audible phrase, silent opening/outro, exact telemetry clock, deterministic instruments/cameras, five heads, four model leases, phone/wide framing and borrowed-model ownership. Browser/GPU and recording verification are reported separately from native projections and tests.

The unchanged `scene-clarity.py` listening aid misheard 120 of 239 words (50.2%) in the mixed short-caption excerpts. This is a diagnostic for robotic singing, not a successful intelligibility score; the owner approved the separate 29-second chorus by listening. Do not change the aid or characterize its result as a pass.
