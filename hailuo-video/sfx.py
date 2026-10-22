"""Synthesise the sound-effects track from out/sfx.json (written by render.js).

Every effect is generated from scratch with numpy, so there are no
third-party audio files to license. Output: out/sfx.wav (48 kHz mono).
"""
import json
import sys
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def t_axis(d):
    return np.arange(int(d * SR)) / SR


def env(d, attack=0.003, decay=0.2):
    t = t_axis(d)
    a = np.clip(t / attack, 0, 1)
    return a * np.exp(-t / decay)


def onepole_lp(x, cut):
    """One-pole low-pass; cut may be a scalar or per-sample array (Hz)."""
    cut = np.broadcast_to(np.asarray(cut, dtype=float), x.shape)
    a = 1 - np.exp(-2 * np.pi * cut / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def hp(x, cut):
    return x - onepole_lp(x, cut)


def sweep(f0, f1, d, curve="exp"):
    t = t_axis(d)
    if curve == "exp":
        f = f0 * (f1 / f0) ** (t / d)
    else:
        f = f0 + (f1 - f0) * t / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def whoosh(d=0.55, lo=300, hi=3500):
    t = t_axis(d)
    shape = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    cut = lo + (hi - lo) * np.sin(np.pi * t / d)
    n = rng.standard_normal(len(t))
    x = onepole_lp(onepole_lp(n, cut), cut * 1.2)
    x = hp(x, 150)
    return x * shape * 3.0


def impact():
    d = 1.1
    t = t_axis(d)
    body = sweep(140, 38, d) * np.exp(-t / 0.28)
    click = onepole_lp(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.025) * 2.5
    tail = onepole_lp(rng.standard_normal(len(t)), 400) * np.exp(-t / 0.35) * 1.4
    return body * 1.1 + click + tail


def pop():
    d = 0.18
    t = t_axis(d)
    return sweep(950, 280, d) * np.exp(-t / 0.045) * np.clip(t / 0.002, 0, 1)


def tick():
    d = 0.05
    t = t_axis(d)
    return np.sin(2 * np.pi * 3200 * t) * np.exp(-t / 0.008) * 0.7


def click():
    d = 0.08
    t = t_axis(d)
    n = hp(rng.standard_normal(len(t)), 2000) * np.exp(-t / 0.006)
    return n * 0.9 + np.sin(2 * np.pi * 1800 * t) * np.exp(-t / 0.012) * 0.5


def bell(freqs, d=1.2, dec=0.5):
    t = t_axis(d)
    x = np.zeros_like(t)
    for i, f in enumerate(freqs):
        x += np.sin(2 * np.pi * f * t) * np.exp(-t / (dec / (1 + i * 0.6))) / (1 + i * 0.5)
    return x * np.clip(t / 0.003, 0, 1)


def chime():
    a = bell([1318.5, 2637, 3955], 1.0, 0.45)
    b = bell([1975.5, 3951, 5926], 1.0, 0.5)
    out = np.zeros(int(1.2 * SR))
    out[: len(a)] += a
    off = int(0.09 * SR)
    out[off: off + len(b)] += b[: len(out) - off]
    return out * 0.6


def sparkle():
    d = 0.7
    out = np.zeros(int(d * SR))
    for _ in range(9):
        f = rng.uniform(2500, 7000)
        st = int(rng.uniform(0, 0.4) * SR)
        p = bell([f], 0.3, 0.06)
        out[st: st + len(p)] += p[: len(out) - st] * rng.uniform(0.3, 0.7)
    return out


def coin():
    d1, d2 = 0.07, 0.35
    t1, t2 = t_axis(d1), t_axis(d2)
    sq = lambda f, t: np.tanh(4 * np.sin(2 * np.pi * f * t))
    a = sq(1975.5, t1) * 0.5
    b = sq(2637, t2) * np.exp(-t2 / 0.1) * 0.5
    return onepole_lp(np.concatenate([a, b]), 6000) * 0.8


def roll(d=0.9):
    out = np.zeros(int((d + 0.1) * SR))
    t = 0.0
    k = 0
    while t < d:
        f = 1800 + 1600 * (t / d)
        p = np.sin(2 * np.pi * f * t_axis(0.03)) * np.exp(-t_axis(0.03) / 0.006)
        st = int(t * SR)
        out[st: st + len(p)] += p * 0.45
        t += 0.06 - 0.03 * (t / d)
        k += 1
    return out


def stamp():
    d = 0.9
    t = t_axis(d)
    thud = sweep(110, 45, d) * np.exp(-t / 0.18)
    slap = onepole_lp(rng.standard_normal(len(t)), 1800) * np.exp(-t / 0.04) * 2.2
    return thud * 1.2 + slap + impact()[: len(t)] * 0.5


def drop():
    d = 1.3
    t = t_axis(d)
    sub = sweep(90, 30, d) * np.exp(-t / 0.5)
    rumble = onepole_lp(rng.standard_normal(len(t)), 200) * np.exp(-t / 0.5) * 2
    return (sub + rumble) * 1.1


def alert():
    d = 0.16
    t = t_axis(d)
    tri = lambda f: 2 / np.pi * np.arcsin(np.sin(2 * np.pi * f * t))
    e = np.clip(t / 0.005, 0, 1) * np.clip((d - t) / 0.02, 0, 1)
    a = tri(880) * e
    b = tri(660) * e
    return np.concatenate([a, np.zeros(int(0.04 * SR)), b]) * 0.5


def glitch():
    out = []
    for _ in range(9):
        d = rng.uniform(0.02, 0.06)
        t = t_axis(d)
        if rng.random() < 0.5:
            x = np.sign(np.sin(2 * np.pi * rng.uniform(150, 1200) * t)) * 0.35
        else:
            x = np.repeat(rng.standard_normal(int(len(t) / 12) + 1), 12)[: len(t)] * 0.4
        out.append(x)
    return np.concatenate(out) * 0.8


def check():
    a = bell([1046.5, 2093], 0.25, 0.08)
    b = bell([1568, 3136], 0.5, 0.15)
    out = np.zeros(int(0.6 * SR))
    out[: len(a)] += a
    off = int(0.08 * SR)
    out[off: off + len(b)] += b[: len(out) - off]
    return out * 0.6


def riser(d=0.9):
    t = t_axis(d)
    p = t / d
    n = onepole_lp(rng.standard_normal(len(t)), 300 + 5000 * p ** 2)
    tone = sweep(180, 900, d) * 0.25
    return (hp(n, 200) * 2.2 + tone) * p ** 2


GEN = {
    "whoosh": lambda: whoosh(),
    "swoosh": lambda: whoosh(0.35, 800, 6000) * 0.8,
    "impact": impact, "pop": pop, "tick": tick, "click": click, "chime": chime,
    "sparkle": sparkle, "coin": coin, "roll": roll, "stamp": stamp, "drop": drop,
    "alert": alert, "glitch": glitch, "check": check,
    "riser": lambda: riser(0.9), "riser_short": lambda: riser(0.25) * 0.8,
}

LEVEL = {  # relative loudness per effect type
    "whoosh": 0.22, "swoosh": 0.18, "impact": 0.55, "pop": 0.32, "tick": 0.18, "click": 0.3,
    "chime": 0.22, "sparkle": 0.2, "coin": 0.2, "roll": 0.2, "stamp": 0.6, "drop": 0.5,
    "alert": 0.18, "glitch": 0.3, "check": 0.25, "riser": 0.3, "riser_short": 0.22,
}


def main(src, dst, total):
    events = json.load(open(src))
    out = np.zeros(int((total + 2) * SR))
    cache = {}
    for ev in events:
        kind = ev["type"]
        if kind not in cache:
            x = GEN[kind]()
            cache[kind] = x / (np.max(np.abs(x)) + 1e-9)
        x = cache[kind] * LEVEL[kind] * ev["gain"]
        st = int(ev["t"] * SR)
        end = min(len(out), st + len(x))
        out[st:end] += x[: end - st]
    out = out[: int(total * SR)]
    peak = np.max(np.abs(out))
    if peak > 0.9:
        out *= 0.9 / peak
    pcm = (out * 32767).astype(np.int16)
    with wave.open(dst, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"wrote {dst}: {len(events)} effects, peak {peak:.2f}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], float(sys.argv[3]))
