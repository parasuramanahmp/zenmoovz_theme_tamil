import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { ServiceIcon, categoryPhoto } from '../art.jsx';
import { BEST_SELLERS, BRANDS, CATEGORIES, FEATURED_BRANDS, NEW_ARRIVALS, PRODUCTS, SPORT, SPORTS } from '../data/catalog.js';
import { SERVICE_BY_KEY, SERVICE_LIST } from '../data/services.js';
import ServiceMedia from './ServiceMedia.jsx';
import { hrefFor } from '../lib/shop.js';
import { Button, SectionHeading } from '../ui.jsx';
import { BrandCard } from './BrandCard.jsx';
import { ProductCard, ProductGrid, Rail } from './ProductCard.jsx';
import { toTop } from './Header.jsx';

const ease = [.22, 1, .36, 1];

/* Scrolling strip of every brand's logo. Each logo links to that brand's page.
   One set is wider than any screen, so two copies loop seamlessly (-50%); the second copy is hidden from assistive tech and
   the tab order. Speed scales with the number of brands. Pauses on hover or keyboard focus; reduced motion gets a scrollable row. */
export function Marquee() {
  return <nav aria-label="Our brands" className="logo-marquee mt-6 overflow-hidden border-y border-navy/10 py-6">
    <div className="marquee-track flex w-max items-center" style={{ animationDuration: `${BRANDS.length * 2.6}s` }}>
      {[0, 1].map(k => <ul key={k} aria-hidden={k > 0 || undefined} className={`logo-marquee-set flex shrink-0 items-center gap-12 pr-12 sm:gap-16 sm:pr-16 ${k > 0 ? 'logo-marquee-dup' : ''}`}>
        {BRANDS.map(b => <li key={b.id} className="shrink-0">
          <Link to={hrefFor({ brand: b.id })} onClick={toTop} tabIndex={k > 0 ? -1 : undefined} aria-label={`Shop ${b.id}`} className="grid h-14 w-32 place-items-center opacity-90 outline-none transition-[opacity,transform] duration-300 hover:-translate-y-0.5 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 focus-visible:ring-offset-mist sm:w-36">
            <img src={b.logo} alt="" decoding="async" draggable="false" className="max-h-[2.6rem] max-w-full object-contain" />
          </Link>
        </li>)}
      </ul>)}
    </div>
  </nav>;
}

export function BestSellers() {
  return <section className="section-wrap py-20">
    <SectionHeading title="Best sellers" description="The gear players keep coming back for." action={<Button variant="ghost" to={hrefFor({ view: 'best' })} onClick={toTop}>View all <ArrowRight size={16} /></Button>} />
    <Rail label="best sellers">{BEST_SELLERS.map((p, i) => <ProductCard key={p.id} product={p} index={i % 4} layout={false} compactOffer />)}</Rail>
  </section>;
}

