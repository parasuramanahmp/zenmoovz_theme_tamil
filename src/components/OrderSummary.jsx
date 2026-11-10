import React, { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CalendarDays, Check, ChevronUp, ClipboardCheck, Copy, CreditCard, Hash, House, Mail, MapPin, MessageSquare, Package, PackageCheck, Printer, Receipt, RotateCcw, ShoppingBag, ShoppingCart, Truck, Wrench } from 'lucide-react';
import { BY_ID } from '../data/catalog.js';
import { SELLER, SUPPORT, STAGES, arrivalWindow, dateTime, deliverBy, gstIncluded, invoiceNo, isCod, shipBy, stageOf, txnId, unitCount } from '../lib/orders.js';
import { hrefOf } from '../lib/shop.js';
import { money, useStore } from '../store.jsx';
import { ProductArt } from '../art.jsx';
import { Button } from '../ui.jsx';

const ease = [.22, 1, .36, 1];
const SERVICE_STAGES = ['Confirmed', 'Gear dropped', 'In progress', 'Ready'];
const heading = (o, st) => o.status === 'cancelled' ? 'This order was cancelled'
  : st === 3 ? (o.svcOnly ? 'Your service is ready' : 'Your order was delivered')
  : st === 2 && !o.svcOnly ? 'Your order is on its way' : 'Your order is confirmed';

/* ───── Cart → Checkout → Payment → Order Summary, used on the payment page and here ───── */
export function OrderStepper({ current, failed = false }) {
  const steps = [['Cart', ShoppingCart], ['Checkout', ClipboardCheck], ['Payment', CreditCard], ['Order Summary', Receipt]];
  return <ol aria-label="Order progress" className="no-print mb-8 flex items-center rounded-[10px] border border-ink/10 bg-white px-4 py-3 shadow-sm sm:px-6">
    {steps.map(([label, Icon], i) => { const done = i < current, on = i === current, bad = failed && on;
      return <li key={label} aria-current={on ? 'step' : undefined} className={`flex items-center ${i < 3 ? 'flex-1' : ''}`}>
        <span className="relative shrink-0">
          <span className={`grid h-10 w-10 place-items-center rounded-full transition-colors duration-300 ${done ? 'bg-emerald-700 text-white' : bad ? 'bg-red-500 text-white' : on ? 'bg-mist text-ink ring-2 ring-ink/25' : 'bg-ink/[.06] text-ink/40'}`}><Icon size={18} strokeWidth={1.8} /></span>
          {done && <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full border-2 border-emerald-700 bg-white text-emerald-700"><Check size={9} strokeWidth={4} /></span>}
        </span>
        <span className={`ml-3 text-sm font-semibold ${on ? 'text-ink' : done ? 'text-ink/80' : 'text-ink/40'} ${on ? '' : 'hidden sm:inline'}`}>{label}</span>
        {i < 3 && <span className="relative mx-3 h-0.5 flex-1 overflow-hidden rounded bg-ink/10"><motion.span className="absolute inset-0 origin-left bg-emerald-700" initial={false} animate={{ scaleX: i < current ? 1 : 0 }} transition={{ duration: .7, ease }} /></span>}
      </li>; })}
  </ol>;
}

/* A rounded card with an icon, a title and a chevron to fold it away */
function Panel({ icon: Icon, title, right, chevronRight = false, id, children }) {
  const [open, setOpen] = useState(true), pid = useId();
  const chev = <motion.span animate={{ rotate: open ? 0 : 180 }} transition={{ duration: .25 }} className={`text-ink/50 ${chevronRight && !right ? 'ml-auto' : ''}`}><ChevronUp size={18} /></motion.span>;
  return <section id={id} className="min-w-0 break-inside-avoid rounded-[10px] border border-ink/10 bg-white">
    <h3><button type="button" aria-expanded={open} aria-controls={pid} onClick={() => setOpen(o => !o)} className="flex w-full items-center gap-3 rounded-[10px] px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mist text-ink/80"><Icon size={16} strokeWidth={1.8} /></span>
      <span className="text-[15px] font-bold">{title}</span>
      {!chevronRight && chev}
      {right && <span className="ml-auto">{right}</span>}
      {chevronRight && chev}
    </button></h3>
    <AnimatePresence initial={false}>{open && <motion.div id={pid} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .3, ease }} className="overflow-hidden">
      <div className="border-t border-ink/10 px-5">{children}</div>
    </motion.div>}</AnimatePresence>
  </section>;
}

