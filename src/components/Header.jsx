import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useAnimation, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Heart, MapPin, Search, ShoppingBag, User, X } from 'lucide-react';
import { ScrollProgress, Swap } from '../motion.jsx';
import { ProductArt, SportIcon } from '../art.jsx';
import { POPULAR_CITIES, SPORTS } from '../data/catalog.js';
import { cityFor, etaFor, highlight, hrefFor, searchProducts } from '../lib/shop.js';
import { FREE_SHIP, money, useStore } from '../store.jsx';
import { Button } from '../ui.jsx';
import { INTRO_END, introPending } from './LogoLoader.jsx';
import OtpSignIn from './OtpSignIn.jsx';

const ease = [.22, 1, .36, 1];
export const toTop = () => (window.__lenis ? window.__lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' }));

export function Logo({ light = false }) {
  return <Link to="/" aria-label="ZENMOOVZ home" className="flex shrink-0 items-center gap-2.5 font-display text-[1.65rem] font-bold">
    <img src={light ? '/logo-white.png' : '/logo.png'} alt="" className="h-9 w-9 object-contain sm:h-10 sm:w-10" />
    <span className={`hidden min-[420px]:inline ${light ? 'text-white' : 'text-ink'}`}>ZENMOOVZ</span>
  </Link>;
}

/* Header logo: the animated Zenmoovz logo (plays once, then holds the final frame).
   - First visit: it waits for the intro to leave, so the animation is actually seen.
   - Reduced motion: shows a still of the final frame instead.
   The artwork canvas has transparent padding, so the image is centred and allowed to overflow: the header keeps its height.
   --h is the canvas height; the visible logo is ~2.82 x --h wide and the mark is ~0.59 x --h tall. */
const LOGO_WEBP = '/zenmoovz-logo-intro.webp', LOGO_STILL = '/zenmoovz-logo-header.png';
export function HeaderLogo() {
  const [calm] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [go, setGo] = useState(() => !introPending());
  useEffect(() => {
    if (go) return;
    const start = () => setGo(true), failsafe = setTimeout(start, 2600);
    window.addEventListener(INTRO_END, start);
    return () => { window.removeEventListener(INTRO_END, start); clearTimeout(failsafe); };
  }, [go]);
  useEffect(() => { if (!calm) new Image().src = LOGO_WEBP; }, [calm]);   // warm the cache while the intro plays
  return <Link to="/" aria-label="ZENMOOVZ home" className="relative block h-10 shrink-0 [--h:52px] sm:[--h:64px]" style={{ width: 'calc(var(--h) * 2.82)' }}>
    {go && <img src={calm ? LOGO_STILL : LOGO_WEBP} alt="" decoding="async" draggable="false" className="pointer-events-none absolute top-1/2 max-w-none -translate-y-1/2" style={{ height: 'var(--h)', left: 'calc(var(--h) * -.134)' }} />}
  </Link>;
}

function Modal({ open, onClose, label, children }) {
  useEffect(() => { if (!open) return; const k = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [open, onClose]);
  return createPortal(<AnimatePresence>{open && <motion.div className="fixed inset-0 z-[120] grid place-items-end p-0 sm:place-items-center sm:p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="absolute inset-0 bg-ink/60" onClick={onClose} />
    <motion.div role="dialog" aria-modal="true" aria-label={label} className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-[6px] sm:p-8"
      initial={{ y: 60, opacity: 0, scale: .97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0, scale: .97 }} transition={{ duration: .4, ease }}>
      <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-ink/50 transition hover:rotate-90 hover:bg-mist hover:text-ink"><X size={18} /></button>
      {children}
    </motion.div></motion.div>}</AnimatePresence>, document.body);
}

/* ───────── Location ───────── */
function LocationModal({ open, onClose }) {
  const { location, setLocation } = useStore();
  const [pin, setPin] = useState(''), [err, setErr] = useState(''), [shake, setShake] = useState(0), [done, setDone] = useState(null);
  useEffect(() => { if (open) { setDone(null); setErr(''); setPin(location?.pin || ''); } }, [open]);
  const apply = (p, city) => { setLocation(p, city); setDone({ pin: p, city: city || cityFor(p) }); };
  const submit = e => { e.preventDefault(); if (!/^[1-9]\d{5}$/.test(pin)) { setErr('Enter a valid 6-digit pincode.'); setShake(s => s + 1); return; } setErr(''); apply(pin); };
  return <Modal open={open} onClose={onClose} label="Choose delivery location">
    <AnimatePresence mode="wait" initial={false}>
      {done ? <motion.div key="done" className="py-4 text-center" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
        <motion.span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}><Check size={30} strokeWidth={3} /></motion.span>
        <h2 className="mt-5 text-2xl font-extrabold tracking-tight">{done.city || `Pincode ${done.pin}`}</h2>
        <p className="mt-1 text-sm text-ink/55">We deliver here. Pincode {done.pin}.</p>
        <p className="mx-auto mt-4 w-fit rounded-[3px] bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-700">Arrives {etaFor(done.pin)}</p>
        <p className="mt-3 text-xs text-ink/45">Free delivery on orders above {money(FREE_SHIP)}.</p>
        <div className="mt-6"><Button className="w-full" onClick={onClose}>Keep shopping</Button></div>
      </motion.div>
        : <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy/[.06] text-accent"><MapPin size={22} /></span>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">Where should we deliver?</h2>
          <p className="mt-1 text-sm text-ink/55">Add your pincode to see delivery dates on every product.</p>
          <form onSubmit={submit} className="mt-5">
            <motion.div key={shake} animate={shake ? { x: [0, -9, 9, -6, 6, 0] } : {}} transition={{ duration: .4 }} className="flex gap-2">
              <input autoFocus inputMode="numeric" maxLength={6} value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setErr(''); }} placeholder="6-digit pincode" aria-label="Pincode" aria-invalid={!!err}
                className={`min-w-0 flex-1 rounded-[3px] border bg-white px-5 py-3 text-sm outline-none transition focus:border-navy focus:ring-4 focus:ring-accent/15 ${err ? 'border-red-400' : 'border-navy/15'}`} />
              <Button type="submit">Check</Button>
            </motion.div>
            <AnimatePresence>{err && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden pl-2 pt-2 text-xs font-medium text-red-500" role="alert">{err}</motion.p>}</AnimatePresence>
          </form>
          <p className="mb-3 mt-6 text-xs font-semibold text-ink/50">Or pick a city</p>
          <div className="flex flex-wrap gap-2">{POPULAR_CITIES.map(([c, p], i) => <motion.button key={c} type="button" onClick={() => apply(p, c)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .05 + i * .03 }} whileHover={{ y: -2 }} whileTap={{ scale: .94 }}
            className="rounded-[3px] border border-navy/15 px-4 py-2 text-xs font-semibold text-ink/70 transition-colors hover:border-navy hover:bg-navy hover:text-white">{c}</motion.button>)}</div>
          {location && <button onClick={() => { setLocation(null); onClose(); }} className="mt-6 text-xs font-semibold text-ink/45 underline-offset-4 hover:text-accent hover:underline">Clear saved location</button>}
        </motion.div>}
    </AnimatePresence>
  </Modal>;
}

