"""Which lines of a prepared scene are hard to make out: Whisper listens to each caption's stretch
of the scene's mix (what a viewer hears, background included) and its words are compared with the
caption. A listening aid, not a judge: nothing is decided by it, and the hill climb's speech judge
(tools/asr/speech_wer.py) is separate and unchanged.

usage: ~/.cache/chimera-asr/.venv/bin/python tools/scene-clarity.py <scene-id>... [--all] [--json out.json]

Set up once with tools/asr/setup.sh. Each line is heard on its own, without the lines around it,
which is stricter than a viewer who has the context and the subtitles: read the list as "check
these by ear", worst first. Captions in parentheses (stage directions) are skipped. Needs ffmpeg.
"""

import json
import os
import re
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCENES = os.path.join(REPO, "public", "scenes")
CACHE = os.path.expanduser("~/.cache/chimera-asr/models")
RATE = 16000


def words(text):
    text = re.sub(r"[^a-z0-9' ]+", " ", text.lower().replace("’", "'"))
    return [w.strip("'") for w in text.split() if w.strip("'")]


def edits(ref, hyp):
    d = list(range(len(hyp) + 1))
    for i, r in enumerate(ref, 1):
        prev, d[0] = d[0], i
        for j, h in enumerate(hyp, 1):
            prev, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, prev + (r != h))
    return d[len(hyp)]


def listen(model, scene_id):
    folder = os.path.join(SCENES, scene_id)
    scene = json.load(open(os.path.join(folder, "scene.json")))
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(folder, scene["audio"]), "-f", "f32le", "-ac", "1",
                          "-ar", str(RATE), "-"], capture_output=True, check=True).stdout
    audio = np.frombuffer(raw, np.float32)
    cues, rows = scene["cues"], []
    for i, cue in enumerate(cues):
        if cue["text"].lstrip().startswith("("):
            continue
        # the line's own stretch, with a little air, but none of its neighbours
        start = max(cue["start"] - 0.15, cues[i - 1]["end"] + 0.03 if i else 0.0, 0.0)
        end = min(cue["end"] + 0.25, cues[i + 1]["start"] - 0.03 if i + 1 < len(cues) else scene["duration"])
        clip = audio[int(start * RATE):int(end * RATE)]
        segs, _ = model.transcribe(clip, language="en", beam_size=1, temperature=0.0, condition_on_previous_text=False,
                                   vad_filter=False)
        heard = " ".join(s.text.strip() for s in segs)
        ref = words(cue["text"])
        rows.append({"scene": scene_id, "start": cue["start"], "speaker": cue["speaker"], "text": cue["text"], "heard": heard,
                     "errors": min(edits(ref, words(heard)), len(ref)), "words": len(ref)})
    return rows


def main():
    args = sys.argv[1:]
    out = None
    if "--json" in args:
        i = args.index("--json")
        out = args[i + 1]
        del args[i:i + 2]
    ids = sorted(os.listdir(SCENES)) if "--all" in args else [a for a in args if not a.startswith("--")]
    if not ids:
        sys.exit(__doc__)
    model = WhisperModel("small.en", device="cpu", compute_type="int8", cpu_threads=os.cpu_count(), download_root=CACHE)
    report = {}
    for scene_id in ids:
        rows = listen(model, scene_id)
        wrong, total = sum(r["errors"] for r in rows), sum(r["words"] for r in rows)
        report[scene_id] = {"wordErrorRate": round(100.0 * wrong / max(1, total), 1), "lines": rows}
        print(f"\n{scene_id}: {wrong} of {total} words misheard ({report[scene_id]['wordErrorRate']} %), {sum(1 for r in rows if r['errors'])} of {len(rows)} lines")
        for r in sorted(rows, key=lambda r: -r["errors"] / max(1, r["words"])):
            if r["errors"]:
                print(f"  {r['start']:7.2f}  {r['speaker'][:12]:12s} {r['errors']}/{r['words']}  {r['text']}  →  {r['heard']}")
    if out:
        json.dump(report, open(out, "w"), indent=1)


main()
