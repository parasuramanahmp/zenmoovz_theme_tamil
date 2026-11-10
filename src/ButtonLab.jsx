import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight, Bell, Check, Fingerprint, Loader2, Send, ShoppingBag, Sparkles, Zap } from 'lucide-react';
import { Bump, Magnetic, SparkHeart, Swap, Words } from './motion.jsx';

/*
  BUTTON LAB — 20 button animations, Framer Motion + Tailwind only.
  Every demo is a small self-contained component: copy any one into your project.
  Route: /buttons
*/
const ease = [.22, 1, .36, 1];
const base = 'relative inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold outline-none focus-visible:ring-4 focus-visible:ring-accent/30';
const dark = `${base} bg-navy text-white`;

/* 01 — whileHover / whileTap with a bouncy spring */
const SpringPop = () => <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: .9 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} className={dark}>Add to bag</motion.button>;

/* 02 — button drifts toward the cursor */
const MagneticBtn = () => <Magnetic><motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }} className={`${dark} bg-accent`}>Shop collection</motion.button></Magnetic>;

/* 03 — light streak sweeps across on hover (parent variants → child) */
const Shine = () => <motion.button initial="rest" animate="rest" whileHover="hover" whileTap={{ scale: .95 }} className={`${dark} overflow-hidden`}>
  <motion.span aria-hidden className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/40" variants={{ rest: { x: 0 }, hover: { x: '520%', transition: { duration: .7, ease: 'easeInOut' } } }} />
  <span className="relative">Get started</span></motion.button>;

/* 04 — background fills from the left, text colour flips */
const FillSlide = () => <motion.button initial="rest" animate="rest" whileHover="hover" whileTap={{ scale: .96 }} className={`${base} overflow-hidden border-2 border-navy`}>
  <motion.span aria-hidden className="absolute inset-0 origin-left bg-navy" variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }} transition={{ duration: .4, ease }} />
  <motion.span className="relative" variants={{ rest: { color: '#111111' }, hover: { color: '#ffffff' } }} transition={{ duration: .3 }}>Explore gear</motion.span></motion.button>;

/* 05 — ripple spawns exactly where you click */
function Ripple() {
  const [r, setR] = useState([]);
  const click = e => { const b = e.currentTarget.getBoundingClientRect(); setR(o => [...o, { id: Math.random(), x: e.detail ? e.clientX - b.left : b.width / 2, y: e.detail ? e.clientY - b.top : b.height / 2 }]); };
  return <motion.button whileTap={{ scale: .97 }} onClick={click} className={`${dark} overflow-hidden bg-accent`}>
    {r.map(o => <motion.span key={o.id} aria-hidden className="pointer-events-none absolute h-6 w-6 rounded-full bg-white/50" style={{ left: o.x - 12, top: o.y - 12 }} initial={{ scale: 0, opacity: .7 }} animate={{ scale: 14, opacity: 0 }} transition={{ duration: .8, ease: 'easeOut' }} onAnimationComplete={() => setR(a => a.filter(z => z.id !== o.id))} />)}
    <span className="relative">Click anywhere</span></motion.button>;
}

/* 06 — arrow grows in and pushes the label */
const ArrowSlide = () => <motion.button initial="rest" animate="rest" whileHover="hover" whileTap={{ scale: .95 }} className={dark}>Shop now
  <motion.span aria-hidden className="inline-flex overflow-hidden" variants={{ rest: { width: 0, opacity: 0, marginLeft: 0 }, hover: { width: 18, opacity: 1, marginLeft: 8 } }} transition={{ duration: .3, ease }}><ArrowRight size={18} /></motion.span></motion.button>;

/* 07 — label rolls up and a second label rolls in */
const TextRoll = () => <motion.button initial="rest" animate="rest" whileHover="hover" whileTap={{ scale: .95 }} className={dark}>
  <span className="block h-5 overflow-hidden"><motion.span className="block" variants={{ rest: { y: 0 }, hover: { y: '-50%' } }} transition={{ duration: .35, ease }}>
    <span className="block h-5 leading-5">Play now</span><span className="block h-5 leading-5">Let’s go!</span></motion.span></span></motion.button>;

