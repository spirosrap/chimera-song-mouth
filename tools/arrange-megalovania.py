"""Rebuild the supplied video's 24-mouth layout from Radixán's MIDIlovania.

Usage: python tools/arrange-megalovania.py /path/to/MIDIlovania.mid
Requires mido. Keep the input MIDI and render intermediates outside this repo.
"""
import hashlib
import json
import sys
from collections import defaultdict, deque
from pathlib import Path

import mido

ROOT = Path(__file__).resolve().parents[1]
SOURCE_SHA256 = "7b307071cddf8f781daefe5b705b48ef74a64b9db7dd3eec3e947e6861892123"
VERSION = "reference-20261110"
# Row-major order, source track/lane, label, body, octave and syllable. These
# are the settings visible in the owner's 24-mouth reference, not GM timbres.
VOICES = [
    (2, 0, "Saw", "F", 0, "da"),
    (2, 1, "Saw 2", "F", 0, "da"),
    (2, 2, "Saw 3", "M", 0, "da"),
    (3, 0, "Polysynth", "C", 0, "da"),
    (5, 0, "Square", "F", -1, "da"),
    (7, 0, "Polysynth", "C", 0, "da"),
    (8, 0, "Strings", "C", -1, "da"),
    (9, 0, "Brass Ensemble", "F", 0, "da"),
    (10, 0, "Trumpet", "F", -1, "da"),
    (12, 0, "Saw", "F", 0, "da"),
    (13, 1, "Bass 2", "M", 2, "dum"),
    (16, 0, "Voice", "F", 0, "da"),
    (9, 2, "Brass Ensemble 3", "M", 0, "da"),
    (14, 0, "Overdriven", "M", -1, "da"),
    (9, 1, "Brass Ensemble 2", "M", 0, "da"),
    (13, 0, "Bass", "M", 0, "ooh"),
    (15, 0, "Distorted", "M", 1, "da"),
    (17, 0, "Voice 2", "M", 0, "da"),
    (11, 0, "Strings", "F", -1, "da"),
    (11, 1, "Strings 2", "C", 0, "da"),
    (6, 0, "Square", "F", -2, "da"),
    (8, 1, "Strings 2", "C", 0, "da"),
    (4, 0, "Orchestra Hit", "F", 0, "da"),
    (11, 2, "Strings 3", "F", 0, "da"),
]


def read_lanes(path):
    raw = Path(path).read_bytes()
    if hashlib.sha256(raw).hexdigest() != SOURCE_SHA256:
        raise ValueError("Expected the credited Radixán MIDIlovania source; refusing a different score")
    midi = mido.MidiFile(path)
    assert midi.ticks_per_beat == 96
    assert all(m.tempo == 500000 for t in midi.tracks for m in t if m.type == "set_tempo")
    tracks = {}
    duplicates = trimmed = 0
    for ti, track in enumerate(midi.tracks):
        tick = 0
        held = defaultdict(deque)
        notes = []
        for msg in track:
            tick += msg.time
            if msg.type == "note_on" and msg.velocity > 0:
                held[msg.channel, msg.note].append(tick)
            elif msg.type == "note_off" or msg.type == "note_on" and msg.velocity == 0:
                queue = held[msg.channel, msg.note]
                if queue:
                    start = queue.popleft()
                    if tick > start and msg.channel != 9:
                        notes.append(dict(start=start, end=tick, midi=msg.note))
        assert not any(held.values()), f"Unclosed note in {track.name}"
        unique = {}
        for n in notes:
            key = (n["start"], n["midi"])
            if key in unique:
                duplicates += 1
                unique[key]["end"] = max(unique[key]["end"], n["end"])
            else:
                unique[key] = n
        lanes = []
        for n in sorted(unique.values(), key=lambda n: (n["start"], -n["midi"])):
            # The MIDI contains tiny note-off overlaps, not extra chord voices.
            # Trim at most 3 ticks (15.625 ms); never shift an attack or drop a chord.
            free = [l for l in lanes if l[-1]["end"] <= n["start"] + 3
                    and l[-1]["start"] < n["start"]]
            free.sort(key=lambda l: abs(l[-1]["midi"] - n["midi"]))
            if free:
                lane = free[0]
                if lane[-1]["end"] > n["start"]:
                    lane[-1]["end"] = n["start"]
                    trimmed += 1
                lane.append(n)
            else:
                lanes.append([n])
        if lanes:
            tracks[ti] = lanes
    expected = {(ti, li) for ti, lanes in tracks.items() for li in range(len(lanes))}
    assert expected == {(v[0], v[1]) for v in VOICES} and len(expected) == 24
    return tracks, dict(duplicateUnisons=duplicates, trimmedNoteTails=trimmed,
                       uniquePitchedNotes=sum(len(l) for ls in tracks.values() for l in ls))


