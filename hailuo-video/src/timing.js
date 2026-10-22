// Speech timing for the voiceover.
// Phrase windows come from the SRT plus the pauses measured in the audio
// (ffmpeg silencedetect). Word times inside a phrase are estimated by
// syllable weight, which is close enough to land animations on words.

const PHRASES = [
  [0.05, 2.04, "Number 2 is Hailuo AI."],
  [2.52, 5.61, "And this is where AI video starts getting seriously impressive."],
  [6.19, 9.50, "Hailuo is particularly good when you're trying to create videos involving"],
  [9.50, 9.93, "people,"],
  [10.18, 11.83, "movement, and realistic scenes."],
  [12.32, 14.78, "There's a free option where you get one-time free credits,"],
  [15.12, 17.67, "which you can use to give it a try before going for paid plans."],
  [18.16, 23.18, "And it offers monthly paid plans starting from $10.50 per month with 1,000 credits."],
  [23.68, 25.24, "If you wish to go for yearly plan,"],
  [25.51, 27.56, "it comes with a 47% discount."],
  [28.08, 29.29, "So you save more on it."],
  [29.79, 30.51, "But as usual,"],
  [30.80, 31.86, "here is the downside."],
  [32.36, 35.18, "Like almost every AI video platform mentioned earlier,"],
  [35.50, 38.55, "your available generations and credits depend on the plan you're using."],
  [39.06, 41.42, "So if you're generating a lot of videos every day,"],
  [41.70, 43.87, "you'll eventually have to think about credit efficiency."],
  [44.37, 45.94, "But here is the interesting part."],
  [46.44, 48.00, "In Hailuo, as a new user,"],
  [48.25, 53.13, "you can download the MiniMax design and get 3,000 credits for free to start creating AI videos."],
  [53.63, 54.29, "In conclusion,"],
  [54.59, 58.34, "for someone looking towards creating impressive AI videos without spending a fortune,"],
  [58.68, 60.51, "Hailuo is absolutely worth trying."],
  [61.03, 63.01, "So let's reveal our number one."],
];

// How some tokens are actually spoken, for syllable weighting.
const SPOKEN = {
  "2": "two", "$10.50": "ten dollars fifty cents", "1,000": "one thousand",
  "47%": "forty seven percent", "3,000": "three thousand", "AI": "ay eye",
  "Hailuo": "hai luo", "MiniMax": "mini max",
};

function syllables(word) {
  const w = word.toLowerCase().replace(/[^a-z ]/g, "");
  if (!w) return 1;
  return w.split(" ").reduce((n, part) => {
    const groups = part.replace(/e$/, "").match(/[aeiouy]+/g);
    return n + Math.max(1, groups ? groups.length : 1);
  }, 0);
}

function buildWords() {
  const words = [];
  PHRASES.forEach(([start, end, text], pi) => {
    const toks = text.split(" ");
    const weights = toks.map((t) => {
      const bare = t.replace(/[,.]$/, "");
      const w = syllables(SPOKEN[bare] || bare) + 0.35;
      return /,$/.test(t) ? w + 0.4 : w;
    });
    const total = weights.reduce((a, b) => a + b, 0);
    let acc = start;
    toks.forEach((t, i) => {
      const d = ((end - start) * weights[i]) / total;
      words.push({ text: t, start: acc, end: acc + d, phrase: pi });
      acc += d;
    });
  });
  return words;
}

const WORDS = buildWords();

// Start time of the first word containing `needle` at or after `after`.
function w(needle, after = 0) {
  const n = needle.toLowerCase();
  const hit = WORDS.find((x) => x.start >= after - 0.01 && x.text.toLowerCase().includes(n));
  if (!hit) throw new Error("word not found: " + needle + " after " + after);
  return hit.start;
}

if (typeof module !== "undefined") module.exports = { PHRASES, WORDS, w };
