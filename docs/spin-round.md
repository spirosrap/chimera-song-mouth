# You Spin Me Round

The complete supplied Dead or Alive music video is available at `?scene=spin-round`. It keeps the original instrumental recording at its supplied speed and replaces the featured singing with the physical CHIMERA airway. The source audio lasts 196.653 seconds; the prepared score includes a 0.35-second release, for 197.003 seconds total.

The owner approved the 30.25-second two-excerpt MP3 on 15 November 2026. Its body blend, complete phones, connected vowels, late diphthong glides and continuously measured melody are the same as the full performance. The source transcription has 302 words, 342 syllables and 43 subtitle lines. The prepared lead has 20 physical phrases. The second opening “I” begins after the measured instrumental rest, rather than being pulled into the first syllables by low-confidence recognition. A regression checks both the silent gap and the repeated entry. This timing correction lies outside both approved audition excerpts, whose plans remain unchanged. The final held calls follow the recording's fading energy; the instrumental window before the second verse remains quiet in the generated voice.

`src/scene/spin-round.ts` contains the absolute source-time poses, camera framing and 29 source cuts. `src/ui/render/spin-round.ts` renders three looks sharing a single borrowed singer: the purple velvet costume, gold-framed portrait and black eye-patch outfit. Swept hair, gold cuffs and belt, mirrored ball and bow, blue and purple backgrounds, extra arms, rotating back-to-back band, metallic flag dancers, circling ribbons and falling sparkles follow the source clock. Other band figures are decorative animated proxies. The stage disposes only its own graphics and never the borrowed `VoiceModel`.

The generated channel contains no original singer samples, cloning, vocoder or effects applied to the original voice. Recorded doubles are not independently reconstructed. The instrumental backing is separated from the supplied recording and can retain faint separation traces. Transcription, pronunciation, measured melody, poses, costumes and likenesses remain approximate. The source film, frames, stems and analysis models are not included.

The six prepared files live in `public/scenes/spin-round/`. `bun tools/render-spin-round-scene.ts` rebuilds the physical voice, original-music mix and exact 20 Hz mouth snapshots using the prepared score, tracked WASM and ffmpeg; it needs no source video or analysis models. After a rebuild, listen, run the scene checks and regenerate the media manifest.

Native Three.js projections and geometry checks cover the costumes, portrait, eye patch, band, mirror ball, extra arms, flags, ribbons and phone framing. The focused regression checks validate the complete source extent, audible phrases, finite source-clock telemetry, cast/camera isolation, backward seeks, clear lead mouth and retained model ownership. Browser playback, layout and recording QA were not run because browser access remains declined in this chat.

Final checks: all 20 tests across the two scene files and three shared catalog suites pass (19,209 assertions), as does TypeScript checking. The final decoded Spin mix peaks at 0.9218; all 20 generated phrases are audible, all 3,941 snapshots are finite and exact on the source clock, and all 704 preceding public asset hashes are unchanged. Both approved audition files retain their original SHA-256 hashes.

See the [combined release notes](music-video-batch-20261115.md) for full regression,
content-manifest, diagnostic and live-deployment results.
