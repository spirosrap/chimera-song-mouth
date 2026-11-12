# O Superman — the circular light

Open `?scene=o-superman`. The complete supplied Laurie Anderson music video is a scene alongside the existing collection. The source video is 507.001 seconds; its decoded audio is 506.984512 seconds. A 350 ms lead-in and 250 ms release make the prepared performance 507.584512 seconds. The long hand-shadow ending is retained.

## Physical sound

The user approved a 27-second preview of the answering-machine and mother passages: “Sounds good—use this.” The approved lead body, source controls, phonetic durations and reference pitch in that excerpt are retained. Both the lead and repeated ha come from CHIMERA’s actual physical airway engine. There is no recorded-vocal filter, voice clone or vocoder substitute in either generated channel.

The lead has 251 source words and 306 dictionary syllables in 97 phrases. Local speech recognition supplies provisional words and boundaries. The repeating pulse causes recognition loops and invented words; those are discarded, and the recognizable closing words are corrected before local phonetic alignment. The nonsensical recognizer phrase “Thanks for watching” is not part of the performance. Long closing vowels retain their supplied phrase windows. Consonants use the existing clear-speech helper and minimum durations, preserving complete affricates and short function words without changing the music clock.

The source pulse is tracked by waveform correlation at approximately 148.5 pulses per minute, with local interpolation for obscured landmarks. The score contains 1,255 separate ha attacks. A single physical gesture cell is rendered for each unique setting and reused at those measured times; the cached waveform is engine output, never a piece of the original singer. Telemetry follows the same offsets and retains an absolute 20 Hz clock. The loop uses the source’s approximately 256.3 Hz pitch and an ending breath fade. Its gain was matched to the original opening’s level. The performance validator permits up to 1,600 phrases for this long vocal loop, retaining the existing phone and contour limits.

The original separated instrumental bed stays at its original speed. Continuous separation keeps the original main vocal out of the gaps; faint vocal traces may remain. The source ha is also removed locally from the analysis stem to reduce pitch-tracking interference, but that analysis stem is not published. The user’s approval covers the preview, not a claim that every second of the complete render was auditioned. Pronunciation and polyphonic vocoder pitch reconstruction remain approximate.

## Video reconstruction

The scene reconstructs the circular light, oversized hand shadows, short-haired performer and dark jacket, white glove, keyboard, dark face with illuminated mouth, red silhouette, inset performer, blue bow and rotating abstract lights. Hand shapes include the fist, pointing finger and open palm. A projection mask keeps the enlarged shadow within the light. The reference video itself is not embedded.

The visible singer uses the physical lead’s articulation. The circular light responds to the separate physical pulse; a manual pulse-mouth view exposes its own simulated airway. Both models are retained for the mounted player. Absolute-time poses restore camera cuts, light colours and hand positions on pauses and backward seeks. The stage releases its graphics and leaves borrowed voice models to their owning leases.

## Rebuild and verification

Seven prepared assets are included: the scene/captions, performance score, full mix, original backing, two compressed telemetry tracks and credits. Raw recordings, separated stems, model weights, local recognition outputs and intermediate renders are excluded from Git.

```sh
bun tools/render-superman-scene.ts
bun run content:manifest
```

Audio checks cover the whole duration, finite unclipped output, phrase audibility, source-clock pulse timing and complete telemetry. Dedicated tests cover bounded long loops, engine-cell timing, scene validation, head framing, finite line buffers, seeking and model ownership. Native projected views are inspected.

The full native suite passed 144 tests (two ignored), and Bun passed 300 tests across 76 files. TypeScript and the static build passed. Each physical voice has 10,152 telemetry frames. The final missing closing phrase was restored in a bounded 395–408-second replacement, with all other phrases and pitch/breath contours unchanged. After that repair and a correction to the final projection fade, all five focused scene tests passed (24,443 assertions). The approved 68–95-second plans and voice controls remain identical. All 448 built public assets match the content manifest; the direct route and all seven new scene files also passed local HTTP checks.

The unchanged `scene-clarity.py` listening aid completed on all 97 final cues. Isolated-cue recognition reported 154 of 251 words misheard (61.4%), including ten long repeated-ha decodes. The restored closing phrase was recognized in full. This is not a pronunciation pass: the user-approved preview is retained, and the complete stylized voice remains approximate. No judge, engine calibration or model table was changed to improve this diagnostic result.

Browser, Playwright and layout-lint access remain declined in this session. Browser playback, GPU rendering and video recording/download interaction are not verified. Available checks use native/Bun tests, TypeScript, content hashes, a static production build and HTTP/file verification. All 441 earlier public assets are preserved byte-for-byte.

Published on 2026-11-12 to `https://agenticspiros.com/chimera-song-mouth/?scene=o-superman` from application commit `8191304`. The uploader completed all 17 changed files successfully, with the index last. SHA-256 comparisons verified 154 live files, including the new scene, app bundles and preserved collection, plus the direct scene route. The temporary upload job was removed after completion.
