# SOS — Dimash concert

Open `?scene=dimash-sos`. This adds the complete 4:05 supplied concert clip alongside the other scenes. The approved French voice is synthesized by CHIMERA's physical mouth, over the original stereo accompaniment. It is not a filtered recording of the singer.

The source video was inspected for its embedded French captions, gestures, musicians and camera cuts. The new `concert` setting includes a dark suit and swept hair, in-ear monitors, a microphone initially on its stand and later held, expressive arms, raised-microphone high note, curved lighting rig, blue/amber/red/white light fans, piano, strings, drums, guitars, backing performers and seated audience. Decorative people are lightweight figures; only the featured singer owns a physical model lease. The supplied clip ends during its last held note, so there is no invented closing bow or applause.

The score contains 159 words, 210 syllables and 32 physical phrases. French rounded vowels, nasal vowels and the uvular consonant are explicit; the English dictionary is not used to guess the French words. Nasal vowels are represented by a base IPA vowel plus `nasalized: true`, forwarded to the native planner to open the velum. The short rounded glide uses the supported /y/ articulation. The original register changes and continuous pitch are retained, with weak tracker spikes removed. The user approved the 29-second low-to-high preview.

Local separation removes the featured voice throughout the entire recording, including rests and the final held note. No original vocal mix is restored at the end. Separation can leave faint vocal traces, and the physical voice and staging remain approximations. Source recordings, analysis stems, model weights and caches are not included.

The six prepared files in `public/scenes/dimash-sos/` are the score, scene/captions/camera data, stereo mix, instrumental backing, compressed mouth telemetry and credits. All previous public assets remain unchanged.

To regenerate the physical voice and telemetry from the included score:

```sh
bun tools/render-concert-scene.ts
bun run content:manifest
bun run verify:content
```

This requires ffmpeg and uses the committed WASM engine plus the prepared backing, without the source video or models. Check the result before deploying.

Validation covers native/Bun tests, French nasal controls, complete audio/telemetry clocks, finite unclipped audio, phrase audibility, source-timed captions, mobile/desktop camera geometry, deterministic seeking, model ownership, static builds and asset hashes. Native SVG projections were inspected for staging and framing. Browser playback, visual layout and recording/export were not tested because browser use was declined in this project.
