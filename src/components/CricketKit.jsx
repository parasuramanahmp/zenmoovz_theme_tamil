import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Feather, Footprints, Gauge, Hand, Layers, Package, RotateCcw, ShieldCheck, ShoppingBag, Target, Wind, Zap } from 'lucide-react';
import { ProductArt } from '../art.jsx';
import { BY_ID, KIT_PRODUCT, sizesFor } from '../data/catalog.js';
import { KIT } from '../data/cricketKit.js';
import { HeartButton, Stars, Words } from '../motion.jsx';
import { money, pct, useStore } from '../store.jsx';

/* ───────────────────────── The bag ─────────────────────────
   A 640 x 420 drawing in two stacked layers so the products can rise out of it:
     back layer  → floor shadow, inside of the bag, the back flap
     (products)  → rail of cards, clipped at the bag's front rim (y = 156)
     front layer → front face, pocket, base, front flap, zip, handles
   Fabric is drawn, not photographed: ripstop weave + fine grain + stitched seams + metal zip + copper piping. */
const PI = Math.PI;
const backFlap = t => { const y = 78 + 39 * Math.cos(PI * t), w = 260 - 38 * t; return `M84,78 L556,78 L${320 + w},${y} L${320 - w},${y} Z`; };
const frontFlap = t => { const y = 156 - 39 * Math.cos(PI * t), w = 260 + 20 * t; return `M36,156 L604,156 L${320 + w},${y} L${320 - w},${y} Z`; };
const backEdge = t => { const y = 78 + 39 * Math.cos(PI * t), w = 260 - 38 * t; return `M${320 - w},${y} L${320 + w},${y}`; };
const frontEdge = t => { const y = 156 - 39 * Math.cos(PI * t), w = 260 + 20 * t; return `M${320 - w},${y} L${320 + w},${y}`; };
const FRONT = 'M36,156 L604,156 L604,342 Q604,372 574,372 L66,372 Q36,372 36,342 Z';
const TOP = 'M36,156 L84,78 Q86,74 92,74 L548,74 Q554,74 556,78 L604,156 Z';

export function Defs() {
  return <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false"><defs>
    <linearGradient id="kb-fab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#30343b" /><stop offset=".4" stopColor="#202328" /><stop offset="1" stopColor="#111215" /></linearGradient>
    <linearGradient id="kb-side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity=".6" /><stop offset=".13" stopColor="#000" stopOpacity="0" /><stop offset=".87" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".6" /></linearGradient>
    <linearGradient id="kb-top" gradientUnits="userSpaceOnUse" x1="0" y1="78" x2="0" y2="156"><stop offset="0" stopColor="#454951" /><stop offset="1" stopColor="#2c2f35" /></linearGradient>
    <linearGradient id="kb-in" gradientUnits="userSpaceOnUse" x1="0" y1="78" x2="0" y2="156"><stop offset="0" stopColor="#35393f" /><stop offset="1" stopColor="#23262b" /></linearGradient>
    <linearGradient id="kb-hole" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#050506" /><stop offset="1" stopColor="#15171a" /></linearGradient>
    <linearGradient id="kb-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2b2e34" /><stop offset="1" stopColor="#0b0c0e" /></linearGradient>
    <linearGradient id="kb-pu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#222225" /><stop offset=".25" stopColor="#141416" /><stop offset="1" stopColor="#09090a" /></linearGradient>
    <linearGradient id="kb-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f1f2f4" /><stop offset=".45" stopColor="#9a9da4" /><stop offset=".6" stopColor="#d5d7da" /><stop offset="1" stopColor="#585b61" /></linearGradient>
    <linearGradient id="kb-copper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d8814f" /><stop offset="1" stopColor="#8a3a19" /></linearGradient>
    <linearGradient id="kb-patch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2518" /><stop offset="1" stopColor="#24160d" /></linearGradient>
    <linearGradient id="kb-pad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f2f2f4" /><stop offset=".5" stopColor="#c9cacf" /><stop offset="1" stopColor="#8e9096" /></linearGradient>
    <linearGradient id="kb-helm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2b3a5c" /><stop offset="1" stopColor="#0c111d" /></linearGradient>
    <linearGradient id="kb-dim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity=".15" /><stop offset=".55" stopColor="#000" stopOpacity=".55" /><stop offset="1" stopColor="#000" stopOpacity=".8" /></linearGradient>
    <radialGradient id="kb-floor" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#000" stopOpacity=".75" /><stop offset=".6" stopColor="#000" stopOpacity=".28" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
    <pattern id="kb-rip" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 .5H9M.5 0V9" stroke="#fff" strokeOpacity=".05" strokeWidth="1" /><path d="M4.5 0V9" stroke="#000" strokeOpacity=".08" strokeWidth=".6" /></pattern>
    <filter id="kb-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".95" numOctaves="2" seed="7" /><feColorMatrix type="matrix" values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.1 -.32" /></filter>
    <filter id="kb-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3" /></filter>
    <clipPath id="kb-fc"><path d={FRONT} /></clipPath>
  </defs></svg>;
}

