"""Builds src/timing.json from the forced alignment.
- Snaps each word start to the acoustic onset (first 10 ms frame >= 12 dB above the local
  silence floor) when the aligner placed the start inside a pause / plosive closure.
- Converts to 30 fps frames and names the visual cue events used by the composition.
Usage: python3 -I scripts/build_timing.py <audio16k.wav> <align_raw.json> <out.json>"""
import sys, json, wave
import numpy as np
wav, raw, out = sys.argv[1:4]
FPS = 30
w = wave.open(wav); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float)
sr = w.getframerate(); hop = sr // 100
db = np.array([20 * np.log10(np.sqrt(np.mean(x[i:i + 2 * hop] ** 2)) + 1) for i in range(0, len(x) - 2 * hop, hop)])
d = json.load(open(raw))
words = []
for s in d["segments"]:
    for wd in s["words"]:
        words.append(dict(wd, segment=s["segment"]))
for wd in words:
    i = int(round(wd["start"] * 100))
    floor = db[max(0, i - 5):i + 1].min()
    if floor < 45:  # starts in a pause: snap to onset
        j = i
        while j < i + 25 and db[j] < floor + 12: j += 1
        wd["onset"] = round(j / 100, 3); wd["snapped"] = j != i
    else:
        wd["onset"] = wd["start"]; wd["snapped"] = False
    wd["frame"] = int(round(wd["onset"] * FPS))

def find(word, after=0.0):
    for wd in words:
        if wd["word"] == word and wd["start"] >= after: return wd
    raise KeyError(word)

LEAD = 2  # graphics land ~67 ms ahead of the syllable, which reads as "on the word"
def cue(word, after=0.0):
    return max(0, find(word, after)["frame"] - LEAD)

cues = {
  "titleIn": 0,
  "rank5": cue("five"), "pixverse": cue("pixverse"), "shortForm": cue("short"), "creativeEffects": cue("creative"),
  "rank4": cue("four"), "pika": cue("pika"), "creativeUnusual": cue("creative", 8.0), "unusual": cue("unusual"),
  "rank3": cue("three"), "vidu": cue("vidu"), "characters": cue("characters"), "imageToVideo": cue("image"),
  "rank2": cue("two"), "hailuo": cue("hailuo"), "realisticPeople": cue("realistic"), "cinematicScenes": cue("cinematic"),
  "myNumber": cue("my"), "rank1": cue("one", 21.0), "kling": cue("kling"),
  "especially": cue("especially"), "realisticVideo": cue("realistic", 26.0), "budgetLow": cue("budget"),
  "useCases": cue("so", 29.0), "productAds": cue("products"), "imageGeneration": cue("image", 31.0), "cinematicMovies": cue("cinematic", 33.0),
  "finalBoard": cue("etcetera"), "dependsOnYou": cue("it", 34.5),
}
scenes = [
  {"id": "intro", "from": 0, "to": cues["rank5"] - 6},
  {"id": "pixverse", "from": cues["rank5"] - 6, "to": cues["rank4"] - 6},
  {"id": "pika", "from": cues["rank4"] - 6, "to": cues["rank3"] - 6},
  {"id": "vidu", "from": cues["rank3"] - 6, "to": cues["rank2"] - 6},
  {"id": "hailuo", "from": cues["rank2"] - 6, "to": cues["myNumber"] - 4},
  {"id": "kling", "from": cues["myNumber"] - 4, "to": cues["especially"] - 4},
  {"id": "klingBenefits", "from": cues["especially"] - 4, "to": cues["useCases"] - 4},
  {"id": "useCases", "from": cues["useCases"] - 4, "to": cues["finalBoard"] - 8},
  {"id": "leaderboard", "from": cues["finalBoard"] - 8, "to": None},
]
dur_s = d["audioDuration"]; total = int(np.ceil(dur_s * FPS)) + 3  # short tail so audio is never cut
scenes[-1]["to"] = total
json.dump({"fps": FPS, "durationInFrames": total, "audioDuration": dur_s,
           "method": d["method"] + "; onsets snapped to RMS energy rise; cues lead audio by %d frames" % LEAD,
           "cues": cues, "scenes": scenes,
           "words": [{k: wd[k] for k in ("word", "segment", "start", "end", "onset", "snapped", "frame")} for wd in words]},
          open(out, "w"), indent=1)
for k, v in cues.items(): print(f"{k:16s} f{v:4d}  {v/FPS:6.2f}s")
print("total", total)
