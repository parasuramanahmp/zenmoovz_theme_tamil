import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Banknote, Check, ChevronDown, CreditCard, Landmark, Lock, MapPin, RotateCcw, ShieldCheck, ShoppingBag, Smartphone, Tag, Truck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore, money, goodsTotal, servicesOnly, shippingForCart, FREE_SHIP } from './store.jsx';
import { Button, EmptyState } from './ui.jsx';
import { Money, Swap, Words } from './motion.jsx';
import { ProductArt } from './art.jsx';
import OrderSummary, { OrderStepper } from './components/OrderSummary.jsx';

const ease = [.22, 1, .36, 1];
const METHODS = [['upi', 'UPI', Smartphone], ['card', 'Card', CreditCard], ['bank', 'Net banking', Landmark], ['cod', 'Cash on delivery', Banknote]];
const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Indian Bank'];
const inp = 'w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-navy focus:ring-4 focus:ring-accent/15';
const toTop = () => (window.__lenis ? window.__lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' }));

function Field({ label, error, shake, className = '', children }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-xs font-semibold text-ink/60">{label}</span>
    <motion.div key={shake} animate={error ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }} transition={{ duration: .4 }}>{children}</motion.div>
    <AnimatePresence>{error && <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="block overflow-hidden pt-1 text-xs text-red-500" role="alert">{error}</motion.span>}</AnimatePresence>
  </label>;
}

/* Live card that flips to the back while the CVV is focused */
function CardPreview({ f, flip }) {
  const digits = f.card.replace(/\s/g, '').padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim(), brand = ({ 4: 'VISA', 5: 'MASTERCARD', 6: 'RUPAY', 3: 'AMEX' })[f.card[0]] || 'CARD';
  return <div className="mx-auto mb-6 h-48 w-full max-w-sm [perspective:1000px]">
    <motion.div className="relative h-full w-full [transform-style:preserve-3d]" animate={{ rotateY: flip ? 180 : 0 }} transition={{ duration: .7, ease }}>
      <div className="absolute inset-0 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-navy via-[#2A2A2A] to-accent p-5 text-white shadow-xl [backface-visibility:hidden]">
        <div className="flex items-center justify-between"><span className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 to-amber-400" /><span className="text-xs font-black tracking-widest">{brand}</span></div>
        <p className="text-lg font-semibold tabular-nums tracking-[.14em] sm:text-xl">{digits}</p>
        <div className="flex items-end justify-between text-[10px] uppercase tracking-widest text-white/70"><span className="max-w-[60%] truncate text-xs font-semibold text-white">{f.name || 'Your name'}</span><span className="text-xs font-semibold text-white">{f.exp || 'MM/YY'}</span></div>
      </div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#2A2A2A] to-navy pt-6 text-white shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
        <span className="block h-10 bg-black/60" />
        <div className="mx-5 mt-5 flex items-center justify-end gap-3 rounded bg-white/90 px-3 py-2 text-navy"><span className="text-[10px] font-bold tracking-widest">CVV</span><span className="text-sm font-bold tracking-[.3em]">{f.cvv.padEnd(3, '•')}</span></div>
      </div>
    </motion.div>
  </div>;
}

