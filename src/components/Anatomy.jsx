import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { ArrowUpRight, Camera } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { SportIcon, photoOf } from '../art.jsx';
import { stockFor } from '../data/stock.js';
import { BY_ID } from '../data/catalog.js';
import { SHOWCASE, anatomyFor } from '../data/anatomy.js';
import { SectionHeading } from '../ui.jsx';
import { Words } from '../motion.jsx';
import { toTop } from './Header.jsx';

const ease = [.22, 1, .36, 1];
const TOUR_MS = 5200;   /* how long the auto-tour stays on one part */
const SCAN_S = 1.5;     /* length of the one-time scan sweep */

/*
  Feature viewer.
  - Entrance: a copper scan line sweeps along the product once; each dot appears as the line passes it.
  - Spotlight: everything except the active part is dimmed; the light glides from part to part.
  - Reticle: corner brackets lock onto the active dot.
  - Part list: accordion beside the photo. A thin copper line under the open part is the auto-tour timer
    (it pauses on hover and stops for good once the visitor picks a part).
*/
export function Anatomy({ product, embedded = false }) {
  const data = anatomyFor(product);
  const [params] = useSearchParams(), calibrate = params.get('calibrate') === '1';
  const [active, setActive] = useState(0), [touched, setTouched] = useState(false), [hover, setHover] = useState(false);
  const [src, setSrc] = useState(0), [ratio, setRatio] = useState(1.6), [ready, setReady] = useState(false), [scanning, setScanning] = useState(true);
  const [pos, setPos] = useState(() => data ? data.hotspots.map(h => [h.x, h.y]) : []);
  const ref = useRef(null), seen = useInView(ref, { once: true, amount: .35 }), inView = useInView(ref, { amount: .35 });
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const n = data?.hotspots.length || 0, go = seen && ready;
  const tourOn = !!data && !touched && !reduced && !calibrate && go && !scanning, paused = hover || !inView;

  /* spotlight position (springs toward the active dot) */
  const sx = useMotionValue(data?.hotspots[0].x ?? 50), sy = useMotionValue(data?.hotspots[0].y ?? 50);
  const px = useSpring(sx, { stiffness: 85, damping: 20 }), py = useSpring(sy, { stiffness: 85, damping: 20 });
  const rx = 24, ry = 24 * ratio; /* a circle whose radius is 24% of the stage width */
  const shade = useMotionTemplate`radial-gradient(ellipse ${rx}% ${ry}% at ${px}% ${py}%, rgba(17,17,18,0) 0%, rgba(17,17,18,0) 34%, rgba(17,17,18,.7) 100%)`;
  const glow = useMotionTemplate`radial-gradient(ellipse ${rx * .7}% ${ry * .7}% at ${px}% ${py}%, rgba(233,185,155,.26), rgba(233,185,155,0) 100%)`;

  useEffect(() => { setActive(0); setTouched(false); setSrc(0); setRatio(1.6); setReady(false); setScanning(true); if (data) setPos(data.hotspots.map(h => [h.x, h.y])); }, [product.id]);
  useEffect(() => {
    const p = pos[active]; if (!p) return;
    sx.set(p[0]); sy.set(p[1]);
    if (reduced) { px.jump ? px.jump(p[0]) : px.set(p[0]); py.jump ? py.jump(p[1]) : py.set(p[1]); }   /* older framer-motion has no .jump */
  }, [active, pos, reduced]);

  const sources = [`/products/${product.id}-anatomy.jpg`, photoOf(product), stockFor(product)].filter(Boolean);
  /* no photo at all: nothing to wait for, show the placeholder state straight away */
  useEffect(() => { if (src >= sources.length) setReady(true); }, [src, sources.length]);
  /* reduced motion: skip the sweep */
  useEffect(() => { if (go && reduced) setScanning(false); }, [go, reduced]);

  if (!data) return null;
  const h = data.hotspots[active];
  const landscape = ratio >= 1, axis = i => { const p = pos[i] || [0, 0]; return landscape ? p[0] : p[1]; };
  const pick = i => { setActive(i); setTouched(true); };
  const advance = () => setActive(a => (a + 1) % n);
  const onKeys = e => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault(); const next = (active + (e.key === 'ArrowDown' ? 1 : n - 1)) % n; pick(next);
    e.currentTarget.querySelectorAll('button[data-part]')[next]?.focus();
  };
  const onStageClick = e => {
    if (!calibrate) return;
    const r = e.currentTarget.getBoundingClientRect(), x = Math.round((e.clientX - r.left) / r.width * 1000) / 10, y = Math.round((e.clientY - r.top) / r.height * 1000) / 10;
    setPos(p => p.map((v, i) => i === active ? [x, y] : v)); setActive(a => (a + 1) % n);
  };
  const json = JSON.stringify({ [product.id]: Object.fromEntries(data.hotspots.map((d, i) => [d.id, pos[i]])) });

  return <section ref={ref} aria-label={`${product.name} features`} className={`${embedded ? '' : 'mt-16 '}overflow-hidden rounded-[4px] bg-[#111112] p-5 text-white sm:p-10 lg:p-12`}>
    {/* title left, the three key facts right */}
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <h3 className="font-display text-[clamp(2rem,4.4vw,3.6rem)] font-bold leading-none tracking-[.04em]">{product.name}</h3>
      <dl className="grid shrink-0 grid-cols-3 divide-x divide-white/15 border-y border-white/15">
        {data.facts.map(([k, v]) => <div key={k} className="px-4 py-3 first:pl-0 last:pr-0 sm:px-6"><dt className="text-[11px] text-white/45">{k}</dt><dd className="mt-0.5 text-[13px] font-medium sm:text-sm">{v}</dd></div>)}
      </dl>
    </div>

    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="mt-8 grid items-center gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-14">
      {/* stage */}
      <div className="grid place-items-center bg-[#0C0C0D] p-3 ring-1 ring-white/10 sm:p-6">
        <div onClick={onStageClick} style={{ ...(calibrate ? { cursor: 'crosshair' } : {}), aspectRatio: ratio, width: `min(100%, calc(70vh * ${ratio}), 960px)` }} className="relative select-none overflow-hidden">
          {src < sources.length
            ? <div className={`absolute inset-0 ${src >= 1 ? 'bg-white' : ''}`}><img key={src} src={sources[src]} alt={`${product.name}, features`} draggable="false" referrerPolicy="no-referrer" onLoad={e => { const { naturalWidth: w, naturalHeight: hh } = e.currentTarget; if (w && hh) setRatio(w / hh); setReady(true); }} onError={() => setSrc(s => s + 1)} className="h-full w-full object-contain" /></div>
            : <div className="absolute inset-0 grid place-items-center border border-dashed border-white/15 text-white/35"><div className="flex flex-col items-center gap-2"><Camera size={22} strokeWidth={1.5} /><span className="text-[11px] font-semibold uppercase tracking-[.16em]">Photo coming soon</span></div></div>}

          {/* spotlight: dims everything but the active part */}
          <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-[1]" style={{ background: shade }} initial={{ opacity: 0 }} animate={{ opacity: go ? 1 : 0 }} transition={{ duration: reduced ? 0 : .8, delay: reduced ? 0 : SCAN_S * .85 }} />
          <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-[2] mix-blend-screen" style={{ background: glow }} initial={{ opacity: 0 }} animate={{ opacity: go ? 1 : 0 }} transition={{ duration: reduced ? 0 : .8, delay: reduced ? 0 : SCAN_S * .85 }} />

          {/* one-time scan sweep along the product's long side */}
          {go && scanning && !reduced && <motion.span aria-hidden key={`scan-${product.id}`} onAnimationComplete={() => setScanning(false)}
            className={`pointer-events-none absolute z-[5] bg-glow shadow-[0_0_26px_6px_rgba(233,185,155,.55)] ${landscape ? 'inset-y-0 w-px' : 'inset-x-0 h-px'}`}
            initial={landscape ? { left: '0%', opacity: 1 } : { top: '0%', opacity: 1 }}
            animate={landscape ? { left: '100%', opacity: [1, 1, 0] } : { top: '100%', opacity: [1, 1, 0] }}
            transition={{ duration: SCAN_S, ease: 'easeInOut', opacity: { times: [0, .85, 1], duration: SCAN_S } }} />}

          {data.hotspots.map((d, i) => { const [x, y] = pos[i] || [d.x, d.y], on = i === active, below = y < 24, align = x > 76 ? 'right-0' : x < 24 ? 'left-0' : 'left-1/2 -translate-x-1/2';
            return <button key={d.id} type="button" onClick={e => { e.stopPropagation(); pick(i); }} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} aria-pressed={on} aria-label={d.title}
              style={{ left: `${x}%`, top: `${y}%` }} className={`group absolute z-10 h-11 w-11 -translate-x-1/2 -translate-y-1/2 outline-none ${go ? '' : 'pointer-events-none'}`}>
              <motion.span className="absolute inset-0 grid place-items-center" initial={{ opacity: 0, scale: .2 }} animate={go ? { opacity: 1, scale: 1 } : { opacity: 0, scale: .2 }}
                transition={{ duration: reduced ? 0 : .5, ease, delay: reduced ? 0 : (axis(i) / 100) * SCAN_S }}>
                {!on && <span aria-hidden className="hs-ring absolute inset-1.5 rounded-full border border-white/70" />}
                <span aria-hidden className={`relative h-3 w-3 rounded-full border-2 shadow-[0_0_0_2px_rgba(17,17,18,.85)] transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[#111112] ${on ? 'scale-[1.25] border-white bg-accent' : 'border-transparent bg-white group-hover:scale-125'}`} />
              </motion.span>
              <AnimatePresence>{on && go && <>
                <motion.svg key="reticle" aria-hidden viewBox="0 0 44 44" className="pointer-events-none absolute inset-0 h-full w-full text-glow" initial={{ scale: 1.8, opacity: 0, rotate: -18 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: .9, opacity: 0 }} transition={{ duration: .45, ease }}>
                  <path d="M3 13V3h10M31 3h10v10M41 31v10H31M13 41H3V31" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
                </motion.svg>
                <motion.span key="tick" aria-hidden initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }} className={`pointer-events-none absolute left-1/2 hidden h-[15px] w-px -translate-x-1/2 bg-white sm:block ${below ? 'top-[calc(100%-2px)] origin-top' : 'bottom-[calc(100%-2px)] origin-bottom'}`} />
                <motion.span key="label" initial={{ opacity: 0, y: below ? -6 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .25, ease }}
                  className={`pointer-events-none absolute hidden whitespace-nowrap bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[.14em] text-ink sm:block ${align} ${below ? 'top-[calc(100%+11px)]' : 'bottom-[calc(100%+11px)]'}`}>{d.title}</motion.span></>}</AnimatePresence>
            </button>; })}
        </div>
      </div>

      {/* parts: the open one shows its story, the line under it is the tour timer */}
      <ul onKeyDown={onKeys} aria-label="Parts" className="divide-y divide-white/10 border-y border-white/10">
        {data.hotspots.map((d, i) => { const on = i === active;
          return <li key={d.id} className="relative">
            <button type="button" data-part onClick={() => pick(i)} aria-expanded={on} aria-controls={`gear-${product.id}-${d.id}`} className="group flex w-full items-center gap-4 py-4 text-left outline-none focus-visible:bg-white/5">
              {/* where this part sits along the product, handle to tip */}
              <span aria-hidden title="Position along the product" className="relative h-px w-9 shrink-0 bg-white/25"><span style={{ left: `${Math.min(96, Math.max(4, axis(i)))}%` }} className={`absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-300 ${on ? 'bg-accent' : 'bg-white/45 group-hover:bg-white'}`} /></span>
              <span className={`text-base font-medium transition-colors duration-300 ${on ? 'text-white' : 'text-white/55 group-hover:text-white'}`}>{d.title}</span>
            </button>
            <AnimatePresence initial={false}>{on && <motion.div key="body" id={`gear-${product.id}-${d.id}`} role="region" aria-label={d.title} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : .4, ease }} className="overflow-hidden">
              <div className="pb-7 pl-[52px]">
                <h4 className="font-display text-[clamp(2rem,3.2vw,2.9rem)] font-bold leading-[.95]"><Words text={h.headline} /></h4>
                <p className="mt-3 max-w-md text-[15px] leading-7 text-white/65">{h.text}</p>
              </div>
            </motion.div>}</AnimatePresence>
            {on && <span key={`${product.id}-${i}`} aria-hidden onAnimationEnd={tourOn ? advance : undefined} className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-accent"
              style={tourOn ? { animation: `gearTour ${TOUR_MS}ms linear forwards`, animationPlayState: paused ? 'paused' : 'running' } : undefined} />}
          </li>; })}
      </ul>
    </div>

    {calibrate && <div className="mx-auto mt-6 max-w-3xl border border-white/20 bg-black/40 p-4 text-xs text-white/80">
      <p className="font-semibold uppercase tracking-[.14em] text-white">Calibration mode</p>
      <p className="mt-1">Click on the photo to place dot {active + 1} ({h.title}); it then moves to the next dot. Paste the JSON below into <code>HOTSPOT_OVERRIDES</code> in <code>src/data/anatomy.js</code> (merge it into the object).</p>
      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all bg-black/50 p-3 text-[11px] text-white">{json}</pre>
    </div>}
  </section>;
}