const Stitch = ({ d, c = '#aeb2ba', o = .55 }) => <path d={d} fill="none" stroke={c} strokeOpacity={o} strokeWidth="1.1" strokeDasharray="4 3.2" strokeLinecap="round" />;
function Tape({ d, opacity }) {
  return <motion.g style={{ opacity }}>
    <motion.path d={d} fill="none" stroke="#0b0c0e" strokeWidth="6.5" strokeLinecap="round" />
    <motion.path d={d} fill="none" stroke="#c9ccd2" strokeWidth="2.6" strokeDasharray="1.5 1.5" />
  </motion.g>;
}
const svgCls = 'kb-lift pointer-events-none absolute inset-0 h-full w-full overflow-visible';

export function BagBack({ prog }) {
  const bd = useTransform(prog, backFlap), be = useTransform(prog, backEdge);
  const outer = useTransform(prog, p => p < .5 ? 1 : 0), inner = useTransform(prog, p => p >= .5 ? 1 : 0), shade = useTransform(prog, [0, 1], [0, .4]);
  const edgeOp = useTransform(prog, [0, .06], [0, 1]);
  return <svg viewBox="0 0 640 420" className={`${svgCls} z-10`} aria-hidden="true">
    {/* floor shadow */}
    <ellipse cx="320" cy="384" rx="318" ry="22" fill="url(#kb-floor)" />
    {/* inside of the bag */}
    <path d="M84,78 L556,78 L604,156 L36,156 Z" fill="url(#kb-hole)" />
    <g>
      <rect x="166" y="102" width="88" height="62" rx="15" fill="url(#kb-pad)" /><rect x="262" y="98" width="88" height="66" rx="15" fill="url(#kb-pad)" />
      <path d="M176,118 H244 M272,114 H340" stroke="#000" strokeOpacity=".25" strokeWidth="2" />
      <path d="M386,164 C386,112 420,90 452,90 C486,90 516,112 516,164 Z" fill="url(#kb-helm)" /><path d="M404,118 C418,102 440,98 462,100" stroke="#fff" strokeOpacity=".22" strokeWidth="3" fill="none" strokeLinecap="round" />
      <g transform="rotate(-9 548 130)"><rect x="541" y="70" width="15" height="96" rx="6" fill="#0d0d0e" />{[82, 92, 102, 112].map(y => <path key={y} d={`M541,${y} H556`} stroke="#fff" strokeOpacity=".14" strokeWidth="1.2" />)}</g>
      <rect x="84" y="78" width="472" height="78" fill="url(#kb-dim)" />
    </g>
    <path d="M36,156 L84,78 L112,96 L74,156 Z" fill="url(#kb-wall)" />
    <path d="M36,156 L84,78 L112,96 L74,156 Z" fill="url(#kb-wall)" transform="translate(640 0) scale(-1 1)" />
    <path d="M84,78 L556,78 L548,92 L92,92 Z" fill="#000" opacity=".5" />
    <path d="M36,156 L604,156 L596,138 L44,138 Z" fill="#000" opacity=".55" />
    {/* back flap: outside, then inside once it passes the vertical */}
    <motion.g style={{ opacity: outer }}><motion.path d={bd} fill="url(#kb-top)" /><motion.path d={bd} fill="url(#kb-rip)" /></motion.g>
    <motion.g style={{ opacity: inner }}><motion.path d={bd} fill="url(#kb-in)" /><motion.path d={bd} fill="url(#kb-rip)" /></motion.g>
    <motion.path d={bd} fill="#000" style={{ opacity: shade }} />
    <path d="M84,78 L556,78" stroke="url(#kb-copper)" strokeWidth="2.4" strokeLinecap="round" opacity=".95" />
    <Tape d={be} opacity={edgeOp} />
  </svg>;
}

