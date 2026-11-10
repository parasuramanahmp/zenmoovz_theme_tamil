import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, Mail, MapPin, Phone } from 'lucide-react';
import { Swap } from '../motion.jsx';
import NavyWordmark from './NavyWordmark.jsx';
import { SPORTS } from '../data/catalog.js';
import { INSTAGRAM_PROFILE } from '../data/reels.js';
import { hrefFor } from '../lib/shop.js';
import { Button } from '../ui.jsx';
import { toTop } from './Header.jsx';

function FLink({ to, href, children, onClick }) {
  const c = 'group relative w-fit text-sm text-ink/60 transition-colors hover:text-navy', u = <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-navy transition-transform duration-300 group-hover:scale-x-100" />;
  return href ? <a href={href} className={c}>{children}{u}</a> : <Link to={to} onClick={onClick} className={c}>{children}{u}</Link>;
}
/* Brand block extras: social buttons and contact lines. Brand icons are inline SVG (lucide no longer ships them).
   Instagram comes from INSTAGRAM_PROFILE in data/reels.js; replace the other links with your own handles. */
const Ico = ({ fill, children }) => <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
const SOCIALS = [
  ['Instagram', INSTAGRAM_PROFILE, <Ico key="i"><rect x="2.5" y="2.5" width="19" height="19" rx="5" /><circle cx="12" cy="12" r="4.2" /><path d="M17.6 6.4h.01" /></Ico>],
  ['Facebook', 'https://www.facebook.com/', <Ico key="f" fill><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></Ico>],
  ['X', 'https://x.com/', <Ico key="x" fill><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.29 19.5h2.04L6.49 3.24H4.3z" /></Ico>],
  ['LinkedIn', 'https://www.linkedin.com/', <Ico key="l" fill><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></Ico>],
];
const CONTACT = [
  [MapPin, 'Pallikaranai, Chennai', 'https://www.google.com/maps/search/?api=1&query=Pallikaranai%2C%20Chennai'],
  [Phone, '+91 98765 43210', 'tel:+919876543210'],
  [Mail, 'hello@zenmoovz.com', 'mailto:hello@zenmoovz.com'],
];
function BrandExtras() {
  return <>
    <div className="mt-6 flex flex-wrap gap-3">
      {SOCIALS.map(([name, href, icon]) => <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={`Zenmoovz on ${name}`} className="grid h-11 w-11 place-items-center rounded-full border border-ink/10 text-ink transition-colors duration-300 hover:border-navy hover:bg-navy hover:text-white focus-visible:border-navy">{icon}</a>)}
    </div>
    <ul className="mt-6 grid gap-3">
      {CONTACT.map(([Icon, text, href]) => <li key={text}><a href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})} className="group inline-flex items-center gap-3 text-sm text-ink/60 transition-colors hover:text-navy"><Icon size={18} strokeWidth={1.7} className="shrink-0 text-accent" aria-hidden="true" />{text}</a></li>)}
    </ul>
  </>;
}
/* The animated logo that replaces the old text brand block. It plays when the footer is uncovered (`on`), holds on the finished logo,
   then replays a few seconds later while the footer stays in view. Reduced motion: the finished logo as a still image. */
