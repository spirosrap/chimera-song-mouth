# Abracadabra

The complete supplied Lady Gaga official video is added at `?scene=abracadabra`.
Original instrumental music stays at the supplied speed. One actual CHIMERA
physical airway generates the announcement, English singing, title and Latin-style
chants and wordless vocalise. No original singer sample, voice clone, vocoder or
effect on a recorded voice is used in the generated channel. Recorded doubles,
harmonies and every layered adlib are not reconstructed independently; faint
separation traces may remain. The bare opening announcement is suppressed in
the backing to prevent the original speech leaking through.

Locally recovered and corrected source words use explicit title/Latin-style
syllables, source-aligned consonants, connected vowels and continuous measured
pitch. The owner requested a clearer English verse after the first audition.
Longer consonant transitions, room for short vowels and an unstressed “of” replace
the squeezed English phones. The owner approved the revised 31.000-second MP3;
the refrain's voice stays in place. Transcription, pronunciation, chant timing,
voice assignment and recovered melody remain approximate.

The procedural scene follows the industrial hall and tall windows, white hood,
corset, long sleeves, boots, flowing cape and train, elevated red queen and narrow
cage, oversized spiked hat, red costume and fringe, 32 decorative dancers, dark
and white wardrobe changes, rows, circles, arm formations, floor poses, overhead
views, lifts and final queen. Sets, outfits, choreography and likenesses are
stylized approximations. Original film, frames, brand artwork and logos are not
embedded.

Three physical heads borrow one retained model. Absolute source time restores
costume, cape, formation, limbs and cameras after seeking. Overhead views reset
the camera's up vector on the next cut. Only owned graphics are disposed; the
mounted model lease retains the physical singer. The rear camera was moved
inside the hall to avoid looking through its back wall. All source cuts receive
native desktop/phone head-framing and mouth-clearance checks; the deliberate
rear pose excludes its own rear costume from the mouth-facing check.

`bun tools/render-abracadabra-scene.ts` rebuilds the physical singer, exact 20Hz
mouth movement and mixed audio from the included score, WASM and instrumental.
FFmpeg is required. After intentional regeneration run `bun run content:manifest`.
Raw source video, frames, stems, model weights and analysis caches stay private.

Native Three.js geometry projections are reviewed for the scene. These are not
GPU screenshots. Browser playback, video export and layout lint are not retested
because browser access remains declined in this chat.

The full performance lasts 269.841 seconds, with 333 words, 505 physical syllables,
82 phrases/captions and 41 camera cues. Its 5,397-frame mouth track is finite and
uses the exact 20Hz source clock. Every phrase is audible (minimum phrase RMS
0.07589). The mix decodes to exactly 12,952,359 stereo frames at 48kHz, with no
end padding or clipping (decoded peak 0.87279). The approved controls and score
remain exact; no common headroom trim was needed. All 811 earlier public files
remain byte-identical; the manifest grows to 817 files.

Sixteen focused scene/catalog tests passed. They cover full extent, syllables,
real quiet gaps, exact clocks, costumes, cloth, dancer formations, seeking,
retained model ownership and head framing/actual lip clearance at every camera
cut on desktop and phone. Twenty-one native Three.js geometry projections were
reviewed using the completed physical mouth track.

The unchanged English-only caption listening aid reports 255 of 333 words
misheard (76.6%) when it hears each short caption alone, including repeated
Latin-style/title syllables. This is a diagnostic limitation, not an intelligibility
pass. The owner-approved revised audition governs the voice. No listening aid,
judge or threshold was changed.

Release checks passed: 195 native tests (two existing ignored), 565 Bun tests
across 136 files, TypeScript, all 817 content hashes and the unchanged production
WASM, the subfolder production build, every built public hash and local HTTP
checks of the direct route, app bundles and six new scene files. Publication
uploads only changed files, with media first and the entry page last.