export function BagFront({ prog, zip }) {
  const fd = useTransform(prog, frontFlap), fe = useTransform(prog, frontEdge);
  const outer = useTransform(prog, p => p < .5 ? 1 : 0), inner = useTransform(prog, p => p >= .5 ? 1 : 0), shade = useTransform(prog, [0, 1], [0, .32]);
  const edgeOp = useTransform(prog, [0, .06], [0, 1]), seamOp = useTransform(prog, [0, .06], [1, 0]);
  const sx = useTransform(zip, [0, 1], [560, 92]);
  const slit = useTransform(sx, x => `M${x},117 L580,117`), zw = useTransform(sx, x => x);
  const slideOp = useTransform(prog, [0, .12], [1, 0]), rim = useTransform(prog, [0, .3], [0, 1]);
  const hOp = useTransform(prog, [0, .25], [1, 0]), hY = useTransform(prog, [0, .25], [0, 16]);
  return <svg viewBox="0 0 640 420" className={`${svgCls} z-30`} aria-hidden="true">
    {/* front face */}
    <g clipPath="url(#kb-fc)">
      <rect x="30" y="150" width="580" height="230" fill="url(#kb-fab)" /><rect x="30" y="150" width="580" height="230" fill="url(#kb-rip)" />
      <rect x="30" y="150" width="580" height="230" fill="url(#kb-side)" />
      <rect x="30" y="156" width="580" height="22" fill="#fff" opacity=".05" />
      <rect x="0" y="0" width="640" height="420" filter="url(#kb-grain)" opacity=".55" style={{ mixBlendMode: 'overlay' }} />
    </g>
    {/* end-panel seams */}
    {[84, 556].map(x => <g key={x}><path d={`M${x},170 L${x},326`} stroke="#0a0a0b" strokeWidth="3" /><path d={`M${x + 1.8},170 L${x + 1.8},326`} stroke="#fff" strokeOpacity=".07" strokeWidth="1" /><Stitch d={`M${x + (x < 300 ? 8 : -8)},172 L${x + (x < 300 ? 8 : -8)},324`} /></g>)}
    {/* base */}
    <path d="M36,322 Q320,336 604,322 L604,342 Q604,372 574,372 L66,372 Q36,372 36,342 Z" fill="url(#kb-pu)" />
    <path d="M36,322 Q320,336 604,322" fill="none" stroke="url(#kb-copper)" strokeWidth="2.2" />
    <path d="M36,322 Q320,336 604,322" fill="none" stroke="#fff" strokeOpacity=".09" strokeWidth="1" transform="translate(0 2.6)" />
    <Stitch d="M52,346 Q320,356 588,346" o={.35} />
    {[[98, 140], [500, 542]].map(([a, b]) => <rect key={a} x={a} y="371" width={b - a} height="7" rx="3" fill="#050506" />)}
    {/* pocket + zip + brand patch */}
    <rect x="112" y="198" width="416" height="104" rx="15" fill="#fff" opacity=".035" /><rect x="112" y="198" width="416" height="104" rx="15" fill="none" stroke="#06060700" />
    <path d="M112,213 Q112,198 127,198 L513,198 Q528,198 528,213 L528,287 Q528,302 513,302 L127,302 Q112,302 112,287 Z" fill="none" stroke="#0a0a0b" strokeWidth="2.4" />
    <path d="M114,214 Q114,200 128,200 L512,200" fill="none" stroke="#fff" strokeOpacity=".09" strokeWidth="1" />
    <Stitch d="M120,213 Q120,206 128,206 L512,206 Q520,206 520,213 L520,287 Q520,294 512,294 L128,294 Q120,294 120,287 Z" o={.32} />
    <path d="M132,222 L508,222" stroke="#0a0a0b" strokeWidth="6" strokeLinecap="round" /><path d="M132,222 L508,222" stroke="#b9bcc2" strokeWidth="2.4" strokeDasharray="1.5 1.5" />
    {[300, 336].map((x, i) => <g key={x} transform={`translate(${x} 222)`}><rect x="-7" y="-5" width="14" height="10" rx="3" fill="url(#kb-metal)" /><path d="M0,5 L0,13" stroke="#141416" strokeWidth="1.6" /><rect x="-4.5" y="13" width="9" height="19" rx="2.5" fill="url(#kb-pu)" stroke="#000" strokeOpacity=".6" /><rect x="-4.5" y="13" width="9" height="19" rx="2.5" fill="none" stroke="#fff" strokeOpacity=".12" /></g>)}
    <g transform="translate(320 262)">
      <rect x="-86" y="-24" width="172" height="48" rx="5" fill="url(#kb-patch)" /><rect x="-86" y="-24" width="172" height="48" rx="5" fill="none" stroke="#000" strokeOpacity=".7" strokeWidth="1.4" />
      <rect x="-86" y="-24" width="172" height="48" rx="5" fill="none" stroke="#fff" strokeOpacity=".1" strokeWidth="1" transform="translate(0 1)" />
      <rect x="-80" y="-18" width="160" height="36" rx="3" fill="none" stroke="#d9a07a" strokeOpacity=".7" strokeWidth="1" strokeDasharray="3.4 2.6" />
      <text x="0" y="6" textAnchor="middle" fontFamily='"Barlow Condensed", Arial Narrow, sans-serif' fontWeight="700" fontSize="27" letterSpacing="3.4" fill="#e7b393" style={{ textTransform: 'uppercase' }}>Zenmoovz</text>
      <text x="0" y="-9.5" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="5.6" letterSpacing="3.2" fill="#c98a62" opacity=".9">CRICKET KIT</text>
    </g>
    {/* D-rings for a shoulder strap */}
    {[[52, 178], [588, 178]].map(([x, y]) => <g key={x}><rect x={x - 9} y={y - 12} width="18" height="9" rx="2" fill="url(#kb-pu)" stroke="#000" strokeOpacity=".6" /><path d={`M${x - 7},${y - 3} a7,7 0 1,0 14,0`} fill="none" stroke="url(#kb-metal)" strokeWidth="3" strokeLinecap="round" /></g>)}
    {/* front edge piping */}
    <path d="M36,156 L604,156" stroke="url(#kb-copper)" strokeWidth="2.4" opacity=".95" strokeLinecap="round" />
    {/* rim shadow once opened */}
    <motion.path d="M36,159.5 L604,159.5" stroke="#050506" strokeWidth="7" style={{ opacity: rim }} />
    {/* front flap */}
    <motion.g style={{ opacity: outer }}><motion.path d={fd} fill="url(#kb-top)" /><motion.path d={fd} fill="url(#kb-rip)" /></motion.g>
    <motion.g style={{ opacity: inner }}><motion.path d={fd} fill="url(#kb-in)" /><motion.path d={fd} fill="url(#kb-rip)" /></motion.g>
    <motion.path d={fd} fill="#000" style={{ opacity: shade }} />
    <Tape d={fe} opacity={edgeOp} />
    <path d="M36,156 L604,156" stroke="#fff" strokeOpacity=".16" strokeWidth="1" />
    {/* closed zip seam: teeth stop at the slider, a dark slit opens behind it */}
    <clipPath id="kb-zc"><motion.rect x="0" y="100" height="40" width={zw} /></clipPath>
    <motion.g style={{ opacity: seamOp }}>
      <g clipPath="url(#kb-zc)"><path d="M60,117 L580,117" stroke="#0b0c0e" strokeWidth="6.5" strokeLinecap="round" /><path d="M60,117 L580,117" stroke="#c9ccd2" strokeWidth="2.6" strokeDasharray="1.5 1.5" /></g>
      <motion.path d={slit} stroke="#040405" strokeWidth="5" strokeLinecap="round" />
    </motion.g>
    {/* slider and leather pull */}
    <motion.g style={{ x: sx, opacity: slideOp }}>
      <circle cx="0" cy="117" r="11" fill="none" stroke="#e7b393" strokeWidth="1.4" className="kb-ring" />
      <rect x="-10" y="110" width="20" height="14" rx="4.5" fill="url(#kb-metal)" stroke="#000" strokeOpacity=".5" />
      <g className="kb-pull"><path d="M0,124 L0,133" stroke="#0c0c0d" strokeWidth="2.2" /><rect x="-6" y="132" width="12" height="32" rx="3" fill="url(#kb-copper)" stroke="#000" strokeOpacity=".55" /><path d="M-3.2,136 L-3.2,160 M3.2,136 L3.2,160" stroke="#fff" strokeOpacity=".4" strokeWidth=".9" strokeDasharray="2 1.8" /></g>
    </motion.g>
    {/* carry handles lie back as the bag opens */}
    <motion.g style={{ opacity: hOp, y: hY }}>
      <path d="M236,108 C226,60 250,44 282,44 L358,44 C390,44 414,60 404,108" fill="none" stroke="#000" strokeOpacity=".35" strokeWidth="14" transform="translate(0 4)" filter="url(#kb-soft)" />
      <path d="M236,108 C226,60 250,44 282,44 L358,44 C390,44 414,60 404,108" fill="none" stroke="#0e0f11" strokeWidth="13" strokeLinecap="round" />
      <path d="M236,108 C226,60 250,44 282,44 L358,44 C390,44 414,60 404,108" fill="none" stroke="#2d3036" strokeWidth="4" strokeLinecap="round" transform="translate(0 -1.6)" />
      <path d="M236,108 C226,60 250,44 282,44 L358,44 C390,44 414,60 404,108" fill="none" stroke="#9a9ea6" strokeOpacity=".45" strokeWidth="1" strokeDasharray="3 3" transform="translate(0 2.6)" />
      <rect x="290" y="37" width="60" height="14" rx="6" fill="url(#kb-copper)" stroke="#000" strokeOpacity=".5" /><path d="M296,44 L344,44" stroke="#fff" strokeOpacity=".35" strokeWidth=".9" strokeDasharray="2.4 2" />
      {[236, 404].map(x => <rect key={x} x={x - 13} y="102" width="26" height="12" rx="3" fill="url(#kb-pu)" stroke="#000" strokeOpacity=".6" />)}
    </motion.g>
  </svg>;
}

