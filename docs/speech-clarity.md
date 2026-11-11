# Speech clarity: which sounds need more time

Some words in the spoken scenes are hard to make out. This note records what was measured on
2026-11-11, what was added for it, and what is left in the engine.

## The measurement

81 sentences were rendered through the wasm engine exactly as a scene renders them (`planPhrases`,
then `renderPart`): the speech judge's 20 training sentences in the adult male and female bodies,
and the 41 Wizard of Oz lines in their five voices. Whisper (small.en, greedy) transcribed each
alone. 697 words; one word is 0.14 points, and two runs of the same setting differ by a point or so.

| Setting | Words wrong | Time |
|---|---|---|
| As planned | 29.0 % | 208 s |
| Breathier, drier, brighter, or the scenes' "clear" source settings | 27.4–30.7 % | 208 s |
| +8 dB around 3 kHz, or a high shelf, after rendering | no change | — |
| Every consonant 1.4× longer | 31.3 % | 245 s |
| Stressed vowels 1.5× | 26 % | 241 s |
| Unstressed vowels 1.5× | 21.2 % | 226 s |
| All vowels 1.4× | 19.2 % | 249 s |
| **Unstressed vowels 1.7×, stressed 1.4×** | **17.1 %** | 259 s |
| All vowels 1.7× / 2.0× | 17.2 % / 17.7 % | 279 s / 309 s |
| Everything slower: rate 0.85 / 0.72 / 0.6 | 25.8 % / 21.0 % / 27.8 % | 245 s / 283 s / 336 s |

So the time has to go to the vowels, and most of all to the reduced ones: the planner's Klatt
durations give an unstressed vowel 55–70 ms, and the words around those are the ones lost ("of
a", "and", "the", "me a"). Lengthening consonants does nothing, the voice's timbre does nothing,
and slowing the whole line buys less per second than lengthening its vowels. Past 1.7× nothing more
is gained.

## In the engine (2026-11-12, branch `consonant-clarity`)

The vowel lengths above are now the planner's own (`crates/chimera/src/phonetics/durations.rs`,
hill-climb experiment 21): by the repo's speech judge, 39.07 → 26.49 % on the training sentences
and 45.33 → 38.67 % held-out, with singing bit-identical. `clearPhrases` therefore no longer
scales vowels; it keeps the affricate floor, and `CLEAR_SPEECH_TIGHT` takes vowels part of the way
back for lines that must fit a clip. All speech gets it, including the single-mouth player.
Prepared scenes keep their audio until re-rendered. The rest of this note describes the helper as
it was first added, on main before that branch.

## What was added

- `src/scene/clarity.ts`: `clearPhrases(phrases, body)` multiplies the planner's own vowel lengths
  (`CLEAR_SPEECH`: unstressed 1.7, stressed 1.4, and an affricate never under 90 ms) before
  planning. Sounds with an explicit `dur` are left alone. `CLEAR_SPEECH_TIGHT` (unstressed 1.5
  only) is for a line that has to fit a slot in a source clip: 8 % more time for most of the gain.
- `tools/scene-clarity.py <scene-id>… | --all`: Whisper listens to each caption's stretch of a
  prepared scene's mix and lists the lines it cannot make out, worst first. A listening aid: it
  hears each line without its context or subtitles, so it is stricter than a viewer.
- The Wizard of Oz scene uses `clearPhrases` for every line.

Scenes as prepared on 2026-11-11, by that tool (words misheard): Arrival 6 %, Contact 14 %, The
Matrix 15 %, Cuckoo's Nest 23 %, The Princess Bride 24 %, HAL 9000 26 %, A Few Good Men 32 %,
Project Hail Mary 38 % (sung, over music), Fool me once 45 % (nine short fragments, 31 words).

## What is left, in the engine

With vowels given their time, what Whisper still gets wrong is consonant quality, the same leads
`docs/hill-climb/log.md` already lists: /ʃ/ and /tʃ/ too quiet and too low ("sheet" → "feet",
"chair" → "tail", "chain" → "pain"), voiceless stops heard as voiced ("planks" → "blanks"), a weak
/v/ ("give me" → "gain"). Those need engine work under the hill-climb rules, with the owner
listening before anything reaches main; nothing here touches the engine.
