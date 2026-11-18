# OK Go — Love

The complete supplied 4:22 edit plays at `?scene=ok-go-love`. Three CHIMERA airways generate the lead, quieter chorus backing and crew calls over the separated original instrumental music and retained scene effects. The supporting harmony uses an estimated octave double. Vocal separation can leave faint original traces.

A continuous camera follows the Budapest station, small mirror arms, triangular reflections, balloon spiral and infinite lens. The finale opens into the larger mirror rigs and a mirrored suit. The stage generates a single live portrait texture per frame and shares it among its mirror faces, with folded texture coordinates for the kaleidoscope. Camera position, arm joints and reflected articulation use the source clock and restore after seeking.

Damian Kulash, Aaron Duffy and Miguel Espada co-directed the original video. [Official video](https://www.youtube.com/watch?v=gz9BRl7DVSM) · [Robot choreography](https://www.universal-robots.com/landing-pages/syncing-30-robots-to-a-beat-the-making-of-ok-go-s-love-music-video/)

Run `bun tools/render-ok-go-love-scene.ts` with FFmpeg to rebuild the three physical tracks and mix from the prepared score and backing. After listening, run `bun run content:manifest`.

Love deployment verified for runtime `fe34c04ea2c2778c3887a6c8752afce7335f22b2`. The publisher uploaded all 19 changed files with media first and index last. SHA-256 checks match 46 live files covering the [Love link](https://agenticspiros.com/chimera-song-mouth/?scene=ok-go-love), its eight assets, the current bundles and the two preceding scenes. Removed the completed publishing job and plist.

The library has 86 concert and music-video performances and 991 public assets. All 981 preceding public files retain their checksums, and both imported dictionary assets match production. The scene was rebased onto the already published engine at upstream revision `eeb0c19`. Typecheck, production build, local HTTP delivery, all 663 Bun tests across 161 files and 278 native tests pass. Two existing native tests remain ignored. The existing Bun suite used a 15-second command timeout. The native/WASM parity case passed after rebuilding the cached WASM test target for the imported engine.

The three physical tracks contain 64 phrases and 5,248 synchronized mouth frames each. The full mix decodes to 12,594,586 stereo sample frames. The 35 camera waypoints and transitions passed 192 head-framing and occlusion checks at desktop and phone sizes. GLSL compiles and native GLES renders all seven mirror patterns. Browser playback and video export remain unverified.

The user approved the 32.8-second lead and first chorus preview. The full score retains its physical voicing, pitch contours and phrasing. The English cue-isolation recognizer reported 82.0% word error across 49 cues. This is a listening aid for synthesized singing and short speech.
