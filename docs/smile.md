# Smile — original orchestra and physical singer

The complete Nat King Cole recording supplied by the user is the twentieth song
at `?song=smile`. The source file's title identifies the 1954 recording; its
embedded description supplies the lyric text. The 176.216-second recording
remains at its original speed, followed by 350 ms of release.

CHIMERA's physical airway generates 111 words and 131 syllables in 25 connected
phrases, with 17 caption lines, from timed phonetics and measured pitch. The original vocal provides local timing and melody measurements; the
prepared mouth channel contains synthesized sound from the engine. Brief
consonants, connected vowel sustains and late diphthong glides preserve the
recording's phrasing. Continuous pitch follows its slides and vibrato, with no
random pitch drift. The singer uses an adult male body, pressure 7.8,
brightness 0.60 and breathiness 0.025. The onset alignment is paired with explicit
consonant durations: stop releases, fricatives, nasals and liquids each have enough
time to remain distinct while the vowel anchors follow the recording. Both
“though” entries have a stronger dental onset and an explicit final glide.
“Through” retains its initial frication; “fear” uses a sustained front vowel
followed by a rhotic vowel and release. The user approved the revised 8–39.2
second preview with these corrections; the full song retains them.

The original orchestral accompaniment remains on the recording's clock. Sung
sections use locally separated instrumental audio; instrumental passages restore
the supplied recording with crossfades outside vocal tails. Resampling and
constant gain provide playback compatibility and headroom. Separation can leave
faint original vocal traces; transcription and pronunciation remain approximate.
Original input recordings, separation stems, analysis caches and models remain
local, outside the repository.

The final word remains sung until about 2:42. The initial recognition ended that
word at the beginning of its long sustain; its end is corrected using the vocal
envelope and pitch evidence. The complete orchestral ending follows.

Voice audio and mouth telemetry share a 48 kHz clock. The existing solo singer
presentation supplies synchronized words, mouth animation, independent voice and
music controls, seeking and WAV export. Existing songs and scenes remain intact.

## Rebuild

```sh
bun tools/render-prepared-voice.ts smile lead
bun run content:manifest
bun run test --timeout 15000
bun run typecheck
bun run build:static --base=/chimera-song-mouth/
```

The score contains the full timed phonetics and pitch contour. Rebuilding the
physical singer requires ffmpeg, but no source recording or analysis model.
The media version is `smile-20261111`.

Validation covers audible phrases, quiet rests, finite moving telemetry,
synchronized audio lengths, sampled waveform pitch, mix headroom and preservation
of earlier media, alongside repository tests, typechecking, the content manifest,
a static build and live file verification. Twenty-four waveform samples from
held vowel regions stayed within 40.5 cents of the planned pitch. The instantaneous
20 Hz pitch telemetry remains a diagnostic alongside those audio measurements.
Browser playback, layout and recording
checks are not performed because browser access was previously declined.
