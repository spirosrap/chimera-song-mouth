# Celentano — the classroom

Open `?scene=celentano`. This adds the complete supplied Rai *Formula Due* classroom performance of **Prisencolinensinainciusol**, alongside the existing songs and scenes.

The source is 224.606625 seconds. The prepared scene lasts 225.206625 seconds, including a 350 ms lead-in and a 250 ms release. The instrumental break, harmonica solo, dancing class and final cut are retained.

## Physical singing and reference timing

CHIMERA's actual mouth engine generates both the lead and answering voice. The prepared score contains 24 lead phrases (801 phones) and five answering phrases (102 phones), explicit phone durations, continuous reference pitch and source-envelope breath contours. The two voices use different adult body blends. There is no recorded singer, voice filter or vocoder in either generated vocal channel.

The song intentionally sounds like American English without being ordinary English. Local phonetic recognition supplies acoustic landmarks; the score uses an American-English phone inventory, including rhotic `r` and familiar vowel shapes. Consonants retain their individual measured positions instead of being packed immediately before the next vowel. That earlier approach prolonged vowels and distorted the speech-like phrasing. The owner rejected the first version and the delay-only correction, clarified that the American-speech illusion was missing, then approved the revised phonetic delivery.

The lead gestures anticipate the acoustic response by 35 ms and the answering voice by 50 ms. The music, camera cuts and captions retain the shared source timeline. Breath contours follow the recording at 25 ms intervals. This is an approximate phonetic reconstruction, not a claim of an exact transcription or identical vocal performance.

Automatic English word recognition invented sentences from the nonsense. Those sentences were not used as lyrics. The 44 captions are explicitly an approximate phonetic guide. The unchanged English speech diagnostic completed, but its word error rate against these phonetic captions does not measure fidelity to this deliberately nonlexical song.

The original band is separated continuously through vocal passages. The instrumental intro break and complete harmonica ending use original audio. Separation can leave faint vocal traces. The source recording, raw stems, model weights and analysis caches remain outside the repository.

## Classroom staging

`ClassroomStage` shows the teacher with glasses, sideburns, long coat and blue tie, twelve students at desks, books, chairs, a teacher's counter and globe, science props, tall arched windows, green leaf patterns, letter panels, suspended coloured balls and a studio audience.

Five foreground heads use real physical anatomy: the lead and four students. The four students share the answering voice's telemetry and one retained model lease. Eight additional classmates and thirty audience figures are lightweight decorative figures. They do not represent additional synthesized voices.

The teacher conducts the opening, gestures, points, visits desks and dances. The students answer, clap and stand to dance during the finale; the featured student raises a harmonica. Motion follows 400 measured beat markers and absolute scene time, so seeking and restarting do not accumulate timing drift. Camera views follow the supplied video approximately, with separate teacher, class, side, audience and harmonica views. The original video is not embedded.

The stage disposes its own graphics and leaves borrowed voice models to their owning leases. Outside-camera walls are hidden so wide and narrow views remain visible.

## Rebuild and verification

`public/scenes/celentano/` contains seven prepared assets: scene metadata/captions, performance score, final mix, original backing, two compressed telemetry tracks and credits.

To regenerate the prepared voice audio and telemetry from the committed score and backing:

```sh
bun tools/render-classroom-scene.ts
bun run content:manifest
```

The renderer checks finite, non-silent output before replacing prepared assets. Audio checks cover full duration, non-clipping output, every phrase, quiet instrumental passages and telemetry coverage. Scene tests cover complete content, physical plans, seeking, camera framing, props, model ownership and resource disposal. Native projected views are used to inspect the classroom.

Browser, Playwright and layout-lint access remain declined in this session. Browser playback, browser rendering and recording/download interaction have not been tested. The full native/Bun tests, TypeScript checks, content hashes, production build, local HTTP serving and deployed-file checks are the verification path.

Validation for this addition: 144 native tests passed (two existing tests ignored), 287 Bun tests passed across 73 files, TypeScript passed, and the production build verified all 419 public assets. All 412 earlier public assets are byte-identical to the baseline. Local HTTP checks cover the direct route, app bundles and all seven scene assets.
