# Apricots: original vocal and nine mouths

The user selected the original vocal sample over the revised mouth-played
accompaniment on 2026-11-10. This is the full 249.412-second arrangement, including
the instrumental introduction, breakdown, return and ending.

`hook.mp3` is the separated original stereo vocal from the supplied BICEP
recording. Its channel is marked `kind: "backing", recordingType: "vocal"` so
playback, seeking, exports and re-rendering preserve it as recorded audio. The
player labels its controls as vocal controls. It is not synthesized, and does
not display a simulated singing head. The nine accompaniment channels do.

The recording and all mouth stems share a 350 ms lead-in. The original vocal
uses the same level as the approved comparison, with quiet separation leakage
removed outside the vocal passage and its release retained. Faint instrumental
traces within the separated vocal are possible.

The accompaniment uses stable pitch lanes rather than repeatedly selecting the
strongest detection at each frame. Bass fragments are joined into sustained
notes, and the upper synth figures retain their original register. Source-derived
amplitude curves retain the electronic pulse. Kick, snare and hat attacks are
separated, and the rhythm is brought forward in the mix. No invented choir
harmonies or synthesized lead are mixed into the accepted version.

The unused former `choir-low`/`choir-high` audio and telemetry, and `hook.tele.gz`,
remain in the portable media archive. The current arrangement never requests
them. All twelve songs, three scenes and 221 public assets remain present.

## Rebuilding

Preserve `hook.mp3`. The normal voice-only command-line renderer intentionally
rejects an arrangement containing a recorded channel. To rebuild the nine
mouths, make a temporary copy of the score containing only parts for which
`isVoicePart` is true, render that score, and then restore the complete score
with its original recorded channel and volume. The in-app voice editor already
retains recorded channels when rendering selected mouths.

Use the final prepared score for its notes, effects and body settings; earlier
transcription scripts do not represent the accepted arrangement. No source
recording is needed to replay or host the prepared version. The raw supplied
MP3, separated analysis WAVs and experimental previews are not included here.

After an intentional regeneration, update `MEDIA-MANIFEST.json` and run the
content verification, audio/animation checks, full tests and static build.
Browser interaction and visual QA were unavailable because browser access was
declined in the source session.
