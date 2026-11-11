# Apollo 13 — Houston, we've had a problem

`?scene=apollo-13`, 3:20. The oxygen tank failure of 13 April 1970, from Houston's request to
stir the tanks to the flight director telling his room to keep cool.

## The words

Jim Lovell's, Jack Swigert's, Fred Haise's, CapCom Jack Lousma's and flight director Gene
Kranz's own, from NASA's air-to-ground transcript and the flight director's loop as collected,
with times, in the Apollo 13 Flight Journal ("Day 3: Houston, we've had a problem"). These are
public record; the journal's editorial notes are not used. Two stretches are covered: 055:52:58
to 055:58:33 ground elapsed time, and 056:08:57 to 056:10:46.

Left out: hesitations ("uh", repeated words), the reaction-control helium report, and everything
on the flight director's loop except Kranz's last speech, which is cut at "a good portion of it
with". Nothing is added. Three captions in parentheses say what nobody says aloud: the fans
going on, the bang, and "Ten minutes later".

## The clock

Unlike the Apollo 11 scene, this one does not keep the mission clock. In the mission the bang
came 101 seconds after "Stand by" and the crew's first report 26 seconds after the bang; here
those are 7 and 5.5 seconds, and ten minutes are skipped before Lovell sees the gas. The order of
the lines is the record's. `src/scene/odyssey.ts` holds the scene's three fixed moments
(`ODYSSEY_STIR`, `ODYSSEY_BANG`, `ODYSSEY_LATER`); `tools/render-odyssey-scene.ts` lays the
dialogue out around them and stops, naming the value to set, if a line would cross one.

## The picture

Three places on one clock, only the one in view drawn: the docked spacecraft between the Earth
and the Moon, the command module's cabin, and Mission Control with the CapCom seated and the
flight director standing behind. At the bang the panel over service module bay 4 leaves and
tumbles away, gas streams from the bay and gathers into a cloud, and the stack rocks and settles.
In the cabin the master alarm flashes for eight seconds, the Main Bus B undervolt light comes on
and later Main Bus A, and the oxygen tank 2 gauge does what Haise and Lovell report: it swings
between 20 and 60 percent, goes off the top, and reads zero after the cut. The hatch window shows
the gas once there is a cloud to see.

Not from the record: the exact look of the damage (the panel was not seen until the crew
photographed the service module four days later), the size of the cloud, and tank 1's reading.

## Sound and speech

The crew and the CapCom are heard over the air-to-ground loop (300 Hz–2.8 kHz, hiss, Quindar
tones around Houston's transmissions); Kranz is heard on Mission Control's own loop, a little
fuller. The tank fans, the bang and the master alarm's two tones are generated. The air-to-ground
loop did not carry the bang; it is here because the scene is also inside the cabin.

Numbers and initials are spelled for the dictionary ("pings" for PGNCS, "lem" for LM), and a few
words respelled without changing the word. Lovell's "we've had a problem" was heard by Whisper as
"we heard a problem" (the dictionary's weak "had"); with "hadd" it hears "we had a problem".
Still unclear: "Undervolt" is heard as "under hold" in every spelling tried, an engine limit on
/v/. `tools/scene-clarity.py apollo-13` printed 28.8 % of words misheard before that fix, a
figure inflated by captions written in figures.

## Rebuilding

    bun tools/render-odyssey-scene.ts --plan   # the timeline
    bun tools/render-odyssey-scene.ts          # about three minutes; needs ffmpeg
    bun run content:manifest
