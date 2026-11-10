/* ───────────────────────── ZENMOOVZ catalogue ─────────────────────────
   Everything the storefront shows comes from this file: sports, categories,
   brands, products, outlet racks and videos. Edit it, or replace it with an
   API response of the same shape.
   Product artwork is drawn in SVG (src/art.jsx). To use real photos instead,
   add `image: 'https://…'` to a product and ProductArt will show the photo.
────────────────────────────────────────────────────────────────────── */

import { KIT as KIT_ITEMS } from './cricketKit.js';
import { SERVICE_PRODUCTS } from './services.js';
const KIT_IDS = KIT_ITEMS.map(k => k.id);

export const SPORTS = [
  { id: 'all', name: 'All', tint: '#ECEAE5' },
  { id: 'badminton', name: 'Badminton', tint: '#ECEAE5', hue: ['#0A0A0A', '#26262A'], pop: '#FFFFFF', line: 'Fast hands. Faster feet.' },
  { id: 'cricket', name: 'Cricket', tint: '#ECEAE5', hue: ['#0A0A0A', '#26262A'], pop: '#FFFFFF', line: 'Own the crease.' },
  { id: 'football', name: 'Football', tint: '#ECEAE5', hue: ['#0A0A0A', '#26262A'], pop: '#FFFFFF', line: 'Ninety minutes. All in.' },
  { id: 'volleyball', name: 'Volleyball', tint: '#ECEAE5', hue: ['#0A0A0A', '#26262A'], pop: '#FFFFFF', line: 'Rise together.' },
  { id: 'throwball', name: 'Throwball', tint: '#ECEAE5', hue: ['#0A0A0A', '#26262A'], pop: '#FFFFFF', line: 'Catch it. Throw it back harder.' },
  { id: 'basketball', name: 'Basketball', tint: '#ECEAE5', hue: ['#0A0A0A', '#26262A'], pop: '#FFFFFF', line: 'Make the next shot count.' },
  { id: 'swimming', name: 'Swimming', tint: '#ECEAE5', hue: ['#0A0A0A', '#26262A'], pop: '#FFFFFF', line: 'Lane by lane.' },
];
export const SPORT = Object.fromEntries(SPORTS.map(s => [s.id, s]));

export const CATEGORIES = [
  { id: 'Bats', label: 'Bats', kind: 'bat', a: '#B4532A', b: '#111111', sport: 'cricket' },
  { id: 'Balls', label: 'Balls', kind: 'football', a: '#fff', b: '#B4532A', sport: 'football' },
  { id: 'Rackets', label: 'Rackets & shuttles', kind: 'racket', a: '#C8E04A', b: '#0A0A0A', sport: 'badminton' },
  { id: 'Footwear', label: 'Footwear', kind: 'shoe', a: '#111111', b: '#B08D57', sport: 'basketball' },
  { id: 'Apparel', label: 'Apparel', kind: 'jersey', a: '#B4532A', b: '#fff', sport: 'football' },
  { id: 'Protection', label: 'Protection', kind: 'helmet', a: '#111111', b: '#E9B99B', sport: 'cricket' },
  { id: 'Swim gear', label: 'Swim gear', kind: 'goggles', a: '#1596C9', b: '#0A0A0A', sport: 'swimming' },
  { id: 'Accessories', label: 'Bags & accessories', kind: 'bag', a: '#111111', b: '#B08D57', sport: 'volleyball' },
];
export const CAT = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

/* Brands we stock. Logos are in public/brands/<slug>.webp (see tools/extract_brand_logos.py).
   `featured` (1-8) = the eight brands shown on the home page, in that order; every brand is on the /brands page.
   Each brand's `line` ("Cricket · Badminton gear") is built below from the products assigned to it. */
