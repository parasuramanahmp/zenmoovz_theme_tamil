import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { LOGO } from '../data/logoPaths.js';

/* ── Tuning knobs ─────────────────────────────────────────────────────────────
   Intro       : the full logo animation, plays once per visit.
   Navigation  : a quicker version (blurred page behind it, no glow) that plays on EVERY navigation: page changes (home → product → cart …) and the
                 sport / category / brand / search views on the home page.
   ROUTE_SPEED : 1 = same speed as the intro, lower = faster (.45 ≈ 0.85 s, .35 ≈ 0.65 s, .7 ≈ 1.3 s).
   ROUTE_LOADER: set to false to switch the navigation animation off.                      */
export const ROUTE_LOADER = true;
export const ROUTE_SPEED = .45;
const LOGO_SECONDS = 1.85;               // how long the logo animation takes at speed 1 (last letter lands at ~1.84 s)
const TIMING = {
  intro: { speed: 1, hold: 2000 },       // hold = ms the panel stays before it leaves
  route: { speed: ROUTE_SPEED, hold: Math.round(LOGO_SECONDS * ROUTE_SPEED * 1000 + 120) },   // always long enough to finish
};
const BG = '#F3F1EC';                  // site background, so the logo looks printed on the page
const ease = [.22, 1, .36, 1];
const wipe = [.76, 0, .24, 1];

/* The animated logo: square pops in → Z shapes slide through → ball drops → wordmark rises letter by letter */
export function AnimatedLogo({ speed = 1, className = '' }) {
  const t = (s) => s * speed;                                    // scale every delay and duration together
  const piece = (delay) => ({
    initial: { x: -90, opacity: 0 }, animate: { x: 0, opacity: 1 },
    transition: { delay: t(delay), duration: t(.6), ease },
  });
  return <svg viewBox={`0 0 ${LOGO.width} ${LOGO.height}`} role="img" aria-label="Zenmoovz" className={className} style={{ overflow: 'visible' }}>
    <motion.path d={LOGO.square} fill={LOGO.navy} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      initial={{ scale: .8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: t(.6), ease }} />
    {/* white Z shapes slide in from the left, one after another, like a quick sprint start */}
    <motion.path d={LOGO.pieces.topLeft} fill="#fff" fillRule="evenodd" {...piece(.3)} />
    <motion.path d={LOGO.pieces.topMid} fill="#fff" fillRule="evenodd" {...piece(.4)} />
    <motion.path d={LOGO.pieces.bottomLeft} fill="#fff" fillRule="evenodd" {...piece(.5)} />
    <motion.path d={LOGO.pieces.bottomRight} fill="#fff" fillRule="evenodd" {...piece(.6)} />
    {/* the ball drops in with a little bounce */}
    <motion.circle cx={LOGO.ball.cx} cy={LOGO.ball.cy} r={LOGO.ball.r} fill="#fff"
      initial={{ y: -70, opacity: 0, scale: .6 }} animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: t(.85), type: 'spring', stiffness: 260, damping: 13, mass: .8 }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
    {LOGO.letters.map((d, i) => <motion.path key={i} d={d} fill={LOGO.navy} fillRule="evenodd"
      initial={{ y: 34, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: t(.95 + i * .055), duration: t(.5), ease }} />)}
  </svg>;
}

/* Intro: solid panel that wipes up.
   Route: the page behind is BLURRED (frosted glass) while only the logo animation plays on top, then it fades. No glow around the logo. */
const FROST = { backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', backgroundColor: 'rgba(243,241,236,.45)' };
function Panel({ variant }) {
  const { speed } = TIMING[variant], route = variant === 'route';
  return <motion.div role="status" aria-label="Loading Zenmoovz" className="pointer-events-none fixed inset-0 z-[100] grid place-items-center"
    style={route ? FROST : { backgroundColor: BG }}
    initial={route ? { opacity: 1 } : { y: 0 }}
    exit={route ? { opacity: 0, transition: { duration: .3, ease } } : { y: '-100%', transition: { duration: .7 * Math.max(speed, .6), ease: wipe } }}>
    <AnimatedLogo speed={speed} className="w-[min(46vw,260px)]" />
    {!route && <motion.span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 origin-left bg-accent"
      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: TIMING[variant].hold / 1000, ease: 'easeInOut' }} />}
  </motion.div>;
}

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const INTRO_END = 'zm:intro-end';           // fired when the first-visit intro starts to leave
const seen = () => { try { return sessionStorage.getItem('zm-intro') === '1'; } catch { return false; } };

/* True when the first-visit intro is about to play (used by the header logo to wait for it) */
export const introPending = () => !seen() && !reduced();

/* First load of a visit */
export function Intro() {
  const [show, setShow] = useState(() => !seen() && !reduced());
  useEffect(() => {
    if (!show) return;
    try { sessionStorage.setItem('zm-intro', '1'); } catch {}
    const id = setTimeout(() => { window.dispatchEvent(new Event(INTRO_END)); setShow(false); }, TIMING.intro.hold);
    return () => clearTimeout(id);
  }, []);
  return <AnimatePresence>{show && <Panel key="intro" variant="intro" />}</AnimatePresence>;
}

/* Every navigation: a new page (path change) or a new storefront view (?sport= ?cat= ?brand= ?q= ?view=).
   The logo animation plays over the new page with a transparent background, then fades. Sorting / price filters and
   #anchor scrolls are not navigation, so they stay quiet. It never blocks clicks and always removes itself on a timer. */
const VIEW_KEYS = ['sport', 'cat', 'brand', 'q', 'view'];
export function RouteLoader() {
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);
  const sig = pathname + '?' + VIEW_KEYS.map(k => (k === 'sport' && params.get(k) === 'all' ? '' : params.get(k)) || '').join('|');
  const [prev, setPrev] = useState(sig);
  const [busy, setBusy] = useState(false);
  if (prev !== sig) { setPrev(sig); if (ROUTE_LOADER && !reduced()) setBusy(true); }   // set during render → no flash of the new page
  useEffect(() => {
    if (!busy) return;
    const id = setTimeout(() => setBusy(false), TIMING.route.hold);
    return () => clearTimeout(id);
  }, [busy, prev]);
  return <AnimatePresence>{busy && <Panel key={prev} variant="route" />}</AnimatePresence>;
}
