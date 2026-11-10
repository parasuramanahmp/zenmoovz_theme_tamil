import React, { useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronUp, Factory, Info, Ruler, Wrench } from 'lucide-react';
import { ServiceIcon } from '../art.jsx';
import { SERVICE_BY_KEY } from '../data/services.js';
import { sizeGuideFor, specsFor } from '../data/specs.js';
import { Stars } from '../motion.jsx';

const ease = [.22, 1, .36, 1];
const ICONS = { wrench: Wrench, ruler: Ruler, factory: Factory, info: Info };

/* A spec card: icon + title, a chevron to fold it away, and label / value rows */
function SpecCard({ icon, title, rows, order }) {
  const [open, setOpen] = useState(true), id = useId(), Icon = ICONS[icon];
  return <section className={`rounded-[6px] border border-ink/10 bg-white ${order}`}>
    <h3><button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)} className="flex w-full items-center gap-3 px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mist text-ink"><Icon size={16} strokeWidth={1.8} /></span>
      <span className="flex-1 text-[15px] font-bold">{title}</span>
      <motion.span animate={{ rotate: open ? 0 : 180 }} transition={{ duration: .25 }} className="text-ink/50"><ChevronUp size={18} /></motion.span>
    </button></h3>
    <AnimatePresence initial={false}>{open && <motion.div id={id} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .3, ease }} className="overflow-hidden">
      <dl className="border-t border-ink/10 px-5">{rows.map(([k, v]) => <div key={k} className="grid grid-cols-[minmax(0,.85fr)_minmax(0,1.5fr)] gap-4 border-b border-ink/10 py-3.5 text-sm last:border-0"><dt className="text-ink/50">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
    </motion.div>}</AnimatePresence>
  </section>;
}

function Specifications({ product }) {
  const cards = useMemo(() => specsFor(product), [product]);
  /* Two stacks on wide screens (their heights differ); one ordered stack on phones (`contents` + `order`) */
  const col = 'contents md:grid md:content-start md:gap-4';
  return <div className="grid items-start gap-4 md:grid-cols-2">
    <div className={col}><SpecCard {...cards[0]} order="order-1" /><SpecCard {...cards[2]} order="order-3" /></div>
    <div className={col}><SpecCard {...cards[1]} order="order-2" /><SpecCard {...cards[3]} order="order-4" /></div>
  </div>;
}