const Rows = ({ rows }) => <dl>{rows.map(([k, v]) => <div key={k} className="grid grid-cols-[minmax(0,.8fr)_minmax(0,1.6fr)] gap-4 border-b border-ink/10 py-3.5 text-sm last:border-0"><dt className="text-ink/50">{k}</dt><dd className="min-w-0 break-words font-medium">{v}</dd></div>)}</dl>;
const Pill = ({ children, tone = 'green' }) => <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${tone === 'green' ? 'bg-emerald-500/10 text-emerald-700' : tone === 'amber' ? 'bg-amber-400/20 text-amber-800' : tone === 'red' ? 'bg-red-500/10 text-red-600' : 'bg-ink/[.06] text-ink/70'}`}>{children}</span>;

function Stat({ icon: Icon, label, children }) {
  return <div className="flex items-center gap-3 rounded-[10px] border border-ink/10 bg-white px-4 py-4">
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist text-ink/70"><Icon size={17} strokeWidth={1.8} /></span>
    <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-ink/45">{label}</p><div className="mt-0.5 text-sm font-bold">{children}</div></div>
  </div>;
}

/* The four-stage tracker. Done stages are green, the one in progress has a ring, the rest are faded. */
function Tracker({ o, st }) {
  const svc = o.svcOnly, names = svc ? SERVICE_STAGES : STAGES;
  const icons = svc ? [ClipboardCheck, Package, Wrench, PackageCheck] : [ClipboardCheck, Package, Truck, House];
  const subs = svc ? ['Just now', 'Bring it to the counter', 'We’re on it', 'Collect at the counter'] : ['Just now', 'Within 24 hrs', `By ${shipBy(o)}`, `By ${deliverBy(o)}`];
  const reach = Math.min(st + 1, 3) / 3;
  return <div className="relative px-2 py-8 sm:px-6">
    <div className="absolute left-[12.5%] right-[12.5%] top-[calc(2rem+34px)] h-1 -translate-y-1/2 overflow-hidden rounded bg-ink/10" aria-hidden="true">
      <motion.div className="h-full origin-left rounded bg-emerald-700" initial={{ scaleX: 0 }} animate={{ scaleX: reach }} transition={{ duration: 1, delay: .3, ease }} />
    </div>
    <ol className="relative grid grid-cols-4" aria-label="Delivery progress">
      {names.map((n, k) => { const Icon = icons[k], done = k <= st, on = k === st + 1;
        return <li key={n} aria-current={on ? 'step' : undefined} className="flex flex-col items-center text-center">
          <span className="relative">
            <span className={`grid h-[68px] w-[68px] place-items-center rounded-full border-2 transition-colors ${done ? 'border-emerald-700 bg-emerald-700 text-white' : on ? 'border-ink/30 bg-mist text-ink' : 'border-ink/15 bg-white text-ink/35'}`}><Icon size={26} strokeWidth={1.6} /></span>
            {done && <span className="absolute -bottom-0.5 -right-0.5 grid h-6 w-6 place-items-center rounded-full border-2 border-emerald-700 bg-white text-emerald-700"><Check size={12} strokeWidth={4} /></span>}
          </span>
          <p className={`mt-3 text-sm font-bold ${done || on ? 'text-ink' : 'text-ink/45'}`}>{n}</p>
          <p className="mt-0.5 text-xs text-ink/45">{subs[k]}</p>
        </li>; })}
    </ol>
  </div>;
}

export default function OrderSummary({ order, fresh = false }) {
  const { orders, user, cancelOrder } = useStore(), [copied, setCopied] = useState(false), [asking, setAsking] = useState(false);
  const o = orders.find(x => x.id === order.id) || order;            // the stored copy, so a cancel shows up straight away
  const st = stageOf(o), cancelled = o.status === 'cancelled', svc = !!o.svcOnly, cod = isCod(o), a = o.address;
  const items = o.items.map(i => BY_ID[i.id] && ({ ...BY_ID[i.id], size: i.size, qty: i.qty, price: i.price ?? BY_ID[i.id].price })).filter(Boolean);
  const email = o.email || user?.email || '', units = unitCount(o), canCancel = !cancelled && st < 2;
  const goods = o.total - o.ship, save = Math.max(0, o.mrp - goods), stage = cancelled ? ['CANCELLED', 'red'] : [(svc ? SERVICE_STAGES : STAGES)[st].toUpperCase(), 'green'];
  const copy = () => { (navigator.clipboard?.writeText(o.id) || Promise.reject()).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const goTrack = () => { const el = document.getElementById('delivery-status'); if (el) window.__lenis ? window.__lenis.scrollTo(el, { offset: -150 }) : el.scrollIntoView({ behavior: 'smooth' }); };
  const delivery = svc ? 'In-store · Pallikaranai counter' : `Standard delivery · ${o.ship ? money(o.ship) : 'Free'}`;
  const arrival = svc ? 'Drop your gear in after you order' : arrivalWindow(o);
  const updates = <>{email || 'Your email'}<br /><span className="text-ink/60">WhatsApp alerts on</span></>;

  return <div id="order-print">
    <OrderStepper current={3} />

    <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
      <div className="flex items-start gap-4">
        <motion.span initial={{ scale: .8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: .5, ease }} className={`grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full border-2 ${cancelled ? 'border-red-500 bg-red-50 text-red-500' : 'border-emerald-700 bg-emerald-50 text-emerald-700'}`}>
          <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true"><motion.path d={cancelled ? 'M6 6l12 12M18 6L6 18' : 'M5 12.5l4.5 4.5L19 7.5'} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: .25, duration: .5, ease: 'easeOut' }} /></svg>
        </motion.span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-ink/55">Order summary</p>
          <h1 className="!mt-1 !text-[clamp(1.7rem,3.4vw,2.3rem)] !font-bold !normal-case !leading-tight !tracking-tight [font-family:Inter,ui-sans-serif,system-ui,sans-serif]">{fresh && !cancelled ? 'Thank you, your order is confirmed' : heading(o, st)}</h1>
          <p className="mt-1 text-sm text-ink/55">{fresh && !cancelled ? (email ? <>We’ve sent the details to <b className="text-ink">{email}</b> and WhatsApp.</> : 'We’ll send the details by WhatsApp and email.') : <>Order <b className="text-ink">{o.id}</b> · placed on {dateTime(o.placedAt)}</>}</p>
        </div>
      </div>
      <div className="no-print flex flex-wrap gap-3">
        {!cancelled && <Button className="!px-5 !py-3" onClick={goTrack}><Truck size={16} /> Track order</Button>}
        <Button variant="outline" className="!px-5 !py-3" onClick={() => window.print()}><Printer size={16} /> Print / PDF</Button>
        <Button variant="outline" className="!px-5 !py-3" to="/">Continue shopping</Button>
      </div>
    </div>

    <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Stat icon={Hash} label="Order number"><span className="flex items-center gap-2 break-all">{o.id}<button type="button" onClick={copy} className="no-print inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline" aria-label="Copy order number">{copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}</button></span></Stat>
      <Stat icon={CalendarDays} label="Placed on">{dateTime(o.placedAt)}</Stat>
      <Stat icon={Truck} label={svc ? 'Where' : 'Arrives'}>{svc ? 'Pallikaranai counter' : arrivalWindow(o)}</Stat>
      <Stat icon={ShoppingBag} label="Items">{items.length} {items.length === 1 ? 'item' : 'items'} · {units} {units === 1 ? 'unit' : 'units'}</Stat>
      <Stat icon={CreditCard} label={cod ? 'Pay on delivery' : 'Paid online'}>{money(o.total)}</Stat>
    </div>

    <section id="delivery-status" className="mb-8 scroll-mt-40 overflow-hidden rounded-[10px] border border-ink/10 bg-white">
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mist text-ink/80"><MapPin size={16} strokeWidth={1.8} /></span>
        <h3 className="text-[15px] font-bold">{svc ? 'Service status' : 'Delivery status'}</h3>
        {!cancelled && <span className="ml-auto rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">{svc ? 'Drop your gear in at the counter' : `Arrives ${arrivalWindow(o)}`}</span>}
      </div>
      <div className="border-t border-ink/10">
        {cancelled
          ? <p className="px-5 py-8 text-sm leading-6 text-ink/65"><b className="text-ink">This order was cancelled{o.cancelledAt ? ` on ${dateTime(o.cancelledAt)}` : ''}.</b> {cod ? 'Nothing was charged.' : 'Any payment goes back to your original payment method.'}</p>
          : <Tracker o={o} st={st} />}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 px-5 py-3.5 text-sm">
          <p className="flex items-center gap-2.5 text-ink/55"><MessageSquare size={16} /> We’ll message you on WhatsApp and email at every step.</p>
          {canCancel && !asking && <button type="button" onClick={() => setAsking(true)} className="no-print font-semibold text-red-600 hover:underline">Cancel order</button>}
          {canCancel && asking && <span className="no-print flex flex-wrap items-center gap-3"><span className="text-ink/65">Cancel this order? This can’t be undone.</span>
            <button type="button" onClick={() => { cancelOrder(o.id); setAsking(false); }} className="rounded-[3px] bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700">Yes, cancel</button>
            <button type="button" onClick={() => setAsking(false)} className="text-xs font-bold text-ink/65 hover:text-ink">Keep order</button></span>}
        </div>
      </div>
    </section>

    <h2 className="mb-4 !text-[1.6rem] !font-bold !normal-case !leading-tight !tracking-tight [font-family:Inter,ui-sans-serif,system-ui,sans-serif]">Order details</h2>
    <div className="grid gap-4 [&>*]:min-w-0">
      <Panel icon={ShoppingBag} title="Ordered items" chevronRight right={<span className="mr-3 rounded-full bg-ink/[.06] px-3 py-1 text-xs font-semibold text-ink/65">{units} {units === 1 ? 'unit' : 'units'}</span>}>
        <ul className="divide-y divide-ink/10">{items.map(p => <li key={p.id + (p.size || '')} className="flex items-center gap-3 py-4 sm:gap-4">
          <Link to={hrefOf(p)} className="h-16 w-16 shrink-0 sm:h-[76px] sm:w-[76px] overflow-hidden rounded-[8px] bg-mist"><ProductArt product={p} className="h-full w-full" shadow={false} /></Link>
          <div className="min-w-0 flex-1"><Link to={hrefOf(p)} className="block truncate text-[15px] font-bold hover:text-accent">{p.name}</Link><p className="mt-0.5 text-sm text-ink/50">{p.service ? 'In-store service' : p.brand}</p>{p.size && <p className="mt-0.5 truncate text-xs text-ink/50">{p.size}</p>}<p className="mt-0.5 text-xs text-ink/50 sm:hidden">Qty {p.qty}</p></div>
          <span className="hidden shrink-0 rounded-full bg-ink/[.06] px-3 py-1 text-xs font-semibold text-ink/65 sm:inline">Qty {p.qty}</span>
          <p className="shrink-0 text-right text-[15px] font-bold sm:w-24">{money(p.price * p.qty)}</p></li>)}</ul>
      </Panel>

      {/* two stacks on wide screens (their heights differ), one ordered stack on phones */}
      <div className="grid items-start gap-4 md:grid-cols-2 [&>*]:min-w-0">
        <div className="contents md:grid md:content-start md:gap-4 [&>*]:min-w-0">
          <div className="order-1"><Panel icon={Package} title="Order information"><Rows rows={[
            ['Order number', o.id], ['Placed on', dateTime(o.placedAt)], ['Status', <Pill tone={stage[1]}>{stage[0]}</Pill>],
            ['Items', `${items.length} ${items.length === 1 ? 'item' : 'items'} · ${units} ${units === 1 ? 'unit' : 'units'}`], ['Delivery method', delivery], ['Estimated arrival', arrival], ['Updates sent to', updates]]} /></Panel></div>
          <div className="order-3"><Panel icon={CreditCard} title="Payment & invoice"><Rows rows={[
            ['Status', cod ? <Pill tone="amber">Pay on delivery</Pill> : <Pill>Paid</Pill>],
            ['Payment method', cod ? 'Cash on delivery' : `Paid online · ${o.method}`],
            ...(cod ? [] : [['Transaction ID', txnId(o)]]),
            [cod ? 'Amount due' : 'Amount paid', money(o.total)], ['Invoice number', invoiceNo(o)], ['Sold by', SELLER.name], ['Seller GSTIN', SELLER.gstin]]} /></Panel></div>
        </div>
        <div className="contents md:grid md:content-start md:gap-4 [&>*]:min-w-0">
          <div className="order-2"><Panel icon={MapPin} title={svc ? 'Drop-off details' : 'Delivery details'}>
            {svc ? <Rows rows={[
              ['Drop off at', 'Pallikaranai counter, Chennai'], ['Contact', SUPPORT.phoneLabel], ['Email', email || SUPPORT.email],
              ['Good to know', 'Bring your gear to the counter after you order. Stringing is fitted while you wait; knocking-in takes about 3 days.']]} />
            : <Rows rows={[
              ['Delivering to', a ? <span className="flex flex-wrap items-center gap-2">{a.name}{a.label && <span className="rounded-full bg-ink/[.06] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-ink/65">{a.label}</span>}</span> : 'No address saved'],
              ['Address', a ? <>{a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />{a.city}{a.pin ? ` – ${a.pin}` : ''}</> : <Link to="/profile?tab=addresses" className="text-accent hover:underline">Add a delivery address</Link>],
              ['Contact', a?.phone ? `+91 ${a.phone}` : user?.phone ? `+91 ${user.phone}` : '—'], ['Email', email || '—'],
              ['Good to know', <>The courier may call before delivery. You can change the address until your order is packed. <Link to="/profile?tab=addresses" className="font-semibold text-accent hover:underline">Change address</Link></>]]} />}
          </Panel></div>
          <div className="order-4"><Panel icon={Receipt} title="Price summary" chevronRight right={save > 0 ? <span className="mr-3 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">You saved {money(save)}</span> : null}>
            <Rows rows={[
              ['Item total (MRP)', money(o.mrp)],
              ...(save > 0 ? [['Discount on MRP', <span className="font-semibold text-emerald-700">−{money(save)}</span>]] : []),
              ['Delivery', svc ? 'Not needed' : o.ship ? money(o.ship) : <span className="font-bold uppercase text-emerald-700">Free</span>],
              ['GST (included)', money(gstIncluded(o.total))]]} />
            <div className="grid grid-cols-[minmax(0,.8fr)_minmax(0,1.6fr)] gap-4 border-t border-ink/20 py-4 text-[15px] font-extrabold"><span>{cod ? 'Total due' : 'Total paid'}</span><span>{money(o.total)}</span></div>
          </Panel></div>
        </div>
      </div>
    </div>

    <div className="no-print mt-5"><Panel icon={MessageSquare} title="Need help with this order?">
      <div className="grid gap-3 py-4 md:grid-cols-3">
        {[[MessageSquare, 'Chat on WhatsApp', 'Replies within a few minutes', `https://wa.me/${SUPPORT.phone}?text=${encodeURIComponent(`Hi, I need help with order ${o.id}`)}`, true],
          [Mail, 'Email support', SUPPORT.email, `mailto:${SUPPORT.email}?subject=${encodeURIComponent(`Order ${o.id}`)}`],
          [RotateCcw, 'All my orders & returns', '7-day returns on unused items', '/profile?tab=orders']].map(([Icon, t, s, href, ext]) => {
          const inner = <><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist text-ink/70"><Icon size={17} strokeWidth={1.8} /></span><span className="min-w-0"><span className="block text-sm font-bold">{t}</span><span className="block truncate text-xs text-ink/50">{s}</span></span></>;
          const cls = 'flex items-center gap-3 rounded-[8px] border border-ink/10 px-4 py-3.5 outline-none transition-colors hover:border-ink/30 hover:bg-mist/50 focus-visible:ring-2 focus-visible:ring-ink';
          return href.startsWith('/') ? <Link key={t} to={href} className={cls}>{inner}</Link> : <a key={t} href={href} className={cls} {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})}>{inner}</a>; })}
      </div>
    </Panel></div>
  </div>;
}
