import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { BRANDS, CAT, PRODUCTS, SPORT } from '../data/catalog.js';
import { filterProducts, hrefFor } from '../lib/shop.js';
import { servicesForView } from '../data/services.js';
import { Words } from '../motion.jsx';
import { money } from '../store.jsx';
import { Button, EmptyState } from '../ui.jsx';
import { ProductGrid } from '../components/ProductCard.jsx';
import { InStoreServices } from '../components/HomeSections.jsx';
import ChampionsChoice from '../components/ChampionsChoice.jsx';
import { toTop } from '../components/Header.jsx';
import HeroMedia, { pickMedia } from '../components/HeroMedia.jsx';

const ease = [.22, 1, .36, 1];
const Chip = ({ on, onClick, children, layoutId }) => <button
  type="button"
  onClick={onClick}
  aria-pressed={on}
  className={`relative inline-flex h-12 shrink-0 items-center justify-center whitespace-nowrap border px-4 text-sm font-semibold leading-none transition-[border-color,color,background-color,border-radius] duration-200 focus-visible:outline-none sm:px-5 sm:text-base lg:text-lg ${on
    ? 'rounded-full border-navy text-white'
    : 'rounded-[3px] border-navy/15 bg-white text-ink/65 hover:border-navy/40 hover:bg-mist hover:text-navy'
  }`}
>
  {on && <motion.span
    layoutId={layoutId}
    className="absolute inset-0 rounded-full bg-navy"
    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
  />}
  <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
</button>;