function SizeGuide({ guide }) {
  return <div className="max-w-3xl">
    <p className="text-sm leading-7 text-ink/65">{guide.intro}</p>
    <div className="mt-6 grid gap-6">
      {guide.tables.map(t => <div key={t.title}>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[.16em] text-ink/50">{t.title}</p>
        <div className="overflow-x-auto rounded-[6px] border border-ink/10 bg-white">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead><tr className="border-b border-ink/10 bg-mist/70">{t.columns.map(c => <th key={c} scope="col" className="px-4 py-3 text-xs font-bold text-ink/60">{c}</th>)}</tr></thead>
            <tbody>{t.rows.map((r, i) => <tr key={r[0]} className={`border-b border-ink/10 last:border-0 ${t.mine === i ? 'bg-accent/[.07]' : ''}`}>{r.map((c, j) => <td key={j} className={`px-4 py-3 ${j === 0 ? 'font-bold' : 'text-ink/70'}`}>{c}{j === 0 && t.mine === i && <span className="ml-2 rounded-[3px] bg-ink px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wider text-white">This ball</span>}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>)}
    </div>
    {guide.tips.length > 0 && <ul className="mt-6 grid gap-2.5 text-sm text-ink/65">{guide.tips.map(t => <li key={t} className="flex items-start gap-3"><Check size={16} className="mt-0.5 shrink-0 text-accent" />{t}</li>)}</ul>}
  </div>;
}

function Addons({ keys, onPick, picked }) {
  return <div>
    <p className="max-w-2xl text-sm leading-7 text-ink/65">Done at our Pallikaranai counter by people who play. Add one to this order and drop your gear in after you check out.</p>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {keys.map(k => { const sv = SERVICE_BY_KEY[k], on = picked[k];
        return <article key={k} className="flex flex-col rounded-[6px] border border-ink/10 bg-white p-5">
          <div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-[4px] bg-mist text-ink"><ServiceIcon id={k} size={19} /></span>
            <div className="min-w-0"><h3 className="text-base font-bold">{sv.title}</h3><p className="mt-1 text-sm leading-6 text-ink/55">{sv.blurb}</p></div></div>
          <p className="mt-4 text-sm text-ink/55"><b className="text-base text-ink">{sv.price}</b> {sv.unit}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <button type="button" onClick={() => onPick(k)} className={`inline-flex items-center gap-2 rounded-[2px] px-5 py-3 text-[11px] font-semibold uppercase tracking-[.14em] transition-colors ${on ? 'bg-ink/10 text-ink' : 'bg-ink text-white hover:bg-[#2B2B2B]'}`}>{on ? <><Check size={14} /> Added to this order</> : 'Add to this order'}</button>
            <Link to={`/services#${k}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/60 underline-offset-4 hover:text-accent hover:underline">Service details <ArrowRight size={13} /></Link>
          </div></article>; })}
    </div>
  </div>;
}

function Reviews({ rating, reviews }) {
  return <div className="grid items-start gap-6 md:grid-cols-[220px_1fr]">
    <div className="rounded-[6px] border border-ink/10 bg-white p-5 text-center">
      <div className="flex justify-center"><Stars rating={rating.rating} size={18} /></div>
      <p className="mt-2 text-xs text-ink/50">{rating.count} {rating.count === 1 ? 'rating' : 'ratings'}</p>
    </div>
    <div>{reviews}</div>
  </div>;
}

/* Specifications · Size guide · Add-ons · Reviews. Tabs only appear when the product has something to show (no size guide for a cork ball, no add-ons for a jersey).
   `tab` / `setTab` live on the product page so the "Size guide" link beside the options can open the right tab. */
export default function ProductDetails({ product, tab, setTab, serviceKeys, picked, onPickAddon, rating, reviews }) {
  const guide = useMemo(() => sizeGuideFor(product), [product]), base = useId(), refs = useRef({});
  const tabs = [['specs', 'Specifications'], ...(guide ? [['size', 'Size guide']] : []), ...(serviceKeys.length ? [['addons', 'Add-ons']] : []), ['reviews', 'Reviews']];
  const cur = tabs.some(t => t[0] === tab) ? tab : 'specs';
  const key = e => {
    const i = tabs.findIndex(t => t[0] === cur), n = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1;
    if (n < 0) return; e.preventDefault(); setTab(tabs[n][0]); refs.current[tabs[n][0]]?.focus();
  };
  return <section id="product-details" aria-label="Product details" className="mt-16 scroll-mt-44">
    <div role="tablist" aria-label="Product details" onKeyDown={key} className="no-scrollbar mb-6 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-ink/10 bg-white p-1.5">
      {tabs.map(([id, label]) => { const on = cur === id;
        return <button key={id} ref={el => { refs.current[id] = el; }} type="button" role="tab" id={`${base}-${id}`} aria-selected={on} aria-controls={`${base}-panel`} tabIndex={on ? 0 : -1} onClick={() => setTab(id)}
          className={`relative shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${on ? 'text-white' : 'text-ink/60 hover:text-ink'}`}>
          {on && <motion.span layoutId="pdp-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <span className="relative">{label}</span></button>; })}
    </div>
    <div role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-${cur}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={cur} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .22, ease }}>
          {cur === 'specs' && <Specifications product={product} />}
          {cur === 'size' && guide && <SizeGuide guide={guide} />}
          {cur === 'addons' && <Addons keys={serviceKeys} onPick={onPickAddon} picked={picked} />}
          {cur === 'reviews' && <Reviews rating={rating} reviews={reviews} />}
        </motion.div>
      </AnimatePresence>
    </div>
  </section>;
}