function LocationButton({ onClick }) {
  const { location } = useStore(), reduce = useReducedMotion();
  const label = location ? location.city : 'Select location', cap = location ? 'Delivering to' : 'Deliver to';
  return <motion.button onClick={onClick} initial="rest" animate="rest" whileHover="hover" whileTap="tap" aria-label={location ? `Delivering to ${location.city}. Change location` : 'Select delivery location'}
    variants={{ rest: { scale: 1 }, hover: { scale: 1 }, tap: { scale: .96 } }} transition={{ type: 'spring', stiffness: 500, damping: 28 }}
    className="group relative flex shrink-0 items-center gap-2 overflow-hidden rounded-[3px] px-2 py-1.5 text-left transition-colors hover:bg-ink/[.05] md:pr-3">
    {/* pin: drops in, hops on hover, pulses until a location is chosen */}
    <span className="relative grid h-7 w-7 shrink-0 place-items-center">
      {!location && !reduce && <span aria-hidden className="absolute inset-[3px] rounded-full border border-accent/60" style={{ animation: 'pinRing 2.2s ease-out infinite' }} />}
      <motion.span key={location ? 'set' : 'unset'} className={location ? 'text-accent' : 'text-ink'}
        initial={{ y: -14, opacity: 0, scale: .6 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 13 }}
        variants={{ hover: { y: [0, -5, 0], rotate: [0, -8, 6, 0], transition: { duration: .55, ease: 'easeOut' } } }}>
        <MapPin size={18} strokeWidth={1.7} fill={location ? 'currentColor' : 'none'} fillOpacity={.15} />
      </motion.span>
      <motion.span aria-hidden className="absolute bottom-[3px] h-[2px] w-2.5 rounded-full bg-ink/25" variants={{ rest: { scaleX: 1, opacity: .5 }, hover: { scaleX: [1, .55, 1], opacity: [.5, .2, .5], transition: { duration: .55 } } }} />
    </span>
    <span className="hidden leading-tight min-[480px]:block">
      <span className="relative block h-[13px] overflow-hidden text-[10px] uppercase tracking-[.12em] text-ink/45">
        <AnimatePresence mode="popLayout" initial={false}><motion.span key={cap} className="block" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: .3, ease }}>{cap}</motion.span></AnimatePresence>
      </span>
      <span className="relative block h-[19px] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}><motion.span key={label} className="block max-w-[150px] truncate text-[13px] font-semibold text-ink" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} transition={{ duration: .38, ease }}>{label}</motion.span></AnimatePresence>
        {/* copper underline draws in on hover */}
        <motion.span aria-hidden className="absolute bottom-0 left-0 h-px w-full origin-left bg-accent" variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1, transition: { duration: .35, ease } } }} />
      </span>
    </span>
    {/* one soft light sweep so the button invites a tap (only until a location is set) */}
    {!location && !reduce && <motion.span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-accent/15 to-transparent"
      animate={{ x: ['0%', '480%'] }} transition={{ duration: 1.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4.5, delay: 2 }} />}
  </motion.button>;
}

