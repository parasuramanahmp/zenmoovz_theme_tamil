import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ProductArt, SportIcon, stage } from '../art.jsx';
import { money } from '../store.jsx';
import { toTop } from './Header.jsx';

/* Spread a product list across its categories (one of each first), so the right-hand images show variety */
export function pickMedia(list, n = 8) {
  const groups = {}; list.forEach(p => (groups[p.cat] ||= []).push(p));
  const g = Object.values(groups).map(a => [...a].sort((x, y) => ((y.best ? 1 : 0) - (x.best ? 1 : 0)) || (y.rating - x.rating)));
  const out = []; for (let i = 0; out.length < n && g.some(a => i < a.length); i++) g.forEach(a => { if (a[i] && out.length < n) out.push(a[i]); });
  return out;
}

const MASK_V = 'linear-gradient(to bottom, transparent 0, #000 14%, #000 86%, transparent 100%)', MASK_H = 'linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%)';
const fill = arr => { const o = []; while (o.length < 4) o.push(...arr); return o; };

/* One image tile: the product photo with a name + price caption. If no photo can be loaded, a clean icon tile is shown instead. */
function Tile({ p, dup, bad, setBad, className = '' }) {
  return <div className={`pb-3 ${className}`}>
    <Link to={`/product/${p.id}`} onClick={toTop} aria-hidden={dup || undefined} tabIndex={dup ? -1 : undefined} className="group relative block aspect-[4/5] overflow-hidden rounded-[6px] bg-white ring-1 ring-white/15">
      {bad[p.id]
        ? <div className="grid h-full w-full place-items-center text-ink/25" style={{ background: stage(p.sport) }}><SportIcon id={p.sport} size={72} /></div>
        : <ProductArt product={p} className="h-full w-full transition-transform duration-700 group-hover:scale-105" onFail={() => setBad(o => ({ ...o, [p.id]: true }))} />}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/45 to-transparent px-3 pb-3 pt-10 text-white">
        <p className="truncate text-[13px] font-medium leading-tight">{p.name}</p><p className="mt-0.5 text-xs text-white/75">{money(p.price)}</p></div>
    </Link>
  </div>;
}

/* Right-hand side of a hero: product images that keep scrolling.
   Desktop: two columns drifting in opposite directions. Mobile: one row drifting sideways. Hover pauses. */
export default function HeroMedia({ products, sport, className = '' }) {
  const [bad, setBad] = useState({}), items = products.slice(0, 8);
  if (!items.length) return <div className={`hidden place-items-center text-white/15 md:grid ${className}`}><SportIcon id={sport} size={260} /></div>;
  const A = fill(items.filter((_, i) => i % 2 === 0)), B = fill(items.length > 1 ? items.filter((_, i) => i % 2) : items), R = fill(items);
  const mv = { maskImage: MASK_V, WebkitMaskImage: MASK_V }, mh = { maskImage: MASK_H, WebkitMaskImage: MASK_H };
  const Col = ({ list, cls }) => <div className="min-w-0 flex-1 overflow-hidden"><div className={`${cls} flex flex-col`}>{[...list, ...list].map((p, i) => <Tile key={`${p.id}-${i}`} p={p} dup={i >= list.length} bad={bad} setBad={setBad} />)}</div></div>;
  return <>
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .8, ease: [.22, 1, .36, 1], delay: .2 }} style={mv} className={`media-pause hidden gap-3 overflow-hidden md:flex ${className}`}>
      <Col list={A} cls="col-up" /><div className="min-w-0 flex-1 overflow-hidden pt-16"><div className="col-down flex flex-col">{[...B, ...B].map((p, i) => <Tile key={`${p.id}-${i}`} p={p} dup={i >= B.length} bad={bad} setBad={setBad} />)}</div></div>
    </motion.div>
    <div style={mh} className="media-pause -mx-6 overflow-hidden sm:-mx-10 md:hidden"><div className="row-left flex w-max">{[...R, ...R].map((p, i) => <Tile key={`${p.id}-${i}`} p={p} dup={i >= R.length} bad={bad} setBad={setBad} className="w-36 shrink-0 pr-3 sm:w-44" />)}</div></div>
  </>;
}
