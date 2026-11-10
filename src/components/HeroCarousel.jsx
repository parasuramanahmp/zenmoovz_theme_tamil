import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, RotateCcw, Truck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroMedia, { pickMedia } from './HeroMedia.jsx';
import { PRODUCTS, SPORT } from '../data/catalog.js';
import { hrefFor } from '../lib/shop.js';
import { Words } from '../motion.jsx';
import { FREE_SHIP, money, pct } from '../store.jsx';
import { Button } from '../ui.jsx';
import { toTop } from './Header.jsx';

const DURATION = 7;
const ease = [.22, 1, .36, 1];

/* One slide per sport. The background photo is /public/hero/<sport>.jpg (landscape, about 1920×900).
   Until a photo is added the slide shows the sport's colours, so the hero never looks broken. */
const SLIDES = [
  { sport: 'cricket', eyebrow: 'New season', title: 'Own the crease.', sub: 'English willow bats, match balls and protection for the new season.', cta: 'Shop cricket' },
  { sport: 'badminton', eyebrow: 'Fresh arrivals', title: 'Faster hands. Lighter rackets.', sub: 'Carbon frames and feather shuttles built for the quickest rallies.', cta: 'Shop badminton' },
  { sport: 'football', eyebrow: 'Match day', title: 'Ninety minutes. All in.', sub: 'Match balls, turf studs and keeper gloves for every kind of pitch.', cta: 'Shop football' },
  { sport: 'basketball', eyebrow: 'Court ready', title: 'Make the next shot count.', sub: 'Grippy indoor and outdoor balls, high-tops and game jerseys.', cta: 'Shop basketball' },
  { sport: 'swimming', eyebrow: 'Early lane', title: 'Lane by lane.', sub: 'Anti-fog goggles, silicone caps and racing jammers for the early swim.', cta: 'Shop swimming' },
];

const PERKS = [[Truck, `Free delivery above ${money(FREE_SHIP)}`], [Zap, 'Extra 5% off on UPI'], [RotateCcw, '7-day easy returns']];