/* ───────── Shopper runner: a man pushing a cart sprints left → right inside the search bar on click ───────── */
const SWING = { duration: .5, repeat: Infinity, ease: 'easeInOut' };
function Leg({ x, y, from, to, color }) {
  return <g transform={`translate(${x} ${y})`}>
    <motion.g style={{ originX: 0, originY: 0 }} initial={{ rotate: from }} animate={{ rotate: [from, to, from] }} transition={SWING}>
      <path d="M0 0 L2.4 6 L0 12.5 L3.8 12.5" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </motion.g>
  </g>;
}
function Wheel({ cx, cy }) {
  return <g transform={`translate(${cx} ${cy})`}>
    <motion.g style={{ originX: 0, originY: 0 }} animate={{ rotate: 360 }} transition={{ duration: .45, repeat: Infinity, ease: 'linear' }}>
      <circle r="3.2" fill="#fff" stroke="#0A0A0A" strokeWidth="1.6" />
      <path d="M-3.2 0H3.2M0 -3.2V3.2" stroke="#0A0A0A" strokeWidth=".9" />
    </motion.g>
  </g>;
}
function ShopperMan() {
  const ink = '#0A0A0A', accent = '#B4532A';
  return <svg viewBox="0 0 66 42" className="h-[38px] w-auto overflow-visible" aria-hidden>
    {/* speed lines trailing behind */}
    {[[-6, 18, 10], [-10, 25, 14], [-4, 32, 8]].map(([x, y, w], i) =>
      <motion.line key={i} x1={x} y1={y} x2={x - w} y2={y} stroke={accent} strokeWidth="1.6" strokeLinecap="round"
        animate={{ opacity: [0, .7, 0], x: [4, -6] }} transition={{ duration: .55, repeat: Infinity, delay: i * .12 }} />)}
    <motion.g animate={{ y: [0, -1.1, 0] }} transition={{ duration: .25, repeat: Infinity, ease: 'easeInOut' }}>
      {/* back leg, then body, then front leg */}
      <Leg x={14} y={24} from={-34} to={34} color="#5b5b5b" />
      {/* torso leaning into the push */}
      <path d="M18.5 12.5 L14 24.5" stroke={accent} strokeWidth="5" strokeLinecap="round" />
      {/* head + cap */}
      <circle cx="20" cy="7.2" r="4.2" fill="#f2c9a5" />
      <path d="M15.8 6.4 A4.4 4.4 0 0 1 24.4 5.6 L26.6 6.6 L15.9 7.2Z" fill={ink} />
      {/* arm to the handle */}
      <path d="M18.4 14 L27 17.6 L33.2 20" fill="none" stroke="#f2c9a5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <Leg x={14} y={24} from={34} to={-34} color={ink} />
      {/* cart */}
      <path d="M32 19 L34.5 19.4" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      <path d="M33.5 20 H55 L51 32 H37.5Z" fill="#fff" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M40 20 L41.2 32 M47 20 L46.4 32 M35.4 26 H53" stroke={ink} strokeWidth=".8" opacity=".35" />
      {/* goodies in the cart: cricket ball + bat + shuttle */}
      <motion.g animate={{ y: [0, -1.4, 0] }} transition={{ duration: .25, repeat: Infinity, delay: .08 }}>
        <circle cx="40.5" cy="17.2" r="3" fill={accent} /><path d="M38.6 15.8 Q40.5 17.2 38.6 18.6" stroke="#fff" strokeWidth=".7" fill="none" />
        <rect x="45.5" y="9.5" width="3.2" height="11" rx="1.4" transform="rotate(14 47 15)" fill="#E9B99B" stroke={ink} strokeWidth=".8" />
        <rect x="46.4" y="5.5" width="1.4" height="5" rx=".7" transform="rotate(14 47 8)" fill={ink} />
      </motion.g>
      <Wheel cx={40.5} cy={36.2} /><Wheel cx={51} cy={36.2} />
    </motion.g>
    <ellipse cx="33" cy="40.2" rx="26" ry="1.3" fill={ink} opacity=".08" />
  </svg>;
}
function ShopperRun({ runKey, onDone }) {
  const reduce = useReducedMotion();
  if (!runKey || reduce) return null;
  return <div key={runKey} className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-[3px]" aria-hidden>
    {/* trail: a copper glow that gets painted along the bar as he passes, then fades */}
    <motion.div className="absolute inset-y-0 left-0 w-full origin-left"
      style={{ background: 'linear-gradient(90deg, rgba(180,83,42,0) 0%, rgba(180,83,42,.10) 55%, rgba(180,83,42,.22) 100%)' }}
      initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
      transition={{ duration: 1.7, times: [0, .75, 1], ease: 'easeInOut' }} />
    <motion.div className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-accent"
      initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
      transition={{ duration: 1.7, times: [0, .75, 1], ease: 'easeInOut' }} />
    {/* the man himself */}
    <motion.div className="absolute top-[3px]" initial={{ left: '-76px' }} animate={{ left: '100%' }}
      transition={{ duration: 1.5, ease: [.45, .05, .35, 1] }} onAnimationComplete={onDone}>
      <ShopperMan />
    </motion.div>
  </div>;
}
const HINTS = ['cricket bats', 'badminton rackets', 'football', 'swim goggles', 'basketball shoes', 'volleyball'];
const TRENDING = ['cricket bat', 'badminton racket', 'goggles', 'football', 'shoes'];
function SearchBox({ className = '' }) {
  const [q, setQ] = useState(''), [open, setOpen] = useState(false), [idx, setIdx] = useState(-1), [hint, setHint] = useState(0), [run, setRun] = useState(0), [running, setRunning] = useState(false);
  const launch = () => { setRun(k => k + 1); setRunning(true); };
  const navigate = useNavigate(), wrap = useRef(null), input = useRef(null), [params] = useSearchParams(), loc = useLocation();
  useEffect(() => { const t = setInterval(() => setHint(h => (h + 1) % HINTS.length), 2600); return () => clearInterval(t); }, []);
  useEffect(() => { setQ(loc.pathname === '/' ? params.get('q') || '' : ''); }, [loc.pathname, params.get('q')]);
  useEffect(() => { const f = e => { if (!wrap.current?.contains(e.target)) setOpen(false); }; document.addEventListener('pointerdown', f); return () => document.removeEventListener('pointerdown', f); }, []);
  const dq = useDeferredValue(q), results = useMemo(() => dq.trim() ? searchProducts(dq) : [], [dq]), shown = results.slice(0, 5);
  const go = term => { setOpen(false); input.current?.blur(); navigate(hrefFor({ q: term })); toTop(); };
  const key = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(shown.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(-1, i - 1)); }
    else if (e.key === 'Escape') { setOpen(false); input.current?.blur(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (idx >= 0 && shown[idx]) { setOpen(false); navigate(`/product/${shown[idx].id}`); } else if (q.trim()) go(q.trim()); }
  };
  return <div ref={wrap} className={`relative ${className}`} role="search">
    <div onPointerDown={() => { if (!running) launch(); }} className={`relative flex items-center gap-2 rounded-[3px] border bg-mist/70 px-4 transition-all duration-300 ${open ? 'border-navy bg-white shadow-lift' : 'border-transparent hover:border-navy/20'}`}>
      <ShopperRun runKey={run} onDone={() => setRunning(false)} />
      <motion.span animate={open ? { rotate: [0, -14, 0], scale: [1, 1.2, 1] } : {}} transition={{ duration: .4 }} className="text-ink/45"><Search size={18} /></motion.span>
      <div className="relative min-w-0 flex-1">
        <input ref={input} value={q} onChange={e => { setQ(e.target.value); setOpen(true); setIdx(-1); }} onFocus={() => setOpen(true)} onKeyDown={key} aria-label="Search products" autoComplete="off" role="combobox" aria-expanded={open} className="h-11 w-full bg-transparent text-sm outline-none" />
        {!q && <span className={`pointer-events-none absolute inset-0 flex items-center overflow-hidden text-sm text-ink/40 transition-opacity duration-300 ${running ? 'opacity-30' : ''}`} aria-hidden><span className="mr-1">Search</span>
          <span className="relative h-5 flex-1 overflow-hidden"><AnimatePresence mode="popLayout" initial={false}><motion.span key={hint} className="absolute left-0 top-0 whitespace-nowrap" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} transition={{ duration: .35, ease }}>{HINTS[hint]}</motion.span></AnimatePresence></span></span>}
      </div>
      <AnimatePresence>{q && <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} onClick={() => { setQ(''); input.current?.focus(); }} aria-label="Clear search" className="grid h-6 w-6 place-items-center rounded-full bg-ink/10 text-ink/60 hover:bg-ink/20"><X size={13} /></motion.button>}</AnimatePresence>
    </div>
    <AnimatePresence>{open && <motion.div initial={{ opacity: 0, y: -8, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .22, ease }} className="absolute left-0 right-0 top-[calc(100%+8px)] z-[70] overflow-hidden rounded-3xl border border-navy/10 bg-white p-2 shadow-lift">
      {!q.trim() ? <div className="p-3"><p className="mb-3 text-xs font-semibold text-ink/50">Trending searches</p><div className="flex flex-wrap gap-2">{TRENDING.map(t => <button key={t} onClick={() => go(t)} className="rounded-[3px] border border-navy/15 px-3.5 py-1.5 text-xs font-semibold text-ink/70 transition hover:bg-navy hover:text-white">{t}</button>)}</div>
        <p className="mb-2 mt-5 text-xs font-semibold text-ink/50">Shop by sport</p><div className="grid grid-cols-4 gap-1">{SPORTS.slice(1).map(s => <Link key={s.id} to={hrefFor({ sport: s.id })} onClick={() => { setOpen(false); toTop(); }} className="flex flex-col items-center gap-1 rounded-2xl p-2 text-[11px] font-semibold text-ink/65 transition hover:bg-mist hover:text-accent"><SportIcon id={s.id} size={20} />{s.name}</Link>)}</div></div>
        : shown.length ? <div>{shown.map((p, i) => <Link key={p.id} to={`/product/${p.id}`} onClick={() => setOpen(false)} onMouseEnter={() => setIdx(i)} className={`flex items-center gap-3 rounded-2xl p-2 transition-colors ${idx === i ? 'bg-mist' : ''}`}>
          <ProductArt product={p} className="h-12 w-12 shrink-0 overflow-hidden rounded-xl" shadow={false} />
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{highlight(p.name, q).map((s, j) => s.hit ? <mark key={j} className="rounded bg-sun/40 px-0.5 text-inherit">{s.part}</mark> : <span key={j}>{s.part ?? s}</span>)}</span><span className="text-xs capitalize text-ink/45">{p.sport} · {p.cat}</span></span>
          <span className="text-sm font-bold">{money(p.price)}</span></Link>)}
          <button onClick={() => go(q.trim())} className="mt-1 w-full rounded-2xl bg-mist px-4 py-3 text-left text-sm font-semibold text-accent transition hover:bg-navy hover:text-white">See all {results.length} results for “{q.trim()}”</button></div>
          : <p className="p-5 text-center text-sm text-ink/50">Nothing matches “{q.trim()}”. Try “bat”, “racket” or “goggles”.</p>}
    </motion.div>}</AnimatePresence>
  </div>;
}

