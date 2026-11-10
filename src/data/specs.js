/* ───────────────────────── Product page: specifications and size guides ─────────────────────────
   Specs are built from what the catalogue already knows (brand, sport, category, price tier, sizes, the product name)
   plus a template per kind of product. Where the real value depends on the exact model we print
   "As printed on the product label" rather than guess.

   To give one product its own exact specs, add a `specs` object to its row in data/catalog.js, for example:
     specs: { technical: [['Willow', 'English willow, Grade 1'], ['Grip', 'Octopus rubber']], measurements: [['Edges', '38 to 40 mm']] }
   Rows listed there replace the template rows for that card (technical | measurements | manufacturer | more).
────────────────────────────────────────────────────────────────────── */

import { CAT, CAT_COPY, SPORT, sizesFor } from './catalog.js';
import { FREE_SHIP, money } from '../store.jsx';

const FREE_DELIVERY = `Free above ${money(FREE_SHIP)}. Check dates with your pincode above`;
const LABEL = 'As printed on the product label';

/* Bat willow from the name first ("Grade 1", "Kashmir"), then the price tier */
export const willowOf = p => {
  const g = /grade\s*(\d)/i.exec(p.name);
  if (g) return `English willow, Grade ${g[1]}`;
  if (/kashmir/i.test(p.name) || /tennis/i.test(p.name) || p.price < 3000) return 'Kashmir willow';
  return p.price > 9000 ? 'English willow, Grade 1–2' : p.price > 4000 ? 'English willow' : 'Kashmir willow';
};
const isTennis = p => /tennis/i.test(p.name);
const isJunior = p => /junior/i.test(p.name);
const shortOnly = p => /short-handle/i.test(p.note || '');
export const handlesFor = p => shortOnly(p) ? ['Short'] : ['Short', 'Long'];

const ballSize = p => (/\(Size (\d)\)/i.exec(p.name) || [])[1];
const packOf = p => (/\((\d+)\)/.exec(p.name) || [])[1];
const grams = lb => Math.round(lb * 453.592 / 5) * 5;

/* Technical specification: what the product is made of, by kind */
const TECH = {
  kit: p => [['Includes', (p.parts || []).map(x => x.name).join(' · ')], ['Sizes', 'Standard adult sizes']],
  bat: p => [['Willow', willowOf(p)], ['Grip', 'Rubber grip'], ['Handle', shortOnly(p) ? 'Cane, short' : 'Cane, short or long'], ['Blade', isTennis(p) ? 'Scooped, for tennis ball' : isJunior(p) ? 'Junior size' : 'Full-size adult'], ['Knocking-in', isTennis(p) ? 'Not needed for tennis ball' : 'Recommended before first use']],
  racket: () => [['Frame', 'Carbon composite'], ['Strings', 'Pre-strung'], ['Restringing', 'Available at our counter']],
  shuttle: p => [['Material', /feather/i.test(p.note + p.name) ? 'Goose feather' : /nylon/i.test(p.name) ? 'Nylon' : LABEL], ['Pack', packOf(p) ? `${packOf(p)} shuttles` : 'Tube'], ['Use', 'Match and practice']],
  shoe: () => [['Upper', 'Breathable mesh'], ['Sole', 'Rubber, non-marking']],
  gloves: () => [['Palm', 'Breathable, reinforced']], helmet: () => [['Shell', 'Impact-tested ABS'], ['Grille', 'Steel']],
  goggles: () => [['Lens', 'Anti-fog, UV protected']], cap: () => [['Material', 'Silicone']], jersey: () => [['Fabric', 'Quick-dry polyester']], shorts: () => [['Fabric', 'Chlorine-resistant']],
};