function FooterLogo({ on, calm }) {
  const v = useRef(null), t = useRef(0);
  useEffect(() => {
    const el = v.current; clearTimeout(t.current); if (!el || calm) return;
    if (on) { el.currentTime = 0; el.play().catch(() => {}); } else { el.pause(); el.currentTime = 0; }
    return () => clearTimeout(t.current);
  }, [on, calm]);
  const again = () => { t.current = setTimeout(() => { const el = v.current; if (el) { el.currentTime = 0; el.play().catch(() => {}); } }, 3600); };
  return <div className="relative aspect-[640/240] w-full max-w-[24rem] overflow-hidden bg-white">
    {calm
      ? <img src="/brand/footer-logo-poster.jpg" alt="ZENMOOVZ. Move with confidence." className="h-full w-full object-cover mix-blend-multiply" />
      : <video ref={v} src="/brand/footer-logo.mp4" poster="/brand/footer-logo-poster.jpg" muted playsInline preload="auto" onEnded={again} aria-label="ZENMOOVZ. Move with confidence." className="h-full w-full object-cover mix-blend-multiply" />}
  </div>;
}
function Newsletter() {
  const [email, setEmail] = useState(''), [done, setDone] = useState(false);
  return <form onSubmit={e => { e.preventDefault(); if (email.includes('@')) setDone(true); }} className="flex border-b border-ink/30 pb-1 transition-colors focus-within:border-ink">
    <input aria-label="Email address" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" className="min-w-0 flex-1 bg-transparent px-3 text-xs outline-none placeholder:text-ink/35" />
    <motion.button whileTap={{ scale: .9 }} aria-label="Subscribe" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-white"><Swap k={done}>{done ? <Check size={17} /> : <ArrowRight size={17} />}</Swap></motion.button>
  </form>;
}
function FooterBody({ fref, fixed, fx, rev }) {
  /* `seen` flips on once the footer is mostly uncovered and off again when it is covered, so the intro replays on every reveal */
  const [calm] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches), [seen, setSeen] = useState(false);
  useEffect(() => { const f = v => setSeen(o => v >= .55 ? true : v <= .08 ? false : o); f(rev.get()); return rev.on('change', f); }, [rev]);
  return <footer ref={fref} className={`${fixed ? 'fixed bottom-0 left-0 z-0' : 'relative'} w-full overflow-hidden bg-white text-ink`}>
    <motion.div style={fx} className="section-wrap relative z-10 pt-16">
      <div className="flex flex-col justify-between gap-8 border-b border-navy/10 pb-12 md:flex-row md:items-end">
        <h2 className="max-w-3xl text-5xl sm:text-7xl">Ready to move different?</h2>
        <Button to="/" variant="accent" onClick={toTop}>Shop the collection <ArrowUpRight size={17} /></Button>
      </div>
      <div className="grid gap-12 py-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div><FooterLogo on={seen} calm={calm} /><p className="mt-5 max-w-xs text-sm leading-6 text-ink/55">Built for the early starts, the last points, and every moment you choose to move.</p><BrandExtras /></div>
        <div><p className="mb-5 text-[11px] font-semibold uppercase tracking-[.18em] text-ink/45">Shop by sport</p><div className="grid gap-3">{SPORTS.slice(1).map(s => <FLink key={s.id} to={hrefFor({ sport: s.id })} onClick={toTop}>{s.name}</FLink>)}</div></div>
        <div><p className="mb-5 text-[11px] font-semibold uppercase tracking-[.18em] text-ink/45">Help</p><div className="grid gap-3"><FLink href="mailto:hello@zenmoovz.example">Contact us</FLink><FLink to="/services" onClick={toTop}>In-store services</FLink><FLink to="/wishlist">Your wishlist</FLink><FLink to="/cart">Your cart</FLink><span className="text-sm text-ink/60">Shipping information</span><span className="text-sm text-ink/60">Returns & exchanges</span></div></div>
        <div><p className="mb-5 text-[11px] font-semibold uppercase tracking-[.18em] text-ink/45">Get in the game</p><p className="mb-4 text-sm leading-6 text-ink/55">New drops and exclusive offers, straight to your inbox.</p><Newsletter /></div>
      </div>
      <NavyWordmark on={seen} calm={calm} /><div className="flex flex-col justify-between gap-2 border-t border-navy/10 py-5 text-xs text-ink/45 sm:flex-row"><span>© {new Date().getFullYear()} ZENMOOVZ. All rights reserved. Photos via <a href="https://www.pexels.com" target="_blank" rel="noreferrer" className="underline decoration-ink/20 underline-offset-2 hover:text-ink">Pexels</a>.</span><span>Move different. Play your way.</span></div>
    </motion.div></footer>;
}

/* Sticky footer reveal. The page is a card that slides up over the footer.
   - Footer fits the screen  → footer is pinned underneath (fixed) and uncovered as the card moves away.
   - Footer taller than screen (small laptops, phones) → it stays in the flow, but its content still glides out from
     under the card as it scrolls in, so the reveal works at every screen size.
   Reduced-motion users keep the layout but not the sliding / fading / scaling. */
export default function Shell({ children }) {
  const cref = useRef(null), fref = useRef(null), [fh, setFh] = useState(0), [fixed, setFixed] = useState(true);
  const [calm] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { const f = () => { const h = fref.current.offsetHeight; setFh(h); setFixed(h <= window.innerHeight); }; f(); const ro = new ResizeObserver(f); ro.observe(fref.current); window.addEventListener('resize', f); return () => { ro.disconnect(); window.removeEventListener('resize', f); }; }, []);
  const { scrollYProgress } = useScroll({ target: cref, offset: ['end end', 'end start'] });
  const rev = useTransform(scrollYProgress, p => fixed ? Math.min(1, p * window.innerHeight / (fh || 1)) : p), y = useTransform(rev, [0, 1], [-110, 0]), opacity = useTransform(rev, [0, 1], [.25, 1]), scale = useTransform(rev, [0, 1], [.94, 1]);
  return <><div ref={cref} className="relative z-10 min-h-screen rounded-b-[2rem] bg-mist shadow-[0_30px_80px_rgba(22,48,73,.18)]" style={{ marginBottom: fixed ? fh : 0 }}>{children}</div><FooterBody fref={fref} fixed={fixed} fx={calm ? undefined : { y, opacity, scale }} rev={rev} /></>;
}
