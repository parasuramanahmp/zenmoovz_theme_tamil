import { PRODUCTS, SPORT, PIN_CITY, BEST_SELLERS, NEW_ARRIVALS } from '../data/catalog.js';

/* Every word typed must appear somewhere in the product's name, sport, category or brand */
const stem = w => w.replace(/(es|s)$/, '');
const ALIAS = { racquet: 'racket', racquets: 'rackets', googles: 'goggles', bats: 'bat', shoes: 'footwear', shoe: 'footwear', boots: 'footwear', kit: 'accessories', jersey: 'apparel' };
export function searchProducts(q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean).map(w => ALIAS[w] || w);
  if (!words.length) return [];
  return PRODUCTS.map(p => {
    const hay = `${p.name} ${p.sport} ${p.cat} ${p.brand} ${p.art.kind}`.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (!hay.includes(stem(w))) return null;
      score += p.name.toLowerCase().includes(stem(w)) ? 3 : 1;
    }
    return [p, score + (p.best ? .5 : 0)];
  }).filter(Boolean).sort((a, b) => b[1] - a[1]).map(x => x[0]);
}

/* Split a string around the typed words so matches can be highlighted */
export function highlight(text, q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean).map(stem).filter(w => w.length > 1);
  if (!words.length) return [text];
  const re = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'ig');
  return text.split(re).map((part, i) => ({ part, hit: i % 2 === 1 }));
}

/* Collection filtering used by sport, category, brand and search views */
export function filterProducts({ sport, cat, brand, q, view, max, sort }) {
  let list = q ? searchProducts(q) : view === 'best' ? [...BEST_SELLERS] : view === 'new' ? [...NEW_ARRIVALS] : [...PRODUCTS];
  if (sport && sport !== 'all') list = list.filter(p => p.sport === sport);
  if (cat) list = list.filter(p => p.cat === cat);
  if (brand) list = list.filter(p => p.brand === brand);
  if (max) list = list.filter(p => p.price <= max);
  if (sort === 'low') list.sort((a, b) => a.price - b.price);
  else if (sort === 'high') list.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
  else if (sort === 'discount') list.sort((a, b) => (1 - b.price / b.oldPrice) - (1 - a.price / a.oldPrice));
  return list;
}

export const cityFor = pin => PIN_CITY[String(pin).slice(0, 2)] || null;

/* Delivery window as real dates, e.g. "Fri 30 Oct – Mon 2 Nov" */
export function etaFor(pin) {
  const n = String(pin).split('').reduce((s, c) => s + Number(c), 0);
  const from = 2 + (n % 3), to = from + 2, f = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const d = k => { const x = new Date(); x.setDate(x.getDate() + k); return f.format(x); };
  return `${d(from)} – ${d(to)}`;
}

export const sportName = id => SPORT[id]?.name || '';

/* Where a cart / order item links to: products have a page, an in-store service opens its calculator on /services */
export const hrefOf = p => p.service ? `/services#${p.service}` : `/product/${p.id}`;

/* URL for a storefront view, e.g. hrefFor({ sport: 'cricket', cat: 'Bats' }) → /?sport=cricket&cat=Bats */
export const hrefFor = ({ sport, cat, brand, q, view } = {}) => {
  const p = new URLSearchParams();
  if (sport && sport !== 'all') p.set('sport', sport);
  if (cat) p.set('cat', cat);
  if (brand) p.set('brand', brand);
  if (q) p.set('q', q);
  if (view) p.set('view', view);
  const s = p.toString();
  return s ? `/?${s}` : '/';
};


/* The storefront's "ALL" view: "/" with no sport / category / brand / search / view filter (a bare ?sport=all counts as All). */
export const isAllView = (params) => !['sport', 'cat', 'brand', 'q', 'view'].some(k => params.get(k)) || (params.get('sport') === 'all' && !['cat', 'brand', 'q', 'view'].some(k => params.get(k)));