/* ───── Order summary: item list, price breakdown, savings, delivery details and live payment method ───── */
function SummaryBody({ cart, t, method, address }) {
  const count = cart.reduce((s, p) => s + p.qty, 0), subtotal = t.mrp - t.save, svcOnly = servicesOnly(cart), left = Math.max(0, FREE_SHIP - t.goods);
  const eta = useMemo(() => new Date(Date.now() + 4 * 864e5).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }), []);
  const M = METHODS.find(m => m[0] === method), MI = M[2];
  const row = (label, value, cls = 'text-ink/55') => <div className={`flex justify-between ${cls}`}><span>{label}</span><span>{value}</span></div>;
  return <>
    <ul className="grid max-h-72 gap-4 overflow-auto pr-1">{cart.map((p, i) => <motion.li key={p.key || p.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .08 + i * .06, ease }} className="flex items-center gap-3">
      <span className="relative h-16 w-16 shrink-0"><ProductArt product={p} className="h-full w-full overflow-hidden rounded-xl" shadow={false} /><span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-navy px-1 text-[10px] font-bold text-white">{p.qty}</span></span>
      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{p.name}</span><span className="block text-xs text-ink/45">{p.brand}{p.size ? ` · ${p.size}` : ''}</span><span className="text-xs text-ink/45">{money(p.price)} × {p.qty}</span></span>
      <span className="text-right"><span className="block text-sm font-bold">{money(p.price * p.qty)}</span>{p.oldPrice > p.price && <span className="block text-[11px] text-ink/35 line-through">{money(p.oldPrice * p.qty)}</span>}</span>
    </motion.li>)}</ul>

    <div className="mt-5 space-y-3 border-y border-navy/10 py-5 text-sm">
      {row(`Items total (MRP) · ${count} ${count === 1 ? 'item' : 'items'}`, <Money value={t.mrp} />)}
      {t.save > 0 && row('Offer savings', <>− <Money value={t.save} /></>, 'font-semibold text-emerald-600')}
      {row('Subtotal', <Money value={subtotal} />, 'text-ink')}
      {row('Delivery', svcOnly ? 'Not needed' : t.ship ? money(t.ship) : 'Free', t.ship ? 'text-ink/55' : 'font-semibold text-emerald-600')}
      {left > 0 && !svcOnly && <div className="pt-1"><p className="mb-2 text-xs text-ink/55">Add <b className="text-ink">{money(left)}</b> more for free delivery</p>
        <div className="h-1.5 overflow-hidden rounded-full bg-navy/10"><motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }} animate={{ width: `${Math.min(100, t.goods / FREE_SHIP * 100)}%` }} transition={{ duration: .8, ease }} /></div></div>}
    </div>

    <div className="flex items-end justify-between pt-5"><div><p className="font-bold">Total to pay</p><p className="text-[11px] text-ink/40">Inclusive of all taxes</p></div><span className="text-2xl font-black"><Money value={t.total} /></span></div>
    {t.save > 0 && <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }} className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"><Tag size={14} /> You’re saving {money(t.save)} ({Math.round(t.save / t.mrp * 100)}% off) on this order</motion.p>}

    <div className="mt-5 grid gap-3 border-t border-navy/10 pt-5 text-sm">
      {svcOnly
        ? <div className="flex items-start gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-accent" /><div><p className="font-semibold">Done at our Pallikaranai counter</p><p className="text-xs text-ink/45">Nothing is shipped. Drop your gear in after you order.</p></div></div>
        : <><div className="flex items-start gap-3"><Truck size={16} className="mt-0.5 shrink-0 text-accent" /><div><p className="font-semibold">Estimated delivery {eta}</p><p className="text-xs text-ink/45">{t.ship ? 'Standard delivery' : 'Free standard delivery'}</p></div></div>
      <div className="flex items-start gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-accent" />{address
        ? <div className="min-w-0 text-xs leading-5 text-ink/60"><p className="text-sm font-semibold text-ink">{address.name}</p><p>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p><p>{address.city}, {address.pin}</p></div>
        : <div><p className="font-semibold">Delivery address</p><Link to="/profile" className="text-xs text-accent hover:underline">Add an address in your profile</Link></div>}</div></>}
      <div className="flex items-start gap-3"><MI size={16} className="mt-0.5 shrink-0 text-accent" /><div><p className="text-xs text-ink/45">Paying with</p><Swap k={method}><p className="font-semibold">{M[1]}</p></Swap></div></div>
    </div>
    <p className="mt-5 flex items-center justify-center gap-2 text-[11px] text-ink/40"><ShieldCheck size={14} /> Secure 256-bit encrypted checkout (demo)</p>
  </>;
}
function Summary({ cart, t, method, address }) {
  const [open, setOpen] = useState(false), count = cart.reduce((s, p) => s + p.qty, 0);
  return <>
    {/* mobile / tablet: collapsible bar at the top so the summary is never buried under the form */}
    <div className="rounded-[6px] border border-navy/10 bg-navy/[.03] lg:hidden">
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
        <span className="flex items-center gap-2 text-sm font-bold text-accent"><ShoppingBag size={16} /> {open ? 'Hide' : 'Show'} order summary <motion.span animate={{ rotate: open ? 180 : 0 }} className="inline-flex"><ChevronDown size={16} /></motion.span></span>
        <span className="text-base font-black"><Money value={t.total} /></span>
      </button>
      <AnimatePresence initial={false}>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .4, ease }} className="overflow-hidden"><div className="px-5 pb-5"><SummaryBody cart={cart} t={t} method={method} address={address} /></div></motion.div>}</AnimatePresence>
    </div>
    {/* desktop: sticky card on the right */}
    <aside className="hidden rounded-[6px] border border-navy/10 bg-navy/[.03] p-6 lg:sticky lg:top-24 lg:block">
      <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-black">Order summary</h2><Link to="/cart" className="text-xs font-semibold text-accent hover:underline">Edit cart</Link></div>
      <SummaryBody cart={cart} t={t} method={method} address={address} />
    </aside>
  </>;
}