const brand = (id, featured = 0) => ({ id, logo: `/brands/${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.webp`, featured, line: '' });
export const BRANDS = [
  brand('Akkash'), brand('Apacs'), brand('Asics'), brand('Black Panther'), brand('Cosco', 8), brand('Forma'), brand('Galaxy'), brand('GM', 6),
  brand('Gupta'), brand('Konex'), brand('Kookaburra', 5), brand('Li-Liang'), brand('Li-Ning', 2), brand('LP Band'), brand('Mercury Plus'), brand('Mighty'),
  brand('Moonwalkr'), brand('MRF'), brand('Nivia', 7), brand('PIA Trends'), brand('Scholl'), brand('SF'), brand('SG', 3), brand('Shrey'),
  brand('SS', 4), brand('Vicky'), brand('VSE'), brand('Yonex', 1),
];
export const FEATURED_BRANDS = BRANDS.filter(b => b.featured).sort((x, y) => x.featured - y.featured);

/* id, sport, category, brand, name, price, mrp, rating, reviews, art kind, colour a, colour b, note, flags (b = best seller, n = new), tag override */
const row = ([id, sport, cat, brand, name, price, oldPrice, rating, reviews, kind, a, b, note, flags = '', tag]) => ({
  id, sport, cat, brand, name, price, oldPrice, rating, reviews, art: { kind, a, b }, note,
  best: flags.includes('b'), isNew: flags.includes('n'), tag: tag || (flags.includes('b') ? 'BEST SELLER' : flags.includes('n') ? 'NEW' : ''),
});