/* 08 — conic-gradient border that never stops spinning */
const SpinBorder = () => <span className="relative inline-flex overflow-hidden rounded-full p-[2px]">
  <motion.span aria-hidden className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,#B4532A,#E9B99B,#FFE08A,#B4532A)]" animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: .96 }} className={`${dark} bg-ink`}>Pro membership</motion.button></span>;

/* 09 — attention rings radiate from a call-to-action */
const PulseRing = () => <span className="relative inline-flex">
  {[0, .8].map(d => <motion.span key={d} aria-hidden className="absolute inset-0 rounded-full bg-accent" initial={{ opacity: .5, scale: 1 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ duration: 1.6, repeat: Infinity, delay: d, ease: 'easeOut' }} />)}
  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }} className={`${dark} gap-2 bg-accent`}><Zap size={16} /> Join the game</motion.button></span>;

/* 10 — icon rings like a bell on hover */
const Wiggle = () => <motion.button initial="rest" animate="rest" whileHover="hover" whileTap={{ scale: .95 }} className={`${dark} gap-2`}>
  <motion.span className="inline-flex origin-top" variants={{ rest: { rotate: 0 }, hover: { rotate: [0, -18, 16, -12, 10, -5, 0], transition: { duration: .7 } } }}><Bell size={17} /></motion.span>Notify me</motion.button>;

/* 11 — idle → spinner → success, width morphs with `layout` */
function LoadSuccess() {
  const [s, setS] = useState('idle');
  useEffect(() => { if (s === 'idle') return; const t = setTimeout(() => setS(s === 'loading' ? 'done' : 'idle'), s === 'loading' ? 1400 : 1600); return () => clearTimeout(t); }, [s]);
  return <motion.button layout disabled={s !== 'idle'} onClick={() => setS('loading')} whileTap={{ scale: .95 }} animate={{ backgroundColor: s === 'done' ? '#10b981' : '#111111' }} transition={{ layout: { type: 'spring', stiffness: 350, damping: 28 } }} style={{ borderRadius: 999 }} className={`${base} h-12 min-w-12 overflow-hidden text-white`}>
    <AnimatePresence mode="popLayout" initial={false}><motion.span key={s} className="inline-flex items-center gap-2" initial={{ opacity: 0, y: 12, scale: .6 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: .6 }} transition={{ duration: .2 }}>
      {s === 'idle' && 'Place order'}{s === 'loading' && <motion.span animate={{ rotate: 360 }} transition={{ duration: .8, repeat: Infinity, ease: 'linear' }} className="inline-flex"><Loader2 size={20} /></motion.span>}{s === 'done' && <><Check size={20} /> Paid</>}
    </motion.span></AnimatePresence></motion.button>;
}

/* 12 — press and hold (mouse, touch or Space/Enter) to confirm */
function HoldConfirm() {
  const p = useMotionValue(0), ctl = useRef(), [done, setDone] = useState(false), color = useTransform(p, [.45, .55], ['#dc2626', '#ffffff']);
  const start = () => { if (done) return; ctl.current?.stop(); ctl.current = animate(p, 1, { duration: 1.2, ease: 'linear', onComplete: () => { setDone(true); setTimeout(() => { setDone(false); p.set(0); }, 1500); } }); };
  const stop = () => { if (done) return; ctl.current?.stop(); ctl.current = animate(p, 0, { duration: .3 }); };
  const key = fn => e => { if ((e.key === ' ' || e.key === 'Enter') && (fn === stop || !e.repeat)) { e.preventDefault(); fn(); } };
  return <motion.button onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} onKeyDown={key(start)} onKeyUp={key(stop)} whileTap={{ scale: .96 }} className={`${base} touch-none select-none overflow-hidden border-2 border-red-500`}>
    <motion.span aria-hidden className="absolute inset-0 origin-left bg-red-500" style={{ scaleX: p }} />
    <motion.span className="relative inline-flex items-center gap-2" style={{ color }}><Swap k={done}>{done ? <><Check size={17} /> Deleted</> : <><Fingerprint size={17} /> Hold to delete</>}</Swap></motion.span></motion.button>;
}

