# Lose Yourself

Open `?song=lose-yourself` for the complete supplied Eminem recording: approximately 5:27, with the full instrumental intro and outro. It is the twenty-first song; all earlier song IDs, default selection and prepared media are preserved.

The original music stays at its original speed. A locally separated instrumental channel runs continuously, including the spaces between words. The generated lead contains only CHIMERA synthesis. No original vocal, vocoder or voice clone is mixed into that channel. Separation can leave faint vocal traces in the backing.

The source transcript was checked and corrected locally, then 786 words / 1008 syllables were aligned to the recording with cached English dictionary and phoneme models. The score contains 22 connected phrases and 4713 reference pitch/stress points. The user approved the second preview, with longer consonants, a slightly smaller airway (`female: .12`), lower breathiness and brighter voicing. Musical-note quantization is not applied to the rap pitch.

`public/band/lose-yourself/arrangement.json` contains explicit phoneme durations, continuous pitch and breath controls, editor syllable notes, sections and every highlighted word. Rebuilding the lead uses the normal `planPart` → `planPerformance` → `renderPart` physical WASM path at 48 kHz. Telemetry is captured in that same render at 20 Hz. The instrumental and generated vocal are independent channels; the existing mix controls and WAV download apply.

The five-minute rap exceeds the previous 1800-phone validation limit. The limit is now 6000, while the existing phrase, pitch-point and renderer gesture limits remain in force. The prepared rap stays below the renderer's 16000-gesture limit. The shared engine and its precompiled binary are unchanged.

## Presentation

The `lyric-video` presentation adds a 16:9 rainy city stage, centered white words, a green active-word highlight, and a circular wireframe mouth at lower left. Words use absolute audio seconds with no extra singing lead-in. The highlight and retained mouth model read the output-compensated mixer clock, so pause, seek and restart keep them together. Seeking backwards uses a fresh binary search; the final word of a line keeps its highlight until it ends. Editing the lyric text hides the prepared highlighting until the original matching text is restored.

The canvas uses the existing shared WebGL renderer for the physical mouth and composites it with the backdrop and captions. It retains its model lease for its mounted lifetime and releases the renderer, animation frame, observer and geometry on unmount. Controls stay inside the fullscreen element. Without WebGL the lyrics and audio can still play with a visible error message.

The rainy city PNG was generated with the built-in image-generation tool and copied unchanged into `public/band/lose-yourself/`. Its complete generation prompt is in `background-prompt.txt`. It contains no baked-in words or interface.

## Checks

`tests/lose-yourself.test.ts` checks the full catalog addition, physical score, all lyric layouts/highlight boundaries, stereo backing asset loading, complete finite telemetry, silent intro/outro and rebuildable gestures. `tests/lyric-video.test.ts` covers seeking through rests, a fast line transition, invalid timing/path data, bounded rap size and small-screen layout geometry.

The finished lead and decoded MP3 files were checked for finite samples, correct length, audible words, stereo backing and mix headroom. Existing public assets are checked byte for byte against the prior manifest. Native geometry projections were inspected at 1280×720 and 375×211. These are not browser screenshots; browser playback, fullscreen interaction and layout-lint were not run because browser access was previously declined.