/* Measurements: sizes on offer and the dimensions that matter for the kind */
const MEASURE = {
  bat: p => [['Handle', shortOnly(p) ? 'Short' : 'Short or long'], ['Blade', isJunior(p) ? 'Junior' : 'Full-size adult']],
  racket: () => [['Length', 'Standard (about 675 mm)'], ['Maximum tension', LABEL]],
  shuttle: p => [['Shuttles per pack', packOf(p) || LABEL]],
  shoe: p => { const z = sizesFor(p) || []; return [['Sizes', `${z[0]} to ${z[z.length - 1]}`], ['Fit', 'Order your usual size']]; },
  jersey: () => [['Sizes', 'S to XL'], ['Fit', 'Regular']], shorts: () => [['Sizes', 'S to XL'], ['Fit', 'Regular']],
  gloves: () => [['Sizes', 'S · M · L']],
  pads: () => [['Sizes', 'Junior · Senior']], kneepad: () => [['Sizes', 'Junior · Senior']], helmet: () => [['Sizes', 'Junior · Senior'], ['Adjustment', 'As printed on the product label']],
};

const LEVEL = p => {
  const k = p.art.kind;
  if (k === 'bat') { const w = willowOf(p); return /Grade 1/.test(w) ? 'Intermediate to advanced' : /English/.test(w) ? 'Club to advanced' : 'Beginner to club'; }
  if (k === 'racket') return p.price > 4500 ? 'Intermediate to advanced' : p.price > 3000 ? 'Club to intermediate' : 'Beginner to club';
  return 'All levels';
};
const CARE = { bat: 'Wipe with a dry cloth. Keep away from water and store upright.', racket: 'Keep dry, use a cover and restring every few months to keep the feel crisp.' };

const merge = (base, over) => over?.length ? over : base;

/* The four cards, in order: Technical specification, Measurements, Manufacturer info, More details */
export function specsFor(p) {
  const k = p.art.kind, o = p.specs || {}, bs = ballSize(p);
  const technical = [['Brand', p.brand], ['Sport', SPORT[p.sport].name], ['Category', CAT[p.cat].label], ...(TECH[k]?.(p) || [])];
  const measurements = MEASURE[k]?.(p) || (bs ? [['Ball size', `Size ${bs}`]] : [['Dimensions', LABEL]]);
  const manufacturer = [['Brand', p.brand], ['Marketed by', 'Zenmoovz Sports, Pallikaranai, Chennai'], ['Country of origin', LABEL], ['Warranty', 'Brand warranty as per the manufacturer’s terms'], ['Customer care', 'hello@zenmoovz.com · +91 98765 43210']];
  const more = [['Suggested level', LEVEL(p)], ['In the box', `1 × ${p.name}`], ['Care', CARE[k] || CAT_COPY[p.cat]], ['Delivery', FREE_DELIVERY], ['Returns', '7-day returns on unused items'], ['Tax', 'Price includes 18% GST']];
  return [
    { id: 'technical', title: 'Technical specification', icon: 'wrench', rows: merge(technical, o.technical) },
    { id: 'measurements', title: 'Measurements', icon: 'ruler', rows: merge(measurements, o.measurements) },
    { id: 'manufacturer', title: 'Manufacturer info', icon: 'factory', rows: merge(manufacturer, o.manufacturer) },
    { id: 'more', title: 'More details', icon: 'info', rows: merge(more, o.more) },
  ];
}

/* ───── Size guides ─────
   { intro, tables: [{ title, columns, rows, mine? }], tips }.  `mine` is the row index to highlight (a ball's own size). */
