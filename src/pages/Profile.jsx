import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Briefcase, Check, Heart, Home, LayoutDashboard, LogOut, MapPin, Package, Pencil, Plus, RotateCcw, ShoppingBag, Trash2, User, X } from 'lucide-react';
import { ProductArt } from '../art.jsx';
import { BY_ID } from '../data/catalog.js';
import { hrefOf } from '../lib/shop.js';
import { Words } from '../motion.jsx';
import { cityFor } from '../lib/shop.js';
import { money, useStore } from '../store.jsx';
import { Button, EmptyState } from '../ui.jsx';

const ease = [.22, 1, .36, 1];
const TABS = [['overview', 'Overview', LayoutDashboard], ['details', 'Profile details', User], ['orders', 'My orders', Package], ['addresses', 'Saved addresses', MapPin]];
const inp = 'w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-navy focus:ring-4 focus:ring-accent/15';
const card = 'rounded-[6px] border border-navy/10 bg-white p-5 sm:p-6';
const fmtDate = t => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const LABELS = { Home, Work: Briefcase, Other: MapPin };

function Field({ label, error, className = '', children }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-xs font-semibold text-ink/60">{label}</span>{children}
    <AnimatePresence>{error && <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="block overflow-hidden pt-1 text-xs text-red-500" role="alert">{error}</motion.span>}</AnimatePresence></label>;
}
const border = err => (err ? 'border-red-400' : 'border-navy/15');

/* ───────── Overview ───────── */
function Stat({ icon: Icon, label, value, to }) {
  return <Link to={to} className="group rounded-[6px] border border-navy/10 bg-white p-4 transition hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-lift">
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy/[.06] text-accent transition-colors group-hover:bg-navy group-hover:text-white"><Icon size={18} /></span>
    <p className="mt-4 text-2xl font-extrabold tracking-tight">{value}</p><p className="text-xs text-ink/50">{label}</p>
  </Link>;
}

function Overview({ go }) {
  const { user, orders, addresses, wishlist, cart } = useStore();
  const spent = orders.reduce((s, o) => s + o.total, 0), def = addresses.find(a => a.isDefault) || addresses[0];
  const checks = [['Add your phone number', !!user.phone, 'details'], ['Add your birthday', !!user.dob, 'details'], ['Save a delivery address', addresses.length > 0, 'addresses'], ['Place your first order', orders.length > 0, 'orders']];
  const done = checks.filter(c => c[1]).length + 1, pct = Math.round(done / (checks.length + 1) * 100);
  return <div className="grid gap-5">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat icon={Package} label="Orders placed" value={orders.length} to="/profile?tab=orders" />
      <Stat icon={ShoppingBag} label="Total spent" value={money(spent)} to="/profile?tab=orders" />
      <Stat icon={Heart} label="In your wishlist" value={wishlist.length} to="/wishlist" />
      <Stat icon={MapPin} label="Saved addresses" value={addresses.length} to="/profile?tab=addresses" />
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <section className={card}>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-extrabold">Recent orders</h2>{orders.length > 0 && <button onClick={() => go('orders')} className="text-xs font-bold text-accent hover:underline">View all</button>}</div>
        {orders.length ? <ul className="grid gap-3">{orders.slice(0, 2).map(o => <li key={o.id} className="flex items-center gap-3 rounded-2xl bg-mist/60 p-3">
          <div className="flex -space-x-3">{o.items.slice(0, 3).map(i => BY_ID[i.id] && <ProductArt key={i.id + i.size} product={BY_ID[i.id]} className="h-12 w-12 overflow-hidden rounded-xl ring-2 ring-white" shadow={false} />)}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{o.id}</p><p className="text-xs text-ink/50">{fmtDate(o.placedAt)} · {o.items.reduce((s, i) => s + i.qty, 0)} item(s)</p></div>
          <div className="text-right"><p className="text-sm font-bold">{money(o.total)}</p><Status order={o} small /></div></li>)}</ul>
          : <p className="rounded-2xl bg-mist/60 p-5 text-sm text-ink/55">No orders yet. Your purchases will show up here once you check out.</p>}
      </section>
      <div className="grid gap-5">
        <section className={card}>
          <h2 className="text-lg font-extrabold">Default address</h2>
          {def ? <div className="mt-3 text-sm leading-6 text-ink/65"><p className="font-bold text-ink">{def.name} <span className="ml-1 rounded-[3px] bg-navy/[.07] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy">{def.label}</span></p><p>{def.line1}{def.line2 ? `, ${def.line2}` : ''}</p><p>{def.city}, {def.pin}</p><p>Phone {def.phone}</p></div>
            : <p className="mt-3 text-sm text-ink/55">You haven’t saved an address yet.</p>}
          <button onClick={() => go('addresses')} className="mt-4 text-xs font-bold text-accent hover:underline">{def ? 'Manage addresses' : 'Add an address'}</button>
        </section>
        <section className={card}>
          <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">Profile strength</h2><span className="text-sm font-extrabold text-accent">{pct}%</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy/10"><motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: .8, ease }} /></div>
          <ul className="mt-4 grid gap-2 text-sm">{checks.map(([t, ok, tab]) => <li key={t} className="flex items-center gap-2">
            <span className={`grid h-5 w-5 place-items-center rounded-full ${ok ? 'bg-emerald-500 text-white' : 'border border-navy/20'}`}>{ok && <Check size={12} strokeWidth={3} />}</span>
            {ok ? <span className="text-ink/40 line-through">{t}</span> : <button onClick={() => go(tab)} className="text-left font-semibold text-ink/75 hover:text-accent">{t}</button>}</li>)}</ul>
        </section>
      </div>
    </div>
    {cart.length > 0 && <Link to="/cart" className="flex items-center justify-between rounded-[6px] bg-navy px-5 py-4 text-sm font-semibold text-white transition hover:bg-accent"><span>You have {cart.reduce((s, x) => s + x.qty, 0)} item(s) waiting in your cart</span><ArrowRight size={18} /></Link>}
  </div>;
}

