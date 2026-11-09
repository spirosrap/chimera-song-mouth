# CHIMERA · Vocal Band

This edition adds a song player to [Jameson Hodge's CHIMERA](https://github.com/jamesondh/chimera-vocal-synth), using its original Rust/WebAssembly physical voice engine and live 2D/3D mouth.

- Select **Ode to Joy**, **Twinkle, Twinkle, Little Star**, or **Frère Jacques** and press **Sing through the mouth**.
- Import a local **MP3, WAV, M4A, OGG, or MIDI** file. Audio melody extraction uses YIN in a browser worker and works best with a solo singer or humming. It estimates pitches; it does not separate vocals from a mix or transcribe lyrics. MIDI import reads type 0/1 PPQ files, global tempo changes and rests; select the melody part for multi-part files. Chords follow the highest note.
- Add English lyrics (one syllable per note, wrapping if there are fewer syllables than notes), or leave the field empty to sing “ah”. MIDI lyric events are not imported.
- Change playback speed, transpose the melody, switch voice body, and compare imported audio with the original. Playback restarts when settings change.
- Files stay in browser memory and are never uploaded. Imports support excerpts up to **3 minutes / 50 MB**, and MIDI parts with up to **2,000 notes**. Very complex lyrics may require a shorter excerpt to fit the engine's gesture capacity. Use an audio file rather than a streaming-service link.

The single-mouth player opens in Sing mode with the 3D mouth. Other original CHIMERA modes remain available there. Song files and choices are not saved after the page closes.

Solo song playback prepares the selected melody in a worker before starting an AudioBufferSource, with recorded airway telemetry driving the face on the audible playback clock. This avoids silence/dropouts when the live solver exceeds the audio thread's budget (the reported failure showed 127% load; a local five-second render took 6.63 seconds). Preparation shows progress and can be cancelled; cancelling, switching songs or changing bodies cannot install a stale result. The live solver pauses during preparation/playback and resumes for live keys or another mode. Volume remains live; other voice changes apply on the next song playback. Tests cover audible generated samples, preserved source settings, matching telemetry duration, native buffer routing, solver bypass, cancellation races and the playback clock. Browser interaction QA remains unavailable because browser access was declined.

## Movie scenes

`?scene=a-few-good-men` opens the full courtroom exchange from the user's supplied clip, through the final confession (2:08 including breathing lead-in and release). The original movie audio/video is not served. CHIMERA synthesizes all four speakers: Kaffee and Jessep appear as working airway heads; Ross and the judge supply short off-camera lines. The main characters have distinct uniforms and wire hair/hands. A Three.js courtroom adds the witness stand, lectern, tables, seating, warm sconces, court seal and flag. Source shot changes guide close-ups and reaction shots. Manual whole-room/character cameras, subtitles, restart, seek and an audio download are available. Existing songs and their default remain intact.

`?scene=princess-bride` adds the complete **Inconceivable! / Cliffs of Insanity** scene (2:20.5), including the long climbing passages and final exchange. Vizzini, Inigo and Fezzik have three independently rendered physical voices and airway heads, with distinct costumes, hair and body sizes. The procedural set includes the sea, boat, cliff strata, ruins, rope and coil, a sword, knife, a silent masked pursuer and red-clad passenger. Climbing, arrival, rope cutting/falling and camera movement follow the same clock as the dialogue and restore after seeks. Quiet wind, sea and rope sounds are generated; no original movie audio/video is served. Its 21 subtitle cues, 24 shots, MP3 mix and three telemetry tracks live in ignored `public/scenes/princess-bride/`. A scene switcher keeps both movies accessible alongside all existing songs.

Dialogue intervals come from local transcription/analysis of the provided video. CHIMERA's normal phonetic phrases are fitted to the original line intervals, preserving the pauses and speaker turns while keeping natural consonant and vowel timing within each line. They are rendered at 48 kHz, with the same clock supplying mouth telemetry. Minor room reflections are applied to the synthetic mix. Speech, actor resemblance and alignment are approximate; this is a stylized physical-voice reconstruction. The raw reference, transcript and rendering work stay outside the repository. Prepared captions, speech mix, credits and telemetry live in ignored `public/scenes/a-few-good-men/`, which must be retained for a rebuild and included in deployment/source-download archives.

Validation covers scene metadata, subtitle/camera timing and backwards seeks, off-camera characters, camera framing of both airway heads, geometry/resource cleanup, finite audible rendered voices, matching mouth clocks and a clean ending. Native tests, Bun tests, type checking and the production build are run. Browser playback and visual/layout QA remain unverified because browser access was declined.

### Download the scene as a subtitled video

On A Few Good Men, **Download MP4 for X** provides a verified pre-encoded copy of the user's captured scene, with its existing subtitles: H.264 High, AAC-LC stereo, YUV 4:2:0, square pixels and constant 30 fps in a fast-start MP4. This direct file is prepared locally in ignored `public/scenes/a-few-good-men/for-x.mp4`; it downloads immediately without another real-time capture. The native upload to X is not performed.

Both scenes’ **Record a new video** button records the full take from zero at 1280×720 and 30 fps, with the scene's audio and subtitles drawn into the picture. It explicitly requests H.264 video with AAC-LC audio for MP4, and uses WebM when that combination is unavailable. A generic MP4 capability is insufficient: some browsers choose VP9/Opus inside MP4, which X rejects. Preparation runs in real time (2:08 for A Few Good Men, 2:20 for The Princess Bride); keep the tab visible. A progress indicator and Cancel are available. A persistent **Save video** link is provided after completion if the automatic download did not start.

Recording uses an audio tap from the existing decoded movie mix and the audio source clock, avoiding speaker latency in the exported mouth movement. It uses automatic camera cuts and includes subtitles regardless of the page's display setting. Playback controls are disabled during the take. Cancellation, navigation, hiding the tab, audio interruptions and encoder errors release the capture/audio tracks and reject incomplete output. The previous playhead is restored paused. No screen-sharing or microphone permission is needed: only the app's own rendered scene and decoded audio are captured. Existing playback remains on the audible clock.

Tests exercise format fallback, caption rendering, complete audio/video track wiring, capture from zero, cancellation/hidden-tab cleanup, restoring the player and separate recording/audible clocks. Browser recording of the added Princess Bride scene remains unverified because browser access was declined; no pre-encoded Princess Bride MP4 is linked. The supplied A Few Good Men browser capture and its corrected MP4 have been inspected with local video tools.

## Vocal band

### Τα παιδιά του Πειραιά — original music, Greek voice and robotic fingers

The ninth song, `?song=ta-paidia-tou-peiraia`, uses the full supplied Μελίνα Μερκούρη recording (3:18.9 plus a short release). Recorded instrumental music stays in its original two channels. CHIMERA replaces the lead with Greek physical singing following estimated vocal pitch and corrected/aligned Greek word timings. The intro, instrumental passages and ending remain. The existing Greek front end supplies the vowels, stress and consonants; no original vocal is intentionally played.

Twenty-seven detected finger clicks in the intro, bridge and ending are recreated with short procedural finger/palm impulses. Original clicks are reduced in the separated percussion channel during those passages; other source instruments remain in the backing. A jointed robotic hand presses thumb and middle finger together, releases against the palm and flashes at the click, on the same absolute audible clock as its audio. Pause, backwards seek, mute/solo and level changes remain synchronized. Singer, hand and music have independent channels; editing/re-rendering the singer retains both accompaniment channels. Finger events are not vocal gestures and do not fetch mouth telemetry. Source-separation traces and approximate pronunciation/timing are acknowledged in the song.

Prepared lyrics, score, backing, synthetic voice/click files, compressed mouth telemetry and credits stay in ignored `public/band/ta-paidia-tou-peiraia/` and the deployment/source-download archives. Raw recordings and preparation files stay outside Git. Existing songs and scenes remain; movie mouth telemetry is now losslessly compressed using the same byte-aware decompressor as band assets, with every original frame verified unchanged.

Checks cover separate hand loading/mixing, click silence/onset times, deterministic five-digit hand motion, seeks/pause, valid click metadata, Greek title pronunciation, complete vocal syllable coverage, matched audio/animation clocks, finite unclipped audio, instrumental fidelity and reduced original clicks. Browser playback/layout QA remain unavailable because browser access was declined.

### Apricots — BICEP, twelve wordless mouths

The eighth song, `?song=bicep-apricots`, adds the full user-supplied official-video recording (4:08.5 plus a short lead-in/release). Eight pitched mouths perform the vocal hook, two newly arranged choir harmonies, upper synth figures, three source chord lanes and bass. Four other mouths supply detected kick, snare/clap, hats and longer breath accents. Original source timing, the vocal-loop entry, long choir breakdown, beat return and outro are retained; estimated pitches, octave choices and supporting harmonies make this a vocal reinterpretation rather than an exact instrumental transcription. Every playback source is rendered from CHIMERA; no original audio or separated stems are served.

Local analysis separates source layers, estimates polyphonic notes and detects drum attacks. Choir harmonies follow the vocal-hook timing using source chord tones. Filters, delay and dynamics act only on the generated mouth audio. Prepared score, twelve mono MP3s, twelve compressed telemetry tracks and credits live in ignored `public/band/bicep-apricots/`; retain them for rebuilds and source-download packages. The shared ensemble display, mute/solo, levels and WAV export are available. The first seven songs, default selection, movie scenes and retained-head fix remain.

Checks cover the library addition, unchanged old score data, valid voice plans, finite audible generated/decoded samples, unclipped stems and mix, audible breakdown/outro and matched mouth clocks. Browser playback/visual QA remain unverified because browser access was declined.

### MEGALOVANIA — full 24-mouth choir

The seventh song, `?song=megalovania`, adds the complete 2:36 **MEGALOVANIA** by Toby Fox (Undertale), using [fakt13’s full MIDI transcription](https://www.vgmusic.com/file/3e64559c315f11156bf8f8d5ccad635c.html). Its 3,043 pitched notes retain their original timing and overlapping chord lanes, with octave changes for vocal range. Nineteen mouths sing wordless syllables; five mouths perform all 1,913 drum events as kicks, snares, hats and crashes. No recorded instrumental or source audio is mixed in. Some parts enter only for short accents, as in the score. The exact MIDI in the supplied 24-mouth video is unknown. Existing songs and the default selection are retained.

Every mounted band head now retains its acoustic model until it unmounts, sharing identical bodies without the live preview cache evicting them. MEGALOVANIA uses 13 different body blends; the old eight-model cache disposed several models while their heads still held them, leaving blank panels. Regression checks keep all 24 head references drawable while the live cache cycles, and verify sharing and cleanup.

The ensemble uses a responsive six-column stage, independent mute/solo/levels, and 20 fps mouth telemetry. Its heads share one WebGL renderer and copy each rendered scene to a separate 2D canvas, avoiding 24 live graphics contexts. Imported arrangements with more than eight loaded mouths use the same ensemble presentation. The editor now supports up to 24 selected voices. Most prepared stems end after their last event and release; their shorter buffers remain aligned on the common playback clock, reducing silent audio in memory.

Score/stems/telemetry/credits live in ignored `public/band/megalovania/` and deployment/download archives. Keep this directory when rebuilding. Checks cover the 24-part score, retained MIDI timing, known beatbox sounds, audible unclipped stems, audio/animation clocks, the shared renderer lifetime, unchanged library/default and the 24-voice limit. Browser playback and layout QA remain unverified because browser access was declined.

### Original singing and whistle passages

`?song=synnefoula` is one combined performance of the full 2:15 supplied recording. The same mouth sings the Greek vocal sections and whistles in the original whistle sections (the intro and two links between verses). Both previous experimental links resolve to this song; the separate all-whistled entry is removed. The other five songs remain.

The original whistle's high, narrow spectral ridge is tracked from the supplied recording, preserving its actual register, phrase timing and small tuning changes. A narrow moving spectral notch reduces the recorded whistle in the stereo backing during those passages; the instruments outside the edited passages are unchanged before encoding. Some source traces and separation artifacts may remain. The generated whistle uses a dedicated tone model; the airway animates pursed lips and breaths. A single lead stem switches between generated Greek singing and synthesized whistling, including matching animation and audible-clock telemetry. Vocal-fold voicing is disabled during the whistle passages and restored for singing. The editor marks this as **Automatic: singing + original whistle passages**.

Tests cover the mode changes, actual whistle register, vocal pitch outside whistle sections, mouth posture, silent gaps, and both old links. Full native/unit checks and production build are run. Browser visual/audio QA remains unverified because browser access was declined.

### Συννεφούλα — Greek lead with the original instrumental backing

The sixth song, `?song=synnefoula`, uses the user's supplied **Διονύσης Σαββόπουλος — Συννεφούλα** recording (2:15). Demucs separates its instrumental backing, retained as stereo recorded audio; CHIMERA generates the new male lead and recreates the original whistle passages. The source singing is not used as the playback vocal. Word timestamps and monophonic pitch are estimated from the separated vocal, so pronunciation and timing are approximate, and faint original vocal traces may remain in the instrumental. The original intro, instrumental passages and ending remain. Mute/solo and level controls independently balance singer and music; voice edits re-render only the mouth and retain the backing. WAV downloads preserve stereo channels.

`src/phonetics/greek.ts` adds a Modern Greek text front end shared by speech and song planning. It covers the five Greek vowels, spelling pairs, written stress, diaeresis, dental and velar/palatal consonants, common consonant clusters and syllable boundaries. It uses existing airway phonemes and leaves English pronunciation and the Rust engine unchanged. Orthographic rules were checked against [eSpeak NG's Greek rules](https://github.com/espeak-ng/espeak-ng/blob/master/dictsource/el_rules); dialectal forms, optional sung hiatus and loanwords can need adjustment. The recording, transcript, melody and stems stay outside Git; only the prepared song assets in the ignored `public/band/synnefoula/` directory are included in deployment and download archives.

Checks cover Greek pronunciation and a real short airway render, backing loading without mouth telemetry, separate mute/solo, stereo WAV preservation and the unchanged previous five songs. Full unit/native checks and the production build are run. Browser playback and visual layout checks remain unverified because browser access was declined.

### Night Train Radio — new-lyrics quartet

The fifth song, `?song=night-train-quartet`, is a full 2:26 quartet adaptation of the **Mr. Sandman** tune with entirely new words about a night train moving through a waking city. The new words are in `src/band/nightTrainWords.ts`. Bass, tenor, alto and soprano sing close harmonies, staggered introductory syllables, three verses, a bass ticket-call response and a sustained final chord. All audio is generated by CHIMERA; no source recording is mixed into the result.

The musical-note reference is [Fernando Montero’s choral MIDI](https://www.coronostrotempo.es/pag/partituras.htm), transposed down a semitone and adapted to the four voice ranges. Music is by Pat Ballard; the replacement words are newly written for this project. The supplied Chordettes recording informed the musical reference and the supplied video informed the quartet presentation. The track retains the existing four songs and default. Its note data and generated stems stay in the ignored `public/band/night-train-quartet/` directory and the deployment/download archives; retain that directory for a complete rebuild.

The quartet uses a row of four heads on desktop, faces the two right singers toward the center, changes the featured singer during playback, and shows the new lyric line beneath the heads. Tablet and phone layouts retain normal document flow. Tests cover preservation of the existing library, caption/spotlight timing and backwards seeking. Offline checks validate every new syllable, note ordering, gesture limits, sound samples and audio/animation duration. Browser visual QA remains unavailable because browser access was declined.

### BICEP — Glue vocal remake

The fourth song, `?song=bicep-glue`, is a full-length, wordless vocal reinterpretation prepared from the user's local **Bicep - Glue (Original Mix)** recording. Source separation and polyphonic pitch estimation supply the hook, sampled-vocal melody, three chord voices and bass; frequency-band attack detection supplies the mouth kick, snare and hats. Transcribed notes and timings are approximate. The vocal melody is lowered an octave for the choir. Eight CHIMERA mouths generate all playback audio, followed by filtering, gentle beat pumping and delay. The original recording and separated source audio are not served.

This cover's score, synthesized stems and mouth telemetry live in the ignored `public/band/bicep-glue/` directory and the prebuilt deployment archive, outside the source repository. Keep that directory when rebuilding the deployed edition; it is not recoverable from a clean source checkout. The catalog loads its score on selection, checks its voice IDs and metadata before fetching assets, and retains the existing three songs and default. Cancelling or switching a pending load cannot install an older song.

### Wordless electronic track

**Neon Current** is an additional original 3:03 track at 128 BPM, alongside both existing songs. Eight simulated mouths provide chopped vowel hooks, fast vocal arpeggios, counter pulses, two choir pads, a rounded bass voice, a mouth breakbeat, and breath percussion. It has an intro, groove, lift, drop, breakdown, build, second drop, and outro. It contains no words or spoken lines.

The dry material comes entirely from CHIMERA. A separate optional processing stage adds tempo-locked delays, quarter-note gain pumping, low/high-pass filters, saturation, section-level filter/gain automation, and an end fade. The same processing runs when re-rendering an edited part in the app. Existing songs keep their original processing and default selection. Wordless tracks show vowel selectors and suppress lyric overlays. A `?song=neon-current` link selects this track directly; changing the song updates its shareable URL.

Tests cover preservation of existing songs/defaults, absence of lyrics/speech in the new track, musical echo timing, high-frequency attenuation, beat pumping, section automation and a clean ending.

The song selector includes **House of the Rising Sun**, a 2:49 treatment of the traditional anonymous folk tune with newly written verses and a new seven-voice arrangement. It has a humming intro, two verses, two refrains, a wordless bridge and a layered coda. The folk melody and opening lines are retained; modern recording arrangements and recordings are not used. The default selection is the longer track; the original short song remains available.

The traditional-tune reference is [Frank Nordberg’s anonymous folk-tune transcription](https://trillian.mit.edu/~jc/music/abc/mirror/musicaviva.com/tunes/usa/house-of-the-rising-01.abc), transposed from D minor to A minor. The [Library of Congress program notes](https://www.loc.gov/static/events/concerts-from-the-library-of-congress/documents/programs/2324-Kronos-Quartet-April18-program.pdf) document the song’s traditional history. New verse words, harmonies, rhythm patterns and recording were made for this app.

Long-song lyric mapping explicitly tracks syllables across held notes; tests check that every syllable is reached and held vowels do not advance the words. Switching songs resets playback and exposes a reload action if loading was cancelled or failed.

The selector also plays **All Made of Air**, an original 35-second, seven-voice a cappella arrangement with an intro, verse, chorus and spoken outro. A large lead mouth is accompanied by harmony, an answering choir, a doo-wop rhythm voice, bass, beatbox and a separate spoken voice. Every stem is generated by the original CHIMERA physical engine; there are no instrument samples or copied commercial recordings.

- Press **Play the whole band**. Mute, solo, set levels, pause, seek, restart, or download the current mix as a stereo WAV.
- **Import a MIDI arrangement** retains all pitched tracks and overlapping chord notes as separate mouths. Drum-channel notes become kick/snare/hat mouth gestures. Select up to 24 voices, change singers or lyrics, and render the parts locally. The first 24 are selected when a file needs more. MIDI supports excerpts up to five minutes, 2,000 notes per voice, and 64 available voices; complex scores may need shorter excerpts to fit the engine's gesture capacity.
- Each voice uses the same sample clock for sound and recorded mouth movement. The included song is pre-rendered for immediate playback. Custom MIDI rendering runs in a worker and may take a few minutes.
- **Single-mouth player** (`?solo=1`) retains the earlier audio/MIDI melody player. An MP3 cannot automatically become a full multi-part arrangement: vocal separation and transcription are not included.

The band is rendered at 48 kHz, with a guard against unstable sound output. Additional tests cover chord preservation, percussion mapping, exact lead syllable alignment, sound/animation timing, synchronized stem starts/seeks, mute/solo and stereo WAV export. Visual application QA remains unverified because browser access was declined; the user-supplied reference video was inspected locally.

## Run this edition

With Rust/Rustup and Bun installed:

```sh
rustup target add wasm32-unknown-unknown
bun install
bun run dev
```

Open the printed localhost address. `bun run build` produces the static `dist/` app; serve it on localhost or HTTPS. For a downloaded package containing a prebuilt `dist/`, `python3 -m http.server 5317 --directory dist` runs it without a build.

Validation: the upstream native Rust suite and Bun tests pass, including added tests for MIDI tempo/rests, audio pitch, rendered silence during rests, and the actual worklet's >4,000-gesture scheduling. Browser layout and interaction QA were unavailable because browser access was declined.

## Original project

A physical-modeling voice synthesizer in the browser. Every sound comes from a simulated
airway (lungs, vocal folds or syrinx, a branched vocal tract, lips, nose), not from samples.
The engine is Rust, compiled to WebAssembly for an AudioWorklet; the same code runs natively
for tests and the `chimera` CLI.

## What it does

- **Play**: drag the tongue, lips and jaw in a live cutaway of the head; vowel pad, encoders,
  computer keyboard and Web MIDI.
- **Speak**: English text (CMUdict with a letter-to-sound fallback) or IPA, turned into
  gestures and prosody, with the gestural score and a consonant chart on screen.
- **Sing**: piano roll with lyrics per note; consonants land before the beat.
- **Beatbox**: pads and a step sequencer, every drum an articulatory gesture.
- **Bestiary**: songbird (two-voice syrinx), seal, alligator and elephant.
- **Duet** (`?show=<id>`): two 3D heads replay a pre-rendered song.

Male, female and child bodies blend continuously. Everything on screen animates from live
engine state: pressure in the airway, airflow, the vocal folds, spectra and formants.

## Run it

Needs Rust with the `wasm32-unknown-unknown` target, and Bun.

```sh
bun install
bun run dev        # builds the wasm, then Vite on 127.0.0.1:5317
bun run test       # wasm build, cargo test --workspace, bun test tests
```

The AudioWorklet needs a secure context, so open it on localhost or over HTTPS (for example
`tailscale serve`). Vercel builds it with `vercel.json`.

Offline renders and measurement:

```sh
cargo run --release -p chimera-cli -- render speech|text|song|notes|beatbox|creature|vowels …
cargo run --release -p chimera-cli -- diagnose       # nasal leakage, formants, bandwidths, pitch
cargo run --release -p chimera-cli -- compare csd    # against a real singer (docs/csd-comparison.md)
cargo run --release -p chimera-cli -- compare tsp    # against 23 real speakers (docs/speech-comparison.md)
bun tools/spectrogram.ts in.wav out.png
```

## Docs

- [docs/architecture.md](docs/architecture.md): the acoustic model (FDTD airway, sources,
  anatomy, gestures).
- [docs/rust-engine.md](docs/rust-engine.md): the engine's real-time and determinism contract,
  and the browser boundary.
- [docs/ui-redesign.md](docs/ui-redesign.md) and [docs/mockups/](docs/mockups/): the vector
  display look.
- [docs/csd-comparison.md](docs/csd-comparison.md): scoring the voice against the Children's
  Song Dataset.
- [docs/speech-comparison.md](docs/speech-comparison.md): scoring the speech against real
  speakers, phone by phone (the TSP speech database).
- [docs/hill-climb/](docs/hill-climb/): the rules and log for tuning the voice one measured
  step at a time.

Agents: see [AGENTS.md](AGENTS.md).

## License

[MIT](LICENSE). Bundled third-party files keep their own licenses: the CMU Pronouncing
Dictionary ([public/data/CMUDICT-LICENSE.txt](public/data/CMUDICT-LICENSE.txt)) and the fonts
([public/fonts/](public/fonts/)).

Prepared band telemetry is stored as `.tele.gz` with `telemetryEncoding: "gzip"` in its prepared score. The asset loader decompresses it losslessly before reading the same telemetry format. This makes room for the additional songs and ready-made MP4 within the hosting archive limit; existing audio, notes and every telemetry sample remain unchanged. Raw backups stay outside public assets. Production builds omit source maps; the repository retains the original source.

## HAL 9000 · the memory core

`?scene=hal-9000` adds the disconnection scene from 2001: A Space Odyssey (3:07.5) as a third movie. Unlike the two earlier scenes it has no supplied clip: `tools/render-hal-scene.ts` holds the lines with hand-set start times, plans them with the normal phrase planner, and takes each caption's end from the plan. HAL's base pitch and speaking rate fall line by line from the first module to the song. “Daisy Bell” (Harry Dacre, 1892) is entered as 51 notes, planned at an even tempo, then every gesture is moved through one time curve that slows the tempo to 2.35× and lowers the sung pitch with it, so the performance runs down like a tape while the mouth keeps articulating each syllable. Dave has one spoken line; the rest of his part is breathing, planned as long open /h/ gestures on his own airway and heard through a band-limited helmet. A generated power hum thins with the room, and each of the 24 modules has a soft release sound. Nothing from the film's soundtrack is used.

`src/scene/core.ts` is the room's clock: module release times, the room's remaining power, the astronaut's drift along the rack and four slowly drifting cameras are pure functions of scene time, so pausing and backwards seeks restore them. `src/ui/render/core.ts` draws the vault in one colour around the two airway heads; HAL's head sits in front of the eye with its mouth at the eye's centre, and the eye is the only light. Captions for this scene fade in and out instead of switching.

Checked: scene validation per film, clock functions and seeks, both close-up framings, the prepared score, matching telemetry clocks, audible voices on every cue and the fall in sung pitch (`tests/core.test.ts`). The mix was also transcribed with Whisper (small.en) as a rough intelligibility check: the spoken lines come back nearly verbatim, the song's last lines do not, by design. Headless-Chromium screenshots were inspected for each camera. Not checked: listening by a person, and video recording of this scene in a real browser.