/* ───────── Sign in: name + mobile, then a 4-digit OTP (components/OtpSignIn.jsx, codes in lib/otp.js) ───────── */
const SignIn = OtpSignIn;

/* ───────── Header icon buttons: profile · wishlist · cart ───────── */
const MLink = motion.create(Link);
const SPRING = { type: 'spring', stiffness: 520, damping: 14 };
const DOTS = Array.from({ length: 8 }, (_, i) => ({ a: (i / 8) * Math.PI * 2 + .3, d: 17 + (i % 2) * 6, s: .8 + (i % 3) * .25 }));
const CONFETTI = ['#B4532A', '#B08D57', '#0A0A0A', '#E9B99B'];
/* radial burst of tiny hearts / confetti dots + an expanding ring; remounts (replays) whenever `id` changes */
function Burst({ id, hearts = false, color = '#B4532A' }) {
  if (!id) return null;
  return <span key={id} aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
    <motion.span className="absolute h-8 w-8 rounded-full border-2" style={{ borderColor: color }} initial={{ scale: .3, opacity: .8 }} animate={{ scale: 1.7, opacity: 0 }} transition={{ duration: .6, ease: 'easeOut' }} />
    {DOTS.map((b, i) => <motion.span key={i} className="absolute" style={{ color: hearts ? color : CONFETTI[i % 4] }}
      initial={{ x: 0, y: 0, scale: 0, opacity: 1 }} animate={{ x: Math.cos(b.a) * b.d, y: Math.sin(b.a) * b.d, scale: [0, b.s, 0], opacity: [1, 1, 0], rotate: hearts ? (i % 2 ? 40 : -40) : 0 }} transition={{ duration: .75, ease: 'easeOut' }}>
      {hearts ? <Heart size={9} fill="currentColor" strokeWidth={0} /> : <span className="block h-1.5 w-1.5 rounded-full bg-current" />}
    </motion.span>)}
  </span>;
}
/* tells us when a number changed and by how much, so the icon can react to items being added/removed anywhere on the site */
function useChange(v) {
  const prev = useRef(v), [d, setD] = useState({ k: 0, delta: 0 });
  useEffect(() => { if (v !== prev.current) { setD(o => ({ k: o.k + 1, delta: v - prev.current })); prev.current = v; } }, [v]);
  return d;
}
const badge = (n, cls) => <motion.span key={n} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 650, damping: 11 }}
  className={`absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-semibold text-white ${cls}`}>{n}</motion.span>;