export function Categories() {
  return <section id="categories" className="relative isolate scroll-mt-40 overflow-hidden bg-[#F2EEE8] py-16 sm:py-24">
    {/* Zenmoovz brand texture: soft warm gradients, the signature mark and a quiet wordmark. */}
    <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_8%_8%,rgba(180,83,42,.12),transparent_34%),radial-gradient(ellipse_at_88%_75%,rgba(19,43,59,.08),transparent_36%),linear-gradient(135deg,#F7F3ED_0%,#EEE7DE_100%)]" />
    <img src="/logo.png" alt="" aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 -z-10 w-[min(48vw,540px)] rotate-[13deg] opacity-[.045]" />
    <span aria-hidden="true" className="pointer-events-none absolute -bottom-8 -left-5 -z-10 select-none font-display text-[clamp(5rem,17vw,15rem)] font-black leading-none tracking-[-.07em] text-[#132B3B]/[.035]">ZENMOOVZ</span>

    <div className="section-wrap relative z-10">
      <div className="mb-9 flex flex-col justify-between gap-5 sm:mb-11 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.24em] text-[#B4532A]"><span className="h-px w-8 bg-[#B4532A]" />The Zenmoovz edit</p>
          <h2 className="max-w-2xl text-[clamp(2.5rem,5vw,4.3rem)] font-bold leading-[.9] text-[#132B3B]">Shop by category</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#132B3B]/65">Find your next essential, from match-day equipment to everyday training gear.</p>
        </div>
        <Link to={hrefFor({})} onClick={toTop} className="group inline-flex w-fit items-center gap-2 border-b border-[#132B3B]/30 pb-2 text-xs font-bold uppercase tracking-[.14em] text-[#132B3B] transition-colors hover:border-[#B4532A] hover:text-[#B4532A]">Explore all gear <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {CATEGORIES.map((c, i) => {
          const count = PRODUCTS.filter(p => p.cat === c.id).length;
          return <motion.div key={c.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: (i % 4) * .055, duration: .6, ease }}>
            <Link to={hrefFor({ cat: c.id })} onClick={toTop} aria-label={`Shop ${c.label}, ${count} products`} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-white/80 bg-[#E8DED2] shadow-[0_12px_32px_rgba(19,43,59,.07)] outline-none transition-[box-shadow,transform] duration-300 hover:shadow-[0_22px_48px_rgba(19,43,59,.16)] focus-visible:ring-2 focus-visible:ring-[#B4532A] focus-visible:ring-offset-4">
              <img src={categoryPhoto(c.id)} alt={`${c.label} sports equipment`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.055]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101F2A]/90 via-[#101F2A]/[.08] to-transparent" />
              <span className="absolute left-3 top-3 rounded-full border border-white/45 bg-white/70 px-2.5 py-1 text-[9px] font-bold tracking-[.16em] text-[#132B3B] sm:left-4 sm:top-4">{String(i + 1).padStart(2, '0')}</span>
              <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/55 bg-white/65 text-[#132B3B] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-[#B4532A] group-hover:text-white sm:right-4 sm:top-4"><ArrowUpRight size={16} /></span>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5 text-white sm:p-5">
                <div className="min-w-0"><h3 className="font-display text-xl font-bold leading-none sm:text-2xl">{c.label}</h3><p className="mt-2 text-[10px] font-semibold uppercase tracking-[.14em] text-white/70 sm:text-[11px]">{count} {count === 1 ? 'product' : 'products'}</p></div>
                <span className="mb-0.5 h-px w-7 shrink-0 bg-white/65 transition-all duration-300 group-hover:w-12" />
              </div>
            </Link>
          </motion.div>;
        })}
      </div>
    </div>
  </section>;
}
export function Brands() {
  return <section id="brands" className="relative isolate scroll-mt-40 overflow-hidden bg-[#E9E2D9] py-16 sm:py-20">
    <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_90%_10%,rgba(180,83,42,.13),transparent_32%),linear-gradient(135deg,#F1ECE5_0%,#E7DED4_100%)]" />
    <span aria-hidden="true" className="pointer-events-none absolute -right-6 top-0 -z-10 select-none font-display text-[clamp(5rem,15vw,13rem)] font-black leading-none tracking-[-.07em] text-[#132B3B]/[.045]">ZENMOOVZ</span>
    <div className="section-wrap relative z-10">
      <div className="mb-9 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.24em] text-[#B4532A]"><span className="h-px w-8 bg-[#B4532A]" />Picked for your play</p><h2 className="text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[.9] text-[#132B3B]">Shop by brand</h2><p className="mt-4 max-w-xl text-sm leading-6 text-[#132B3B]/65">Explore the labels behind the gear, each with a distinct feel and focus.</p></div>
        <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#132B3B]/45">{BRANDS.length} brands · one place to play</span>
      </div>
      {/* 8 featured brands: 2 columns on phones (4 rows), 4 on larger screens (2 rows) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {FEATURED_BRANDS.map((b, i) => <BrandCard key={b.id} brand={b} index={i} />)}
      </div>
      <div className="mt-9 flex justify-center">
        <Button to="/brands" onClick={toTop}>View all {BRANDS.length} brands <ArrowRight size={16} /></Button>
      </div>
    </div>
  </section>;
}
export function NewArrivals() {
  const sports = useMemo(() => ['all', ...SPORTS.slice(1).map(s => s.id).filter(id => NEW_ARRIVALS.some(p => p.sport === id))], []);
  const [sel, setSel] = useState('all');
  const list = NEW_ARRIVALS.filter(p => sel === 'all' || p.sport === sel).slice(0, 8);
  return <section className="section-wrap py-20">
    <SectionHeading title="New arrivals" description="Fresh on the rack this season." action={<Button variant="ghost" to={hrefFor({ view: 'new' })} onClick={toTop}>View all <ArrowRight size={16} /></Button>} />
    <div className="no-scrollbar mb-9 flex gap-7 overflow-x-auto border-b border-ink/10" role="tablist" aria-label="Filter new arrivals">
      {sports.map(id => <button key={id} role="tab" aria-selected={sel === id} onClick={() => setSel(id)} className={`relative shrink-0 pb-3 text-[12px] font-semibold uppercase tracking-[.14em] transition-colors ${sel === id ? 'text-ink' : 'text-ink/45 hover:text-ink'}`}>
        {id === 'all' ? 'All sports' : SPORT[id].name}
        {sel === id && <motion.span layoutId="new-underline" className="absolute inset-x-0 -bottom-px h-[2px] bg-ink" transition={{ duration: .3, ease }} />}</button>)}
    </div>
    <ProductGrid products={list} />
  </section>;
}

/* In-store services: knocking-in, engraving and stringing, done at the Pallikaranai counter. Each card opens its calculator on /services.
   On the All view it shows all three; on bat / racket views (`keys`, `inline`) only the services that belong to that gear. */
export function InStoreServices({ keys, inline = false }) {
  const list = keys ? keys.map(k => SERVICE_BY_KEY[k]).filter(Boolean) : SERVICE_LIST;
  return <section aria-label="In-store services" className={inline ? 'mt-16' : 'section-wrap py-16 sm:py-20'}>
    <SectionHeading title="In-store services" description="Done at our Pallikaranai counter by people who play. Add to your cart and drop your gear in." action={<Button variant="ghost" to="/services">See all services <ArrowRight size={16} /></Button>} />
    <div className={`grid gap-4 sm:grid-cols-2 ${list.length > 2 ? 'lg:grid-cols-3' : ''} lg:gap-5`}>
      {list.map((sv, i) => <motion.div key={sv.key} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: i * .07, duration: .6, ease }}>
        <Link to={`/services#${sv.key}`} aria-label={`${sv.title}, ${sv.price} ${sv.unit}`} className="group flex h-full flex-col rounded-[6px] border border-ink/10 bg-white p-6 outline-none transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4">
          <ServiceMedia id={sv.key} className="aspect-[5/3] rounded-[4px]" />
          <h3 className="mt-5 text-xl font-bold">{sv.title}</h3>
          <p className="mt-2 text-sm leading-6 text-ink/55">{sv.blurb}</p>
          <p className="mt-auto pt-5 text-sm text-ink/55"><b className="text-base text-ink">{sv.price}</b> {sv.unit}</p>
        </Link>
      </motion.div>)}
    </div>
  </section>;
}

/* The trust strip under the services */
const PROMISES = [
  [Truck, 'Fast delivery', 'Check delivery dates with your pincode'],
  [ShieldCheck, 'Quality picks', 'Gear selected for how you play'],
  [RotateCcw, '7-day returns', 'Easy returns on unused gear'],
  [ShieldCheck, 'Genuine products', 'Authentic gear from the brands we stock'],
];
export function ValueProps() {
  return <section className="section-wrap pb-20 pt-2" aria-label="Why shop with us"><div className="grid gap-6 rounded-[6px] border border-navy/10 bg-white p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-4 lg:gap-5">
    {PROMISES.map(([Icon, t, s]) => <div key={t} className="flex items-center gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ink/15 text-ink"><Icon size={20} strokeWidth={1.6} /></span><div><p className="text-sm font-bold">{t}</p><p className="mt-1 text-xs text-ink/50">{s}</p></div></div>)}
  </div></section>;
}