def main():
    tracks, audit = read_lanes(sys.argv[1])
    parts = []
    source = "MEGALOVANIA · Toby Fox / Undertale. MIDIlovania transcription by Radixán; 24-mouth adaptation following the supplied video."
    for i, (ti, li, label, body, octave, syllable) in enumerate(VOICES):
        notes = [dict(start=n["start"] / 192, duration=(n["end"] - n["start"]) / 192,
                      midi=n["midi"] + octave * 12) for n in tracks[ti][li]]
        # The 31 ms ornaments are too short for a fresh D closure. Carry the
        # vowel through each grace note, preserving its pitch and exact timing.
        for n in notes:
            if n["duration"] < .055:
                n["hold"] = True
        # Interpret short MIDI gate gaps as sung legato, not a breath after each
        # syllable. Keep every attack, syncopation and longer musical rest.
        for n, following in zip(notes, notes[1:]):
            gap = following["start"] - n["start"] - n["duration"]
            if 0 < gap <= .14 and following["start"] - n["start"] < .5:
                n["duration"] = following["start"] - n["start"]
        parts.append(dict(
            id=f"voice-{i+1:02}", name=label,
            role=f"{'Male' if body == 'M' else 'Female' if body == 'F' else 'Child'} · {syllable.upper()} · octave {octave:+d}",
            body=dict(female=int(body == "F"), child=int(body == "C")),
            volume=.45, pan=0, vibrato=0,
            voice=dict(breathiness=.15, brightness=.25, tension=.5, pressure=8, drift=5),
            telemetryEncoding="gzip", assetVersion=VERSION,
            melody=dict(name=label, notes=notes, duration=max(n["start"] + n["duration"] for n in notes),
                        lyrics=syllable, source=source)))
    arrangement = dict(
        title="MEGALOVANIA · 24 mouths",
        description="The full Undertale track as a 24-mouth vocal orchestra, following the reference video's singers and octaves. Connected DA riffs, DUM pulses and a rounded OOH bass keep the music flowing — every sound comes from a simulated mouth.",
        bpm=120, duration=156.9, wordless=True, showSyllables=True, presentation="ensemble", parts=parts,
        sections=[dict(name=name, time=time) for name, time in [
            ("Opening riff", 0), ("Low pulse", 8), ("Full ensemble", 16),
            ("Square lead", 31.5), ("Child voices", 40), ("Trumpet lead", 49),
            ("Second refrain", 64), ("Low voices", 80), ("Rising strings", 96),
            ("Riff returns", 112), ("Final drive", 128), ("Last riff", 144)]])
    out = ROOT / "public/band/megalovania"
    (out / "arrangement.json").write_text(json.dumps(arrangement, ensure_ascii=False, separators=(",", ":")))
    print(json.dumps(audit))
    for p, v in zip(parts, VOICES):
        ns = p["melody"]["notes"]
        print(p["id"], p["name"], v[:2], p["role"], len(ns), min(n["midi"] for n in ns), max(n["midi"] for n in ns))


if __name__ == "__main__":
    main()
