"""Studio-style feature-viewer images (1600x1000, dark stage, product lying horizontally, handle on the LEFT).
   Dot positions in src/data/anatomy.js are computed from the same geometry, so they land exactly on each part.
   Output: public/products/9-anatomy.jpg (cricket bat) and 25-anatomy.jpg (badminton racket).
   Replace either file with a real studio photo of the same name; then run the site with ?calibrate=1 to re-place the dots."""
import math, os, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public/products'); os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(11)
W, H = 1600, 1000; BG = np.array([17, 17, 18], float)
hexrgb = lambda h: np.array([int(h[i:i+2], 16) for i in (1, 3, 5)], float) / 255
lerp = lambda a, b, t: tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def stage():
    y, x = np.mgrid[0:H, 0:W].astype(float)
    d = np.sqrt(((x - W * .52) / (W * .55)) ** 2 + ((y - H * .5) / (H * .62)) ** 2)
    glow = np.clip(1 - d, 0, 1) ** 2 * 20
    return np.clip(BG[None, None, :] + glow[..., None] * np.array([1, 1, 1.06]), 0, 255)

def grain(shape, sigma, amp):
    n = gaussian_filter(rng.standard_normal(shape), sigma); return n / n.std() * amp

# ------------------------------------------------------------------ BAT
def bat_image(wood='#EDD3A8', sticker='#D94B3D', grip='#34343A', toe=(.20, .13, .08)):
    s = 7; w, h = 46 * s, 196 * s
    yy, xx = np.mgrid[0:h, 0:w].astype(float); X, Y = xx / s - 1, yy / s - 1
    mk = Image.new('L', (w, h), 0); d = ImageDraw.Draw(mk); P = lambda pts: [((x + 1) * s, (y + 1) * s) for x, y in pts]
    PROFILE = [(56, 6), (64, 7.6), (72, 10.4), (79, 14.2), (85, 16.4), (92, 17), (150, 17.3), (176, 17.9), (183, 16.6), (187, 13.5), (190, 8), (191, 0)]
    ys = [y for y, _ in PROFILE]; hw = lambda y: np.interp(y, ys, [v for _, v in PROFILE])
    d.rounded_rectangle([*P([(17, 2)])[0], *P([(27, 60)])[0]], radius=int(5 * s), fill=255)
    left = [(22 - v, y) for y, v in PROFILE]; right = [(22 + v, y) for y, v in reversed(PROFILE)]
    d.polygon(P(left + right), fill=255)
    m = np.array(mk.filter(ImageFilter.GaussianBlur(1.2))) / 255.0
    base = hexrgb(wood)
    g = grain((h, w), (40, .9), .08); rings = np.sin((X + gaussian_filter(rng.standard_normal((h, w)), (60, 4)) * 9) * 1.6) * .04
    u = np.clip((X - 22) / 18, -1.2, 1.2); shade = .80 + .30 * np.cos(u * 1.3) - .10 * u
    col = base[None, None] * (shade + g + rings)[..., None] + (np.exp(-((X - 19) / 3.2) ** 2) * .07)[..., None]
    gm = (Y >= 2) & (Y < 52) & (X > 16) & (X < 28); gc = hexrgb(grip)
    wrap = (np.sin((Y + X * .9) * 1.15) > 0) * .30 + .70; gs = .70 + .55 * np.cos(np.clip((X - 22) / 5.2, -1.3, 1.3) * 1.2)
    col = np.where(gm[..., None], gc[None, None] * (wrap * gs)[..., None] * (1 + grain((h, w), 1, .05)[..., None]) * 1.25, col)
    band = (Y >= 52) & (Y < 59) & (X > 15) & (X < 29); col = np.where(band[..., None], hexrgb(sticker)[None, None] * (.7 + .4 * np.cos(np.clip((X - 22) / 7, -1.3, 1.3)))[..., None], col)
    st = (X > 10) & (X < 34) & (Y > 104) & (Y < 154); sc = hexrgb(sticker)
    stripe = (np.abs(Y - 116) < .9) | (np.abs(Y - 142) < .9) | (np.abs(X - 22) < .6)
    col = np.where(st[..., None], np.where(stripe[..., None], .96, sc[None, None] * (.9 + .12 * np.cos((X - 22) / 12))[..., None]), col)
    tg = (Y > 177) & (np.abs(X - 22) < 20); col = np.where(tg[..., None], np.array(toe)[None, None] * (.8 + .3 * np.cos((X - 22) / 14))[..., None], col)
    col *= (1 - .18 * np.exp(-((Y - 79) / 3) ** 2) * (Y > 79))[..., None]
    half = hw(np.clip(Y, 56, 191)); edge = np.minimum(X - (22 - half), (22 + half) - X)
    blade = Y > 60
    col *= np.where(blade, .62 + .38 * np.clip(edge / 3.2, 0, 1), 1)[..., None]            # rounded edges fall into shadow
    col += np.where(blade, np.exp(-((edge - 1.0) / .7) ** 2) * .10, 0)[..., None]         # thin rim light just inside the edge
    rgba = np.dstack([np.clip(col, 0, 1), m]); return Image.fromarray((rgba * 255).astype('uint8'), 'RGBA')