export default function HeroCarousel() {
  const [i, setI] = useState(0), [paused, setPaused] = useState(false), ref = useRef(null), inView = useInView(ref, { amount: .35 });
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const go = d => setI(v => (v + d + SLIDES.length) % SLIDES.length);
  const s = SLIDES[i], sp = SPORT[s.sport], [c1, c2] = sp.hue;
  /* right-hand images: this sport's products, one of each category first */
  const media = useMemo(() => Object.fromEntries(SLIDES.map(sl => [sl.sport, pickMedia(PRODUCTS.filter(p => p.sport === sl.sport))])), []);

  return <section ref={ref} aria-roledescription="carousel" aria-label="Featured sports" className="section-wrap pt-4 sm:pt-6"
    onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
    <motion.div className="relative isolate min-h-[580px] overflow-hidden rounded-[6px] bg-ink text-white sm:rounded-[6px] md:min-h-[620px]" style={{ touchAction: 'pan-y' }}
      onPanEnd={(e, info) => { if (Math.abs(info.offset.x) > 70 && Math.abs(info.offset.x) > Math.abs(info.offset.y)) go(info.offset.x < 0 ? 1 : -1); }}>

      {/* background: sport colours with a soft light from the right, behind the image columns */}
      <AnimatePresence initial={false}>
        <motion.div key={s.sport} className="absolute inset-0 -z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .9, ease: 'easeInOut' }}>
          <div className="absolute inset-0" style={{ background: `linear-gradient(125deg, ${c1} 0%, ${c2} 120%)` }} />
          <div className="absolute -right-24 top-1/2 h-[120%] w-[55%] -translate-y-1/2 rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,.07), transparent)' }} />
          <div className="noise absolute inset-0 opacity-20 mix-blend-overlay" />
        </motion.div>
      </AnimatePresence>

      <div className="grid min-h-[580px] items-center gap-6 px-6 pb-28 pt-12 sm:px-10 md:min-h-[620px] md:grid-cols-[1.05fr_.95fr] md:px-14 md:pb-28">
        <div key={s.sport} className="relative z-10 max-w-2xl">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }} className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.22em] text-white/80"><span className="h-px w-10 bg-white/60" />{sp.name} · {s.eyebrow}</motion.p>
          <h1 className="mt-6 text-[clamp(3.6rem,9vw,8rem)] leading-[.88]"><Words text={s.title} delay={.1} /></h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .5, duration: .6 }} className="mt-6 max-w-md text-[15px] leading-7 text-white/75">{s.sub}</motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .65, duration: .6 }} className="mt-8 flex flex-wrap items-center gap-3">
            <Button variant="light" to={hrefFor({ sport: s.sport })} onClick={toTop}>{s.cta} <ArrowRight size={16} /></Button>
            <Link to={hrefFor({ view: 'best' })} onClick={toTop} className="rounded-[3px] px-4 py-3 text-sm font-bold text-white/90 underline decoration-white/30 underline-offset-8 transition hover:decoration-white">Best sellers</Link>
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .9 }} className="mt-9 hidden flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-white/70 sm:flex">
            {PERKS.map(([Icon, t]) => <li key={t} className="flex items-center gap-2"><Icon size={15} strokeWidth={1.6} className="text-white/80" />{t}</li>)}</motion.ul>
        </div>

        {/* right side: this sport's product images, scrolling */}
        <div key={`m-${s.sport}`} className="relative md:h-[460px]"><HeroMedia products={media[s.sport]} sport={s.sport} className="h-full" /></div>
      </div>

      <p className="absolute right-6 top-6 text-xs font-bold tabular-nums tracking-widest text-white/60 sm:right-10 md:right-14" aria-hidden="true"><span className="text-white">{String(i + 1).padStart(2, '0')}</span> / {String(SLIDES.length).padStart(2, '0')}</p>

      {/* controls: each sport is a tab whose bar fills while its slide is showing */}
      <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 px-6 pb-6 sm:px-10 md:px-14">
        <div className="flex flex-1 gap-2 sm:gap-3" role="tablist" aria-label="Choose slide">
          {SLIDES.map((sl, k) => <button key={sl.sport} role="tab" aria-selected={k === i} aria-label={SPORT[sl.sport].name} onClick={() => setI(k)} className="group min-w-0 flex-1 text-left">
            <span className={`mb-2 hidden truncate text-[11px] font-semibold uppercase tracking-[.14em] transition-colors sm:block ${k === i ? 'text-white' : 'text-white/45 group-hover:text-white/80'}`}>{SPORT[sl.sport].name}</span>
            <span className="relative block h-[3px] overflow-hidden rounded-full bg-white/25">
              {k === i && <span key={`${i}-${reduced}`} className="absolute inset-0 block origin-left rounded-full bg-white" onAnimationEnd={() => !reduced && go(1)}
                style={reduced ? undefined : { animation: `heroFill ${DURATION}s linear forwards`, animationPlayState: paused || !inView ? 'paused' : 'running' }} />}
              {k === i && reduced && <span className="absolute inset-0 block rounded-full bg-white" />}
              {k < i && <span className="absolute inset-0 block rounded-full bg-white/70" />}
            </span>
          </button>)}
        </div>
        <div className="hidden gap-2 sm:flex">{[[-1, ChevronLeft, 'Previous slide'], [1, ChevronRight, 'Next slide']].map(([d, Icon, l]) => <motion.button key={l} onClick={() => go(d)} aria-label={l} whileTap={{ scale: .94 }} className="grid h-11 w-11 place-items-center rounded-full border border-white/40 transition-colors hover:bg-white hover:text-ink"><Icon size={20} /></motion.button>)}</div>
      </div>
    </motion.div>
  </section>;
}
