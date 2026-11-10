import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { ProductArt } from '../art.jsx';
import { CAT, PRODUCTS } from '../data/catalog.js';
import { Money, Roll, Words } from '../motion.jsx';
import { FREE_SHIP, goodsTotal, money, servicesOnly, shippingForCart, useStore } from '../store.jsx';
import { hrefOf } from '../lib/shop.js';
import { Button, EmptyState, SectionHeading } from '../ui.jsx';
import { ProductGrid } from '../components/ProductCard.jsx';

export default function Cart() {
  const { cart, setQty, removeFromCart } = useStore();
  const subtotal = cart.reduce((s, p) => s + p.price * p.qty, 0), mrp = cart.reduce((s, p) => s + p.oldPrice * p.qty, 0), goods = goodsTotal(cart), svcOnly = servicesOnly(cart), hasSvc = cart.some(p => p.service), ship = shippingForCart(cart), left = Math.max(0, FREE_SHIP - goods);
  const more = useMemo(() => { const sports = new Set(cart.map(p => p.sport)), have = new Set(cart.map(p => p.id)); return PRODUCTS.filter(p => sports.has(p.sport) && !have.has(p.id)).sort((a, b) => b.rating - a.rating).slice(0, 4); }, [cart.length]);
  return <main className="section-wrap min-h-[55vh] pb-16 pt-10">
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-4xl font-extrabold tracking-[-.05em] sm:text-5xl"><Words text="Shopping cart" /><span className="lime-text">.</span></h1><p className="mt-3 text-sm text-ink/50">Good gear. Great moves.</p></div><Button to="/" variant="outline"><ArrowLeft size={16} /> Keep shopping</Button></div>
    {!cart.length ? <EmptyState title="Your cart is taking a break." body="Find your next favourite and bring it to the game." action={<Button to="/">Explore the store <ArrowRight size={16} /></Button>} /> : <>
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_350px]">
        <div className="grid gap-3"><AnimatePresence mode="popLayout">{cart.map((p, i) => <motion.article layout key={p.key} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 90, scale: .9 }} transition={{ delay: i * .05, type: 'spring', stiffness: 260, damping: 26 }} className="flex gap-4 rounded-[6px] border border-navy/10 bg-white p-3 sm:gap-5 sm:p-4">
          <Link to={hrefOf(p)} className="h-28 w-28 shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-32"><ProductArt product={p} className="h-full w-full" /></Link>
          <div className="flex min-w-0 flex-1 flex-col justify-between py-1"><div><p className="text-xs text-ink/45">{p.service ? 'In-store service · Pallikaranai counter' : `${p.brand} · ${CAT[p.cat].label}`}</p><Link to={hrefOf(p)} className="mt-1 block truncate text-sm font-bold sm:text-base">{p.name}</Link>{p.size && <p className="mt-1 text-xs text-ink/55">{p.service ? 'Details' : 'Option'}: {p.size}</p>}<p className="mt-2 font-bold">{money(p.price)}</p></div>
            <div className="mt-3 flex items-center justify-between gap-3"><div className="flex items-center gap-3 rounded-[3px] border border-navy/10 px-2 py-1"><button onClick={() => setQty(p.key, p.qty - 1)} aria-label="Decrease quantity" className="p-1 text-ink/60 hover:text-accent"><Minus size={14} /></button><Roll v={p.qty} className="min-w-4 text-center text-xs" /><button onClick={() => setQty(p.key, p.qty + 1)} aria-label="Increase quantity" className="p-1 text-ink/60 hover:text-accent"><Plus size={14} /></button></div>
              <button onClick={() => removeFromCart(p.key)} className="flex items-center gap-1 text-xs text-ink/40 transition hover:text-red-500"><Trash2 size={14} /><span className="hidden sm:inline">Remove</span></button></div></div>
          <p className="hidden pt-2 text-sm font-bold sm:block"><Money value={p.price * p.qty} /></p></motion.article>)}</AnimatePresence></div>
        <aside className="rounded-[6px] border border-navy/10 bg-white p-6 lg:sticky lg:top-44"><h2 className="text-xl font-extrabold">Order summary</h2>
          <div className="mt-6 space-y-4 border-b border-navy/10 pb-5 text-sm"><div className="flex justify-between text-ink/55"><span>Subtotal</span><span className="text-ink"><Money value={subtotal} /></span></div>{mrp > subtotal && <div className="flex justify-between font-semibold text-emerald-600"><span>Offer savings</span><span>− <Money value={mrp - subtotal} /></span></div>}<div className="flex justify-between text-ink/55"><span>Delivery</span><span className={ship ? 'text-ink' : 'font-semibold text-emerald-600'}>{svcOnly ? 'Not needed' : ship ? money(ship) : 'Free'}</span></div>
            {!svcOnly && <div><p className="mb-2 text-xs text-ink/55">{left > 0 ? <>Add <b className="text-ink">{money(left)}</b> more for free delivery</> : 'You’ve unlocked free delivery'}</p><div className="h-1.5 overflow-hidden rounded-full bg-navy/10"><motion.div className="h-full rounded-full bg-accent" initial={false} animate={{ width: `${Math.min(100, goods / FREE_SHIP * 100)}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} /></div></div>}
            {hasSvc && <p className="rounded-[4px] bg-mist px-3 py-2.5 text-xs leading-5 text-ink/65">In-store services are done at our Pallikaranai counter. Drop your gear in after you order.</p>}</div>
          <div className="flex justify-between py-5 font-bold"><span>Total</span><span className="text-xl"><Money value={subtotal + ship} /></span></div><Button className="w-full" to="/checkout">Continue to checkout <ArrowRight size={17} /></Button><p className="mt-4 text-center text-[11px] leading-5 text-ink/40">Demo checkout only. No payment will be collected.</p></aside>
      </div>
      {more.length > 0 && <section className="mt-16"><SectionHeading title="Complete the kit" description="Picked from the sports in your cart." /><ProductGrid products={more} /></section>}
    </>}
  </main>;
}
