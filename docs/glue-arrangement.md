# Glue: nine physical mouths

The full 270.8-second arrangement keeps every sound synthesized, including the
wordless vocal melody. The supplied recording and separated stems are analysis
references only. No recorded vocal or instrument is loaded by this arrangement.

The selected revision applies the Apricots rhythm lessons while preserving
Glue's source shuffle. Kick and clap now have separate physical mouths, avoiding
overlapping gestures in one tract. Prepared beat rendering compensates for the
live pad's mouth setup time. The percussion uses 200 kick attacks, 355 short `K`
claps and 1,121 short `t` releases. The former amplitude-based rule incorrectly
turned 477 high transients into long open-hat hisses; those are now short sounds.

The six pitched parts use stable source pitch lanes. Adjacent detections of the
same note are joined and held, rather than restarting the mouth. The harmony
parts retain their own registers instead of exchanging notes whenever detector
confidence changes. Source amplitude curves use 20 ms measurements, with no
additional periodic pump or delay imposed on the recording's existing movement.

The vocal retains the first revised preview selected by the user: connected OO
phrases, a soft mouth tone and source pitch movement. Its notes are no longer
uniformly shifted down an octave. The prepared `performance` uses the same
`ooh` lyrics marker as its melody and must be retained when rebuilding.

All nine audio/telemetry pairs share the common 350 ms lead-in. Mixer faders are
scaled together for playback headroom, preserving the reviewed balance. Pitched
stems use 128 kbps MP3; percussion uses 192 kbps to preserve short noisy attacks.
Every prior public asset remains present. The added clap pair and credits bring
the app to 224 public files; all other songs and scenes are unchanged.

## Rebuilding and checks

Use `public/band/bicep-glue/arrangement.json` as the source of truth. All parts are
voice parts; no original recording is required for playback or regeneration.
The old initial transcription script is not this selected score. Preserve the
`drums` ID for the kick and the new `snare` ID for claps. All nine parts need
`telemetryEncoding: "gzip"` and corresponding `.tele.gz` files.

After regenerating voices, refresh cache versions and `MEDIA-MANIFEST.json`, run
the full tests and typecheck, and build for `/chimera-song-mouth/`. Tests retain
the all-mouth requirement, connected-note behavior, separate percussion and
compressed telemetry loading. Full audio/telemetry checks cover the intro,
breakdown, return and outro. Browser interaction and visual QA were unavailable
because browser access was declined in the source session.