function ProfileButton({ onSignIn }) {
  const { user } = useStore(), navigate = useNavigate(), loc = useLocation(), reduce = useReducedMotion(), [bid, setBid] = useState(0);
  const initials = user ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '';
  const here = loc.pathname === '/profile';
  return <motion.button initial="rest" whileHover="hover" whileTap={{ scale: .86 }} transition={SPRING}
    onClick={() => { if (!reduce) setBid(k => k + 1); user && user.phoneVerified ? navigate('/profile') : onSignIn(); }} aria-label={user ? `${user.name}, open your profile` : 'Sign in'} aria-current={here ? 'page' : undefined}
    className={`relative grid h-11 w-11 place-items-center rounded-full transition-colors ${here ? 'bg-ink/[.07]' : 'hover:bg-ink/[.05]'}`}>
    <Burst id={bid} />
    {user
      ? <motion.span key={initials} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }} className="grid h-8 w-8 place-items-center rounded-full bg-ink text-[11px] font-semibold tracking-wide text-white">{initials}</motion.span>
      : <motion.span variants={{ hover: { y: [0, -3, 0], rotate: [0, -10, 8, 0], transition: { duration: .5 } } }} className="inline-flex"><User size={20} strokeWidth={1.7} /></motion.span>}
  </motion.button>;
}

