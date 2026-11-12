# The Avalanches — Frontier Psychiatrist

Open `?scene=frontier-psychiatrist`. This adds the complete supplied official music video as a surreal theatre scene alongside the existing songs and scenes.

The supplied recording lasts 257.578957 seconds. The prepared scene lasts 258.178957 seconds, including a 350 ms lead-in and a 250 ms release. The instrumental opening, spoken montages, scratched samples, nonverbal effects and closing curtain are retained. The original video is not embedded.

## Physical voices and sample timing

CHIMERA's airway engine generates six distinct voice channels: headmaster, mother/drummer, cowboy, doctor, announcer and parrot/answering voice. Their body blends, registers and source-shaped inflections differ. The committed performance has 91 utterances with word landmarks and explicit phonemes, passed through the existing clear-speech planner. No recorded speaker, vocoder or voice filter is used in the generated dialogue channels.

The score stays on the original recording's clock. Waveform matching recovered the repeated chorus at an 87.33571-second offset and the chopped title and violin samples. Independently aligned words retain their own measured landmarks. Music is never time-stretched. Short sample phrases are rendered in groups with 200 ms of preparation/release space; untouched gaps contain silence, and telemetry keeps the absolute 20 Hz scene clock.

Listening revisions restored the initial sound of “psychosomatic,” which an ASR word boundary had cut short. The approved version gives the “koh,” “so-MAT” and final “tik” enough articulation time, with a steady rounded vowel and a firmer voiced ending. The owner approved the final version after identifying each unclear section. Both choruses use the correction. The closing “white as a sheet” and “false teeth” phrases also have clearer consonants, vowels and word timing.

The original music and nonverbal effects remain. Continuous vocal separation replaces the recorded dialogue throughout the spoken montages; unchanged source audio is used outside those passages. Separation can leave faint recorded vocal traces. Source video, raw stems, model weights, analysis caches and intermediate renders remain outside the repository.

## Surreal theatre

The wireframe reconstruction includes gold tinsel curtains, a monochrome opening conversation, headmaster with glasses and suit, elderly drummer with pearls, orchestra, two cowboy hats, sheet ghosts, human-headed turtle, formula blackboard, dancers, megaphone, parrot costume and spinning record. Forty-five camera shots follow the supplied video approximately.

Six featured heads use retained physical models. A seventh head on the turtle borrows the active speaker's model and telemetry. Background players and dancers are decorative. The stage owns and disposes its graphics, but leaves borrowed physical models to their owning leases. Closed curtains hide stage figures so anatomy drawn without depth testing cannot shine through them.

Motion follows measured beat markers and absolute scene time. Pausing, seeking and restarting do not accumulate animation drift. Close-up cameras account for wide and narrow aspect ratios. The staging, delivery and pronunciation are approximate reconstructions.

## Rebuild and verification

`public/scenes/frontier-psychiatrist/` contains eleven prepared assets: scene/captions, performance score, mix, backing, six compressed telemetry tracks and credits.

Regenerate the physical voices, mix and telemetry from the committed score and backing with:

```sh
bun tools/render-frontier-scene.ts
bun run content:manifest
```

The renderer checks finite, audible voice output before replacing assets. Audio checks cover the full duration, every phrase, unclipped mix, silent dialogue channels during instrumental passages and complete telemetry coverage. Tests cover the full scene, sample rendering, repeated timing, props, seeking, camera framing, curtain occlusion and model/resource ownership. Native projected views were inspected.

Browser, Playwright and layout-lint access remain declined in this session. Browser playback, browser rendering and recording/download interaction have not been tested. Native/Bun tests, TypeScript, content hashes, a production build and HTTP/file checks provide the available verification.

The unchanged local speech diagnostic misrecognized 235 of 368 words (63.9%) when listening to isolated caption cuts with the original music. It also misrecognized the word the owner approved by ear. This remains approximate robotic speech, especially in the short scratched samples; the diagnostic is recorded as a limitation, not a passing intelligibility score.

Final local validation: 144 native tests passed (two existing tests ignored), 291 Bun tests passed across 74 files, TypeScript passed, and the production build verified all 430 public assets. All 419 earlier public files remain byte-identical. Local HTTP checks cover the direct scene route, app bundles and all eleven new scene files.
