# Toni Braxton — Un-Break My Heart

Open `?scene=unbreak-my-heart`. This is the complete supplied 273.159546-second music video, with a 0.35-second physical release for 273.509546 seconds. It is an additional selection alongside the existing library.

## Physical singing and original music

The owner approved the validated 53–89 second first-chorus preview: “Sounds good—use this.” The full score preserves that excerpt's exact prepared phones, phrasing, continuous pitch and body/voice settings. The adult female body blend is 0.82, pressure 7.6, brightness 0.50, breathiness 0.035 and tension 0.53; random drift and added vibrato are zero. The measured source contour carries its expressive slides and vibrato.

The unchanged physical airway generates the featured singing. The voice contains no recorded singer samples, voice clone, vocoder or recorded-vocal effects. Corrected source words are aligned locally to dictionary phones, with explicit two-syllable pronunciations for unbreak and uncry, complete consonants, sustained vowels and late diphthong glides. The score has 260 words and 295 sung syllables. The generated mouth telemetry is captured during synthesis.

Two independent source recognizers were compared, with additional short checks of the sustained ending. Some tail recognition was unreliable: the source's final on was aligned late, so its vowel entry was restored to the measured source window near 245.3 seconds. The held run continues through the quiet vocal fade. The final empty/applause interval produced a recognition hallucination of “Thank you”; it is not added to the singing. Timing, phonetic alignment, pitch estimates and pronunciation remain approximate.

Continuous separated original accompaniment begins at zero and preserves the complete source speed, story opening, instrumental break, applause and ending. There is no copied original-vocal prefix. Separation may leave faint recorded voices or artifacts. Original source video, stems, analysis caches and model weights stay local and outside Git.

## The full video scene

The opening motorcycle, helmet-like shapes and roadside car establish the tragedy without graphic injury. Warm home memories, partner with a shaved head, blue pool, circular mirror and shaving gesture, bedroom, and seated grief on cool stairs alternate on the source clock. Brown curls, earrings and a black outfit give way to the short curly bob and ivory halter gown in the theatre finale.

The theatre has a populated seated orchestra, stands and scores, moving violin bows, audience, gold columns and rosettes, moving blue/gold light beams and closing red curtains. Tighter singer shots hide the busy orchestra background. Source-time costume, room, posture, hand gestures and camera movement restore directly after seeking. The singing anatomy hides behind the closing curtain rather than shining through it.

The physical head borrows one retained voice model for its mounted lifetime. Decorative people share scene-local geometry and materials and allocate no voice models. The shared cast supports skin/hair colours, bald heads, dark trousers, connected necks and a ballad pose. Disposal releases only the stage's owned graphics. Likenesses, actions and exact choreography remain stylized approximations.

## Rebuild and verification

Six prepared files contain the complete scene, physical score, original backing, mixed audio, compressed mouth telemetry and credits.

```sh
bun tools/render-unbreak-my-heart-scene.ts
bun run content:manifest
bun run verify:content
```

Keep all 549 earlier public files byte-identical. The new manifest contains 555 files. Regression checks protect the full source duration, final held vowel, complete physical score, sample-clock telemetry, quiet opening and ending, all seven sets, seated grief, gown, orchestra/curtain state, close-up framing, exact seek restoration and borrowed model ownership.

Browser, Playwright and layout-lint access remain declined in this chat. Native geometry projections and HTTP delivery checks do not verify GPU lighting, browser playback, or real-time recording/export interaction.

The finished stereo render has 13,128,459 frames and each physical telemetry track has 5,471 frames. All 27 phrases have measurable sound; the quietest phrase has RMS 0.102927. The decoded MP3 peaks at 0.910115. The scene has 38 caption windows and 31 camera cuts. The full mix applies a 0.926196 headroom trim equally to accompaniment and generated lead.

Twenty-four stable planned waveform windows were measured independently: the largest fundamental-pitch difference was 53.79 cents. No octave-ambiguous window required an independent override. This tests the generated waveform against its prepared contour, rather than proving that the original singer’s melody was transcribed perfectly.

The unchanged English scene-clarity listening aid misheard 114 of 260 caption words (43.8%). This is not an intelligibility pass; uncry and parts of the later refrain remain difficult for the recognizer. The owner-approved chorus and original sound settings are retained.

Final validation passed 187 native tests (two existing ignored), 387 Bun tests across 96 files, TypeScript, the 555-file content verification, production build and local HTTP checks of all prepared assets, the direct scene route and app bundles. Ten focused Toni/Bon Jovi checks also passed after the closing-curtain cleanup. Native compositions were inspected across all seven sets, portrait views and the fully closed curtain. A regression protects against wire bows remaining visible through the curtain; the actor and physical voice ownership tests remain intact. All 549 preceding public files are byte-identical and the tracked WASM still matches its provenance.

## Live release

Application commit `fd93646` is live at [Un-Break My Heart](https://agenticspiros.com/chimera-song-mouth/?scene=unbreak-my-heart). All seventeen changed files uploaded successfully, with the entry page last. HTTP checks matched 38 live files byte-for-byte, including all six new scene files, application bundles, preserved Bon Jovi/Hello/Whitney media and the direct route. The temporary publish job was removed. Browser playback and real-time recording remain unverified in this chat.
