# MEGALOVANIA reference arrangement

The 2026-11-10 revision replaces the fakt13 transcription (19 pitched parts plus
five beatbox parts) with Radixán's MIDIlovania. Its track names and polyphony
match the owner's 24-mouth reference. The supplied clip covers approximately
24.2–64 seconds of the score, rather than its opening. The reference post does
not explicitly identify its MIDI, so this is a reconstruction, not a claim of
byte-identical source provenance.

Source credits and links are in `public/band/megalovania/credits.txt`. The input
file's SHA-256 is pinned by `tools/arrange-megalovania.py`. The original input
MIDI and video, intermediate audio, and analysis stay outside the repository.

## Parts and sound

The score contains all 3,239 unique pitched notes, split into 24 monophonic lanes.
Sixteen simultaneous duplicate Saw notes are merged. Seventeen note tails
overlap the next attack by at most three ticks (15.625 ms at 120 BPM); those
tails are shortened, preserving every attack and real chord. The Drum Kit
track is omitted to match the reference's 24 pitched mouths.

The row order, M/F/C body presets and octave shifts are transcribed from the
video controls in `VOICES` in the arrangement script. Bass 2 sings DUM two
octaves up; Bass sings OOH. The other parts use DA. Only the portions visible
in the supplied clip can be directly compared; the full remaining score uses
those same settings. No instrument samples or reference audio are mixed in.
The shared synthesis engine and phonetic planners are unchanged. Forty-four
31 ms ornaments use the existing held-vowel setting: repeated D closures were
swallowing these fast notes. In a 2.9-second Square-part comparison, the four
ornaments' RMS rose from 0.000002–0.000175 to 0.058–0.326 with their pitches and
timestamps preserved. Ordinary notes retain their DA attacks.

After listening, the owner asked for smoother phrasing and a closer voice tone.
The final version connects 1,435 short MIDI gate gaps, each no longer than 140 ms
and between attacks less than half a second apart. This avoids taking a breath
after each staccato MIDI note; every pitch, attack and longer rest is retained.
The full pitch/onset sequence has a pinned checksum in the regression test.

The owner then preferred a comparison using CHIMERA's softer default source:
brightness 0.25, breathiness 0.15, tension 0.5, pressure 8 and drift 5 cents.
The previous bright source had brightness 1 and breathiness 0.02. In the same
12-second passage, the softer source reduced excess high-frequency energy;
its spectral centroid was 823 Hz versus the reference's 803 Hz (previously
1,144 Hz with the connected phrasing). Comparisons were loudness-matched.
These measurements support the listening choice, not a claim of identical tone.
Pressure and drift are optional per-part renderer controls; existing songs
keep their original defaults. No shared Rust engine or calibration changed.

The score's `showSyllables` flag displays the scat syllables at the lips even
though `wordless` is true. All 24 heads retain their model leases and use the
shared renderer. MP3 and mouth telemetry share the same 48 kHz render clock,
with the normal 350 ms lead-in and a release through 156.9 seconds; some short
cameo stems end earlier after their final release. Each asset
and the arrangement URL have a revision tag so reloads fetch the new version.

## Rebuild

Install Python's `mido` in a separate environment, then run:

```sh
python tools/arrange-megalovania.py /path/to/MIDIlovania.mid
bun tools/render-band-song.ts megalovania --score public/band/megalovania/arrangement.json
bun run content:manifest
bun run test --timeout 15000
bun run typecheck
bun run build:static --base=/chimera-song-mouth/
```

The render needs ffmpeg. Do not use the old scripts that target a different
checkout or restore the old choir/beatbox score. `tests/megalovania.test.ts`
guards the full note count, voice roles, cameo note, riff, monophonic lanes,
body presets, syllables and asset versions, and renders the rapid ornament
passage to check that its notes remain audible. Preserve all unrelated media.

Local signal checks and HTTP checksums are separate from listening and browser
QA. Browser interaction/layout checks were unavailable in this session because
browser access was previously declined; do not report them as completed.