const CLOTHING = (title, col, rows) => ({ intro: 'Measure yourself, then pick the row that fits. Between two sizes, go up for a relaxed fit.', tables: [{ title, columns: ['Size', `${col} (in)`, `${col} (cm)`], rows }], tips: ['Measure over a thin layer, with the tape snug but not tight.'] });
export function sizeGuideFor(p) {
  const k = p.art.kind, bs = Number(ballSize(p));
  switch (k) {
    case 'bat': return {
      intro: 'A bat should feel balanced the moment you pick it up. Use your height to choose the handle, then confirm at our counter if you can.',
      tables: [
        { title: 'Handle', columns: ['Handle', 'Player height', 'Overall length'], rows: [['Short handle (SH)', 'Up to about 5 ft 10 in (178 cm)', 'About 85 cm'], ['Long handle (LH)', 'Above about 5 ft 10 in (178 cm)', 'About 87 cm']] },
      ],
      tips: ['Pick-up matters more than the number on the sticker. Hold the bat before you buy if you can.', ...(isJunior(p) ? ['Junior bats are chosen by height. Ask at the counter if you are unsure.'] : [])],
    };
    case 'racket': return {
      intro: 'String tension changes how the strings feel and how much power you get.',
      tables: [
        { title: 'String tension', columns: ['Player', 'Tension'], rows: [['Beginners', '22 to 24 lbs'], ['Club players', '24 to 27 lbs'], ['Advanced', '27 lbs and above']] },
      ],
      tips: ['Check the maximum tension printed on your racket frame before stringing.', 'Stringing is done at our counter. See the Add-ons tab.'],
    };
    case 'shoe': return {
      intro: 'Sizes are approximate and vary a little between brands. If you are between two sizes, go up.',
      tables: [{ title: 'Shoe size', columns: ['UK', 'EU', 'Foot length'], rows: [['UK 6', 'EU 39.5', '24.8 cm'], ['UK 7', 'EU 41', '25.6 cm'], ['UK 8', 'EU 42', '26.5 cm'], ['UK 9', 'EU 43', '27.3 cm'], ['UK 10', 'EU 44.5', '28.2 cm']] }],
      tips: ['Measure your foot in the evening, when it is at its largest.', 'Wear the socks you play in when you try them.'],
    };
    case 'jersey': return CLOTHING('Chest', 'Chest', [['S', '36 to 38', '91 to 97'], ['M', '38 to 40', '97 to 102'], ['L', '40 to 42', '102 to 107'], ['XL', '42 to 44', '107 to 112']]);
    case 'shorts': return CLOTHING('Waist', 'Waist', [['S', '28 to 30', '71 to 76'], ['M', '30 to 32', '76 to 81'], ['L', '32 to 34', '81 to 86'], ['XL', '34 to 36', '86 to 91']]);
    case 'gloves': return { intro: 'Measure your hand and choose the closest size. Gloves should be snug with room to flex.', tables: [{ title: 'Glove size', columns: ['Size', 'Hand length'], rows: [['S', '17 to 18.5 cm'], ['M', '18.5 to 20 cm'], ['L', '20 to 21.5 cm']] }], tips: ['Measure from the crease of the wrist to the tip of the middle finger.'] };
    case 'pads': case 'kneepad': return { intro: 'Protection should sit snug without limiting how you move.', tables: [{ title: 'Size', columns: ['Size', 'Player height'], rows: [['Junior', 'Up to about 5 ft 2 in (157 cm)'], ['Senior', 'Above about 5 ft 2 in (157 cm)']] }], tips: ['Replace protective gear after any hard impact.'] };
    case 'helmet': return { intro: 'A helmet should sit level and snug, with no wobble when you shake your head.', tables: [{ title: 'Head size', columns: ['Size', 'Head circumference'], rows: [['Junior', '52 to 56 cm'], ['Senior', '56 to 60 cm']] }], tips: ['Measure around the widest part of the head, just above the eyebrows.'] };
    case 'football': return { intro: 'The right ball size depends on the age of the player.', tables: [{ title: 'Ball size', columns: ['Size', 'Age group'], rows: [['Size 3', 'Up to about 8 years'], ['Size 4', 'About 8 to 12 years'], ['Size 5', '12 years and above']], mine: bs ? bs - 3 : undefined }], tips: [] };
    case 'basketball': return { intro: 'The right ball size depends on who is playing.', tables: [{ title: 'Ball size', columns: ['Size', 'Player'], rows: [['Size 5', 'Under about 12 years'], ['Size 6', 'Women and girls, about 12 to 14 years'], ['Size 7', 'Men and boys, 14 years and above']], mine: bs ? bs - 5 : undefined }], tips: [] };
    default: return null;
  }
}