/* ───── payment result screens ───── */
const STEPS = ['Contacting your bank…', 'Authorising payment…', 'Confirming your order…'];
function Processing({ total }) {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(v => Math.min(v + 1, 2)), 900); return () => clearInterval(t); }, []);
  return <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: .4, ease }}
    className="mx-auto flex max-w-md flex-col items-center rounded-[6px] border border-navy/10 bg-white px-8 py-14 text-center shadow-xl" role="status" aria-live="polite">
    <div className="relative grid h-28 w-28 place-items-center">
      <motion.span className="absolute inset-0 rounded-full border-4 border-navy/10 border-t-accent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
      <motion.span className="absolute inset-3 rounded-full border-2 border-dashed border-glow/70" animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} />
      <motion.span className="relative block h-8 w-8 rounded-full bg-red-500 shadow-[inset_-3px_-3px_5px_rgba(0,0,0,.35)]" animate={{ y: [0, -16, 0], scaleY: [1, 1, .8, 1] }} transition={{ duration: .7, repeat: Infinity, ease: 'easeOut' }}><span className="absolute inset-x-0 top-1/2 h-px bg-white/80" /></motion.span>
    </div>
    <p className="mt-8 text-xs font-bold tracking-[.2em] text-accent">Please don’t close this page</p>
    <h2 className="mt-3 text-2xl font-black tracking-tight"><Swap k={i}>{STEPS[i]}</Swap></h2>
    <p className="mt-2 text-sm text-ink/50">Paying <b className="text-ink">{money(total)}</b> securely</p>
    <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-navy/10"><motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2.7, ease: 'easeInOut' }} /></div>
  </motion.div>;
}

const CONF = ['bg-accent', 'bg-glow', 'bg-sun', 'bg-white', 'bg-amber-300', 'bg-rose-400'];
/* Confetti: two bursts shoot up from behind the confirmation card, then fall and fade. Plays once; skipped for reduced motion. */
function Confetti() {
  const [on, setOn] = useState(true), reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pieces = useMemo(() => Array.from({ length: 120 }, (_, i) => {
    const a = (Math.random() * 150 - 75) * Math.PI / 180, v = 240 + Math.random() * 460, round = Math.random() < .3, w = 6 + Math.random() * 7;
    return { i, c: CONF[i % CONF.length], w, h: round ? w : 10 + Math.random() * 9, round, dx: Math.sin(a) * v, up: Math.cos(a) * v * .85 + 140, rot: (Math.random() - .5) * 1500, d: (i < 60 ? 0 : .9) + Math.random() * .25, t: 2.6 + Math.random() * 1.6 };
  }), []);
  useEffect(() => { const t = setTimeout(() => setOn(false), 6200); return () => clearTimeout(t); }, []);
  if (reduced || !on) return null;
  const fall = typeof window !== 'undefined' ? window.innerHeight * .7 : 600;
  return <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden" aria-hidden="true">
    {pieces.map(p => <motion.span key={p.i} className={`absolute left-1/2 top-[36%] ${p.c} ${p.round ? 'rounded-full' : 'rounded-[1px]'}`} style={{ width: p.w, height: p.h }}
      initial={{ x: 0, y: 0, opacity: 0 }} animate={{ x: [0, p.dx, p.dx * 1.25], y: [0, -p.up, fall], rotate: [0, p.rot * .4, p.rot], opacity: [1, 1, 1, 0] }}
      transition={{ duration: p.t, delay: p.d, times: [0, .32, 1], ease: ['easeOut', 'easeIn'], opacity: { duration: p.t, delay: p.d, times: [0, .6, .85, 1] } }} />)}
  </div>;
}