export const PRODUCTS = [
  /* Cricket */
  [1, 'cricket', 'Bats', 'SG', 'PowerDrive Pro Bat', 5499, 6499, 4.9, 42, 'bat', '#B4532A', '#111111', 'A balanced, powerful bat built for confident strokes and long innings', 'b'],
  [9, 'cricket', 'Bats', 'SS', 'Reign English Willow Grade 1', 14999, 17999, 4.9, 31, 'bat', '#D94B3D', '#0A0A0A', 'Straight-grain Grade 1 willow with a huge sweet spot', '', 'PRO PICK'],
  [10, 'cricket', 'Bats', 'GM', 'Reign English Willow Grade 2', 9499, 11499, 4.8, 54, 'bat', '#B08D57', '#111111', 'Match-ready willow with a punchy mid-profile'],
  [11, 'cricket', 'Bats', 'Kookaburra', 'Slam Power Bat', 7299, 8499, 4.7, 38, 'bat', '#1F8A4C', '#0A0A0A', 'Thick edges and a high middle for clean power hitting', 'n'],
  [12, 'cricket', 'Bats', 'MRF', 'Heritage Players Bat', 11299, 13499, 4.8, 22, 'bat', '#E9B99B', '#7A1F1F', 'Classic profile, hand-selected willow, light pick-up'],
  [13, 'cricket', 'Bats', 'SF', 'Kashmir Willow Classic', 2199, 2799, 4.5, 77, 'bat', '#E8E0D0', '#B4532A', 'Tough Kashmir willow for nets and weekend leagues', 'b'],
  [14, 'cricket', 'Bats', 'Gupta', 'Junior Scoop Bat', 1499, 1899, 4.6, 49, 'bat', '#B08D57', '#B4532A', 'Short-handle bat sized for young players'],
  [15, 'cricket', 'Bats', 'Akkash', 'Tennis-Ball Power Bat', 899, 1199, 4.4, 63, 'bat', '#D94B3D', '#111111', 'Scooped blade for the street and the terrace'],
  [4, 'cricket', 'Balls', 'Kookaburra', 'MatchPro Cricket Ball', 499, 599, 4.7, 61, 'cball', '#C0392B', '#F8E3C8', 'A dependable match ball with consistent bounce and feel', 'b'],
  [5, 'cricket', 'Balls', 'SG', 'StreetPlay Cork Ball', 149, 199, 4.6, 19, 'cork', '#C98B4B', '#7A4A1F', 'A durable practice essential for casual games and training'],
  [16, 'cricket', 'Protection', 'Shrey', 'Pro Batting Gloves', 1199, 1499, 4.6, 40, 'gloves', '#B4532A', '#fff', 'Segmented finger protection with a breathable palm'],
  [17, 'cricket', 'Protection', 'SS', 'Shield Batting Pads', 1899, 2399, 4.7, 35, 'pads', '#FFFFFF', '#B4532A', 'Lightweight pads with a cushioned knee roll'],
  [18, 'cricket', 'Protection', 'Shrey', 'Aero Helmet', 2399, 2899, 4.8, 18, 'helmet', '#111111', '#E9B99B', 'Steel grille helmet with ventilated shell', 'n'],
  [19, 'cricket', 'Footwear', 'Asics', 'Spike Cricket Shoes', 3299, 3999, 4.6, 26, 'shoe', '#FFFFFF', '#B4532A', 'Spiked outsole and a locked-in heel for crease work'],
  [20, 'cricket', 'Accessories', 'SS', 'Kit Bag Duffel', 2599, 3199, 4.5, 29, 'bag', '#111111', '#B08D57', 'Room for a bat, pads, helmet and shoes'],
  [21, 'cricket', 'Accessories', 'Black Panther', 'Wooden Stumps Set', 799, 999, 4.4, 21, 'stumps', '#E7C48B', '#B4532A', 'Three stumps and bails for the backyard pitch'],
  /* Badminton */
  [2, 'badminton', 'Rackets', 'Yonex', 'AeroStrike Racket', 3299, 3999, 4.8, 28, 'racket', '#B4532A', '#0A0A0A', 'Lightweight frame with a responsive feel for fast rallies', 'b', 'PRO PICK'],
  [22, 'badminton', 'Rackets', 'Li-Ning', 'Featherlight 83', 2799, 3499, 4.7, 46, 'racket', '#C8E04A', '#0A0A0A', 'Ultra-light head-light balance for quick defence', 'b'],
  [23, 'badminton', 'Rackets', 'Apacs', 'Smash Pro', 4899, 5999, 4.8, 33, 'racket', '#D94B3D', '#0A0A0A', 'Stiff shaft and head-heavy balance for steep smashes', 'n'],
  [24, 'badminton', 'Rackets', 'Yonex', 'Control X', 3699, 4499, 4.6, 27, 'racket', '#E9B99B', '#111111', 'Even balance and a forgiving string bed'],
  [25, 'badminton', 'Rackets', 'Li-Ning', 'Carbon Elite', 6499, 7999, 4.9, 19, 'racket', '#0A0A0A', '#B08D57', 'Full carbon build tuned for tournament play', 'n'],
  [26, 'badminton', 'Rackets', 'Li-Liang', 'Nano Speed', 3999, 4799, 4.7, 24, 'racket', '#B08D57', '#0A0A0A', 'Slim frame that cuts through the air'],
  [27, 'badminton', 'Rackets', 'Apacs', 'Power Edge', 3199, 3899, 4.5, 30, 'racket', '#1F8A4C', '#0A0A0A', 'Weighted head for drives and clears'],
  [28, 'badminton', 'Rackets', 'Yonex', 'Starter Duo Set', 1299, 1699, 4.4, 88, 'racket', '#9A4FA8', '#0A0A0A', 'Two rackets, a cover and shuttles to get started'],
  [29, 'badminton', 'Rackets', 'Li-Ning', 'Feather Shuttles (12)', 899, 1099, 4.7, 52, 'shuttle', '#FFFFFF', '#D94B3D', 'Goose-feather shuttles with a stable flight'],
  [30, 'badminton', 'Rackets', 'Konex', 'Nylon Shuttles (6)', 449, 549, 4.5, 71, 'shuttle', '#B08D57', '#B4532A', 'Hard-wearing nylon shuttles for practice'],
  [3, 'badminton', 'Footwear', 'Li-Ning', 'Velocity Court Shoes', 4299, 4999, 4.9, 36, 'shoe', '#FFFFFF', '#B4532A', 'Responsive cushioning and grippy traction for explosive moves', 'b', 'NEW DROP'],
  [31, 'badminton', 'Accessories', 'Yonex', 'Racket Bag (6-pack)', 1699, 2099, 4.5, 20, 'bag', '#0B4F4A', '#C8E04A', 'Thermal-lined bag that holds six rackets'],
  /* Football */
  [32, 'football', 'Balls', 'Nivia', 'Match Ball Pro (Size 5)', 1799, 2199, 4.8, 64, 'football', '#FFFFFF', '#B4532A', 'Thermo-bonded panels for a true, predictable flight', 'b'],
  [33, 'football', 'Balls', 'Cosco', 'Night Match Ball (Size 5)', 1599, 1999, 4.6, 27, 'football', '#B08D57', '#0A0A0A', 'High-visibility colours for evening games', 'n'],
  [34, 'football', 'Balls', 'VSE', 'Training Ball (Size 5)', 899, 1199, 4.5, 90, 'football', '#FFFFFF', '#D94B3D', 'Machine-stitched and built to take a beating'],
  [35, 'football', 'Balls', 'Mighty', 'Futsal Ball', 1299, 1599, 4.6, 33, 'football', '#1F8A4C', '#FFFFFF', 'Low-bounce ball for indoor courts'],
  [36, 'football', 'Balls', 'Nivia', 'Street Rubber Ball', 599, 799, 4.4, 102, 'football', '#B4532A', '#B08D57', 'Rubber cover for concrete and gravel'],
  [37, 'football', 'Balls', 'Cosco', 'Junior Ball (Size 3)', 699, 899, 4.5, 45, 'football', '#9A4FA8', '#FFFFFF', 'Lightweight size 3 for young footballers'],
  [38, 'football', 'Balls', 'Galaxy', 'Beach Soft Ball', 799, 999, 4.3, 23, 'football', '#1596C9', '#FFFFFF', 'Soft-touch ball for sand and grass'],
  [39, 'football', 'Balls', 'Forma', 'Pulse Ball (Size 5)', 2199, 2699, 4.9, 15, 'football', '#0A0A0A', '#C8E04A', 'Premium match ball with a seamless surface', 'n'],
  [40, 'football', 'Footwear', 'Nivia', 'Turf Studs', 3499, 4299, 4.6, 31, 'shoe', '#0A0A0A', '#C8E04A', 'Short studs for artificial turf and hard ground'],
  [41, 'football', 'Protection', 'Mighty', 'Shin Guards', 599, 799, 4.4, 58, 'kneepad', '#FFFFFF', '#B4532A', 'Hard shell with a soft inner and ankle sleeve'],
  [42, 'football', 'Protection', 'Cosco', 'Keeper Gloves', 1399, 1799, 4.7, 25, 'gloves', '#C8E04A', '#0A0A0A', 'Latex palm with a wrist lock for a secure fit'],
  [43, 'football', 'Apparel', 'PIA Trends', 'Club Jersey', 1199, 1499, 4.5, 47, 'jersey', '#B4532A', '#FFFFFF', 'Quick-dry fabric with a breathable mesh back'],
  /* Basketball */
  [44, 'basketball', 'Balls', 'Cosco', 'Grip Pro Ball (Size 7)', 1899, 2299, 4.8, 58, 'basketball', '#D9531E', '#0A0A0A', 'Deep channels and soft-touch grip for confident handles', 'b'],
  [45, 'basketball', 'Balls', 'Nivia', 'Street Rubber (Size 7)', 999, 1299, 4.5, 80, 'basketball', '#B8451A', '#0A0A0A', 'Rubber outdoor ball that shrugs off concrete'],
  [46, 'basketball', 'Balls', 'Mercury Plus', 'Indoor Cushion (Size 7)', 2299, 2799, 4.7, 21, 'basketball', '#C97A2B', '#0A0A0A', 'Composite leather for hardwood courts'],
  [47, 'basketball', 'Balls', 'Mighty', 'Women’s Ball (Size 6)', 1599, 1999, 4.6, 26, 'basketball', '#D9531E', '#FFFFFF', 'Size 6 ball for women’s games and training'],
  [48, 'basketball', 'Balls', 'VSE', 'Junior Ball (Size 5)', 899, 1099, 4.5, 34, 'basketball', '#B4532A', '#B08D57', 'Size 5 ball for under-12s'],
  [49, 'basketball', 'Balls', 'Galaxy', 'Skyline Ball (Size 7)', 1299, 1599, 4.6, 19, 'basketball', '#111111', '#B08D57', 'Dark-blue ball with gold seams', 'n'],
  [50, 'basketball', 'Footwear', 'Asics', 'Court High-Tops', 4999, 5999, 4.8, 29, 'shoe', '#D9531E', '#FFFFFF', 'Ankle support and heel cushioning for hard cuts'],
  [51, 'basketball', 'Apparel', 'PIA Trends', 'Game Jersey', 1299, 1599, 4.5, 36, 'jersey', '#D9531E', '#FFFFFF', 'Sleeveless mesh jersey with a relaxed fit'],
  /* Volleyball */
  [6, 'volleyball', 'Balls', 'Cosco', 'SkyReach Volleyball', 1199, 1499, 4.8, 33, 'volleyball', '#B08D57', '#B4532A', 'Soft-touch surface and reliable grip for indoor and outdoor matches', 'b', 'TEAM FAVOURITE'],
  [53, 'volleyball', 'Balls', 'Nivia', 'Beach Volley', 999, 1299, 4.5, 28, 'volleyball', '#1596C9', '#FFFFFF', 'Water-resistant cover for sand courts'],
  [54, 'volleyball', 'Balls', 'Vicky', 'Match Soft Touch', 1699, 2099, 4.7, 22, 'volleyball', '#FFFFFF', '#D94B3D', 'Match-grade ball with a gentle feel on serve receive', 'n'],
  [55, 'volleyball', 'Balls', 'Mercury Plus', 'Training Volley', 749, 949, 4.4, 61, 'volleyball', '#9A4FA8', '#B08D57', 'Durable practice ball for drills'],
  [7, 'volleyball', 'Accessories', 'Vicky', 'ProCourt Net Set', 2499, 2999, 4.7, 24, 'net', '#FFFFFF', '#111111', 'A sturdy, easy-to-set-up net for your next court session', '', 'GAME ON'],
  [56, 'volleyball', 'Protection', 'LP Band', 'Knee Pads', 699, 899, 4.6, 53, 'kneepad', '#111111', '#FFFFFF', 'Padded knee guards for dives and digs'],
  [57, 'volleyball', 'Footwear', 'Asics', 'Court Shoes', 3299, 3999, 4.5, 17, 'shoe', '#B08D57', '#FFFFFF', 'Gum-rubber sole for stop-and-jump grip'],
  /* Throwball */
  [58, 'throwball', 'Balls', 'Cosco', 'Match Throwball', 749, 949, 4.6, 36, 'throwball', '#D94B3D', '#B08D57', 'Soft, grippy ball sized for a one-hand catch', 'b'],
  [59, 'throwball', 'Balls', 'Vicky', 'Women’s Tournament Throwball', 899, 1099, 4.7, 29, 'throwball', '#9A4FA8', '#FFFFFF', 'Tournament weight with a tacky finish', 'n'],
  [60, 'throwball', 'Balls', 'Black Panther', 'Training Throwball', 549, 699, 4.4, 48, 'throwball', '#B4532A', '#FFFFFF', 'Everyday practice ball'],
  [61, 'throwball', 'Balls', 'Nivia', 'Grip Throwball', 649, 849, 4.5, 31, 'throwball', '#1F8A4C', '#FFFFFF', 'Textured cover for wet hands'],
  [62, 'throwball', 'Footwear', 'Moonwalkr', 'Throwball Court Shoes', 2999, 3699, 4.5, 14, 'shoe', '#9A4FA8', '#FFFFFF', 'Light court shoes with a flexible forefoot', 'n'],
  [63, 'throwball', 'Protection', 'LP Band', 'Elbow & Knee Guard Set', 799, 999, 4.4, 20, 'kneepad', '#0A0A0A', '#FFFFFF', 'Four guards in one set'],
  [64, 'throwball', 'Accessories', 'Gupta', 'Throwball Kit Bag (3 balls)', 1299, 1599, 4.3, 16, 'bag', '#47204F', '#FFD6F2', 'Ventilated bag for three balls and a bottle'],
  /* Swimming */
  [65, 'swimming', 'Swim gear', 'Cosco', 'Anti-Fog Goggles', 899, 1199, 4.7, 92, 'goggles', '#1596C9', '#0A0A0A', 'UV-protected anti-fog lenses with a soft seal', 'b'],
  [66, 'swimming', 'Swim gear', 'Mercury Plus', 'Racing Goggles Pro', 1499, 1899, 4.8, 26, 'goggles', '#0A0A0A', '#BFF0FF', 'Low-profile racing fit with a split strap', 'n'],
  [67, 'swimming', 'Swim gear', 'Vicky', 'Silicone Swim Cap', 399, 549, 4.5, 70, 'cap', '#B4532A', '#FFFFFF', 'Stretchy silicone cap that stays put'],
  [68, 'swimming', 'Apparel', 'PIA Trends', 'Racing Jammers (Men)', 1299, 1599, 4.6, 38, 'shorts', '#0A0A0A', '#1596C9', 'Chlorine-resistant fabric with a drag-cutting cut'],
  [69, 'swimming', 'Apparel', 'Mighty', 'Kids Swim Trunks', 799, 999, 4.5, 41, 'shorts', '#B08D57', '#1596C9', 'Quick-dry trunks with a soft waistband'],
  [70, 'swimming', 'Swim gear', 'Mighty', 'Kickboard', 599, 749, 4.6, 44, 'board', '#1596C9', '#FFFFFF', 'Buoyant foam board for kick sets'],
  [71, 'swimming', 'Swim gear', 'Galaxy', 'Pull Buoy', 549, 699, 4.5, 32, 'board', '#B08D57', '#0A0A0A', 'Foam float that isolates your upper body'],
  [72, 'swimming', 'Swim gear', 'Akkash', 'Mirror Goggles', 1099, 1399, 4.6, 30, 'goggles', '#9A4FA8', '#0A0A0A', 'Mirror-coated lenses for bright pools', 'n'],
  [73, 'swimming', 'Accessories', 'Gupta', 'Mesh Swim Bag', 1099, 1399, 4.4, 22, 'bag', '#1596C9', '#FFFFFF', 'Drains fast and dries quicker'],
  [74, 'swimming', 'Swim gear', 'Scholl', 'Silicone Cap Pro (Long Hair)', 449, 599, 4.5, 35, 'cap', '#D94B3D', '#FFFFFF', 'Extra-roomy cap for long hair'],
].map(row);