/* 13 — a ball launches from the button into the cart icon */
function CartLaunch() {
  const wrap = useRef(null), btn = useRef(null), cart = useRef(null), [n, setN] = useState(0), [balls, setBalls] = useState([]);
  const go = () => {
    const w = wrap.current.getBoundingClientRect(), b = btn.current.getBoundingClientRect(), c = cart.current.getBoundingClientRect();
    const sx = b.left - w.left + 24, sy = b.top - w.top + b.height / 2 - 8, dx = c.left - w.left + c.width / 2 - 8 - sx, dy = c.top - w.top + c.height / 2 - 8 - sy;
    setBalls(o => [...o, { id: Math.random(), sx, sy, dx, dy }]);
  };
  return <div ref={wrap} className="relative flex items-center gap-8">
    <motion.button ref={btn} onClick={go} whileHover={{ scale: 1.05 }} whileTap={{ scale: .93 }} className={`${dark} gap-2`}><ShoppingBag size={16} /> Add to cart</motion.button>
    <span ref={cart} className="relative grid h-11 w-11 place-items-center rounded-full border border-navy/15 text-navy"><Bump k={n}><ShoppingBag size={20} /></Bump>
      <AnimatePresence>{n > 0 && <motion.span key={n} initial={{ scale: 2 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }} className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">{n}</motion.span>}</AnimatePresence></span>
    {balls.map(b => <motion.span key={b.id} aria-hidden className="pointer-events-none absolute h-4 w-4 rounded-full border border-orange-700/40 bg-orange-400" style={{ left: b.sx, top: b.sy }} initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{ x: [0, b.dx * .5, b.dx], y: [0, Math.min(b.dy, 0) - 50, b.dy], scale: [1, 1, .4], opacity: [1, 1, 0], rotate: 540 }} transition={{ duration: .8, ease: 'easeInOut', times: [0, .45, 1] }} onAnimationComplete={() => { setBalls(a => a.filter(z => z.id !== b.id)); setN(v => v + 1); }} />)}
  </div>;
}

/* 14 — paper plane takes off, label swaps to “Sent!” */
function Takeoff() {
  const [sent, setSent] = useState(false);
  useEffect(() => { if (!sent) return; const t = setTimeout(() => setSent(false), 2200); return () => clearTimeout(t); }, [sent]);
  return <motion.button onClick={() => setSent(true)} disabled={sent} whileTap={{ scale: .95 }} className={`${dark} gap-2`}>
    <motion.span className="inline-flex" animate={sent ? { x: [0, 0, 90], y: [0, -4, -26], rotate: [0, 0, -20], opacity: [1, 1, 0] } : { x: 0, y: 0, rotate: 0, opacity: 1 }} transition={sent ? { duration: .8, times: [0, .2, 1], ease: 'easeIn' } : { duration: .3, delay: .2 }}><Send size={17} /></motion.span>
    <Swap k={sent}>{sent ? 'Sent!' : 'Send message'}</Swap></motion.button>;
}

/* 15 — glowing box-shadow loop */
const Neon = () => <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: .95 }} animate={{ boxShadow: ['0 0 0px 0px rgba(141,187,239,0)', '0 0 22px 4px rgba(141,187,239,.85)', '0 0 0px 0px rgba(141,187,239,0)'] }} transition={{ boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }} className={`${base} border border-glow bg-ink text-glow`}>Night match</motion.button>;

/* 16 — chunky key that physically presses down */
const Press3D = () => <motion.button initial={{ y: 0, boxShadow: '0 6px 0 0 #0A0A0A' }} whileHover={{ y: -2, boxShadow: '0 8px 0 0 #0A0A0A' }} whileTap={{ y: 6, boxShadow: '0 0px 0 0 #0A0A0A' }} transition={{ duration: .1 }} className={`${base} bg-accent text-white`}>Press me</motion.button>;

