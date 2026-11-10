# Συννεφούλα performer

The `?song=synnefoula` view uses an upper-body wireframe performer inspired by the supplied `Nicu Chiciuc - cleaned-up version [2120079253592997888].mp4`: a white hat with an amber band, blue torso and arms, amber acoustic guitar, moving fingers, and a microphone against a dark backdrop. The scene is procedural Three.js geometry; the reference recording is not bundled into the app.

`FolkSinger` in `src/ui/components/` owns the recorded voice-model lease and borrows the shared head renderer. Its scene in `src/ui/render/folkSinger.ts` uses the existing `Anatomy3D` head, attaches the hat to the head's nod/tilt transform, and reads articulation directly from the existing voice telemetry. Greek singing and pursed-lip whistle passages therefore follow the same playback clock as before. Pausing freezes guitar movement; seeking and restarting position the hands from song time. Strumming and fret changes are decorative beat-based animation, not a transcription of the original guitarist's fingering.

The guitar, shirt, hands, hat and microphone share the existing glowing-line renderer. The camera fits desktop and narrow phone layouts. Model, geometry and shared-renderer leases are released when changing songs. Other songs keep their existing views, and the audio, arrangement, captions and all 221 prepared public assets remain unchanged.

Verification: the real Συννεφούλα telemetry exercises singing, whistling, pause, mute, seek and restart. Geometry checks cover the head, hat and guitar neck at 900×760, 600×456, 350×430 and 272×430; a portrait crop may omit the lower torso. Resource disposal is checked. Native projections of the actual scene geometry were inspected at desktop and phone sizes. Browser layout/playback QA and `lint:layout` were not run because browser access was previously declined; the native projections are not browser screenshots.

The singer also uses the existing green drifting-word overlay. Whole Greek words
are assembled from the engine's lyric syllables and displayed on the prepared
melody clock, including its 350 ms audio lead-in. The full lyric line sits inside
the singer panel. During actual whistle notes, little amber musical notes and
green curls of air drift from the lips. Both overlays freeze with the song and
reset on seeks; muting the singer hides them. The whistle indicator uses the same
`whistleNotes` timing as the sound, not a guess from the song section label.
Regression checks cover all 268 sung syllables and all 93 whistle notes, plus
clearing the lyric trail when seeking from singing to whistling or back to zero.
