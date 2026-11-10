"""Cut the brand logos out of the two screenshot grids and save them as transparent WebP files in public/brands/.
Usage: python3 tools/extract_brand_logos.py grid1.png grid2.png
NOTE: Forma's lettering is white in the source image, so only its yellow swoosh survives. Replace public/brands/forma.webp with a dark/colour version of the logo.
White card background -> transparent ("colour to alpha"), trimmed, padded, upscaled 2x for crisp display."""
import sys, re
import numpy as np
from PIL import Image

# (name, file slug) in reading order; grid 1 is 8 x 3, grid 2 is 4 x 1
GRID1 = ['Akkash','Apacs','Asics','Black Panther','Cosco','Forma','Galaxy','GM',
         'Gupta','Konex','Kookaburra','Li-Liang','Li-Ning','LP Band','Mercury Plus','Mighty',
         'Moonwalkr','MRF','Nivia','PIA Trends','Scholl','SF','SG','Shrey']
GRID2 = ['SS','Vicky','VSE','Yonex']
X1 = [(22,224),(238,441),(455,658),(672,875),(889,1092),(1106,1309),(1323,1526),(1540,1743)]; Y1 = [(13,216),(262,465),(512,715)]
X2 = [(24,226),(240,443),(457,660),(674,877)];                                                  Y2 = [(0,203)]
INSET = 7        # stay clear of the card border and its rounded corners
slug = lambda n: re.sub(r'[^a-z0-9]+', '-', n.lower()).strip('-')

def color_to_alpha(rgb):
    c = rgb.astype(float); m = c.min(axis=2)                      # how "non-white" each pixel is
    alpha = (255 - m) / 255
    alpha = np.where(alpha < .035, 0, alpha)                      # kill compression noise on the white card
    with np.errstate(divide='ignore', invalid='ignore'):
        out = 255 - (255 - c) / np.maximum(alpha, 1e-6)[..., None]
    out = np.clip(out, 0, 255)
    return np.dstack([out, alpha * 255]).astype(np.uint8)

def run(path, names, xs, ys):
    im = np.array(Image.open(path).convert('RGB')); k = 0
    for (y0, y1) in ys:
        for (x0, x1) in xs:
            tile = im[y0 + INSET:y1 - INSET + 1, x0 + INSET:x1 - INSET + 1]
            rgba = Image.fromarray(color_to_alpha(tile), 'RGBA')
            bb = rgba.getchannel('A').point(lambda v: 255 if v > 14 else 0).getbbox()
            rgba = rgba.crop(bb)
            pad = 4; canvas = Image.new('RGBA', (rgba.width + 2*pad, rgba.height + 2*pad), (0,0,0,0)); canvas.paste(rgba, (pad, pad))
            canvas = canvas.resize((canvas.width * 2, canvas.height * 2), Image.LANCZOS)
            canvas.save(f'public/brands/{slug(names[k])}.webp', 'WEBP', quality=92, method=6)
            print(f'{names[k]:14s} {canvas.size}'); k += 1

run(sys.argv[1], GRID1, X1, Y1); run(sys.argv[2], GRID2, X2, Y2)
