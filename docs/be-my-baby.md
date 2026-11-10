# Be My Baby — lead and backing mouths

The full 2:40 Ronettes recording is added at `?song=be-my-baby`, with the
original instrumental music and three physical singers: a featured lead and
two answering voices. All fourteen preceding selections and their
prepared media stay unchanged.

The locally supplied MP3 is the timing reference. Its stereo accompaniment
keeps the original sample clock and speed. The drum introduction and true
instrumental break retain the supplied mix; passages containing singers use
locally separated instrumental audio. Separation may leave faint vocal traces.
Only a short silent release is appended after the recording.

The three new voices use explicit phonetics through `planPerformance`,
`planPart` and `renderPart` at 48 kHz. CHIMERA's airflow, vocal folds and vocal
tract generate their sound, and each mouth's telemetry comes from that same
render. There is no recorded vocal, vocoder or processed original singer in
these three voice channels. The score contains everything needed to rebuild
them without recognition models or the input recording.

Words and timings are adapted from local transcription of the supplied audio.
Lead and answering phrases have separate timelines; backing singers do not
merely double all the lead's words. Phone alignment uses short consonants,
held vowels and late diphthong glides, following the Blue Moon and Country Roads
refinements. Adjacent lyric lines that compete for the same consonants are
aligned together, preserving every syllable without overlapping one singer's
phrases. The ending retains the backing refrain through the original fade.

The lead melody is selected from measured polyphonic note strengths, with
continuous pitch variation retained where the monophonic estimate follows it.
The backing line is measured separately after local karaoke separation, then
performed by two mouths with a small pitch and body difference. The chorus
refrain repeats at the recording's section entrances; closing notes follow the
separately measured backing vocal. It is a three-mouth adaptation, not an exact
isolation of every original harmony singer. Fading ad-libs, individual harmony
voicings and pronunciation remain approximate.

Listening revisions replaced guessed backing harmonies with that measured
response melody, corrected the fourth response's words, and brought the backing
mouths forward in the mix. Reliable consonant releases locate the onset of held
diphthongs; otherwise recognizing the late glide can make a word start too late.
The lead's three chorus-ending whoa passages are also retained. Audition clips
included an isolated backing check; the published song starts with the original
drum introduction and keeps the music under the voices.

The `backed-ensemble` presentation places the featured lead beside two backing
mouths, with independent syllable labels, combined lead/backing lyric lines,
mute/solo/level controls and the existing WAV download. Music has its own
control. All channels share the mixer's audio clock. No new audio routing or
additional WebGL contexts are introduced.

## Rebuild

```sh
bun tools/render-prepared-voice.ts be-my-baby lead
bun tools/render-prepared-voice.ts be-my-baby harmony-low
bun tools/render-prepared-voice.ts be-my-baby harmony-high
bun run content:manifest
bun run test --timeout 15000
bun run typecheck
bun run build:static --base=/chimera-song-mouth/
```

Retain the prepared backing and mixer levels. Checks cover full-length finite
audio and telemetry, physical articulation, instrumental rests, simultaneous
lead/backing lyrics, source-aligned responses, the fading ending,
original accompaniment timing and all 243 preceding public asset hashes.
Browser playback, layout and recording QA are not claimed because browser
access was previously declined. The underlying engine is unchanged.