function Failed({ onRetry }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-2xl">
    <div className="rounded-[4px] bg-ink px-6 py-14 text-center text-white">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/30"><X size={26} strokeWidth={1.6} /></span>
      <p className="mt-7 text-[11px] font-semibold uppercase tracking-[.2em] text-white/50">Payment</p>
      <h1 className="mt-3 text-5xl sm:text-6xl"><Words text="Payment failed" /></h1>
      <p className="mt-4 text-sm text-white/65">Your payment didn’t go through.</p>
    </div>
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: .6, ease }} className="mt-5 rounded-[6px] border border-ink/10 bg-white p-6">
      <p className="text-sm font-semibold text-ink">Transaction declined by the bank</p>
      <p className="mt-1 text-sm leading-6 text-ink/60">No money has been deducted and your cart is safe. Please try again or pick another payment method. <span className="text-ink/40">(Demo: your next attempt will succeed.)</span></p>
      <div className="mt-5 flex flex-wrap gap-3"><Button onClick={onRetry}><RotateCcw size={16} /> Try again</Button><Button to="/cart" variant="outline"><ArrowLeft size={16} /> Back to cart</Button></div>
    </motion.div>
  </motion.div>;
}

/* ───── page ───── */
export default function Checkout() {
  const { cart, clearCart, addOrder, addresses, user } = useStore();
  const [method, setMethod] = useState('upi'), [phase, setPhase] = useState('form'), [sim, setSim] = useState('success');
  const [f, setF] = useState({ upi: '', card: '', name: '', exp: '', cvv: '', bank: '' }), [errors, setErrors] = useState({}), [shake, setShake] = useState(0), [flip, setFlip] = useState(false);
  const [order, setOrder] = useState(null), timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const set = (k, v) => { setF(o => ({ ...o, [k]: v })); setErrors(o => ({ ...o, [k]: undefined })); };
  const subtotal = cart.reduce((s, p) => s + p.price * p.qty, 0), mrp = cart.reduce((s, p) => s + p.oldPrice * p.qty, 0), ship = shippingForCart(cart);
  const t = { mrp, save: mrp - subtotal, ship, total: subtotal + ship, goods: goodsTotal(cart) };

  const validate = () => {
    const e = {};
    if (method === 'upi' && !/^[\w.-]{2,}@[a-z]{2,}$/i.test(f.upi.trim())) e.upi = 'Enter a valid UPI ID, e.g. name@okaxis';
    if (method === 'card') {
      if (f.card.replace(/\s/g, '').length !== 16) e.card = 'Enter the 16-digit card number';
      if (!f.name.trim()) e.name = 'Enter the name on the card';
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(f.exp)) e.exp = 'Use MM/YY';
      if (!/^\d{3,4}$/.test(f.cvv)) e.cvv = '3 or 4 digits';
    }
    if (method === 'bank' && !f.bank) e.bank = 'Choose your bank';
    return e;
  };
  const demoFill = () => setF(o => method === 'upi' ? { ...o, upi: 'zenmoovz@okaxis' } : method === 'card' ? { ...o, card: '4111 1111 1111 1111', name: 'ZEN PLAYER', exp: '12/30', cvv: '123' } : method === 'bank' ? { ...o, bank: BANKS[1] } : o);

  const pay = () => {
    const e = validate(); setErrors(e);
    if (Object.keys(e).length) { setShake(s => s + 1); return; }
    setPhase('processing'); toTop();
    timer.current = setTimeout(() => {
      if (sim === 'fail') { setPhase('failed'); setSim('success'); }
      else {
        const eta = new Date(Date.now() + 4 * 864e5).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
        const placed = { id: 'ZMV-' + Math.floor(100000 + Math.random() * 900000), placedAt: Date.now(), email: user?.email || '', items: cart, total: t.total, mrp: t.mrp, ship: t.ship, svcOnly: servicesOnly(cart), method: METHODS.find(m => m[0] === method)[1], eta, address: addresses.find(a => a.isDefault) || addresses[0] || null };
        setOrder(placed); addOrder(placed);
        clearCart(); setPhase('success');
      }
      toTop();
    }, 2800);
  };

  if (!cart.length && phase === 'form') return <main className="section-wrap min-h-[55vh] pt-12"><EmptyState title="Nothing to pay for yet" body="Add some gear to your cart and come back to check out." action={<Button to="/shop">Explore the shop <ArrowRight size={16} /></Button>} /></main>;

  /* paid: the order summary replaces the whole checkout page (it has its own progress bar and header) */
  if (phase === 'success' && order) return <motion.main initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, ease }} className="section-wrap min-h-[60vh] pb-16 pt-8"><Confetti /><OrderSummary order={order} fresh /></motion.main>;

  return <main className="section-wrap min-h-[60vh] pt-12 pb-4">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[.22em] text-accent">SECURE CHECKOUT</p>
      <h1 className="text-4xl font-black tracking-[-.06em] sm:text-5xl"><Words text="Payment" /><span className="lime-text">.</span></h1></div>
      {phase === 'form' && <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-ink/50 hover:text-accent"><ArrowLeft size={16} /> Back to cart</Link>}
    </div>
    <OrderStepper current={2} failed={phase === 'failed'} />
    <AnimatePresence mode="wait" initial={false}>
      {phase === 'form' && <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: .4, ease }} className="grid items-start gap-8 lg:grid-cols-[1fr_400px]">
        <div className="order-2 lg:order-none">
          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist">{METHODS.map(([k, l, I]) => <button key={k} role="tab" aria-selected={method === k} onClick={() => { setMethod(k); setErrors({}); }}
            className={`relative flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-xs font-bold transition-colors ${method === k ? 'border-navy text-white' : 'border-navy/10 text-ink/60 hover:border-navy/30'}`}>
            {method === k && <motion.span layoutId="paytab" className="absolute inset-0 rounded-2xl bg-navy" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <I size={20} className="relative" /><span className="relative">{l}</span></button>)}</div>

          <div className="rounded-[6px] border border-navy/10 bg-white p-5 sm:p-7">
            <AnimatePresence mode="wait" initial={false}><motion.div key={method} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: .25, ease }}>
              {method === 'upi' && <div className="grid gap-4">
                <Field label="UPI ID" error={errors.upi} shake={shake}><input className={`${inp} ${errors.upi ? 'border-red-400' : 'border-navy/15'}`} value={f.upi} onChange={e => set('upi', e.target.value)} placeholder="yourname@okaxis" autoComplete="off" inputMode="email" /></Field>
                <div className="flex flex-wrap gap-2">{['@okaxis', '@ybl', '@paytm', '@oksbi'].map(h => <motion.button type="button" key={h} whileTap={{ scale: .9 }} whileHover={{ y: -2 }} onClick={() => set('upi', f.upi.split('@')[0] + h)} className="rounded-[3px] border border-navy/15 px-3 py-1.5 text-xs font-semibold text-ink/65 transition-colors hover:border-navy hover:text-accent">{h}</motion.button>)}</div>
                <p className="text-xs leading-5 text-ink/45">You’ll get a collect request in your UPI app. Approve it to complete the payment.</p></div>}
              {method === 'card' && <div>
                <CardPreview f={f} flip={flip} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field className="sm:col-span-2" label="Card number" error={errors.card} shake={shake}><input className={`${inp} tabular-nums ${errors.card ? 'border-red-400' : 'border-navy/15'}`} value={f.card} onChange={e => set('card', e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())} placeholder="1234 5678 9012 3456" inputMode="numeric" autoComplete="cc-number" /></Field>
                  <Field className="sm:col-span-2" label="Name on card" error={errors.name} shake={shake}><input className={`${inp} ${errors.name ? 'border-red-400' : 'border-navy/15'}`} value={f.name} onChange={e => set('name', e.target.value.toUpperCase())} placeholder="NAME AS ON CARD" autoComplete="cc-name" /></Field>
                  <Field label="Expiry" error={errors.exp} shake={shake}><input className={`${inp} ${errors.exp ? 'border-red-400' : 'border-navy/15'}`} value={f.exp} onChange={e => { const d = e.target.value.replace(/\D/g, '').slice(0, 4); set('exp', d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d); }} placeholder="MM/YY" inputMode="numeric" autoComplete="cc-exp" /></Field>
                  <Field label="CVV" error={errors.cvv} shake={shake}><input className={`${inp} ${errors.cvv ? 'border-red-400' : 'border-navy/15'}`} value={f.cvv} type="password" onFocus={() => setFlip(true)} onBlur={() => setFlip(false)} onChange={e => set('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="•••" inputMode="numeric" autoComplete="cc-csc" /></Field>
                </div></div>}
              {method === 'bank' && <div><div className="grid gap-2 sm:grid-cols-2">{BANKS.map(b => <button type="button" key={b} onClick={() => set('bank', b)} className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${f.bank === b ? 'border-navy bg-navy/[.05]' : 'border-navy/10 hover:border-navy/30'}`}>{b}
                <motion.span initial={false} animate={{ scale: f.bank === b ? 1 : 0, rotate: f.bank === b ? 0 : -90 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} className="grid h-5 w-5 place-items-center rounded-full bg-navy text-white"><Check size={12} strokeWidth={3} /></motion.span></button>)}</div>
                <AnimatePresence>{errors.bank && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden pt-2 text-xs text-red-500" role="alert">{errors.bank}</motion.p>}</AnimatePresence></div>}
              {method === 'cod' && <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent/10 text-accent"><Banknote size={24} /></span>
                <div><p className="font-bold">Pay <Money value={t.total} /> when your order arrives</p><p className="mt-1 text-sm leading-6 text-ink/50">Keep the exact amount handy. You can also pay by UPI to the delivery partner.</p></div></div>}
            </motion.div></AnimatePresence>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-navy/20 px-4 py-3 text-xs">
            <span className="font-semibold text-ink/55">Demo mode · simulate result</span>
            <div className="relative flex rounded-full bg-navy/[.06] p-1" role="radiogroup" aria-label="Simulated payment result">{[['success', 'Success'], ['fail', 'Failure']].map(([k, l]) => <button key={k} role="radio" aria-checked={sim === k} onClick={() => setSim(k)} className={`relative rounded-[3px] px-4 py-1.5 font-bold transition-colors ${sim === k ? 'text-white' : 'text-ink/55'}`}>
              {sim === k && <motion.span layoutId="sim" className={`absolute inset-0 rounded-full ${k === 'fail' ? 'bg-red-500' : 'bg-navy'}`} transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}<span className="relative">{l}</span></button>)}</div>
            {method !== 'cod' && <button type="button" onClick={demoFill} className="font-semibold text-accent underline-offset-2 hover:underline">Fill demo details</button>}
          </div>
          <div className="mt-5"><Button className="w-full" onClick={pay}><Lock size={16} /> {method === 'cod' ? 'Place order' : <>Pay <Money value={t.total} /></>}</Button></div>
          <p className="mt-3 text-center text-[10px] leading-5 text-ink/35">Demo checkout only. No real payment will be collected.</p>
        </div>
        <div className="order-1 lg:order-none lg:contents"><Summary cart={cart} t={t} method={method} address={addresses.find(a => a.isDefault) || addresses[0] || null} /></div>
      </motion.div>}
      {phase === 'processing' && <Processing key="processing" total={t.total} />}
      {phase === 'failed' && <Failed key="failed" onRetry={() => { setPhase('form'); toTop(); }} />}
    </AnimatePresence>
  </main>;
}