/* ───────── Profile details ───────── */
function Details() {
  const { user, updateUser } = useStore();
  const init = { name: user.name || '', email: user.email || '', phone: user.phone || '', gender: user.gender || '', dob: user.dob || '' };
  const [f, setF] = useState(init), [err, setErr] = useState({}), [saved, setSaved] = useState(false);
  const dirty = Object.keys(init).some(k => init[k] !== f[k]);
  const set = (k, v) => { setF(o => ({ ...o, [k]: v })); setErr(o => ({ ...o, [k]: undefined })); setSaved(false); };
  const submit = e => {
    e.preventDefault(); const er = {};
    if (!f.name.trim()) er.name = 'Tell us your name';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) er.email = 'Enter a valid email';
    if (f.phone && !/^[6-9]\d{9}$/.test(f.phone)) er.phone = 'Enter a valid 10-digit mobile number';
    if (f.dob && new Date(f.dob) > new Date()) er.dob = 'Birthday can’t be in the future';
    setErr(er); if (Object.keys(er).length) return;
    updateUser({ ...f, name: f.name.trim(), email: f.email.trim() }); setSaved(true);
  };
  return <form onSubmit={submit} noValidate className={card}>
    <h2 className="text-lg font-extrabold">Profile details</h2><p className="mt-1 text-sm text-ink/50">Keep your details up to date for faster checkout.</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <Field label="Full name" error={err.name}><input className={`${inp} ${border(err.name)}`} value={f.name} onChange={e => set('name', e.target.value)} autoComplete="name" /></Field>
      <Field label="Email" error={err.email}><input className={`${inp} ${border(err.email)}`} type="email" value={f.email} onChange={e => set('email', e.target.value)} autoComplete="email" /></Field>
      <Field label="Mobile number" error={err.phone}><div className="flex"><span className="grid place-items-center rounded-l-xl border border-r-0 border-navy/15 bg-mist px-3 text-sm text-ink/55">+91</span><input className={`${inp} !rounded-l-none ${border(err.phone)}`} inputMode="numeric" maxLength={10} value={f.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, ''))} placeholder="10-digit number" autoComplete="tel-national" /></div></Field>
      <Field label="Birthday" error={err.dob}><input className={`${inp} ${border(err.dob)}`} type="date" max={new Date().toISOString().slice(0, 10)} value={f.dob} onChange={e => set('dob', e.target.value)} autoComplete="bday" /></Field>
      <Field label="Gender" className="sm:col-span-2"><div className="flex flex-wrap gap-2">{['Male', 'Female', 'Other'].map(g => <button type="button" key={g} onClick={() => set('gender', f.gender === g ? '' : g)} aria-pressed={f.gender === g}
        className={`rounded-[3px] border px-5 py-2.5 text-sm font-semibold transition-colors ${f.gender === g ? 'border-navy bg-navy text-white' : 'border-navy/15 text-ink/65 hover:border-navy/40'}`}>{g}</button>)}</div></Field>
    </div>
    <div className="mt-7 flex flex-wrap items-center gap-4">
      <Button type="submit" className={!dirty ? 'pointer-events-none opacity-50' : ''}>Save changes</Button>
      {dirty && <button type="button" onClick={() => { setF(init); setErr({}); }} className="text-sm font-semibold text-ink/50 hover:text-accent">Discard</button>}
      <AnimatePresence>{saved && !dirty && <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600" role="status"><Check size={16} /> Saved</motion.span>}</AnimatePresence>
    </div>
  </form>;
}

