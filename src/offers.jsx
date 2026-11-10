import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Gift, Percent, Tag, Truck, Zap } from 'lucide-react';
import { Money } from './motion.jsx';
import { FREE_SHIP, money, pct, saved } from './store.jsx';

const ease = [.22, 1, .36, 1];

/* Offer lines that rotate on every product card — replace with your real offers */
const OFFERS = [[Percent, 'Extra 5% off on UPI payments'], [Truck, `Free delivery above ${money(FREE_SHIP)}`], [Zap, 'No-cost EMI on cards'], [Gift, 'Free grip & care guide']];

/* Amount that counts up from zero the first time it scrolls into view */
export function CountMoney({ value }) {
  const ref = useRef(null), seen = useInView(ref, { once: true });
  return <span ref={ref}><Money value={seen ? value : 0} /></span>;
}

/* Discount label: plain, sharp, no animation */
export function DiscountSeal({ value, size = 'md', className = '' }) {
  return <span className={`pointer-events-none inline-flex items-center bg-ink font-semibold tracking-[.08em] text-white ${size === 'lg' ? 'px-3 py-2 text-base' : 'px-2 py-1 text-[11px]'} ${className}`}>−{value}%</span>;
}

/* "You save ₹1,000": quiet text */
export function SavePill({ amount, className = '' }) {
  return <span className={`inline-flex w-fit items-center gap-1 text-xs font-medium text-accent ${className}`}>You save <CountMoney value={amount} /></span>;
}

/* Rotating one-line offers */
export function OfferTicker({ start = 0, className = '' }) {
  const [i, setI] = useState(start % OFFERS.length);
  useEffect(() => { const t = setInterval(() => setI(v => (v + 1) % OFFERS.length), 2600); return () => clearInterval(t); }, []);
  const [Icon, text] = OFFERS[i];
  return <div className={`relative h-5 overflow-hidden ${className}`} aria-live="off">
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.p key={i} className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium text-ink/60" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} transition={{ duration: .35, ease }}>
        <Icon size={13} /> {text}
      </motion.p>
    </AnimatePresence>
  </div>;
}

/* Old price whose strike-through is drawn in */
export const OldPrice = ({ children }) => <span className="relative text-xs text-ink/40">{children}
  <motion.span className="absolute left-0 top-1/2 h-px w-full origin-left bg-ink/40" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: .6, duration: .5, ease }} /></span>;

/* Product-page offer panel */
export function OfferPanel({ product }) {
  return <div className="mt-6 flex items-center gap-5 border border-ink/15 bg-white p-4 pr-6">
    <DiscountSeal value={pct(product)} size="lg" className="shrink-0" />
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-ink/45">Limited-time offer</p>
      <p className="mt-1 text-lg font-semibold">You save <CountMoney value={saved(product)} /></p>
      <OfferTicker className="mt-1.5" />
    </div>
  </div>;
}