/* "Cricket · Badminton gear" for each brand, from the products assigned to it */
BRANDS.forEach(b => {
  const sports = [...new Set(PRODUCTS.filter(p => p.brand === b.id).map(p => SPORT[p.sport].name))];
  b.line = sports.length ? `${sports.join(' · ')} gear` : 'Coming soon';
});
export const BY_ID = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

/* The Cricket Kit: ONE product in the cart. Its price is the sum of the pieces (so it never drifts from the catalogue),
   and its photo is public/products/900.jpg. It lives in BY_ID only, so it is never listed in the shop grid or search. */
export const KIT_ID = 900;
export const KIT_PRODUCT = (() => {
  const parts = KIT_IDS.map(id => BY_ID[id]).filter(Boolean);
  return { ...row([KIT_ID, 'cricket', 'Accessories', 'ZENMOOVZ', 'Cricket Kit', parts.reduce((t, x) => t + x.price, 0), parts.reduce((t, x) => t + x.oldPrice, 0), 4.8, 64, 'kit', '#0A0A0A', '#B4532A',
    'Everything for match day in one bag: bat, helmet, pads, gloves, spikes, ball and stumps, packed in a kit bag', '', 'KIT']), parts };
})();
BY_ID[KIT_ID] = KIT_PRODUCT;
/* In-store services (knocking-in, engraving, stringing) are cart products too, but only in BY_ID: never in the shop grid or search. See data/services.js */
Object.assign(BY_ID, SERVICE_PRODUCTS);
export const BEST_SELLERS = PRODUCTS.filter(p => p.best);
export const NEW_ARRIVALS = PRODUCTS.filter(p => p.isNew);