def render_bat():
    im = bat_image(); im = im.transpose(Image.FLIP_LEFT_RIGHT)          # lit side ends up on top after the turn
    im = im.rotate(90, expand=True)                                    # handle (top) -> LEFT
    L = 1280; f = L / im.width; im = im.resize((L, int(im.height * f)), Image.LANCZOS)
    x0 = (W - im.width) // 2; y0 = (H - im.height) // 2
    base = stage(); canvas = Image.fromarray(base.astype('uint8'))
    sh = Image.new('L', (W, H), 0); sh.paste(im.split()[3].point(lambda v: 110 if v > 20 else 0), (x0 + 10, y0 + 28)); sh = sh.filter(ImageFilter.GaussianBlur(22))
    canvas = Image.composite(Image.new('RGB', (W, H), (0, 0, 0)), canvas, sh); canvas.paste(im, (x0, y0), im)
    # bat-unit y (2..190 along the length) -> pixel x ;  across the width -> pixel y
    k = 7 * f; X = lambda yb: x0 + (yb - 1 + 1) * k - 0.0 * k
    pos = lambda yb, off=0: [round((x0 + (yb - 1) * k) / W * 100, 1), round((H / 2 + off * k) / H * 100, 1)]
    return canvas, {'grip': pos(30), 'splice': pos(68), 'blade': pos(92, -7), 'sweet': pos(140, 2), 'toe': pos(184)}