/* 17 — toggle with heart pop + sparkles */
function HeartBtn() {
  const [on, setOn] = useState(false);
  return <motion.button onClick={() => setOn(o => !o)} aria-pressed={on} whileTap={{ scale: .88 }} whileHover={{ scale: 1.05 }} className={`${base} gap-2 border-2 transition-colors duration-300 ${on ? 'border-rose-500 bg-rose-500 text-white' : 'border-navy/20 text-navy'}`}>
    <SparkHeart liked={on} size={18} /><Swap k={on}>{on ? 'Saved' : 'Save'}</Swap></motion.button>;
}

/* 18 — confetti shoots out from the button on every click */
const CONF = ['#B4532A', '#E9B99B', '#FFE08A', '#10b981', '#fb7185', '#111111'];
function ConfettiBtn() {
  const [n, setN] = useState(0);
  const bits = useMemo(() => Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2 + Math.random() * .4, r = 50 + Math.random() * 40; return { x: Math.cos(a) * r, y: Math.sin(a) * r, c: CONF[i % 6], rot: Math.random() * 540 - 270 }; }), [n]);
  return <span className="relative inline-flex">
    <motion.button onClick={() => setN(v => v + 1)} whileTap={{ scale: .92 }} whileHover={{ scale: 1.05 }} className={`${dark} gap-2`}><Sparkles size={16} /> Celebrate</motion.button>
    {n > 0 && <span key={n} aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">{bits.map((b, i) => <motion.span key={i} className="absolute h-2 w-1.5 rounded-[1px]" style={{ backgroundColor: b.c }} initial={{ x: 0, y: 0, opacity: 1, scale: 1 }} animate={{ x: b.x, y: b.y + 30, opacity: 0, rotate: b.rot, scale: .6 }} transition={{ duration: .9, ease: 'easeOut' }} />)}</span>}
  </span>;
}

/* 19 — squash & stretch like jelly on click */
function Jelly() {
  const c = useAnimation();
  return <motion.button animate={c} whileHover={{ scale: 1.05 }} onClick={() => c.start({ scaleX: [1, 1.3, .82, 1.12, .96, 1], scaleY: [1, .7, 1.2, .92, 1.03, 1], transition: { duration: .8, ease: 'easeOut' } })} className={`${base} bg-amber-400 text-navy`}>Squish me</motion.button>;
}

/* 20 — drag the handle all the way to confirm (Enter/Space also works) */
const MAX = 208; // w-64 (256) − handle w-10 (40) − padding p-1 (8)
function SlidePay() {
  const x = useMotionValue(0), [done, setDone] = useState(false), fill = useTransform(x, v => v + 44), hint = useTransform(x, [0, 110], [1, 0]);
  const finish = () => { animate(x, MAX, { duration: .15 }); setDone(true); setTimeout(() => { animate(x, 0, { type: 'spring', stiffness: 200, damping: 24 }); setDone(false); }, 1800); };
  const end = () => { if (done) return; x.get() > MAX * .8 ? finish() : animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 }); };
  return <div className="relative h-12 w-64 select-none overflow-hidden rounded-full bg-navy/10 p-1" role="group" aria-label="Slide to pay">
    <motion.div aria-hidden className="absolute inset-y-0 left-0 rounded-full bg-accent/30" style={{ width: fill }} />
    <motion.p aria-hidden className="absolute inset-0 grid place-items-center pl-8 text-xs font-bold tracking-wide text-navy/60" style={{ opacity: hint }}>Slide to pay</motion.p>
    <AnimatePresence>{done && <motion.p initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="absolute inset-0 grid place-items-center pr-8 text-xs font-bold text-navy">Payment sent</motion.p>}</AnimatePresence>
    <motion.button aria-label="Slide to pay" drag="x" dragConstraints={{ left: 0, right: MAX }} dragElastic={0} dragMomentum={false} style={{ x }} onDragEnd={end} onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !done) { e.preventDefault(); finish(); } }}
      whileTap={{ scale: .95 }} className="relative z-10 grid h-10 w-10 cursor-grab touch-none place-items-center rounded-full bg-navy text-white outline-none focus-visible:ring-4 focus-visible:ring-accent/30 active:cursor-grabbing"><Swap k={done}>{done ? <Check size={18} /> : <ArrowRight size={18} />}</Swap></motion.button>
  </div>;
}

