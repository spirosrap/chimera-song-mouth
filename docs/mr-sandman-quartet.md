# Mr. Sandman — four physical mouths

The full 2:26 original-lyrics quartet is added at `?song=mr-sandman-quartet`.
Night Train Radio remains a separate new-lyrics song. All thirteen preceding
songs, three movie scenes and the speech keep their existing prepared files.

The original words were transcribed from the complete Chordettes recording
supplied by the user. Local dictionary pronunciations and phone alignment guide
brief consonants, sustained vowels and late diphthong glides. The sung proper
names have explicit pronunciations. Four pitch lanes come from the locally
saved F. Montero SATB note reference, transposed down one semitone to match the
recording's opening key. The arrangement follows that score's complete musical
form, including the final held chord, rather than its source MP3's clock.

The tenor leads the first verse, the alto the second and the soprano the final
verse; the other sung pitches remain in the harmony. The bass supplies rhythmic
bum-bum accompaniment and the comic answer. The familiar opening passes short
syllables between all four singers. Genuine musical rests remain, while connected
vowels share one air stream. The overlapping response and closing reprise are
included. Timing, harmony voicing and pronunciation are an adaptation.

Each channel uses `planPerformance` / `planPart` / `renderPart` and the physical
CHIMERA engine at 48 kHz. Its airflow, vocal folds and vocal tract generate the
sound. Mouth telemetry is captured from the same render. No recorded music,
recorded vocal, vocoder, audio effect or external synthesized voice is mixed in.
The prepared JSON carries all phonetics and pitches needed to regenerate it.

The quartet presentation retains independently animated heads, changing lead,
syllable labels, captions, mute/solo/level controls, seeking and WAV export. This
selection adds a retro microphone and four harmonic graphs. The graphs sample
the decoded audio at the mixer's audible clock, honor mute/solo/levels and use a
Hann-window FFT. They do not create new audio routing or extra WebGL contexts.

## Rebuild

```sh
bun tools/render-prepared-voice.ts mr-sandman-quartet bass
bun tools/render-prepared-voice.ts mr-sandman-quartet lead
bun tools/render-prepared-voice.ts mr-sandman-quartet alto
bun tools/render-prepared-voice.ts mr-sandman-quartet soprano
bun run content:manifest
bun run test --timeout 15000
bun run typecheck
bun run build:static --base=/chimera-song-mouth/
```

The renderer needs ffmpeg. The original recording, separated analysis audio,
recognition models and local work caches are not required and are not published.
Retain the four mixer levels when regenerating; they leave peak headroom.

## Regression and verification

The initial preview lost adjacent bum-bum notes because the fill routine treated
an earlier scat as an occupied lyric window. It also discarded entire pickup
notes that partly overlapped a lyric onset. Subtract only lyric intervals, retain
all 27 opening attacks, and trim partial overlaps instead of dropping notes.
A second listening correction shortened the opening sustains so descending
attacks are audible, and retained rhythmic bass under the sung words. Tests
protect both the note sequence and the continuing bass accompaniment.

Checks cover the full ending, valid phonetics, independent harmony contours,
audible audio, finite moving telemetry, seek/caption timing and known FFT peaks.
All 233 preceding public assets retain their SHA-256 hashes. Native/unit tests,
type checking, production building and live asset hashes are verified for release.
Browser playback, layout and video-recording QA are not claimed: browser access
was previously declined. The band offers its existing WAV download.
