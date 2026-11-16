# Babooshka

The complete supplied Kate Bush official video is an additional scene at
`?scene=babooshka`, with original instrumental music at the supplied speed and
CHIMERA’s physical airway generating the featured singing. Three identifiable
delayed closing title calls are synthesized too. Recorded overlapping doubles
and indistinct effects are not independently reconstructed. No source singer
samples, cloning, vocoder or effects applied to the original singer appear in
the generated channel. Separation traces may remain.

Locally corrected source words and dictionary phones use source-aligned complete
consonants, connected held vowels, late diphthong glides and continuous measured
melody. For the title, the prepared explicit score uses the dictionary’s
“Babushka” phones with middle-syllable stress rather than the default English
fallback; written captions retain “Babooshka.” The owner approved the 38.550-second
verse and high-refrain MP3. Its voice, phonetics and melody drive the full render.

The procedural black studio has the carved maple double bass with fingerboard,
pegs, scroll, bridge, four strings and f-holes; the veiled black bodysuit, gold
chain belt, long hair, neck grip, embrace and side portraits. The contrasting
gold warrior wears a crown, earrings, metallic costume, thigh straps and black
boots, with moving striped sleeves and soft backlight. The final instrument
return, held poses and long closing dance follow source time. Subtle costume
seams keep the black figure visible; low-opacity lace leaves the mouth clear.

Two physical head graphics borrow one retained singer. Only owned graphics are
disposed. Backward seeking restores clothes, hands, bass, ribbons, sleeves and
cameras deterministically. Original film, frames and logos are not embedded;
scenery, clothes, choreography and likenesses are stylized approximations.

`bun tools/render-babooshka-scene.ts` rebuilds the physical voice, exact 20Hz
mouth snapshots and mix from the prepared score, included WASM and instrumental
asset; FFmpeg is required. Follow intentional regeneration with
`bun run content:manifest`.

The full performance is 211.071 seconds, with 199 words, 289 sung syllables,
33 connected phrases, 40 caption lines and 33 source-time camera cuts. The mix
decodes to exactly 10,131,413 stereo frames at 48kHz without clipping or end
padding (decoded peak 0.7113). All 33 phrases are audible and all 4,222 mouth
snapshots are finite on the exact 20Hz clock. No final headroom trim was needed.
All 772 preceding public files are byte-for-byte preserved; this addition
brings the manifest to 778 files.

Sixteen focused scene/catalog tests passed, covering full source extent,
explicit title phones, held notes, audible phrases, quiet instrumental gaps,
exact clocks, cast/camera isolation, phone/desktop physical-head bounds, clear
actual lips, backward seeks, hand contact at the bass neck, costume transitions
and retained model ownership. Native Three.js geometry projections inspect the
scene. Browser playback, video export and layout are not retested because
access remains declined in this chat. The unchanged speech-clarity aid is a
listening diagnostic; the owner-approved audition governs the voice.

The unchanged speech-clarity aid completed with a 74.9% isolated-caption
word error rate. It is diagnostic rather than an intelligibility pass; no judging
tools or approved voice controls were changed in response.

Required tests passed: 195 native tests with two existing ignored tests, and
541 Bun tests across 130 files. TypeScript and verification of all 778 public
files passed. The tracked WASM retains its unchanged provenance checksum.

The production build passed. All 778 built public assets match the manifest,
and the direct route, app bundles and six new scene files served correctly
over local HTTP. The changed-file upload plan contains 17 files, with media
first and the entry page last.

The scene is live at [Babooshka](https://agenticspiros.com/chimera-song-mouth/?scene=babooshka).
Runtime commit `a6f8b15d4c4a1535b1695f1ae88734fc50f4144a` was pushed before deployment. The existing Mac mini
uploader published all 17 changed files with `DEPLOY_EXIT=0`, media first and
the app index last. All 277 checked live files match their local SHA-256 values,
including every current app bundle, all six new scene files and 37 preserved
performances. The clean direct route returns the new index. The task’s temporary
launchd job and plist were removed after success. Only documentation changed
after the verified production build.
