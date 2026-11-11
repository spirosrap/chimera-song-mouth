# Apollo 11 — the Eagle has landed

`?scene=apollo-11`, 4:20. The last four minutes of the first landing on the Moon, 20 July 1969,
from "You're Go for landing" (102:42:08 ground elapsed time) to "Thank you" (102:46:16).

## The words

Neil Armstrong's, Buzz Aldrin's and CapCom Charlie Duke's own, from NASA's air-to-ground and
onboard voice transcripts as collected, with times, in the Apollo Lunar Surface Journal's "The
First Lunar Landing". These are public record. The journal's editorial notes in parentheses are
not used. A few asides are left out so the rest keeps to the clock ("Give me an LPD", two repeated
rates, the onboard "Engine arm is off"); nothing is added. No recording of the mission is used.

## The clock

The scene clock starts at 102:42:05. `tools/render-landing-scene.ts` starts each line at its
mission time, or as soon after as the line before it allows, and says a late line a little faster.
The latest any line starts is 2.7 s behind; the tool stops if that passes 4 s, or if "Contact
light" and "Shutdown" drift more than 2.5 s from what the picture shows.

The picture is driven by the same record: `src/scene/landing.ts` holds the altitude and forward
speed calls at their mission times, and the lander's height, distance still to fly, tilt, dust and
shadow are all computed from them. Forward speeds before "58 forward" were not called and are
estimates. The Sun is 10.8 degrees up behind the lander, so its shadow runs far ahead of it
("I got the shadow out there"). The PROG light is lit for the 1201 and 1202 alarms, the blue
contact light from "Contact light" to just after "Shutdown".

Three sets share the clock and only the one the camera is in is drawn: the Moon (West crater's
boulder field uprange, the small crater short of the site, a level landing point), the lander's
cabin, and the CapCom's console in Houston. The craters other than those two are placed by a fixed
random sequence, not surveyed.

## Sound and speech

Everything is heard over the air-to-ground loop: each voice band-limited to 300 Hz–2.8 kHz and
driven a little, the channel's hiss, Quindar tones around Houston's transmissions, and a low engine
rumble that stops at "Shutdown". All generated; the voices are CHIMERA airways through
`clearPhrases`.

Numbers and initials are spelled out for the dictionary, and a few words are respelled without
changing the word ("Rah jer", "awn" for a stressed "on", "dee tent"), each checked with Whisper.
What is still unclear: Whisper mishears about a third of the words that are not numbers, mostly in
one- and two-word calls ("Contact light", "Engine stop"), and "Eagle" inside a sentence is heard
as "acre" whatever the spelling. Slowing Aldrin's calls did not help (26 % at this speed, 28–32 %
slower), and the radio filter costs nothing (25 % with, 25 % without). `tools/scene-clarity.py`
over-counts here, because it compares with captions written in figures.

## Rebuilding

    bun tools/render-landing-scene.ts --plan   # the timeline, with each line's lag
    bun tools/render-landing-scene.ts          # about four minutes; needs ffmpeg
    bun run content:manifest
