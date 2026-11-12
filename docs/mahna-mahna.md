# Mahna Mahna — the trio

Open `?scene=mahna-mahna`. This adds the complete supplied *Muppet Show* sketch alongside the existing songs and scenes. The user replaced an accidentally downloaded 31-second promo with the longer trio performance; the promo is not used in the published scene.

The supplied video runs 156.221 seconds; its decoded audio is 156.200658 seconds. The prepared scene runs 156.800658 seconds with a 350 ms lead-in and a 250 ms release. Kermit’s introduction, the instrumental opening, trio, improvised walk-offs, backstage telephone and Statler/Waldorf ending are included. The original video is not embedded.

## Physical voices

Mahna Mahna and both Snowths use independently rendered CHIMERA airway voices. The lead has 38 prepared phrases, including 19 short calls and source-timed scat passages. Each Snowth has 156 answering syllables. Their bodies differ, their unison pitch contours differ by seven cents, and their audio/telemetry tracks are independent. The supporting Kermit, Statler and Waldorf voices also come from physical mouths.

The lead calls use explicit consonant/vowel durations at measured source landmarks. The improvisations use local phonetic decoding and reference pitch; nonsense is kept as sounds. Automatic word recognition was not used to invent lyrics for the scat passages. Captions identify improvisation rather than assigning it an English meaning. The Snowths’ short and long answers retain their individual attacks, including the quick syllables at the end of each extended response.

Supporting dialogue uses corrected words, locally aligned phones and natural timing from `clearPhrases` with `CLEAR_SPEECH_TIGHT`. The telephone greeting has an explicit 380 ms /h ə l oʊ/ gesture because its first automatic alignment squeezed it into 275 ms. Reference pitch and envelope contours drive the prepared performance. Rendering uses the existing physical engine and sample-group helper; there is no recorded singer, voice clone, vocoder or actor-voice filter in the generated channels.

The user heard a 22-second trio preview containing calls, answers and the first scat passage and approved it: “Sounds good—use this.” That is approval of the excerpt, not a claim that every second of the full render was auditioned.

Original music and nonverbal audience sounds remain. The instrumental opening uses original audio; spoken and sung regions use continuous vocal separation. Separation may leave faint recorded vocal traces. The same source clock drives audio and animation, with 35 ms of vocal gesture anticipation for the airway response. No music time stretching is used. Raw inputs, separated stems, analysis caches and model weights remain outside Git.

## Staging

The central performance has three costumed physical heads. The orange-haired lead has round glasses, a purple nose and green fur. The two pink Snowths have horns, eyelashes, yellow snouts and independent mouth movement. Their outer mouth openings follow the actual articulation telemetry. The physical airway remains visible within the costume.

The lead enters, wanders, ducks below the pair and moves away while improvising. The Snowths bob, lean inward and turn to look for him. The full sketch includes Kermit’s red curtains, backstage desk and telephone, his return beside the Snowths, and the decorated balcony with the two critics. Twenty-four automatic camera shots follow the reference approximately; manual views include the trio, individual speakers, pair, distant singer, backstage and balcony.

Poses depend on absolute scene time, preserving pauses and backward seeks. Wide and portrait framing are tested. Six retained models belong to the mounted player; the stage disposes only its own geometry/materials. Hidden heads are not updated each frame. Every visible line batch must have a finite instance count: an unused, uninitialized batch was caught during native projection and removed before publication.

## Rebuild and verification

`public/scenes/mahna-mahna/` contains eleven prepared assets: scene/captions, performance score, final mix, original backing, six compressed telemetry tracks and credits.

```sh
bun tools/render-puppet-scene.ts
bun run content:manifest
```

The rebuild tool renders the actual voices from the committed score and backing. Audio validation checks every phrase, silent gaps, full duration, finite output, mix headroom and telemetry clocks. Tests cover the complete scene and ending, independent Snowth performances, source-time poses, camera framing, visibility, telephone, line-buffer bounds, seeking and resource ownership. Native projected views were inspected.

Final checks passed: 144 native tests (two ignored), 295 Bun tests across 75 files, TypeScript, the production build and all 441 public-file hashes. The 430 previous public files remain byte-identical. The four dedicated scene tests cover the complete performance and the stage regressions above.

The unchanged scene-clarity diagnostic was run. Its 90.3% aggregate word-error figure is not an intelligibility measure for the invented calls and repeated doo syllables. It transcribed the short spoken lines and the closing punchline, but flagged Kermit’s fast first sentence and the original short telephone greeting. A local check transcribed the corrected greeting as “Hello?”. Two opening re-timings did not give a convincing improvement and were reverted; the fast introduction remains an approximate reconstruction. The user’s listening approval covers the trio excerpt. No speech judge or engine calibration was changed.

Browser, Playwright and layout-lint access remain declined in this session. Browser playback, rendering and recording/download interaction have not been tested. The available verification uses native/Bun tests, TypeScript, complete content hashes, a production build and HTTP/file checks. Phonetic reconstruction, creature staging and camera timing are approximate.