/* ───────── Orders ───────── */
const STEPS = ['Confirmed', 'Packed', 'Shipped', 'Delivered'];
/* Demo tracking: progress follows how long ago the order was placed */
const stageOf = o => { const d = (Date.now() - o.placedAt) / 864e5; return d < 1 ? 0 : d < 2 ? 1 : d < 3.5 ? 2 : 3; };
function Status({ order, small }) {
  if (order.status === 'cancelled') return <span className={`inline-flex items-center rounded-[3px] bg-red-500/10 px-2.5 py-0.5 ${small ? 'text-[10px]' : 'text-xs'} font-bold text-red-600`}>Cancelled</span>;
  const st = stageOf(order), done = st === 3;
  return <span className={`inline-flex items-center gap-1 rounded-[3px] px-2.5 py-0.5 ${small ? 'text-[10px]' : 'text-xs'} font-bold ${done ? 'bg-emerald-500/10 text-emerald-700' : 'bg-sun/25 text-ink/80'}`}>{done && <Check size={11} strokeWidth={3} />}{STEPS[st]}</span>;
}

function OrderCard({ o, i }) {
  const { reorder } = useStore(), st = stageOf(o), items = o.items.filter(x => BY_ID[x.id]);
  return <motion.article initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06, duration: .45, ease }} className="overflow-hidden rounded-[6px] border border-navy/10 bg-white">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 bg-mist/60 px-5 py-4 text-sm">
      <div className="flex flex-wrap gap-x-8 gap-y-2">{[['Order ID', o.id], ['Placed on', fmtDate(o.placedAt)], ['Total', money(o.total)]].map(([k, v]) => <div key={k}><p className="text-[11px] text-ink/45">{k}</p><p className="font-bold">{v}</p></div>)}</div>
      <Status order={o} />
    </header>
    <div className="px-5 pt-5">
      <ol className="flex items-center" aria-label="Order progress">{STEPS.map((s, k) => <li key={s} className={`flex items-center ${k < 3 ? 'flex-1' : ''}`}>
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${k <= st ? 'bg-accent text-white' : 'bg-navy/10 text-ink/40'}`}>{k <= st ? <Check size={12} strokeWidth={3} /> : k + 1}</span>
        <span className={`ml-1.5 hidden text-[11px] font-semibold sm:inline ${k <= st ? 'text-ink' : 'text-ink/40'}`}>{s}</span>
        {k < 3 && <span className={`mx-2 h-0.5 flex-1 rounded ${k < st ? 'bg-accent' : 'bg-navy/10'}`} />}</li>)}</ol>
      <p className="mt-2 text-xs text-ink/50">{o.status === 'cancelled' ? 'This order was cancelled' : o.svcOnly ? 'Drop your gear in at our Pallikaranai counter' : st === 3 ? 'Delivered' : `Arriving by ${o.eta}`}</p>
    </div>
    <ul className="grid gap-3 px-5 py-5">{items.map(x => { const p = BY_ID[x.id]; return <li key={x.id + (x.size || '')} className="flex items-center gap-4">
      <Link to={hrefOf(p)} className="h-16 w-16 shrink-0 overflow-hidden rounded-xl"><ProductArt product={p} className="h-full w-full" shadow={false} /></Link>
      <div className="min-w-0 flex-1"><Link to={hrefOf(p)} className="block truncate text-sm font-bold hover:text-accent">{p.name}</Link><p className="text-xs text-ink/50">{p.brand}{x.size ? ` · ${x.size}` : ''} · Qty {x.qty}</p></div>
      <p className="text-sm font-bold">{money(x.price * x.qty)}</p></li>; })}</ul>
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-navy/10 px-5 py-4">
      <p className="min-w-0 text-xs text-ink/50">Paid via <b className="text-ink/70">{o.method}</b>{o.address && !o.svcOnly && <> · Delivering to <b className="text-ink/70">{o.address.city} {o.address.pin}</b></>}</p>
      <div className="flex flex-wrap gap-2"><Button variant="outline" className="!px-5 !py-2.5 !text-xs" to={`/order/${o.id}`}>View order</Button><Button variant="outline" className="!px-5 !py-2.5 !text-xs" onClick={() => reorder(items)}><RotateCcw size={14} /> Buy again</Button></div>
    </footer>
  </motion.article>;
}

function Orders() {
  const { orders } = useStore();
  if (!orders.length) return <EmptyState title="No orders yet" body="When you place an order it will appear here with live tracking." action={<Button to="/">Start shopping <ArrowRight size={16} /></Button>} />;
  return <div className="grid gap-5"><p className="text-sm text-ink/50">{orders.length} order{orders.length === 1 ? '' : 's'}, newest first</p>{orders.map((o, i) => <OrderCard key={o.id} o={o} i={i} />)}</div>;
}

/* ───────── Addresses ───────── */
const BLANK = { label: 'Home', name: '', phone: '', pin: '', city: '', line1: '', line2: '', isDefault: false };
function AddressForm({ initial, onCancel, onSave }) {
  const [f, setF] = useState(initial), [err, setErr] = useState({});
  const set = (k, v) => { setF(o => ({ ...o, [k]: v })); setErr(o => ({ ...o, [k]: undefined })); };
  const onPin = v => { const pin = v.replace(/\D/g, '').slice(0, 6); setF(o => ({ ...o, pin, city: pin.length === 6 && (!o.city || o.city === cityFor(o.pin)) ? cityFor(pin) || o.city : o.city })); setErr(o => ({ ...o, pin: undefined })); };
  const submit = e => {
    e.preventDefault(); const er = {};
    if (!f.name.trim()) er.name = 'Enter the receiver’s name';
    if (!/^[6-9]\d{9}$/.test(f.phone)) er.phone = 'Enter a valid 10-digit mobile number';
    if (!/^[1-9]\d{5}$/.test(f.pin)) er.pin = 'Enter a valid 6-digit pincode';
    if (!f.line1.trim()) er.line1 = 'Enter house number and street';
    if (!f.city.trim()) er.city = 'Enter the city';
    setErr(er); if (!Object.keys(er).length) onSave({ ...f, name: f.name.trim(), line1: f.line1.trim(), line2: f.line2.trim(), city: f.city.trim() });
  };
  return <motion.form onSubmit={submit} noValidate initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: .35, ease }} className="overflow-hidden">
    <div className={`${card} mb-5 border-navy/25`}>
      <div className="flex items-center justify-between"><h3 className="text-lg font-extrabold">{initial.id ? 'Edit address' : 'Add a new address'}</h3><button type="button" onClick={onCancel} aria-label="Close form" className="grid h-8 w-8 place-items-center rounded-full text-ink/50 hover:bg-mist hover:text-ink"><X size={16} /></button></div>
      <div className="mt-4 flex gap-2">{Object.keys(LABELS).map(l => { const Icon = LABELS[l]; return <button type="button" key={l} onClick={() => set('label', l)} aria-pressed={f.label === l} className={`flex items-center gap-1.5 rounded-[3px] border px-4 py-2 text-xs font-bold transition-colors ${f.label === l ? 'border-navy bg-navy text-white' : 'border-navy/15 text-ink/65 hover:border-navy/40'}`}><Icon size={14} />{l}</button>; })}</div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Receiver’s name" error={err.name}><input className={`${inp} ${border(err.name)}`} value={f.name} onChange={e => set('name', e.target.value)} autoComplete="name" autoFocus /></Field>
        <Field label="Mobile number" error={err.phone}><input className={`${inp} ${border(err.phone)}`} inputMode="numeric" maxLength={10} value={f.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, ''))} autoComplete="tel-national" /></Field>
        <Field label="Pincode" error={err.pin}><input className={`${inp} ${border(err.pin)}`} inputMode="numeric" maxLength={6} value={f.pin} onChange={e => onPin(e.target.value)} autoComplete="postal-code" /></Field>
        <Field label="City" error={err.city}><input className={`${inp} ${border(err.city)}`} value={f.city} onChange={e => set('city', e.target.value)} autoComplete="address-level2" /></Field>
        <Field label="House no., building, street" error={err.line1} className="sm:col-span-2"><input className={`${inp} ${border(err.line1)}`} value={f.line1} onChange={e => set('line1', e.target.value)} autoComplete="address-line1" /></Field>
        <Field label="Landmark / area (optional)" className="sm:col-span-2"><input className={`${inp} border-navy/15`} value={f.line2} onChange={e => set('line2', e.target.value)} autoComplete="address-line2" /></Field>
      </div>
      <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-ink/70"><input type="checkbox" checked={f.isDefault} onChange={e => set('isDefault', e.target.checked)} className="h-4 w-4 accent-[#111111]" />Make this my default address</label>
      <div className="mt-6 flex gap-3"><Button type="submit">Save address</Button><Button variant="outline" onClick={onCancel}>Cancel</Button></div>
    </div>
  </motion.form>;
}

function Addresses() {
  const { addresses, saveAddress, removeAddress, makeDefaultAddress, location, setLocation } = useStore();
  const [editing, setEditing] = useState(null), [confirm, setConfirm] = useState(null);
  const save = a => { saveAddress(a); setEditing(null); };
  return <div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-ink/50">{addresses.length ? `${addresses.length} saved address${addresses.length === 1 ? '' : 'es'}` : 'Save addresses for faster checkout.'}</p>
      {!editing && <Button onClick={() => setEditing({ ...BLANK })}><Plus size={16} /> Add new address</Button>}</div>
    <AnimatePresence initial={false}>{editing && <AddressForm key={editing.id || 'new'} initial={editing} onCancel={() => setEditing(null)} onSave={save} />}</AnimatePresence>
    {!addresses.length && !editing ? <EmptyState title="No saved addresses" body="Add your home or work address so checkout is one tap faster." action={<Button onClick={() => setEditing({ ...BLANK })}><Plus size={16} /> Add address</Button>} />
      : <div className="grid gap-4 md:grid-cols-2"><AnimatePresence mode="popLayout">{addresses.map((a, i) => { const Icon = LABELS[a.label] || MapPin, here = location?.pin === a.pin;
        return <motion.article layout key={a.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .94 }} transition={{ delay: i * .04, duration: .35, ease }} className={`flex flex-col rounded-[6px] border bg-white p-5 ${a.isDefault ? 'border-navy' : 'border-navy/10'}`}>
          <div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-navy/[.06] text-accent"><Icon size={17} /></span><span className="text-sm font-extrabold">{a.label}</span>{a.isDefault && <span className="rounded-[3px] bg-navy px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Default</span>}</div>
          <div className="mt-4 flex-1 text-sm leading-6 text-ink/65"><p className="font-bold text-ink">{a.name}</p><p>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p><p>{a.city} – {a.pin}</p><p>Phone: {a.phone}</p></div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-navy/10 pt-4 text-xs font-bold">
            <button onClick={() => setEditing(a)} className="flex items-center gap-1 text-ink/60 hover:text-accent"><Pencil size={13} /> Edit</button>
            {confirm === a.id ? <span className="flex items-center gap-2 text-red-500">Delete?<button onClick={() => { removeAddress(a.id); setConfirm(null); }} className="rounded-[3px] bg-red-500 px-3 py-1 text-white">Yes</button><button onClick={() => setConfirm(null)} className="text-ink/50">No</button></span>
              : <button onClick={() => setConfirm(a.id)} className="flex items-center gap-1 text-ink/60 hover:text-red-500"><Trash2 size={13} /> Delete</button>}
            {!a.isDefault && <button onClick={() => makeDefaultAddress(a.id)} className="text-ink/60 hover:text-accent">Set as default</button>}
            <button onClick={() => setLocation(a.pin, a.city)} disabled={here} className={`ml-auto flex items-center gap-1 ${here ? 'text-emerald-600' : 'text-accent hover:underline'}`}>{here ? <><Check size={13} /> Delivering here</> : <><MapPin size={13} /> Deliver here</>}</button>
          </div></motion.article>; })}</AnimatePresence></div>}
  </div>;
}

/* ───────── Page ───────── */
export default function Profile() {
  const { user, signOut, setAuthOpen, orders } = useStore(), navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(t => t[0] === params.get('tab')) ? params.get('tab') : 'overview';
  const go = id => { setParams(id === 'overview' ? {} : { tab: id }, { replace: false }); window.__lenis ? window.__lenis.scrollTo(0) : window.scrollTo({ top: 0 }); };
  useEffect(() => { document.title = `${TABS.find(t => t[0] === tab)[1]} · ZENMOOVZ`; return () => { document.title = 'ZENMOOVZ'; }; }, [tab]);

  if (!user) return <main className="section-wrap min-h-[55vh] pb-16 pt-10"><EmptyState title="Sign in to see your profile" body="Your details, orders and saved addresses live here." action={<Button onClick={() => setAuthOpen(true)}>Sign in <ArrowRight size={16} /></Button>} /></main>;
  const initials = user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return <main className="section-wrap min-h-[60vh] pb-16 pt-8 sm:pt-10">
    <div className="mb-8 flex flex-wrap items-center gap-4 sm:gap-5">
      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-navy text-xl font-extrabold text-white sm:h-20 sm:w-20 sm:text-2xl">{initials}</span>
      <div className="min-w-0 flex-1"><h1 className="truncate text-3xl font-extrabold tracking-[-.05em] sm:text-4xl"><Words text={user.name} /></h1><p className="truncate text-sm text-ink/50">{user.email}{user.since ? ` · Member since ${new Date(user.since).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}` : ''}</p></div>
      <button onClick={() => { signOut(); navigate('/'); }} className="flex items-center gap-2 rounded-[3px] border border-navy/15 px-4 py-2.5 text-sm font-semibold text-ink/65 transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"><LogOut size={16} />Sign out</button>
    </div>
    {!user.phoneVerified && <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[4px] border border-accent/30 bg-accent/[.06] px-4 py-3 text-sm">
      <span className="min-w-0 flex-1 font-medium text-ink/75">Your mobile number is not verified yet. Confirm it with a one-time code to secure your account.</span>
      <Button onClick={() => setAuthOpen(true)} variant="accent" className="!px-5 !py-3">Verify with OTP</Button>
    </div>}
    <div className="grid items-start gap-6 lg:grid-cols-[250px_1fr]">
      <nav aria-label="Profile sections" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0 lg:sticky lg:top-44 lg:flex-col lg:gap-1 lg:rounded-[6px] lg:border lg:border-navy/10 lg:bg-white lg:p-2">
        {TABS.map(([id, label, Icon]) => { const on = tab === id; return <button key={id} onClick={() => go(id)} aria-current={on ? 'page' : undefined} className={`relative flex shrink-0 items-center gap-3 rounded-[3px] px-4 py-3 text-sm font-bold transition-colors lg:rounded-2xl ${on ? 'text-white' : 'text-ink/65 hover:text-navy'}`}>
          {on && <motion.span layoutId="profile-tab" className="absolute inset-0 rounded-full bg-navy lg:rounded-2xl" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <Icon size={18} className="relative" /><span className="relative">{label}</span>
          {id === 'orders' && orders.length > 0 && <span className={`relative ml-auto rounded-[3px] px-2 py-0.5 text-[10px] ${on ? 'bg-white/20' : 'bg-navy/10'}`}>{orders.length}</span>}</button>; })}
      </nav>
      <AnimatePresence mode="wait" initial={false}>
        <motion.section key={tab} aria-label={TABS.find(t => t[0] === tab)[1]} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { duration: .35, ease } }} exit={{ opacity: 0, transition: { duration: .12 } }} className="min-w-0">
          {tab === 'overview' && <Overview go={go} />}{tab === 'details' && <Details />}{tab === 'orders' && <Orders />}{tab === 'addresses' && <Addresses />}
        </motion.section>
      </AnimatePresence>
    </div>
  </main>;
}