# ------------------------------------------------------------------ RACKET
def render_racket(gold=(176, 141, 87)):
    S = 2; w, h = W * S, H * S
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    P = lambda *v: tuple(int(a * S) for a in v)
    cy = 500; cx, rx, ry = 1155, 275, 215
    # strings (under the frame): mains along the length, crosses across
    sm = Image.new('L', (w, h), 0); ImageDraw.Draw(sm).ellipse(P(cx - rx + 14, cy - ry + 14, cx + rx - 14, cy + ry - 14), fill=255)
    st = Image.new('RGBA', (w, h), (0, 0, 0, 0)); sd = ImageDraw.Draw(st)
    for yv in range(cy - ry, cy + ry, 20): sd.line(P(cx - rx, yv, cx + rx, yv), fill=(232, 232, 222, 170), width=2 * S // 2 + 1)
    for xv in range(cx - rx, cx + rx, 20): sd.line(P(xv, cy - ry, xv, cy + ry), fill=(232, 232, 222, 150), width=2 * S // 2 + 1)
    img.paste(st, (0, 0), Image.composite(st.split()[3], Image.new('L', (w, h), 0), sm))
    d = ImageDraw.Draw(img)
    tube = lambda draw_fn, wd, dark=(26, 26, 29), light=(132, 132, 142): [draw_fn(i, lerp(dark, light, math.sin(math.pi * i / max(1, wd - 1)) ** 1.6)) for i in range(wd)]
    # head frame: concentric outlines give the tube a rounded, lit look
    FW = 22 * S
    for i in range(FW):
        c = lerp((26, 26, 29), (140, 140, 150), math.sin(math.pi * i / (FW - 1)) ** .9)
        d.ellipse((cx * S - rx * S + i, cy * S - ry * S + i, cx * S + rx * S - i, cy * S + ry * S - i), outline=c + (255,), width=2)
    # gold accent arcs on the frame
    mid = (cx * S - rx * S + FW // 2, cy * S - ry * S + FW // 2, cx * S + rx * S - FW // 2, cy * S + ry * S - FW // 2)
    d.arc(mid, 238, 302, fill=gold + (255,), width=7 * S); d.arc(mid, 58, 122, fill=gold + (255,), width=7 * S)
    # throat arms + shaft
    def rod(p0, p1, wd):
        for i in range(wd):
            t = i / max(1, wd - 1); c = lerp((24, 24, 27), (146, 146, 156), math.sin(math.pi * t) ** 1.6)
            dx, dy = p1[0] - p0[0], p1[1] - p0[1]; ln = math.hypot(dx, dy); nx, ny = -dy / ln, dx / ln; o = (i - wd / 2)
            d.line((p0[0] * S + nx * o, p0[1] * S + ny * o, p1[0] * S + nx * o, p1[1] * S + ny * o), fill=c + (255,), width=3)
    for sgn in (-1, 1): rod((728, cy + sgn * 7), (941, cy + sgn * 135), 13 * S)
    rod((440, cy), (740, cy), 17 * S)
    d.polygon([P(706, cy - 20), P(766, cy - 11), P(766, cy + 11), P(706, cy + 20)], fill=gold + (255,))   # T-joint
    # grip
    gx0, gx1, gh = 150, 440, 27
    d.rounded_rectangle(P(gx0, cy - gh, gx1, cy + gh), radius=int(24 * S), fill=(40, 40, 45, 255))
    for xv in range(gx0 + 18, gx1 - 6, 14):
        d.line(P(xv, cy - gh + 3, xv + 18, cy + gh - 3), fill=(78, 78, 88, 255), width=4 * S // 2)
    d.rounded_rectangle(P(gx0, cy - gh, gx0 + 20, cy + gh), radius=int(10 * S), fill=gold + (255,))
    d.rectangle(P(gx1 - 14, cy - gh, gx1, cy + gh), fill=gold + (255,))
    d.line(P(gx0 + 24, cy - gh + 5, gx1 - 18, cy - gh + 5), fill=(120, 120, 132, 255), width=2 * S)       # top highlight
    img = img.resize((W, H), Image.LANCZOS)
    base = Image.fromarray(stage().astype('uint8'))
    sh = Image.new('L', (W, H), 0); sh.paste(img.split()[3].point(lambda v: 90 if v > 30 else 0), (10, 26)); sh = sh.filter(ImageFilter.GaussianBlur(20))
    canvas = Image.composite(Image.new('RGB', (W, H), (0, 0, 0)), base, sh); canvas.paste(img, (0, 0), img)
    pc = lambda x, y: [round(x / W * 100, 1), round(y / H * 100, 1)]
    return canvas, {'grip': pc(295, cy), 'shaft': pc(585, cy), 'frame': pc(cx, cy - ry + 11), 'strings': pc(cx + 30, cy + 18)}

out = {}
for pid, fn in ((9, render_bat), (25, render_racket)):
    im, pos = fn(); im.save(os.path.join(OUT, f'{pid}-anatomy.jpg'), quality=92, optimize=True); out[pid] = pos
print(json.dumps(out))
# preview with dots
for pid in out:
    im = Image.open(os.path.join(OUT, f'{pid}-anatomy.jpg')).convert('RGB'); d = ImageDraw.Draw(im)
    for k, (x, y) in out[pid].items():
        cx, cy = x / 100 * W, y / 100 * H; d.ellipse((cx - 14, cy - 14, cx + 14, cy + 14), outline='white', width=3); d.ellipse((cx - 6, cy - 6, cx + 6, cy + 6), fill='white')
    im.resize((800, 500)).save(f'/tmp/prev-{pid}.png')