/* One view for every way of browsing: a sport, a category, a brand, a search, best sellers or new arrivals */
export default function Collection() {
  const [params] = useSearchParams(), navigate = useNavigate();
  const sport = params.get('sport') || 'all', cat = params.get('cat') || '', brand = params.get('brand') || '', q = params.get('q') || '', view = params.get('view') || '';
  const [sort, setSort] = useState('featured'), [max, setMax] = useState(null), [bsel, setBsel] = useState('');
  const base = useMemo(() => filterProducts({ sport, cat, brand, q, view }), [sport, cat, brand, q, view]);
  useEffect(() => { setMax(null); setBsel(''); }, [sport, cat, brand, q, view]);
  const bounds = useMemo(() => base.length ? [Math.floor(Math.min(...base.map(p => p.price)) / 100) * 100, Math.ceil(Math.max(...base.map(p => p.price)) / 100) * 100] : [0, 0], [base]);
  const list = useMemo(() => filterProducts({ sport, cat, brand: brand || bsel, q, view, max, sort }), [sport, cat, brand, bsel, q, view, max, sort]);
  const catsHere = useMemo(() => { const m = {}; filterProducts({ sport, brand, q, view }).forEach(p => { m[p.cat] = (m[p.cat] || 0) + 1; }); return Object.entries(m); }, [sport, brand, q, view]);
  const brandsHere = useMemo(() => [...new Set(base.map(p => p.brand))], [base]);

  const svcKeys = servicesForView({ sport, cat });
  const sp = SPORT[sport] || SPORT.all, [c1, c2] = sp.hue || ['#111111', '#B4532A'];
  const title = q ? `Results for “${q}”` : brand ? brand : view === 'best' ? 'Best sellers' : view === 'new' ? 'New arrivals' : cat ? CAT[cat]?.label : sp.name;
  const sub = q ? `${base.length} ${base.length === 1 ? 'product matches' : 'products match'} your search.` : brand ? BRANDS.find(b => b.id === brand)?.line : cat && sport !== 'all' ? `${CAT[cat]?.label} for ${sp.name.toLowerCase()}.` : sport !== 'all' ? sp.line : view === 'best' ? 'The gear players keep coming back for.' : view === 'new' ? 'Fresh on the rack this season.' : 'Everything for your game.';
  const media = useMemo(() => pickMedia(base), [base]), from = base.length ? Math.min(...base.map(p => p.price)) : 0, filtered = (max !== null && max < bounds[1]) || bsel;
  const crumbs = [['Home', '/'], ...(sport !== 'all' ? [[sp.name, hrefFor({ sport })]] : []), ...(cat ? [[CAT[cat]?.label, '']] : []), ...(brand ? [[brand, '']] : [])];

  return <main className="section-wrap pb-16 pt-4 sm:pt-6">
    <motion.div key={`${sport}${cat}${brand}${q}${view}`} initial={{ clipPath: 'inset(0 0 100% 0 round 6px)' }} animate={{ clipPath: 'inset(0 0 0% 0 round 6px)' }} transition={{ duration: .8, ease }}
      className="relative isolate overflow-hidden rounded-[6px] px-6 pb-8 pt-8 text-white sm:px-10 sm:pb-10 sm:pt-10" style={{ background: `linear-gradient(125deg, ${c1}, ${c2})` }}>
      <div className="noise absolute inset-0 -z-10 opacity-20 mix-blend-overlay" />
      <div className="absolute -right-24 top-1/2 -z-10 h-[130%] w-[50%] -translate-y-1/2 rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,.07), transparent)' }} aria-hidden />
      {/* left: content · right: images of this category, scrolling */}
      <div className="grid items-center gap-8 md:min-h-[400px] md:grid-cols-[1.05fr_.95fr]">
        <div className="min-w-0 max-w-xl">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-xs font-semibold text-white/65">{crumbs.map(([n, to], i) => <React.Fragment key={n}>{i > 0 && <ChevronRight size={13} />}{to && i < crumbs.length - 1 ? <Link to={to} className="hover:text-white">{n}</Link> : <span className="text-white">{n}</span>}</React.Fragment>)}</nav>
          <h1 className="text-[clamp(2.8rem,7vw,5.6rem)] font-bold leading-[.9]"><Words text={title} /></h1>
          <p className="mt-4 max-w-md text-[15px] leading-7 text-white/75">{sub}</p>
          <motion.ul initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .5 }} className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-xs font-semibold uppercase tracking-[.14em] text-white/70">
            <li><b className="mr-1.5 text-base text-white">{base.length}</b>{base.length === 1 ? 'product' : 'products'}</li>{base.length > 0 && <li>From <b className="ml-1 text-base text-white">{money(from)}</b></li>}</motion.ul>
          {base.length > 0 && <div className="mt-8"><Button variant="light" onClick={() => { const el = document.getElementById('products'); window.__lenis ? window.__lenis.scrollTo(el, { offset: -150 }) : el?.scrollIntoView({ behavior: 'smooth' }); }}>Shop the range</Button></div>}
        </div>
        <div key={`m-${sport}${cat}${brand}${q}${view}`} className="relative md:h-[400px]"><HeroMedia products={media} sport={sport} className="h-full" /></div>
      </div>
    </motion.div>

    {/* cricket and badminton: the players behind the brands, right under the hero banner (data/champions.js); not on a search or a best-sellers / new-arrivals list */}
    {!q && !view && <ChampionsChoice sport={sport} />}

    {/* filters */}
    <div className="mt-6 grid gap-4">
      {catsHere.length > 1 && <div className="no-scrollbar flex min-w-0 items-center gap-2 overflow-x-auto overscroll-x-contain px-1 py-1" role="group" aria-label="Filter by category">
        <Chip layoutId="cat-chip" on={!cat} onClick={() => navigate(hrefFor({ sport, brand, q, view }))}>All</Chip>
        {catsHere.map(([c, n]) => <Chip key={c} layoutId="cat-chip" on={cat === c} onClick={() => navigate(hrefFor({ sport, cat: c, brand, q, view }))}>{CAT[c]?.label || c} <span className="text-[.85em] font-semibold opacity-60">{n}</span></Chip>)}
      </div>}
      <div className="flex flex-col gap-3 rounded-3xl border border-navy/10 bg-white p-3 sm:flex-row sm:items-center sm:p-4">
        {!brand && brandsHere.length > 1 && <label className="flex items-center gap-2 text-xs font-semibold text-ink/55">Brand
          <select value={bsel} onChange={e => setBsel(e.target.value)} className="rounded-[3px] border border-navy/15 bg-white px-3 py-2 text-sm font-medium text-ink outline-none focus:border-navy"><option value="">All brands</option>{brandsHere.map(b => <option key={b}>{b}</option>)}</select></label>}
        {bounds[1] > bounds[0] && <label className="flex flex-1 items-center gap-3 text-xs font-semibold text-ink/55">Up to <input type="range" min={bounds[0]} max={bounds[1]} step="100" value={max ?? bounds[1]} onChange={e => setMax(Number(e.target.value))} aria-label="Maximum price" className="h-1.5 min-w-24 flex-1 cursor-pointer accent-[#111111]" /><span className="w-16 text-right text-sm font-bold text-ink">{money(max ?? bounds[1])}</span></label>}
        <label className="flex items-center gap-2 text-xs font-semibold text-ink/55 sm:ml-auto">Sort
          <select value={sort} onChange={e => setSort(e.target.value)} className="rounded-[3px] border border-navy/15 bg-white px-3 py-2 text-sm font-medium text-ink outline-none focus:border-navy"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="rating">Top rated</option><option value="discount">Biggest discount</option></select></label>
      </div>
      <div className="flex items-center justify-between text-sm text-ink/55" aria-live="polite"><span><b className="text-ink">{list.length}</b> {list.length === 1 ? 'product' : 'products'}</span>
        <AnimatePresence>{filtered && <motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} onClick={() => { setMax(null); setBsel(''); }} className="flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"><RotateCcw size={13} />Reset filters</motion.button>}</AnimatePresence></div>
    </div>

    <div id="products" className="mt-6 scroll-mt-40">{list.length ? <ProductGrid products={list} /> : <EmptyState title="No gear found" body={q ? 'Try “bat”, “racket”, “goggles” or a sport name.' : 'Try widening the price or brand filter.'} action={<Button onClick={() => { setMax(null); setBsel(''); if (q) navigate('/'); }}>{q ? 'Back to the store' : 'Reset filters'}</Button>} />}</div>
    {/* bats and cricket → knocking-in + engraving; rackets and badminton → stringing */}
    {!q && svcKeys.length > 0 && <InStoreServices keys={svcKeys} inline />}
  </main>;
}