/* ───────────────────────── Cards ───────────────────────── */
const ICONS = { Target, Zap, Feather, ShieldCheck, Wind, Hand, Footprints, Gauge, Layers, Package, Check };
const cardV = {
  hidden: i => ({ y: '112%', x: (3.5 - i) * 46, scale: .72, rotate: i % 2 ? 5 : -5, transition: { duration: .5, ease: [.5, 0, .75, 0], delay: (7 - i) * .045 } }),
  show: i => ({ y: 0, x: 0, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 140, damping: 19, mass: .95, delay: i * .11 } }),
};

/* One-click kit: pick the standard adult size for each piece (Senior, middle weight / size) since the cards carry no pickers */
const kitSize = p => { const z = sizesFor(p); return z ? (z.includes('Senior') ? 'Senior' : z[Math.floor(z.length / 2)]) : undefined; };

/* Silver-blue shining cards: brushed-metal frame (.kc-card in index.css) with a light that sweeps across, one card after another.
   Purchase controls (size / weight picker + Add to cart) were removed: the card is a showcase that links through to the product page. */
function KitCard({ item, i, show, bought }) {
  const { product: p } = item, { wishlist, toggleWishlist, ratingOf } = useStore();
  const r = ratingOf(p), liked = wishlist.some(x => x.id === p.id);
  return <motion.div custom={i} variants={cardV} initial="hidden" animate={show ? 'show' : 'hidden'} role="listitem" {...(!show && { inert: true })}
    className="w-[74%] shrink-0 snap-start sm:w-[44%] md:w-[31.5%] lg:w-[calc((100%-3.75rem)/4)]">
    <article className="kc-card flex h-full flex-col overflow-hidden rounded-[6px] p-2.5 text-ink" style={{ '--i': i }}>
      <div className="relative overflow-hidden rounded-[3px] bg-white shadow-[0_6px_18px_-8px_rgba(20,50,90,.55)] ring-1 ring-white/90">
        <Link to={`/product/${p.id}`} aria-label={`View ${p.name}`} className="block aspect-square overflow-hidden"><div data-kit-art className="h-full w-full"><ProductArt product={p} className="h-full w-full" /></div></Link>
        <AnimatePresence>{bought && <motion.span key="in" initial={{ opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * .12 + .5, type: 'spring', stiffness: 260, damping: 18 }} className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-center gap-1.5 rounded-[3px] bg-[#10243A]/92 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-white"><Check size={12} aria-hidden="true" />In your kit</motion.span>}</AnimatePresence>
        <span className="absolute left-3 top-3 bg-[#10243A] px-2 py-1 text-[10px] font-semibold uppercase tracking-[.14em] text-white">{String(i + 1).padStart(2, '0')} / {String(KIT.length).padStart(2, '0')}</span>
        <HeartButton liked={liked} onClick={() => toggleWishlist(p)} className="absolute right-3 top-3 !h-9 !w-9 shadow-sm" />
      </div>
      <div className="relative flex flex-1 flex-col px-2 pb-1.5 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#1D4E7E]">{item.role}</p>
        <div className="mt-1.5 flex items-baseline justify-between gap-3">
          <Link to={`/product/${p.id}`} className="min-w-0 text-[15px] font-semibold leading-snug transition-colors hover:text-[#1D4E7E]">{p.name}</Link>
          <span className="shrink-0 text-[15px] font-semibold">{money(p.price)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3 text-xs text-[#1B2B3C]/60"><span className="truncate">{p.brand}</span><span className="flex shrink-0 gap-2"><span className="line-through">{money(p.oldPrice)}</span><span className="font-semibold text-[#1D4E7E]">−{pct(p)}%</span></span></div>
        <div className="mt-2"><Stars rating={r.rating} size={11} /></div>
        <ul className="mt-4 grid gap-2.5 border-t border-[#1D4E7E]/20 pt-4">
          {item.benefits.map(([ic, t]) => { const Ic = ICONS[ic] || Check; return <li key={t} className="flex gap-2.5 text-[12.5px] leading-[1.45] text-[#14202D]/80"><span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/75 text-[#1D4E7E] shadow-[inset_0_0_0_1px_rgba(29,78,126,.18)]"><Ic size={11} strokeWidth={2.2} /></span>{t}</li>; })}
        </ul>
        <div className="mt-auto pt-5">
          <Link to={`/product/${p.id}`} className="btn-nudge inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#1D4E7E] underline decoration-[#1D4E7E]/30 underline-offset-[6px] transition-colors hover:decoration-[#1D4E7E]">View details <ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
      </div>
    </article>
  </motion.div>;
}

/* ───────────────────────── Name backdrop ─────────────────────────
   A giant ZENMOOVZ the bag stands on: silver-blue outlined letters filled with a cool "floor light", a blue pool of light behind the bag,
   and a bright silver highlight sweeping across the letters. The bag hides the top of the middle letters, so the name reads as a podium
   under the bag. It brightens once the bag is open. Barlow Condensed 700 is 3.75 units wide per font-size unit, so 261 fills 980. */
function NameBackdrop({ lit, calm }) {
  const face = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif';
  const word = { x: 500, y: 212, textAnchor: 'middle', fontFamily: face, fontWeight: 700, fontSize: 261, textLength: 980, lengthAdjust: 'spacing' };
  return <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex justify-center">
    <motion.div className="absolute bottom-[4%] left-1/2 h-[135%] w-[74%] -translate-x-1/2" initial={false} animate={{ opacity: lit ? 1 : .5 }} transition={{ duration: 1.3 }}
      style={{ background: 'radial-gradient(closest-side, rgba(110,165,235,.34), rgba(60,110,180,.13) 58%, transparent 100%)', filter: 'blur(10px)' }} />
    <motion.svg viewBox="0 0 1000 232" className="relative block w-[min(100vw,1480px)] overflow-visible" initial={false} animate={{ opacity: lit ? 1 : .82, filter: lit ? 'drop-shadow(0 0 16px rgba(130,185,255,.38))' : 'drop-shadow(0 0 0px rgba(130,185,255,0))' }} transition={{ duration: 1.1 }}>
      <defs>
        <linearGradient id="zk-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".05" /><stop offset=".5" stopColor="#b9d0ea" stopOpacity=".16" /><stop offset="1" stopColor="#6fa6e6" stopOpacity=".5" /></linearGradient>
        <linearGradient id="zk-line" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2f8ff" stopOpacity=".55" /><stop offset=".5" stopColor="#b8d2ee" stopOpacity=".85" /><stop offset="1" stopColor="#8fbcf0" stopOpacity=".95" /></linearGradient>
        <linearGradient id="zk-sweep" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="190" y2="70">
          <stop offset="0" stopColor="#dff0ff" stopOpacity="0" /><stop offset=".5" stopColor="#f4faff" stopOpacity=".8" /><stop offset="1" stopColor="#dff0ff" stopOpacity="0" />
          {!calm && <animateTransform attributeName="gradientTransform" type="translate" from="-320 0" to="1120 0" dur="6s" repeatCount="indefinite" />}
        </linearGradient>
      </defs>
      <text {...word} fill="url(#zk-fill)" stroke="url(#zk-line)" strokeWidth="1.6" strokeLinejoin="round" style={{ vectorEffect: 'non-scaling-stroke' }}>ZENMOOVZ</text>
      {!calm && <text {...word} fill="url(#zk-sweep)" stroke="none">ZENMOOVZ</text>}
    </motion.svg>
  </div>;
}

/* ───────────────────────── Section ───────────────────────── */
const wait = ms => new Promise(r => setTimeout(r, ms));

export default function CricketKit() {
  const { addKit } = useStore();
  const items = useMemo(() => KIT.map(k => ({ ...k, product: BY_ID[k.id] })).filter(k => k.product), []);
  const [phase, setPhase] = useState('closed'), [show, setShow] = useState(false);
  const [bought, setBought] = useState(false), [expanded, setExpanded] = useState(false), [railH, setRailH] = useState(0), [bagW, setBagW] = useState(0);
  const zip = useMotionValue(0), prog = useMotionValue(0), rail = useRef(null), stage = useRef(null), bagEl = useRef(null);
  /* While the bag is closed there are NO cards on screen, so the card area collapses to just the part the bag overhangs
     (bag width x .24375: the rim sits that far below the bag's top). It expands to the full card height as the bag opens. */
  useLayoutEffect(() => {
    const measure = () => { setRailH(rail.current?.offsetHeight || 0); setBagW(bagEl.current?.offsetWidth || 0); };
    measure(); const ro = new ResizeObserver(measure); rail.current && ro.observe(rail.current); bagEl.current && ro.observe(bagEl.current);
    return () => ro.disconnect();
  }, []);
  const calm = useMemo(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const t = s => calm ? 0 : s;
  const total = items.reduce((s, k) => s + k.product.price, 0);

  const openBag = async () => {
    if (phase !== 'closed') return;
    setPhase('opening');
    await animate(zip, 1, { duration: t(.6), ease: [.65, 0, .35, 1] });
    setExpanded(true);
    animate(prog, 1, { duration: t(1.05), ease: [.22, 1, .36, 1] });
    await wait(t(420)); setShow(true);
    const el = stage.current; if (el) window.__lenis ? window.__lenis.scrollTo(el, { offset: -90 }) : el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    await wait(t(1000)); setPhase('open');
  };
  const closeBag = async () => {
    if (phase !== 'open') return;
    setPhase('closing'); setShow(false); setBought(false); rail.current?.scrollTo({ left: 0, behavior: 'smooth' });
    await wait(t(800)); setExpanded(false); await animate(prog, 0, { duration: t(.7), ease: [.65, 0, .35, 1] }); await animate(zip, 0, { duration: t(.55), ease: [.65, 0, .35, 1] });
    setPhase('closed');
  };
  /* ONE cart line: "Cricket Kit". Its option text lists the standard adult sizes that come in it. */
  const kitOption = useMemo(() => `Adult: ${items.filter(k => sizesFor(k.product)).map(k => `${kitSize(k.product)} ${({ helmet: 'helmet', pads: 'pads', gloves: 'gloves', shoe: 'spikes', bat: 'bat' })[k.product.art.kind]}`).join(', ')}`, [items]);
  const buyKit = () => {
    if (phase !== 'open') return;
    const arts = [...(rail.current?.querySelectorAll('[data-kit-art]') || [])];
    addKit(KIT_PRODUCT, kitOption, items.map((k, i) => ({ product: k.product, el: arts[i] })));
    setBought(true); clearTimeout(buyKit.t); buyKit.t = setTimeout(() => setBought(false), 6000);
  };
  const by = d => rail.current?.scrollBy({ left: d * rail.current.clientWidth * .8, behavior: 'smooth' });
  const isOpen = phase === 'open', canOpen = phase === 'closed';

  return <section id="cricket-kit" aria-labelledby="cricket-kit-title" className="relative isolate scroll-mt-32 overflow-hidden bg-[#0a0a0b] pb-10 pt-16 text-white sm:pb-14 sm:pt-24">
    <Defs />
    <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_55%_at_50%_100%,rgba(90,140,210,.22),transparent_70%),radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(255,255,255,.07),transparent_70%)]" />

    <div className="section-wrap relative z-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:mb-10 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.24em] text-glow"><span className="h-px w-8 bg-glow" />The cricket kit</p>
          <h2 id="cricket-kit-title" className="max-w-2xl text-[clamp(2.5rem,5.4vw,4.4rem)] font-bold leading-[.9]"><Words text="Open the kit bag" inView /></h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/60">Everything a batter packs for match day, in one bag. Open it to see what goes in and why each piece earns its place.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-end" aria-hidden={!isOpen}>
          {[-1, 1].map(d => <button key={d} type="button" onClick={() => by(d)} tabIndex={isOpen ? 0 : -1} aria-label={d < 0 ? 'Previous kit items' : 'Next kit items'} className={`grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white transition-all duration-500 hover:bg-white hover:text-ink ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>{d < 0 ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}</button>)}
        </div>
      </div>

      <div ref={stage} className="relative isolate scroll-mt-24" style={{ paddingBottom: 'calc(min(100vw, 1480px) * .14)' }}>
        <NameBackdrop lit={expanded} calm={calm} />
        {/* products: clipped at the bag's front rim, so they slide up out of the opening */}
        <motion.div className="relative z-20 [overflow-y:clip]" initial={false} animate={{ height: expanded ? railH : bagW * .24375 }}
          transition={{ duration: phase === 'opening' || phase === 'closing' ? t(expanded ? .95 : .7) : 0, ease: [.22, 1, .36, 1] }}>
          <div ref={rail} role="list" aria-label="Cricket kit contents" className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto overflow-y-hidden px-4 pt-3 sm:-mx-6 sm:scroll-px-6 sm:px-6">
            {items.map((k, i) => <KitCard key={k.id} item={k} i={i} show={show} bought={bought} />)}
          </div>
          {/* closed: no cards on screen at all, just two quiet captions beside the bag (wide screens) */}
          <AnimatePresence>{!show && <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: .25 } }} className="pointer-events-none absolute inset-0">
            <p className="absolute bottom-10 left-0 hidden text-[11px] font-bold uppercase tracking-[.26em] text-white/45 lg:block">{items.length} pieces packed inside</p>
            <p className="absolute bottom-10 right-0 hidden items-center gap-2 text-[11px] font-bold uppercase tracking-[.26em] text-white/45 lg:flex">Tap the bag to open it<ArrowRight size={14} className="rotate-90" aria-hidden="true" /></p>
          </motion.div>}</AnimatePresence>
        </motion.div>

        {/* the bag: back layer (z-10) sits behind the cards, front layer (z-30) in front of them */}
        <div ref={bagEl} className="kb-hover group relative mx-auto" style={{ '--wb': 'min(600px, 92vw)', width: 'var(--wb)', height: 'calc(var(--wb) * .65625)', marginTop: 'calc(var(--wb) * -.24375)' }}>
          <BagBack prog={prog} /><BagFront prog={prog} zip={zip} />
          <button type="button" onClick={openBag} disabled={!canOpen} aria-expanded={isOpen || phase === 'opening'} aria-label={canOpen ? 'Open the cricket kit bag' : isOpen ? 'Cricket kit bag is open' : 'Cricket kit bag'}
            className={`absolute inset-x-0 bottom-0 top-[18%] z-40 rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-glow ${canOpen ? 'cursor-pointer' : 'pointer-events-none'}`}>
            <AnimatePresence>{canOpen && <motion.span key="tap" style={{ x: '-50%' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute left-1/2 top-[64%] flex items-center gap-2 whitespace-nowrap rounded-full border border-white/25 bg-black/55 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[.16em] text-white backdrop-blur-md transition-colors group-hover:border-glow group-hover:bg-black/70"><Hand size={14} className="text-glow" aria-hidden="true" />Tap to open the bag</motion.span>}</AnimatePresence>
          </button>
          {/* small screens: the same "pieces packed inside" caption, above the bag (the name backdrop fills the space below; no layout impact) */}
          <AnimatePresence>{canOpen && <motion.p key="packed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: .2 } }} className="pointer-events-none absolute inset-x-0 -top-8 text-center text-[11px] font-bold uppercase tracking-[.24em] text-white/45 lg:hidden">{items.length} pieces packed inside</motion.p>}</AnimatePresence>
        </div>
      </div>

      {/* actions */}
      <AnimatePresence>{(isOpen || phase === 'closing') && <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: show ? 1 : 0, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .5, delay: show ? .5 : 0 }} className="mt-8 flex flex-col items-stretch gap-4 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-white/45">The full kit · {items.length} pieces</p>
          <p className="mt-1 text-2xl font-semibold">{money(total)}</p>
          <p className="mt-1 text-xs text-white/45">{kitOption}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <button type="button" onClick={closeBag} disabled={!isOpen} className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[.14em] text-white/70 underline decoration-white/25 underline-offset-[7px] transition-colors hover:text-white hover:decoration-white"><RotateCcw size={14} aria-hidden="true" />Repack the bag</button>
          <button type="button" onClick={buyKit} className="btn-nudge inline-flex items-center gap-2.5 rounded-[2px] bg-gradient-to-b from-[#F2F7FC] via-[#C9DAEB] to-[#9DB7D1] px-8 py-4 text-[12px] font-bold uppercase leading-none tracking-[.16em] text-[#10243A] shadow-[0_0_28px_-6px_rgba(125,180,245,.6)] transition-[filter] hover:brightness-105">
            <AnimatePresence mode="wait" initial={false}>{bought
              ? <motion.span key="done" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="inline-flex items-center gap-2.5"><Check size={16} aria-hidden="true" />Kit added</motion.span>
              : <motion.span key="buy" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="inline-flex items-center gap-2.5"><ShoppingBag size={16} aria-hidden="true" />Buy kit · {money(total)}</motion.span>}</AnimatePresence>
          </button>
        </div>
      </motion.div>}</AnimatePresence>
    </div>
  </section>;
}
