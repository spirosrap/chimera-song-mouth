# Boyz II Men — I’ll Make Love to You

Open `?scene=ill-make-love-to-you`. This adds the complete supplied 260.017052-second official video, plus a 0.35-second release, for 260.367052 seconds (4:20). Its spoken security-system visit, full song and quiet closing letter reading are retained alongside all earlier selections.

## Approved quartet and original music

The owner approved the validated 88.5–113.5 second first-chorus preview: “Sounds good—use this.” The full performance preserves all four voices’ exact approved phones, continuous contours, harmony paths and settings. The common final headroom trim changes only the master level.

The physical quartet has a lead, tenor harmony, baritone harmony and bass harmony. Female body blends are 0.08, 0.19, 0.01 and 0 respectively, with no child blend, added vibrato or random drift. Pressures are 7.5, 7.7, 7.3 and 7.1; brightness is 0.47, 0.52, 0.44 and 0.40. All use breathiness 0.03 and tension 0.53. The original stereo accompaniment remains continuous at the supplied speed.

The lead has 306 source words, 337 syllables, 28 connected phrases and 2,789 pitch/breath points. Each supporting harmony has 212 syllables, 15 phrases and 1,669 contour points. Complete consonants, held vowels and late diphthong glides follow locally aligned dictionary phones. Separate short source crops recover the soft first verse that both long-window recognizers initially missed. A 174 ms trim to the held vowels before the first chorus retains every consonant while preserving the approved chorus entry.

Supporting pitches are estimated from the polyphonic vocal spectrum using harmonic templates and smooth register paths. They are not separate isolations of each original singer. The lead follows measured source pitch; harmony voicing and all transcription remain approximate. The four physical voices contain no recorded singer samples, voice clone, vocoder or recorded-vocal effects. Telemetry is captured during synthesis.

Continuous separated source accompaniment/background starts at zero. There is no copied recorded-vocal prefix. Separation can leave faint recorded voices or artifacts. Original input video, stems, models, weights, alignment data and intermediate renders remain local and outside Git.

## Physical spoken opening

Dwayne and Miss Sparks use two additional retained physical models (body blends 0.04 and 0.76). The spoken opening has 89 male and 16 female words across nine and five utterances. It uses CHIMERA’s native English front end and `clearPhrases` with `CLEAR_SPEECH_TIGHT`, preserving the planner’s natural consonants, vowel stress, breath breaks and question intonation. Baseline pitches are 145 Hz and 210 Hz; pressure is 7.5, brightness 0.50 and 0.55, breathiness 0.02 and tension 0.53.

The dialogue’s complete native gesture plans are stored in `dialogue.json`. The arrangement’s `speech` entries identify the lines, but the prepared control plans are authoritative for the rebuild. Speaking rates stay between 0.9 and 1.45. Small adjustments within the opening’s quiet gaps give the fastest lines more room and avoid overlapping the replies; the music and approved chorus keep their original clock. Mouth movement comes from the same actual airway render as each voice.

## Complete video staging

Thirty-seven absolute-time camera cuts follow the warm foyer with wrought balcony and palms, two installers, security keypad and toolbox, wood-panelled writing room, silver desk lamp, pen, paper and framed portrait. Four distinct ivory outfits include a sleeveless waistcoat, long coats, white cap and cane. The populated performance room has tall curtains, a staircase, candles and warm wood. Blue-lit portraits and overlapping singer images alternate with the story.

The woman changes from a white T-shirt and loose hair to an ivory robe at the candlelit vanity, then an updo and floral robe while reading the letter. The perfume bottle, folded letter, pen strokes, hand gestures, source-like 4:3 pillarbox and final fade use source time. The letter stays below the mouth so the face remains visible. Portrait framing removes the pillarbox and reframes the actual anatomy.

All six voices keep their model leases for the mounted scene. The stage borrows these models and releases only its own graphics. Decorative helpers allocate no voice models. All rooms, costumes, hand poses, writing, reading, camera states and fades restore directly after seeking. Likenesses, exact actions and optical transitions remain stylized approximations.

## Rebuild and verification

Twelve prepared files contain the singing score, native dialogue controls, full mix, original backing, six compressed telemetry tracks, scene/caption/camera data and credits.

```sh
bun tools/render-ill-make-love-to-you-scene.ts
bun run content:manifest
bun run verify:content
```

The stereo render has 12,497,619 audio frames. All six mouth tracks have 5,208 frames at 20 Hz. The mix contains 59 caption windows and 37 camera cuts. Each prepared utterance has measurable sound; checks protect silence before and after the voices’ active sections. Source-aligned singing and native dialogue are rebuilt through their respective actual engine plans.

All 574 earlier public files must remain byte-identical; this addition brings the manifest to 586 files. Five focused regression tests protect the complete duration, opening and ending, all six voices and independent harmony paths, source-clock telemetry, quiet rests, all rooms, keypad hand, writing pen, cap/cane, perfume, letter, exact seeking, 4:3/portrait framing and borrowed model ownership.

Native geometry projections cover the complete scene and portrait views. Browser, Playwright and layout-lint access remain declined in this chat. Native projections and HTTP delivery checks do not verify GPU lighting, browser playback or real-time recording/export interaction.

The finished mix applies a common 0.797077 headroom trim and the decoded MP3 peaks at 0.916512. The quietest sung phrase has RMS 0.066683; the two opening voices have minimum utterance RMS 0.099022 and 0.086499.

Ninety-six stable singing waveform windows were measured against the prepared contours. Two octave-ambiguous YIN results were checked independently with autocorrelation and the waveform spectrum; no score pitches were changed to match the measurement. The largest verified fundamental difference is 51.54 cents. This checks synthesis against its prepared contour, not a perfect transcription of the original harmony.

The unchanged English scene-clarity listening aid misheard 153 of 411 words (37.2%): 117 of 306 sung words, 28 of 89 male dialogue words and 8 of 16 female dialogue words. The native speech pass reduces the opening’s errors from 85 of 105 to 36 of 105. Proper names, some short replies and several sung phrases remain difficult for the recognizer; this is an imperfect listening aid, not an intelligibility pass. The approved quartet and its physical renders are retained.

Final validation passed 187 native tests (two existing ignored), 406 Bun tests across 100 files, TypeScript, all 586 public content hashes, the production build and local HTTP checks of the direct route, app bundles and all twelve new files. All 574 preceding public assets remain byte-identical and the tracked WASM matches its unchanged provenance. The five focused scene regressions also passed with the finished native dialogue.
