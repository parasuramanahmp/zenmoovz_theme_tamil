/* ───────────────────────── In-store services ─────────────────────────
   Done at the Pallikaranai counter. Everything about them lives here: prices, options, and how a configured
   service becomes a cart line. Change a price here and the home page, the /services page, the product pages
   and the cart all follow. All prices include GST.
────────────────────────────────────────────────────────────────────── */

const inr = n => `₹${n.toLocaleString('en-IN')}`;
const num = n => n.toLocaleString('en-IN');

/* Bat knocking-in: one price covers up to 8,000 knocks, then a small step per extra 1,000. Same price for any bat. */
export const KNOCK = { base: 400, included: 8000, per: 50, step: 1000, min: 4000, max: 20000, recommended: 8000 };
export const knockPrice = n => KNOCK.base + Math.max(0, Math.ceil((n - KNOCK.included) / KNOCK.step)) * KNOCK.per;

/* Bat engraving: flat price, up to 20 characters, on one of four places on the bat */
export const ENGRAVE = { price: 350, max: 20, spots: ['Back of blade', 'Handle', 'Shoulder', 'Side edge'] };

/* Badminton stringing: labour is always ₹200. "Ours" adds the string on top (the totals are the string price + labour). */
export const STRING_LABOUR = 200;
export const STRINGS = [
  { id: 'BG65', blurb: 'Durable all-rounder', price: 370 },
  { id: 'BG80', blurb: 'Crisp, sharp feel', price: 570 },
  { id: 'Exbolt 65', blurb: 'Thin, attacking repulsion', price: 770 },
  { id: 'Lethal 63', blurb: 'Fast, powerful repulsion', price: 670 },
];
export const STRING_BY_ID = Object.fromEntries(STRINGS.map(s => [s.id, s]));
export const TENSIONS = Array.from({ length: 15 }, (_, i) => 18 + i);   // 18 to 32 lbs
export const TENSION_DEFAULT = 24;
export const TENSION_HINT = 'Beginners 22–24 · Club 24–27 · Advanced 27+';
export const stringTotal = (mode, stringId) => STRING_LABOUR + (mode === 'ours' ? (STRING_BY_ID[stringId]?.price || 0) : 0);
export const STRING_FROM = STRING_LABOUR + Math.min(...STRINGS.map(s => s.price));   // "from ₹570"

/* ── The three services as the cards on the home page and the /services page show them ── */
export const SERVICE_LIST = [
  { key: 'knock', title: 'Bat knocking-in', sport: 'cricket',
    blurb: `${num(KNOCK.included)} controlled mallet knocks so your new bat is ready for the nets.`,
    price: inr(KNOCK.base), unit: `for ${num(KNOCK.included)} knocks, GST incl.` },
  { key: 'engrave', title: 'Bat engraving', sport: 'cricket',
    blurb: 'Your name or number on the back, handle, shoulder or edge.',
    price: inr(ENGRAVE.price), unit: 'flat, GST included' },
  { key: 'string', title: 'Badminton stringing', sport: 'badminton',
    blurb: `Bring your own string for ${inr(STRING_LABOUR)}, or pick one of ours. Fitted while you wait.`,
    price: `From ${inr(STRING_LABOUR)}`, unit: `your string · or string + service from ${inr(STRING_FROM)}` },
];
export const SERVICE_BY_KEY = Object.fromEntries(SERVICE_LIST.map(s => [s.key, s]));

/* Which services belong on which page: used by the product page and the sport / category views */
export const servicesForProduct = p => p?.art?.kind === 'bat' ? ['knock', 'engrave'] : p?.art?.kind === 'racket' ? ['string'] : [];
export const servicesForView = ({ sport, cat } = {}) => {
  if (cat === 'Bats' || (!cat && sport === 'cricket')) return ['knock', 'engrave'];
  if (cat === 'Rackets' || (!cat && sport === 'badminton')) return ['string'];
  return [];
};

/* ── Cart products. Each service is ONE product id so cart lines, orders and toasts work like any other item.
   The configured details (knocks, text, string…) travel as the line's `size` text and its own `price`. ── */
export const SERVICE_ID = { knock: 9001, engrave: 9002, string: 9003 };
const svc = (key, name, note, sport) => ({
  id: SERVICE_ID[key], service: key, sport, cat: 'Services', brand: 'ZENMOOVZ', name, price: 0, oldPrice: 0, rating: 0, reviews: 0,
  art: { kind: 'service', a: '#0A0A0A', b: '#B4532A' }, note, best: false, isNew: false, tag: '',
});
export const SERVICE_PRODUCTS = {
  [SERVICE_ID.knock]: svc('knock', 'Bat knocking-in', 'Done at our Pallikaranai counter', 'cricket'),
  [SERVICE_ID.engrave]: svc('engrave', 'Bat engraving', 'Done at our Pallikaranai counter', 'cricket'),
  [SERVICE_ID.string]: svc('string', 'Badminton stringing', 'Done at our Pallikaranai counter', 'badminton'),
};
/* The price a service line was added at is stored on the line; this is the fallback and the "from" price */
SERVICE_PRODUCTS[SERVICE_ID.knock].price = SERVICE_PRODUCTS[SERVICE_ID.knock].oldPrice = KNOCK.base;
SERVICE_PRODUCTS[SERVICE_ID.engrave].price = SERVICE_PRODUCTS[SERVICE_ID.engrave].oldPrice = ENGRAVE.price;
SERVICE_PRODUCTS[SERVICE_ID.string].price = SERVICE_PRODUCTS[SERVICE_ID.string].oldPrice = STRING_FROM;

/* A configured service → { product, size, price }, the shape the cart takes */
export const cleanText = t => String(t || '').replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, ENGRAVE.max);
export const knockLine = (n = KNOCK.recommended) => ({ product: SERVICE_PRODUCTS[SERVICE_ID.knock], size: `${num(n)} knocks`, price: knockPrice(n) });
export const engraveLine = (text, spot) => ({ product: SERVICE_PRODUCTS[SERVICE_ID.engrave], size: `${spot} · “${cleanText(text)}”`, price: ENGRAVE.price });
export const stringLine = ({ mode, string, tension }) => ({
  product: SERVICE_PRODUCTS[SERVICE_ID.string],
  size: mode === 'own' ? `Your own string · ${tension} lbs` : `${string} string + service · ${tension} lbs`,
  price: stringTotal(mode, string),
});
export const isServiceId = id => id in SERVICE_PRODUCTS;

/* Real footage for the service cards (see public/services/README.txt). Missing files quietly fall back to the animated drawing. */
export const SERVICE_MEDIA = {
  knock: { video: '/services/knock.mp4', image: '/services/knock.jpg', gallery: [1, 2, 3].map(n => `/services/knock-${n}.jpg`), alt: 'A mallet knocking in a new cricket bat' },
  engrave: { video: '/services/engrave.mp4', image: '/services/engrave.jpg', gallery: [1, 2, 3].map(n => `/services/engrave-${n}.jpg`), alt: 'A name being engraved onto a cricket bat' },
  string: { video: '/services/string.mp4', image: '/services/string.jpg', gallery: [1, 2, 3].map(n => `/services/string-${n}.jpg`), alt: 'A badminton racket being strung' },
};
