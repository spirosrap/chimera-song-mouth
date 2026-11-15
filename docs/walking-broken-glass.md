# Annie Lennox — Walking on Broken Glass

Open `?scene=walking-broken-glass`. The complete owner-supplied official video and recording, approximately 3:59 including the quiet ending, is reconstructed with original accompaniment and actual physical mouth-engine singing. The owner approved the validated 40.05-second, two-excerpt audition covering the first verse and later stronger phrases: “Sounds good—use this version.” Pause after this finished performance before continuing the earlier list.

## Physical singing

The unchanged CHIMERA airway generates the voice through `planPart` → `planPerformance` → `renderPart`. The generated channel contains no recorded singer samples, cloning, vocoders or effects applied to the original singer. Mouth telemetry is captured during synthesis.

Recognition of the supplied video and isolated vocal supplies rough word windows. Corrected words are aligned to dictionary phones; complete consonants, connected vowels, late diphthong glides and measured continuous source pitch preserve the English phrasing. Repeated hooks were checked separately against the isolated vocal because the first full-track recognizer substituted unrelated words near the ending. The featured source line is followed by one physical singer; recorded doubles and overlapping backing layers are not independently reconstructed. Transcription, pronunciation, word timing and melody recovery remain approximate.

The score has 293 corrected words, 365 dictionary syllables/notes and 38 connected physical phrases. Forty-one lyric captions and 36 camera cuts follow the source clock. The lead keeps the approved female body blend 0.62, pressure 7.8, brightness 0.48, tension 0.54 and breathiness 0.025, with zero random drift and no added vibrato. The final breath follows the fading recording.

Original instrumental accompaniment stays continuous at the supplied speed. Uniform gain, resampling and MP3 encoding apply; faint original vocal traces and separation artifacts may remain. No interval is restored from the complete source recording. Audio is 48 kHz and mouth snapshots follow the exact 20 Hz source clock.

## The period-costume party

The source was inspected throughout, with additional hood, party, lovers, quarrel and staircase views. The procedural reconstruction follows the red wrapped hood, gold earrings, choker, embroidered red gown, gold cuffs and gesturing hands; powdered wigs, large blonde updos, lace-like cravats, coats and wide gowns; moving fans and goblets; candlelit room, chandelier and crystals, wall panels, columns, fireplace, portrait, flowers and table; jealous burgundy-coated guest, cream-coated lover and blonde partner; corridor quarrel and embrace; spiral stairwell, descent and carried finale.

One physical head and one retained singer move between the party, curtained portrait, corridor and staircase sets. Seventeen decorative guest proxies include the featured party trio, twelve additional guests and the two later lover instances. They do not generate extra voices. Fingers, fans, cups, heads, limbs, skirt, flames, chandelier and camera targets derive from absolute source time, so paused and backward seeks restore each tableau.

The stair camera follows the outward side of the descent, and the stairwell walls stay beyond its path. The final couple stand in front of the stair flight so faces remain visible during the carried pose and closing embrace. Regression checks cover the staircase/face occlusion, both final faces and the overhead camera up-vector. Only stage-owned lines use normal blending and depth testing; other scenes' shared neon materials remain unchanged. Disposal frees owned graphics and leaves the borrowed voice model with `MovieStage`.

Costumes, scenery, acting, gestures, transitions, choreography and likenesses are stylized approximations. The film, photographs and logos are not embedded. The source's outer black borders are not reproduced. The party and romantic action are procedural tableaux rather than exact filmed choreography.

## Rebuilding and validation

The six prepared files contain the explicit phonetic score, instrumental backing, full mix, compressed telemetry, source-timed scene/captions/cameras and credits. Source video, separated stems, model weights and analysis stay private outside the repository.

```sh
bun tools/render-walking-broken-glass-scene.ts
bun run content:manifest
bun run verify:content
```

The prepared score, backing, tracked WASM and ffmpeg suffice to rebuild the voice, mix and mouth movement. All 686 preceding public files, including Sweet Dreams and the concurrent Nightwish addition, remain byte-identical. The new manifest contains 692 files.

The performance lasts 239.376213 seconds, with 11,490,059 synthesized audio frames and 4,788 mouth snapshots. Both MP3s decode to 11,490,095 frames; all 36 extra frames were verified to be zero end-padding. All 38 physical phrases are audible, and the instrumental opening, middle break and ending are vocally quiet. The decoded mix peaks at 0.91789 with no clipping; the final uniform headroom multiplier is 0.93421009.

The unchanged scene-clarity listening aid reported 190 errors among 293 normalized caption words (64.8%) over all 41 excerpts. It is a listening diagnostic, not an intelligibility pass. The owner approved the actual two-excerpt audition, and the voice settings remain unchanged. The judge was not edited.

Browser, Playwright and layout-lint access remain declined in this chat. Native geometry projections and tests do not verify browser/GPU playback or real-time recording/export interaction.

Validation passed 187 native tests (two existing ignored), 473 Bun tests across 116 files, TypeScript, content/WASM verification and the production build. Four focused scene tests cover complete audible physical phrases, exact source-clock telemetry, quiet instrumental stretches, direct backward seeking, phone/landscape head framing, clear final faces, stair-flight/camera occlusion, the cut into the rescue, overhead up-vector restoration and retained-model ownership. Twenty native geometry views were inspected, with five final costume, corridor and staircase close-ups checked after framing fixes. These are not browser screenshots.

Local HTTP checks matched all 692 built media files to the manifest and served the direct route, app bundles and six new media files correctly. The seven concurrently deployed Nightwish files were also verified against their live hashes and preserved without re-uploading.

## Live release

Application commit `89fb332` is live at [Walking on Broken Glass](https://agenticspiros.com/chimera-song-mouth/?scene=walking-broken-glass). All 17 changed files uploaded with the entry page last. Live verification matched 181 files, including the six new media assets, app bundles and twenty-four preserved performances, plus the direct scene route. The concurrent Nightwish files remain unchanged. The temporary publish job was removed. Browser/GPU playback and real-time recording remain untested for this scene.
