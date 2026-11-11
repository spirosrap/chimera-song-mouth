# Space Oddity — original music and physical voices

The complete David Bowie recording supplied by the user is the eighteenth song
at `?song=space-oddity`. Its stereo instrumental music stays at the original speed,
including the opening fade and the long outro. The prepared duration is 5:05,
including 350 ms of release. Existing songs and scenes are preserved.

CHIMERA's physical vocal engine generates the singer and a separate, quieter
spoken launch countdown. The countdown overlaps the sung words in the supplied
recording; it is aligned from the left vocal channel while the singer is aligned
from the right. This prevents the spoken numbers from changing the singer's
pitch or swallowing sung syllables. Neither mouth channel contains a recording
of the original voice or a vocal-filter effect.

The singer has 203 words, 253 syllables and 30 connected phrases. The countdown
contains all ten numbers and “Lift off,” with 13 syllables in 11 phrases. Explicit
timed phonetics use short consonants, held vowel nuclei and late diphthong glides.
The introductory singing stays in its low register; the later melody rises into
the recorded register. Stable musical targets retain changes within held vowels
and use restrained, delayed vibrato with no random pitch drift. The user approved the music-backed “tin can” refrain preview. The body and
voice settings match the approved Starman singer: male body, pressure 7.2,
brightness 0.46 and breathiness 0.04.

Melody targets were reviewed against the supplied recording, with
[P. Brown's keyboard arrangement](https://6f4f21bf-70e2-4787-aae4-d86f013c3b0c.filesusr.com/ugd/8c2144_d0780449f40447ce80e57c575f5e79d2.pdf)
as a cross-check. The recording takes precedence where they differ, including
the shorter descent in the first verse. A median instrumental tuning estimate
of +5.2 cents is applied. The second held “Far” starts at the recording's earlier
vowel onset rather than the late alignment estimate. The singer finishes at
about 4:11.5, leaving the complete instrumental outro.

During singing and the countdown, the backing uses locally separated original
instrumental audio. Instrumental sections restore the supplied stereo recording
with crossfades outside vocal tails. No tempo or pitch changes are applied.
Resampling and constant gain provide playback compatibility and headroom.
Separation can leave faint original vocal traces; pronunciation and timing remain
approximate. Source recordings, analysis caches, stems and models remain local.

Both voices and their mouth telemetry are rendered together at 48 kHz on the
source clock. The existing ensemble player supplies synchronized words, each
mouth's syllable overlay, individual levels, mute, solo, seeking and WAV export.
All 262 previously prepared public files are preserved byte for byte.

## Rebuild

```sh
bun tools/render-prepared-voice.ts space-oddity lead
bun tools/render-prepared-voice.ts space-oddity countdown
bun run content:manifest
bun run test --timeout 15000
bun run typecheck
bun run build:static --base=/chimera-song-mouth/
```

The committed score includes the complete timed phonetics and pitch contours.
Rebuilding the physical voices requires ffmpeg, but no original recordings or
analysis models. The asset version is `space-oddity-20261111`.

Validation covers complete phrase audio, silent rests, melody targets, the
independent overlapping countdown, finite moving telemetry, synchronized asset
lengths, original stereo backing and mix headroom. Repository tests, typechecking,
static build and live file verification are used. Browser playback, interaction
and visual/recording QA are not performed because browser access was previously
declined.
