# a-ha — Take On Me

Open `?scene=take-on-me`. The complete supplied 4:04 official video, including its long opening and closing section, is reconstructed with original instrumental music, physical lead and chorus replies and the colour/comic-book story. The 51–76 second preview includes the first chorus and high ending. Pause after the finished performance before starting another selection.

## Physical singing and melody

The unchanged CHIMERA airway generates both vocal parts through `planPart` → `planPerformance` → `renderPart`. The generated channels contain no recorded singer samples, clones, vocoders or effects applied to source vocals. Physical mouth telemetry is captured in the same synthesis run.

Local recognition on the supplied recording provides rough word windows. The fast verses and high outro produce recognition errors and loops, so the source words are corrected before phonetic alignment. A local phonetic CTC model locates complete dictionary consonants and vowels. Connected phrases, held vowels and late diphthong glides retain the source phrasing rather than turning recognition blanks into singing pauses.

The pitch tracker sometimes follows a lower overlapping voice during the high ending. Independent spectral checks show the foreground upper voice while the track drops an octave. Within those source high-phrase windows, measured upper spectral peaks recover the falsetto contour before smoothing. Other source pitch remains unchanged. There is no note quantization or change to the engine or judges.

The lead uses female body blend 0.35, pressure 7.8 and brightness 0.53. The replies use body blend 0.08, pressure 7.5 and brightness 0.46. Both use tension 0.54, breathiness 0.025, zero random drift and no added vibrato. The lead contains 145 words and 175 syllables in 22 connected phrases; nine quiet backing calls contain 27 words/syllables. Backing calls repeat the measured first-call melody with estimated timing and register. They are an approximation rather than an independent recovery of every original vocal double. Pronunciation, transcription and melody recovery remain approximate.

Original instrumental accompaniment remains continuous at the supplied speed, including the opening, instrumental break and complete ending. Faint recorded-vocal separation traces may remain. The stereo mix uses 48 kHz and snapshots follow the exact 20 Hz sample clock. The MP3 decoder adds 22 zero samples at the end of this recording; these are explicitly checked as silent padding and excluded from the source-clock mix extent.

## Pencil world and colour world

The supplied film was inspected across its duration. The procedural sequence follows the pencil motorcycle race and helmets; café, waitress, cup and comic book; wink and reaching hand; girl entering the paper world; framed window into a colour band, keyboard and drums; wrench-wielding rivals and chase; torn-paper escape and climbing from the café bin; apartment, comic pages and doorway transformation; reunion and closing comic cover.

The singer wears a light collared jacket and dark trousers, with swept hair and a helmet in the race. The girl has lighter curled hair, a jacket over a blouse and a dark skirt. She stays vocally silent and uses neutral articulation. The lead, girl and colour reflection share one retained model; the keyboard's answering singer uses a second. The other café/band/racing figures are decorative proxies.

Graphite rendering belongs only to this scene. Its lines use normal blending so dark ink stays visible on paper; the shared neon renderer keeps its original maximum blending. Hatching, paper panels and source-time 12-frame sketch jitter accompany the ink anatomy. The colour band appears inside the frame while the foreground couple stays drawn. The doorway alternates between ink and colour before the reunion. All camera cuts, hands, running, bin climb, wink, paper tear and transformation derive from absolute source time, so seeking restores them directly. Landscape retains the source 4:3 frame; named head close-ups adapt to mobile.

Both models are borrowed for the mounted scene. Disposal frees only stage-owned head graphics, geometry and materials. Scenery, likenesses, costumes and gestures are stylized approximations. The original source film itself is not embedded.

## Rebuilding and verification

Seven prepared files include the explicit two-part phonetic score, original backing, full mix, two compressed telemetry streams, scene/captions/cameras and credits. Raw input video, separated stems, analysis and model weights remain private, outside the repository.

```sh
bun tools/render-take-on-me-scene.ts
bun run content:manifest
bun run verify:content
```

The prepared score, backing, tracked WASM and ffmpeg suffice to rebuild the physical voices, mix and mouth movement. Preserve all 619 preceding public files byte-for-byte; the updated manifest contains 626 files.

Browser, Playwright and layout-lint access remain declined in this chat. Native scene projections and geometry checks do not verify browser/GPU playback or real-time recording/export interaction.

The full performance lasts 244.368503 seconds with 11,729,689 source-clock audio frames and 4,888 mouth snapshots per singer. The decoded mix peaks at 0.9169. Every physical phrase is audible; the generated vocals are silent during the instrumental opening and after the singing. There are 33 subtitle lines and 32 source-time camera cuts.

The unchanged scene-clarity listening aid completed on 33 lead captions over the original music and synthesized replies. It marked 95 of 145 words as errors (65.5%). Overlapping replies, the low calls and sustained upper register are difficult for this recognizer. This is a listening diagnostic, not an intelligibility pass; the preview settings and prepared source phones are retained.

Validation passed 187 native tests (two existing ignored), 431 Bun tests across 106 files, five final focused scene checks, TypeScript, all 626 public hashes and unchanged WASM provenance. The subfolder production build and local HTTP checks matched every built media file, the direct scene route, app bundles and all seven new files. Native projections were inspected for the race, café and book, wink, hand contact, pair, window/band, chase and rivals, bin escape, transformation, reunion, cover and mobile framing. Browser/GPU playback and real-time recording remain unverified.