function WishButton() {
  const { wishlist } = useStore(), n = wishlist.length, ch = useChange(n), ctrl = useAnimation(), reduce = useReducedMotion(), [bid, setBid] = useState(0);
  /* a product got hearted / un-hearted anywhere: big pop + burst, or a soft shrink */
  useEffect(() => {
    if (!ch.k) return;
    if (ch.delta > 0) { ctrl.start({ scale: [1, .6, 1.45, .9, 1], rotate: [0, -14, 10, -4, 0], transition: { duration: .65, times: [0, .2, .5, .75, 1] } }); if (!reduce) setBid(k => k + 1); }
    else ctrl.start({ scale: [1, .75, 1], y: [0, 2, 0], transition: { duration: .35 } });
  }, [ch.k]);
  const click = () => { ctrl.start({ scale: [1, .68, 1.3, 1], transition: { duration: .45 } }); if (!reduce) setBid(k => k + 1); };
  return <MLink to="/wishlist" onClick={click} initial="rest" whileHover="hover" whileTap={{ scale: .88 }} transition={SPRING} aria-label={`Wishlist, ${n} saved`} className="relative grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-ink/[.05]">
    <Burst id={bid} hearts />
    {/* heartbeat on hover */}
    <motion.span variants={{ hover: { scale: [1, 1.2, 1, 1.14, 1], transition: { duration: .8, repeat: Infinity, repeatDelay: .15 } } }} className="inline-flex">
      <motion.span animate={ctrl} className={`inline-flex transition-colors duration-300 ${n ? 'text-accent' : ''}`}>
        <Heart size={20} strokeWidth={1.7} fill={n ? 'currentColor' : 'none'} />
      </motion.span>
    </motion.span>
    {n > 0 && badge(n, 'bg-ink')}
  </MLink>;
}