/* Outlet racks — which products stand on which rack, and how the rack is laid out */
export const RACKS = [
  { id: 'cricket', sport: 'cricket', label: 'Cricket bats', layout: 'bats', title: 'The bat wall', blurb: 'Eight bats, tape-ball to English willow. Pull one off the rack to see the full card.', ids: [9, 12, 10, 11, 1, 13, 14, 15] },
  { id: 'badminton', sport: 'badminton', label: 'Badminton rackets', layout: 'hang', title: 'The racket wall', blurb: 'Head-light to head-heavy. Tap a racket to take it off the pegs.', ids: [25, 23, 26, 22, 24, 27, 2, 28] },
  { id: 'football', sport: 'football', label: 'Footballs', layout: 'shelf', title: 'The ball wall', blurb: 'Match balls, futsal and street. Pick one off the shelf.', ids: [32, 39, 33, 34, 35, 36, 37, 38] },
  { id: 'basketball', sport: 'basketball', label: 'Basketballs', layout: 'shelf', title: 'The ball rack', blurb: 'Indoor, outdoor and junior sizes. Tap a ball to check it out.', ids: [44, 46, 49, 47, 45, 48] },
  { id: 'volleyball', sport: 'volleyball', label: 'Volleyballs', layout: 'shelf', title: 'The volley shelf', blurb: 'Four balls for sand, hall and practice.', ids: [54, 6, 53, 55] },
  { id: 'throwball', sport: 'throwball', label: 'Throwballs', layout: 'shelf', title: 'The throwball shelf', blurb: 'Grippy, soft and tournament-ready.', ids: [59, 58, 61, 60] },
  { id: 'swimming', sport: 'swimming', label: 'Swim gear', layout: 'hang', title: 'The pool-deck pegboard', blurb: 'Goggles, caps and jammers on hooks. Tap one to unhook it.', ids: [66, 65, 72, 67, 74, 68, 69, 70] },
];

