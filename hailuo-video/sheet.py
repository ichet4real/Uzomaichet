# Build a contact sheet from the given PNG files: python3 sheet.py out.png a.png b.png ...
import sys
from PIL import Image
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).resize((960, 540)) for f in files]
W = Image.new("RGB", (1920, 540 * ((len(ims) + 1) // 2)))
for i, im in enumerate(ims): W.paste(im, ((i % 2) * 960, (i // 2) * 540))
W.save(out)
