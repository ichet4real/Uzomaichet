"""Forced alignment of the known transcript against the voiceover using PocketSphinx.
Aligns each SRT phrase window separately (with 0.25 s padding) so errors can't drift.
Usage: python3 -I scripts/align.py <audio16k.wav> <srt> <out.json>"""
import sys, json, re, wave
from pocketsphinx import Decoder

wav, srt, out = sys.argv[1:4]
# Custom pronunciations for brand names / tokens not in CMUdict.
EXTRA = {
    "pixverse": "P IH K S V ER S",
    "pika": "P IY K AH",
    "vidu": "V IY D UW",
    "hailuo": "HH AY L UW OW",
    "kling": "K L IH NG",
}
NUM = {"5": "five", "4": "four", "3": "three", "2": "two", "1": "one", "100%": "one hundred percent", "etc": "etcetera"}

def ts(s):
    h, m, rest = s.split(":"); sec, ms = rest.split(",")
    return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000

blocks = []
for b in open(srt, encoding="utf-8").read().strip().split("\n\n"):
    lines = b.strip().splitlines()
    a, z = [ts(x.strip()) for x in lines[1].split("-->")]
    blocks.append((a, z, " ".join(lines[2:])))

w = wave.open(wav); sr = w.getframerate(); pcm = w.readframes(w.getnframes())
total = len(pcm) / 2 / sr

def norm(text):
    toks = []
    for t in re.findall(r"[A-Za-z0-9%']+", text):
        t = NUM.get(t.lower(), t.lower())
        toks += t.split()
    return toks

result = []
for i, (a, z, text) in enumerate(blocks):
    pad = 0.25
    s0 = max(0.0, a - pad); s1 = min(total, z + pad)
    chunk = pcm[int(s0 * sr) * 2:int(s1 * sr) * 2]
    d = Decoder(samprate=sr, loglevel="FATAL", bestpath=False)
    for k, v in EXTRA.items():
        try: d.add_word(k, v, True)
        except RuntimeError: pass  # already in dictionary
    words = norm(text)
    d.set_align_text(" ".join(words))
    d.start_utt(); d.process_raw(chunk, full_utt=True); d.end_utt()
    got = []
    for sg in d.seg():  # word segments from the alignment search (100 frames/s)
        if sg.word in ("<sil>", "<s>", "</s>", "[NOISE]", "(NULL)"): continue
        got.append({"word": re.sub(r"\(\d+\)$", "", sg.word),
                    "start": round(s0 + sg.start_frame / 100, 3),
                    "end": round(s0 + (sg.end_frame + 1) / 100, 3)})
    ok = [g["word"] for g in got] == words
    result.append({"segment": i + 1, "srtStart": a, "srtEnd": z, "text": text, "aligned": ok, "words": got})
    print(f"[{i+1}] {'OK ' if ok else 'MISMATCH'} {a:.2f}-{z:.2f}")
    for g in got: print(f"     {g['start']:6.2f} {g['end']:6.2f}  {g['word']}")
json.dump({"audioDuration": round(total, 3), "method": "pocketsphinx forced alignment per SRT phrase", "segments": result}, open(out, "w"), indent=1)
