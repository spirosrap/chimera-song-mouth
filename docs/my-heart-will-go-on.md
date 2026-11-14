# Céline Dion — My Heart Will Go On

Open `?scene=my-heart-will-go-on`. This adds the complete supplied 280.566712-second anniversary alternate video, plus a 0.35-second physical release, for 280.916712 seconds (4:41). The alternate edit stays entirely with the singer rather than cutting to Titanic’s film-story scenes. The reconstruction follows that supplied edition.

## Approved physical singing and original music

The owner approved the validated 59–88.5 second chorus preview: “Sounds good—use this.” The full score preserves that excerpt’s exact phones, continuous pitch/breath contour, phrasing and voice/body settings. The female body blend is 0.86, pressure 7.8, brightness 0.52, breathiness 0.03 and tension 0.54. Random drift and added vibrato are zero; measured source pitch carries the original slides and vibrato.

The unchanged physical airway generates all featured singing. There are no recorded singer samples, voice clone, vocoder or recorded-vocal effects in the generated channel. Two local recognizers and source analysis inform 172 corrected words, 192 dictionary syllables, 24 connected phrases and 2,882 pitch/breath points. Explicit source-aligned phones preserve complete consonants, held vowels and late diphthong glides. Mouth telemetry is captured during synthesis. Timing, pitch transcription and pronunciation remain approximate.

The full original accompaniment stays at the supplied speed. Its instrumental opening remains original through 19.5 seconds, crossfading to continuous separated accompaniment by 20.3 seconds, before the first word around 21 seconds. After the last vocal decay, a 253.5–254.5 second crossfade restores the original instrumental outro. This retains the flute and quiet ending that separation partly classifies as voice. No recorded-vocal prefix is copied. Separation may leave faint voices or artifacts during the main song. Recognition-only stray words in the quiet ending are excluded. The final generated vowel remains audible through about 250.8 seconds.

## Full video presentation

Thirty-two source-time camera cuts alternate low views past the curved white rails, full-length deck shots, warm sunset close-ups, starry dark-blue views and overlapping images of the singer. The bow has a plated curved hull, portholes, timber planks and four rail levels. A gradient sky, soft sun glow, cloud bands, ocean waves and subtle ship motion establish the sea without embedding the original film.

The ivory gown, waist and neckline, translucent diamond lace over both complete sleeves, pearl earrings, shoulder-length brown/blonde hair and wind follow the supplied look. Absolute-time hands move from the heart to clasped, open and rail-reaching poses. The star field has 240 softly varying lights. The second physical image shares the first singer’s exact articulation and a single retained model lease; it is visual double exposure, not an additional audible voice.

All motion, outfits, hand joints, fade, cameras and room visibility restore directly after seeking. The two anatomy renderers borrow one physical model. Each image has its own owned graphics and sleeve material so fading the double exposure cannot dim the main performer. Likeness, choreography and optical dissolves remain stylized approximations.

## Rebuild and verification

Six prepared files contain the physical score, complete mix, original backing, compressed mouth telemetry, scene/caption/camera data and credits. Original inputs, stems, recognizers, weights, intermediate renders and analysis caches stay outside Git.

```sh
bun tools/render-my-heart-will-go-on-scene.ts
bun run content:manifest
bun run verify:content
```

The finished stereo render has 13,484,003 audio frames and 5,619 mouth telemetry frames at 20 Hz. All 24 phrases have measurable sound; the quietest phrase has RMS 0.157466. The decoded MP3 peak is 0.920775. A common 0.945554 headroom trim preserves the balance between lead and music. There are 24 caption windows and 32 camera cuts.

Keep all 568 previous public files byte-identical; this addition brings the manifest to 574 files. Five focused regressions protect the full source duration and ending, audible physical phrases, finite sample-clock telemetry, quiet bookends, all presentation rooms, gestures, shared-model double exposure, exact seeking, landscape/portrait framing and borrowed voice ownership.

Native geometry projections cover bow, deck, sunset, stars, hands, double exposure and portrait framing. Browser, Playwright and layout-lint access remain declined in this chat. Native projections and HTTP delivery checks do not verify GPU lighting, browser playback or real-time recording/export interaction.

Twenty-four stable generated waveform windows were measured independently against the prepared pitch contour; the largest fundamental difference was 17.09 cents. No ambiguous octave required an override. This checks synthesis against the prepared contour rather than proving a perfect transcription of the original melody.

The unchanged English scene-clarity listening aid misheard 104 of 172 caption words (60.5%), across all 24 lines. It struggles with several long, high-register vowels and sustained syllables. This is a remaining recognition/intelligibility limitation, not a clarity pass; the owner-approved chorus and voice settings are retained.

Final validation passed 187 native tests (two existing ignored), 401 Bun tests across 99 files, TypeScript, all 574 public content hashes, the production build and local HTTP checks of the direct route, app bundles and all six new files. Ten focused new-scene/Hero regressions also passed. All 568 earlier public assets remain byte-identical and the tracked WASM matches its unchanged provenance.

## Live release

Application commit `404be4e` is live at [My Heart Will Go On](https://agenticspiros.com/chimera-song-mouth/?scene=my-heart-will-go-on). All seventeen changed files uploaded successfully with the entry page last. HTTP checks matched 63 live files byte-for-byte, including all six new assets, app bundles, preserved Hero/Céline mansion/Toni/November Rain/Bon Jovi/Hello/Whitney media and the direct route. The temporary publish job was removed. Browser playback and real-time recording remain unverified in this chat.