function CartLink() {
  const { cart } = useStore(), n = cart.reduce((s, x) => s + x.qty, 0), ch = useChange(n), ctrl = useAnimation(), reduce = useReducedMotion(), [bid, setBid] = useState(0), [flash, setFlash] = useState(null);
  /* something was added: the bag drops, squashes and bounces, confetti pops and a "+1" floats up */
  useEffect(() => {
    if (!ch.k) return;
    if (ch.delta > 0) {
      ctrl.start({ y: [0, -10, 0, -3, 0], scaleY: [1, 1.1, .86, 1.04, 1], scaleX: [1, .92, 1.12, .98, 1], transition: { duration: .65, times: [0, .25, .5, .75, 1] } });
      if (!reduce) { setBid(k => k + 1); setFlash({ k: ch.k, t: `+${ch.delta}` }); const t = setTimeout(() => setFlash(null), 900); return () => clearTimeout(t); }
    } else ctrl.start({ scale: [1, .82, 1], transition: { duration: .35 } });
  }, [ch.k]);
  const click = () => { ctrl.start({ rotate: [0, -16, 12, -6, 0], transition: { duration: .55 } }); if (!reduce) setBid(k => k + 1); };
  return <MLink id="cart-btn" to="/cart" onClick={click} initial="rest" whileHover="hover" whileTap={{ scale: .88 }} transition={SPRING} aria-label={`Cart, ${n} items`} className="relative grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-ink/[.05]">
    <Burst id={bid} />
    {/* gentle swing like a shopping bag on hover */}
    <motion.span style={{ originY: 0, originX: .5 }} variants={{ hover: { rotate: [0, -12, 9, -5, 0], transition: { duration: .6 } } }} className="inline-flex">
      <motion.span animate={ctrl} style={{ originY: 1 }} className="inline-flex"><ShoppingBag size={20} strokeWidth={1.7} /></motion.span>
    </motion.span>
    {n > 0 && badge(n, 'bg-accent')}
    <AnimatePresence>{flash && <motion.span key={flash.k} aria-hidden className="pointer-events-none absolute -top-1 right-0 text-[12px] font-extrabold text-accent"
      initial={{ y: 6, opacity: 0, scale: .5 }} animate={{ y: -14, opacity: 1, scale: 1.1 }} exit={{ y: -22, opacity: 0 }} transition={{ duration: .45, ease: 'easeOut' }}>{flash.t}</motion.span>}</AnimatePresence>
  </MLink>;
}