/* Category copy and options used on the product page */
export const CAT_COPY = {
  Bats: 'Knock it in before match day and oil the blade lightly for a longer life.',
  Balls: 'Inflate to the pressure printed on the ball and store away from direct sun.',
  Rackets: 'Restring every few months to keep the feel crisp.',
  Footwear: 'Designed for the surface you play on. Wear them in on a short session first.',
  Apparel: 'Breathable fabric that moves with you and dries fast.',
  Protection: 'Fit snugly and replace after any hard impact.',
  'Swim gear': 'Rinse in fresh water after every swim and let it air-dry.',
  Accessories: 'Practical add-ons that keep your game running smoothly.',
};
export const sizesFor = p => {
  const k = p.art.kind;
  /* bats and rackets have no weight choice: the weight is not an option on the product page, in the cart or in the kit */
  if (k === 'shoe') return ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'];
  if (k === 'jersey' || k === 'shorts') return ['S', 'M', 'L', 'XL'];
  if (k === 'gloves') return ['S', 'M', 'L'];
  if (k === 'pads' || k === 'kneepad' || k === 'helmet') return ['Junior', 'Senior'];
  return null;
};
export const sizeLabel = () => 'Size';

/* Pincode → city (first two digits). Extend or replace with a real lookup. */
export const PIN_CITY = { 60: 'Chennai', 56: 'Bengaluru', 50: 'Hyderabad', 40: 'Mumbai', 11: 'Delhi', 70: 'Kolkata', 41: 'Pune', 64: 'Coimbatore', 68: 'Kochi', 38: 'Ahmedabad' };
export const POPULAR_CITIES = [['Chennai', '600001'], ['Bengaluru', '560001'], ['Hyderabad', '500001'], ['Mumbai', '400001'], ['Delhi', '110001'], ['Kolkata', '700001'], ['Pune', '411001'], ['Coimbatore', '641001']];
