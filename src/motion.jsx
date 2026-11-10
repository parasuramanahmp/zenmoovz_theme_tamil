import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useAnimation, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import Lenis from 'lenis';
import { Scene } from './scenes.jsx';
import { ProductArt } from './art.jsx';

const ease = [.22, 1, .36, 1];
const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

/* Word-by-word masked headline reveal.
   The reveal is triggered by the headline as a whole (not by each hidden word), so no word can get stuck invisible. */
export function Words({ text, className = '', delay = 0, inView = false }) {
  const ref = useRef(null), seen = useInView(ref, { once: true, amount: .2 }), go = inView ? seen : true;
  return <span ref={ref} className={className} aria-label={text}>{text.split(' ').map((w, i) =>
    <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[.1em] pr-[.2em] align-bottom">
      <motion.span className="inline-block" initial={{ y: '115%', rotate: 5 }} animate={go ? { y: 0, rotate: 0 } : { y: '115%', rotate: 5 }}
        transition={{ duration: .85, delay: (inView ? 0 : .15) + delay + i * .08, ease }}>{w}</motion.span>
    </span>)}</span>;
}

/* Button follows the cursor slightly */
export function Magnetic({ children, className = '' }) {
  const ref = useRef(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16 }), sy = useSpring(y, { stiffness: 220, damping: 16 });
  return <motion.span ref={ref} style={{ x: sx, y: sy }} className={`inline-flex ${className}`}
    onMouseMove={e => { const r = ref.current.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * .25); y.set((e.clientY - r.top - r.height / 2) * .35); }}
    onMouseLeave={() => { x.set(0); y.set(0); }}>{children}</motion.span>;
}

/* Text swap (Add to cart -> Added) */
export const Swap = ({ k, children }) => <AnimatePresence mode="wait" initial={false}>
  <motion.span key={String(k)} className="inline-flex items-center gap-2" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: .18 }}>{children}</motion.span>
</AnimatePresence>;

/* Rolling digit for quantities */
export const Roll = ({ v, className = '' }) => <span className={`relative inline-block overflow-hidden ${className}`}>
  <AnimatePresence mode="popLayout" initial={false}>
    <motion.span key={v} className="inline-block" initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-100%', opacity: 0 }} transition={{ duration: .22 }}>{v}</motion.span>
  </AnimatePresence></span>;

/* Prices that count up/down */
export function Money({ value }) {
  const ref = useRef(null), prev = useRef(value);
  useEffect(() => { const c = animate(prev.current, value, { duration: .6, ease, onUpdate: v => { if (ref.current) ref.current.textContent = fmt(Math.round(v)); } }); prev.current = value; return c.stop; }, [value]);
  return <span ref={ref}>{fmt(value)}</span>;
}

/* Stats that count up when visible */
export function Counter({ to, pad = 0 }) {
  const ref = useRef(null), seen = useInView(ref, { once: true });
  useEffect(() => { if (!seen) return; const c = animate(0, to, { duration: 1.4, delay: .5, ease, onUpdate: v => { ref.current.textContent = String(Math.round(v)).padStart(pad, '0'); } }); return c.stop; }, [seen]);
  return <span ref={ref}>{String(0).padStart(pad, '0')}</span>;
}

/* Wiggle when the count changes (cart icon) */
export function Bump({ k, children }) {
  const c = useAnimation(), first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } c.start({ scale: [1, 1.15, 1], transition: { duration: .35 } }); }, [k]);
  return <motion.span animate={c} className="inline-flex">{children}</motion.span>;
}

/* Product card: soft fade-up reveal (no tilt) */
export function TiltCard({ index = 0, className = '', children, layout = true }) {
  return <motion.article layout={layout} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }}
    exit={{ opacity: 0, transition: { duration: .2 } }} transition={{ duration: .6, delay: (index % 4) * .06, ease }} className={className}>{children}</motion.article>;
}

/* Brand intro (animated logo, once per visit) now lives in components/LogoLoader.jsx */
export { Intro } from './components/LogoLoader.jsx';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll(), s = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  return <motion.div style={{ scaleX: s }} className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-accent" />;
}

/* Fly a little copy of the product into the cart icon */
export function useFly() {
  const [fl, setFl] = useState([]);
  const fly = (product, el) => {
    const t = document.getElementById('cart-btn'); if (!el || !t) return;
    setFl(o => [...o, { id: Math.random(), product, a: el.getBoundingClientRect(), b: t.getBoundingClientRect() }]);
  };
  const layer = <>{fl.map(({ id, product, a, b }) => {
    const cx = a.left + a.width / 2, cy = a.top + a.height / 2;
    return <motion.div key={id} className="pointer-events-none fixed z-[90] overflow-hidden rounded-2xl shadow-glow" style={{ left: cx - 40, top: cy - 40, width: 80, height: 80 }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }} animate={{ x: b.left + b.width / 2 - cx, y: b.top + b.height / 2 - cy, scale: .15, opacity: .3, rotate: 240 }}
      transition={{ duration: .85, ease: [.5, 0, .75, 0] }} onAnimationComplete={() => setFl(o => o.filter(f => f.id !== id))}><ProductArt product={product} className="h-full w-full" shadow={false} /></motion.div>;
  })}</>;
  return { fly, layer };
}

/* Large wordmark for the footer */
export const Wordmark = () => <div className="section-wrap select-none overflow-hidden pb-4" aria-hidden="true">
  <div className="font-display flex justify-between text-[clamp(3.2rem,16vw,13rem)] font-bold leading-[.85] text-ink/[.08]">
    {'ZENMOOVZ'.split('').map((c, i) => <motion.span key={i} initial={{ y: '60%', opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * .04, duration: .7, ease }}>{c}</motion.span>)}
  </div></div>;