const ITEMS = [
  [SpringPop, 'Spring pop', 'whileHover + whileTap with a bouncy spring.'],
  [MagneticBtn, 'Magnetic', 'Drifts toward the cursor using motion values + useSpring.'],
  [Shine, 'Shine sweep', 'Parent variants drive a light streak across the button.'],
  [FillSlide, 'Fill slide', 'scaleX fill from the left while the text colour flips.'],
  [Ripple, 'Click ripple', 'A ripple is spawned at the exact click position.'],
  [ArrowSlide, 'Arrow slide', 'Arrow width animates open and pushes the label.'],
  [TextRoll, 'Text roll', 'Two stacked labels slide inside an overflow-hidden mask.'],
  [SpinBorder, 'Spinning border', 'Endlessly rotating conic-gradient border.'],
  [PulseRing, 'Pulse rings', 'Looping rings pull attention to the main call-to-action.'],
  [Wiggle, 'Bell wiggle', 'Icon swings from its top edge using rotate keyframes.'],
  [LoadSuccess, 'Loading → success', 'State machine + layout animation: pill → spinner → check.'],
  [HoldConfirm, 'Hold to confirm', 'Press and hold fills the button; release cancels it.'],
  [CartLaunch, 'Add-to-cart launch', 'A ball arcs from the button to the cart, which bumps.'],
  [Takeoff, 'Take-off', 'Icon flies out of the button, label swaps to “Sent!”.'],
  [Neon, 'Neon glow', 'Looping boxShadow keyframes for a glowing edge.'],
  [Press3D, '3D press', 'Hard shadow collapses as the key is pushed down.'],
  [HeartBtn, 'Heart toggle', 'Colour morph, popping heart and sparkle burst.'],
  [ConfettiBtn, 'Confetti burst', 'Randomised particles fly out on every click.'],
  [Jelly, 'Jelly squish', 'scaleX / scaleY keyframes for squash and stretch.'],
  [SlidePay, 'Slide to pay', 'drag="x" handle with a progress fill and snap-back.'],
];

function Demo({ n, title, how, children }) {
  return <motion.article initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .5, ease, delay: ((n - 1) % 3) * .07 }} className="flex flex-col overflow-hidden rounded-[6px] border border-navy/10 bg-white">
    <div className="grid min-h-[150px] place-items-center bg-gradient-to-b from-mist/60 to-white px-4 py-8">{children}</div>
    <div className="border-t border-navy/10 px-5 py-4"><p className="text-sm font-bold"><span className="mr-2 tabular-nums text-accent">{String(n).padStart(2, '0')}</span>{title}</p><p className="mt-1 text-xs leading-5 text-ink/50">{how}</p></div>
  </motion.article>;
}

export default function ButtonLab() {
  return <main className="section-wrap min-h-[60vh] pb-4 pt-12">
    <div className="mb-10 max-w-2xl">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[.22em] text-accent">TEST PAGE</p>
      <h1 className="text-4xl font-black tracking-[-.06em] sm:text-5xl"><Words text="Button animation lab" /><span className="lime-text">.</span></h1>
      <p className="mt-3 text-sm leading-6 text-ink/50">{ITEMS.length} button animations built with Framer Motion and Tailwind. Hover, press, hold, drag and click each one. Every demo lives in <code className="rounded bg-navy/[.06] px-1.5 py-0.5 text-xs">src/ButtonLab.jsx</code> as an independent component you can copy.</p>
    </div>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{ITEMS.map(([C, t, h], i) => <Demo key={t} n={i + 1} title={t} how={h}><C /></Demo>)}</div>
  </main>;
}
