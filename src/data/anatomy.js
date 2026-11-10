/*
  Feature hotspots ("anatomy") for the feature viewer on the home page (cricket + badminton).

  x / y are percentages of the stage (0–100), measured from the top-left of the photo area.
  The defaults assume the anatomy photo is landscape with the product lying horizontally,
  handle on the LEFT and the tip / head on the RIGHT (see PHOTOS.md).
  If your photo is framed differently, open any bat with ?calibrate=1 on the product URL,
  click where each dot should sit, and paste the printed JSON into HOTSPOT_OVERRIDES below.
*/

const WILLOW = p => p.price > 9000
  ? { name: 'English willow, Grade 1–2', line: 'Straight, even grain from premium English willow: the liveliest rebound and the longest-lasting blade in the range.' }
  : p.price > 4000
    ? { name: 'English willow', line: 'English willow gives a crisp, lively response off the face. A little oil and a good knocking-in is all it needs before match day.' }
    : { name: 'Kashmir willow', line: 'Denser and tougher than English willow, so it shrugs off hard use. A durable choice for practice and everyday cricket.' };

const BAT = p => {
  const w = WILLOW(p);
  return {
    subtitle: `${p.brand} · ${w.name}`,
    facts: [['Blade', w.name], ['Handle', 'Cane with rubber grip'], ['Brand', p.brand]],
    hotspots: [
      { id: 'grip', x: 13, y: 50, title: 'Handle & grip', headline: 'Built to absorb the shock', text: 'A cane handle with a rubber grip. Cane soaks up the vibration from the ball, and the grip keeps the bat steady in your hands all the way through the shot.' },
      { id: 'splice', x: 31, y: 50, title: 'Splice', headline: 'Where your power transfers', text: 'The splice is where the handle meets the blade. A clean, well-shaped splice carries the force of your swing from your hands straight into the wood.' },
      { id: 'blade', x: 47, y: 40, title: 'Willow blade', headline: w.name, text: `${w.line} ${p.note}.` },
      { id: 'sweet', x: 63, y: 54, title: 'Sweet spot', headline: 'Find it. Feel nothing.', text: 'The sweet spot sits in the lower-middle of the blade. Hit the ball here and it leaves the bat with the most power and the least vibration up your arms.' },
      { id: 'toe', x: 90, y: 52, title: 'Toe', headline: 'Protect the toe', text: 'The toe takes the knocks from yorkers and the ground. Keep it dry, and add toe tape to extend the life of your bat.' },
    ],
  };
};

const RACKET = p => ({
  subtitle: `${p.brand} · Carbon composite`,
  facts: [['Frame', 'Carbon composite'], ['Strings', 'Pre-strung'], ['Brand', p.brand]],
  hotspots: [
    { id: 'grip', x: 12, y: 50, title: 'Grip', headline: 'Comfort for long rallies', text: 'A cushioned grip that soaks up sweat and gives you control. Add an overgrip when it starts to feel slick.' },
    { id: 'shaft', x: 34, y: 50, title: 'Shaft', headline: 'Flex that feeds the shot', text: 'The shaft bends as you swing and releases that energy into the shuttle. Stiffer suits fast, attacking players; more flex gives power for less effort.' },
    { id: 'frame', x: 62, y: 28, title: 'Frame', headline: 'Carbon composite frame', text: 'Lightweight and rigid, so the head holds its shape through hard smashes and quick, repeated swings.' },
    { id: 'strings', x: 66, y: 52, title: 'Strings', headline: 'Pre-strung, ready to play', text: 'Strung at the factory so you can play on day one. Restring when the tension drops or a string frays.' },
  ],
});

const BUILDERS = { Bats: BAT, Rackets: RACKET };

/* Per-product dot positions: { [productId]: { [hotspotId]: [x, y] } }  (paste calibrate output here) */
export const HOTSPOT_OVERRIDES = {
  /* 9 = Reign English Willow Grade 1 · 25 = Carbon Elite. 9 = your bat photo (dots measured on it); 25 = rendered racket from tools/render_anatomy.py. */
  9: { grip: [37, 19.5], splice: [41, 32], blade: [49.5, 62], sweet: [52.9, 73], toe: [55.5, 89] },   /* measured on your bat photo (portrait, handle top-left) */
  25: { grip: [18.4, 50], shaft: [36.6, 50], frame: [72.2, 29.6], strings: [74.1, 51.8] },
};

/* The feature viewer lives on the HOME page only: one product per sport (id from catalog.js) */
export const SHOWCASE = [
  { sport: 'cricket', label: 'Cricket', id: 9 },
  { sport: 'badminton', label: 'Badminton', id: 25 },
];

export function anatomyFor(product) {
  const build = BUILDERS[product.cat]; if (!build) return null;
  const d = build(product), o = HOTSPOT_OVERRIDES[product.id] || {};
  return { ...d, hotspots: d.hotspots.map(h => o[h.id] ? { ...h, x: o[h.id][0], y: o[h.id][1] } : h) };
}
