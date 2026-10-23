"""Compute per-frame loudness + 24 spectrum bands from the voiceover -> audio.js"""
import json, subprocess, sys
import numpy as np
src, out, fps = sys.argv[1], sys.argv[2], 30
sr = 24000
raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", src, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32)
hop, win = sr // fps, 2048
n = int(np.ceil(len(x) / hop)) + 1
x = np.pad(x, (win, win))
edges = np.geomspace(80, 8000, 25)
freqs = np.fft.rfftfreq(win, 1 / sr)
env, bands = [], []
w = np.hanning(win)
for i in range(n):
    c = win + i * hop
    seg = x[c - win // 2:c + win // 2] * w
    env.append(float(np.sqrt(np.mean(seg ** 2))))
    mag = np.abs(np.fft.rfft(seg))
    bands.append([float(mag[(freqs >= edges[b]) & (freqs < edges[b + 1])].mean()) for b in range(24)])
env = np.array(env); env = np.clip(env / np.percentile(env, 98), 0, 1)
bands = np.log1p(np.array(bands)); bands = np.clip(bands / np.percentile(bands, 99), 0, 1)
with open(out, "w") as f:
    f.write("window.AUDIO=" + json.dumps({"fps": fps, "env": np.round(env, 3).tolist(),
                                           "bands": np.round(bands, 3).tolist()}) + ";")
print(n, "frames")