/* ───── v4 additions ───── */
const SP = Array.from({ length: 10 }, (_, i) => { const a = i / 10 * Math.PI * 2, r = i % 2 ? 36 : 52; return { x: Math.cos(a) * r, y: Math.sin(a) * r, s: i % 2 ? 8 : 13, c: ['#ffffff', '#E9B99B', '#FFE08A', '#B4532A'][i % 4], r: i % 2 ? 160 : -160, d: (i % 3) * .035 }; });
export const Spark = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c.8 6.5 5.5 11.2 12 12-6.5.8-11.2 5.5-12 12-.8-6.5-5.5-11.2-12-12C6.5 11.2 11.2 6.5 12 0z" fill={color} /></svg>;

/* Ring + sparkles, replayed by remounting it with a new key */
export const Burst = () => <span className="pointer-events-none absolute inset-0 grid place-items-center">
  <motion.span className="absolute h-6 w-6 rounded-full border-2 border-glow" initial={{ scale: .4, opacity: .9 }} animate={{ scale: 2.8, opacity: 0 }} transition={{ duration: .6 }} />
  {SP.map((p, i) => <motion.span key={i} className="absolute" initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
    animate={{ x: p.x, y: p.y, scale: [0, 1.25, 0], opacity: [0, 1, 0], rotate: p.r }} transition={{ duration: .85, delay: p.d, ease: 'easeOut' }}><Spark size={p.s} color={p.c} /></motion.span>)}
</span>;

/* Heart: fills in when liked */
export function SparkHeart({ liked, size = 17 }) {
  return <motion.span className="inline-flex" animate={liked ? { scale: [1, 1.18, 1] } : { scale: 1 }} transition={{ duration: .3 }}><Heart size={size} strokeWidth={1.6} fill={liked ? 'currentColor' : 'none'} /></motion.span>;
}
export function HeartButton({ liked, onClick, className = '' }) {
  return <motion.button whileTap={{ scale: .9 }} onClick={onClick} data-liked={liked} aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
    className={`grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink transition-colors hover:bg-ink hover:text-white ${liked ? '!bg-ink !text-white' : ''} ${className}`}><SparkHeart liked={liked} /></motion.button>;
}

/* Stars fill one by one, pop, and the number counts up (and re-counts when the rating changes) */
export function Stars({ rating, size = 13 }) {
  const ref = useRef(null), num = useRef(null), prev = useRef(0), seen = useInView(ref, { once: true, amount: .8 });
  useEffect(() => {
    if (!seen) return; const from = prev.current; prev.current = rating;
    const c = animate(from, rating, { duration: from ? .7 : 1, delay: from ? 0 : .15, ease, onUpdate: v => { if (num.current) num.current.textContent = v.toFixed(1); } }); return c.stop;
  }, [seen, rating]);
  return <span ref={ref} className="inline-flex items-center gap-1.5" aria-label={`Rated ${rating} out of 5`}>
    <span className="inline-flex gap-px">{[0, 1, 2, 3, 4].map(i => {
      const fill = Math.max(0, Math.min(1, rating - i)), d = .1 + i * .12;
      return <motion.span key={i} className="relative inline-block" style={{ width: size, height: size }} transition={{ duration: .4 }}>
        <Star size={size} className="absolute inset-0 text-navy/15" fill="currentColor" strokeWidth={0} />
        <motion.span className="absolute inset-y-0 left-0 overflow-hidden" initial={{ width: 0 }} animate={{ width: seen ? `${fill * 100}%` : 0 }} transition={{ delay: d, duration: .5, ease }}>
          <Star size={size} className="text-[#B08D57]" fill="currentColor" strokeWidth={0} style={{ minWidth: size }} /></motion.span>
      </motion.span>;
    })}</span>
    <span ref={num} className="text-xs font-semibold tabular-nums">0.0</span>
  </span>;
}

/* Words light up as you scroll */
function Fade({ w, p, a, b }) { const o = useTransform(p, [a, b], [.14, 1]); return <motion.span style={{ opacity: o }} className="mr-[.25em] inline-block">{w}</motion.span>; }
export function ScrollReveal({ text, className = '' }) {
  const ref = useRef(null), { scrollYProgress: p } = useScroll({ target: ref, offset: ['start .85', 'end .45'] }), ws = text.split(' ');
  return <p ref={ref} className={className}>{ws.map((w, i) => <Fade key={i} w={w} p={p} a={i / ws.length} b={(i + 1) / ws.length} />)}</p>;
}

/* Cursor ring that grows over links and buttons */
export function Cursor() {
  const x = useMotionValue(-100), y = useMotionValue(-100), sx = useSpring(x, { stiffness: 500, damping: 40, mass: .4 }), sy = useSpring(y, { stiffness: 500, damping: 40, mass: .4 });
  const [on, setOn] = useState(false), [big, setBig] = useState(false);
  useEffect(() => {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return; setOn(true);
    const mv = e => { x.set(e.clientX); y.set(e.clientY); setBig(!!e.target.closest?.('a,button,input,select')); };
    window.addEventListener('mousemove', mv); return () => window.removeEventListener('mousemove', mv);
  }, []);
  return on ? <motion.div className="pointer-events-none fixed left-0 top-0 z-[120] rounded-full border border-accent bg-accent/10" style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}
    animate={{ width: big ? 60 : 14, height: big ? 60 : 14 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} /> : null;
}

/* Lenis smooth scrolling */
export function useLenis() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const l = new Lenis({ lerp: .11, wheelMultiplier: 1, smoothWheel: true }); window.__lenis = l;
    let id; const raf = t => { l.raf(t); id = requestAnimationFrame(raf); }; id = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(id); l.destroy(); window.__lenis = null; };
  }, []);
}