/* HOME PAGE feature viewer: one viewer, switch between cricket and badminton. (Not shown on individual product pages.) */
export default function FeatureShowcase() {
  const [sport, setSport] = useState(SHOWCASE[0].sport), item = SHOWCASE.find(x => x.sport === sport), product = BY_ID[item.id];
  return <section id="features" className="section-wrap scroll-mt-40 py-20">
    <SectionHeading title="Know your gear" description="Tap the dots to see what every part of the bat and racket does."
      action={<div role="tablist" aria-label="Choose a sport" className="flex gap-2">
        {SHOWCASE.map(x => { const on = x.sport === sport;
          return <button key={x.sport} role="tab" aria-selected={on} onClick={() => setSport(x.sport)} className={`relative flex items-center gap-2 rounded-full border px-5 py-3 text-[12px] font-semibold uppercase tracking-[.14em] transition-colors ${on ? 'border-ink text-white' : 'border-ink/20 text-ink/60 hover:border-ink hover:text-ink'}`}>
            {on && <motion.span layoutId="feat-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: .3, ease }} />}
            <span className="relative flex items-center gap-2"><SportIcon id={x.sport} size={17} />{x.label}</span></button>; })}
      </div>} />
    {/* plain keyed div + CSS fade (index.css .feat-fade): the viewer can never get stuck invisible the way an opacity-0 AnimatePresence wrapper can */}
    <div key={sport} className="feat-fade">
      <Anatomy product={product} embedded />
    </div>
    <div className="mt-6 flex justify-center"><Link to={`/product/${product.id}`} onClick={toTop} className="btn-nudge inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[.14em] underline decoration-ink/25 underline-offset-[7px] transition hover:decoration-ink">Shop {product.name} <ArrowUpRight size={16} /></Link></div>
  </section>;
}