/* ───────── Sport strip: quiet text tabs with a sliding underline. Services now lives in the docked panel on the right edge (ServicesDock.jsx). ───────── */
function SportStrip() {
  const [params] = useSearchParams(), loc = useLocation(), navigate = useNavigate();
  const active = loc.pathname === '/' ? (params.get('sport') || 'all') : null, rail = useRef(null);
  useEffect(() => { const el = rail.current?.querySelector('[aria-current="true"]'); el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); }, [active]);
  const pick = id => { navigate(hrefFor({ sport: id })); toTop(); };
  return <nav aria-label="Shop by sport" className="relative border-t border-ink/[.08]">
    <div className="section-wrap flex items-stretch">
      <div className="relative min-w-0 flex-1">
        <div ref={rail} className="no-scrollbar flex gap-6 overflow-x-auto pr-6 sm:gap-9">
          {SPORTS.map(s => { const on = active === s.id;
            return <button key={s.id} onClick={() => pick(s.id)} aria-current={on ? 'true' : undefined}
              className={`relative shrink-0 py-3.5 text-[12px] font-semibold uppercase tracking-[.14em] outline-none transition-colors focus-visible:text-accent ${on ? 'text-ink' : 'text-ink/50 hover:text-ink'}`}>
              {s.name}
              {on && <motion.span layoutId="sport-underline" className="absolute inset-x-0 bottom-0 h-[2px] bg-ink" transition={{ duration: .3, ease }} />}
            </button>; })}
        </div>
        {/* a soft fade at the right edge: a hint that there are more sports to scroll */}
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent xl:hidden" />
      </div>
    </div>
  </nav>;
}

/* ───────── Header ───────── */
const PROMOS = [`Free delivery above ${money(FREE_SHIP)}`, 'Extra 5% off on UPI payments', 'Easy 7-day returns on unused gear'];
export default function Header() {
  const [compact, setCompact] = useState(false), [locOpen, setLocOpen] = useState(false), [promo, setPromo] = useState(0);
  const { authOpen, setAuthOpen } = useStore();
  const { scrollY } = useScroll(); useMotionValueEvent(scrollY, 'change', v => setCompact(v > 48));
  useEffect(() => { const t = setInterval(() => setPromo(p => (p + 1) % PROMOS.length), 3200); return () => clearInterval(t); }, []);
  return <header className="sticky top-0 z-50 bg-white shadow-[0_1px_0_rgba(10,10,10,.08)]">
    <motion.div animate={{ height: compact ? 0 : 32 }} transition={{ duration: .3, ease }} className="overflow-hidden bg-navy text-white">
      <div className="relative mx-auto h-8 max-w-[1240px] text-center text-[11px] font-medium uppercase tracking-[.16em]">
        <AnimatePresence mode="popLayout" initial={false}><motion.p key={promo} className="absolute inset-x-0 top-0 flex h-8 items-center justify-center" initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -22, opacity: 0 }} transition={{ duration: .4, ease }}>{PROMOS[promo]}</motion.p></AnimatePresence>
      </div>
    </motion.div>
    <motion.div animate={{ minHeight: compact ? 60 : 76 }} transition={{ duration: .3, ease }} className="section-wrap flex items-center gap-2 sm:gap-3 md:gap-5">
      <HeaderLogo />
      <LocationButton onClick={() => setLocOpen(true)} />
      <SearchBox className="hidden flex-1 md:block" />
      <div className="ml-auto flex items-center gap-0.5 sm:gap-1 md:ml-0"><ProfileButton onSignIn={() => setAuthOpen(true)} /><WishButton /><CartLink /></div>
    </motion.div>
    <div className="section-wrap pb-2 md:hidden"><SearchBox /></div>
    <SportStrip />
    <ScrollProgress />
    <LocationModal open={locOpen} onClose={() => setLocOpen(false)} />
    <SignIn open={authOpen} onClose={() => setAuthOpen(false)} />
  </header>;
}
