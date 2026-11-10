import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight, Plus, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { ProductArt } from '../art.jsx';
import { BRANDS, BY_ID, CAT, CAT_COPY, PRODUCTS, SPORT, sizeLabel, sizesFor } from '../data/catalog.js';
import { KNOCK, cleanText, engraveLine, knockLine, servicesForProduct, stringLine } from '../data/services.js';
import { handlesFor, sizeGuideFor } from '../data/specs.js';
import { cityFor, etaFor, hrefFor } from '../lib/shop.js';
import { Stars, SparkHeart, Words } from '../motion.jsx';
import { OfferPanel, OldPrice } from '../offers.jsx';
import RateProduct from '../rating.jsx';
import { money, saved, useStore } from '../store.jsx';
import { AddButton, Button, EmptyState, SectionHeading } from '../ui.jsx';
import { ProductGrid } from '../components/ProductCard.jsx';
import { toTop } from '../components/Header.jsx';
import ProductAddons, { ENGRAVE_DEFAULT, STRING_DEFAULT } from '../components/ProductAddons.jsx';
import ProductDetails from '../components/ProductDetails.jsx';

const ease = [.22, 1, .36, 1];

export default function ProductPage() {
  const { id } = useParams(), navigate = useNavigate(), product = BY_ID[Number(id)];
  const { addToCart, addMany, wishlist, toggleWishlist, rate, ratingOf, location, setLocation } = useStore();
  const [size, setSize] = useState(null), [warn, setWarn] = useState(0), [view, setView] = useState(0), [bad, setBad] = useState({}), [pin, setPin] = useState(location?.pin || ''), [eta, setEta] = useState(location ? etaFor(location.pin) : ''), [perr, setPerr] = useState(false), [stick, setStick] = useState(false);
  const [handle, setHandle] = useState('Short'), [addons, setAddons] = useState({}), [eng, setEng] = useState(ENGRAVE_DEFAULT), [engErr, setEngErr] = useState(''), [str, setStr] = useState(STRING_DEFAULT), [tab, setTab] = useState('specs');
  const buy = useRef(null), stage = useRef(null);
  useEffect(() => { setSize(null); setView(0); setWarn(0); setBad({}); setHandle('Short'); setAddons({}); setEng(ENGRAVE_DEFAULT); setEngErr(''); setStr(STRING_DEFAULT); setTab('specs'); }, [id]);
  useEffect(() => { const el = buy.current; if (!el) return; const io = new IntersectionObserver(([e]) => setStick(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 }); io.observe(el); return () => io.disconnect(); }, [id]);
  if (product?.service) return <Navigate to={`/services#${product.service}`} replace />;
  if (!product) return <main className="section-wrap py-24"><EmptyState title="Product not found" body="This product may have moved." action={<Button to="/">Back to the store</Button>} /></main>;

  const sizes = sizesFor(product), liked = wishlist.some(x => x.id === product.id), r = ratingOf(product), sp = SPORT[product.sport];
  const kind = product.art.kind, isBat = kind === 'bat', serviceKeys = servicesForProduct(product), hasGuide = !!sizeGuideFor(product), handles = handlesFor(product);
  /* The option text on the cart line: a bat is "Short handle" (no weight choice) */
  const optionStr = isBat ? `${handle} handle` : size;
  /* In-store services ticked for this product become their own cart lines, added together with it */
  const addonLines = [
    ...(isBat && addons.knock ? [knockLine(KNOCK.recommended)] : []),
    ...(isBat && addons.engrave && cleanText(eng.text) ? [engraveLine(eng.text, eng.spot)] : []),
    ...(kind === 'racket' && addons.string ? [stringLine(str)] : []),
  ];
  const grand = product.price + addonLines.reduce((t, l) => t + l.price, 0);
  const scrollTo = elId => setTimeout(() => { const el = document.getElementById(elId); if (el) window.__lenis ? window.__lenis.scrollTo(el, { offset: -150 }) : el.scrollIntoView({ behavior: 'smooth' }); }, 30);
  const openTab = t => { setTab(t); scrollTo('product-details'); };
  const pickAddon = k => { setAddons(o => ({ ...o, [k]: true })); scrollTo('pdp-addons'); };
  const guard = fn => e => {
    if (sizes && !size) { setWarn(w => w + 1); return; }
    if (isBat && addons.engrave && !cleanText(eng.text)) { setEngErr('Enter the name or number to engrave, or untick engraving.'); scrollTo('pdp-addons'); return; }
    fn(e);
  };
  const add = e => addonLines.length
    ? addMany([{ product, size: optionStr }, ...addonLines], stage.current, `Added to cart with ${addonLines.length} in-store ${addonLines.length === 1 ? 'service' : 'services'}`)
    : addToCart(product, stage.current, optionStr);
  const defaultOption = p => p.art.kind === 'bat' ? 'Short handle' : sizesFor(p)?.[0];
  const together = PRODUCTS.filter(p => p.sport === product.sport && p.id !== product.id && p.cat !== product.cat).sort((a, b) => b.rating - a.rating).slice(0, 2);
  const bundle = [product, ...together], bundleTotal = bundle.reduce((s, p) => s + p.price, 0);
  const similar = PRODUCTS.filter(p => p.sport === product.sport && p.cat === product.cat && p.id !== product.id).concat(PRODUCTS.filter(p => p.sport === product.sport && p.cat !== product.cat && p.id !== product.id)).slice(0, 4);
  const views = [{ n: 1, label: 'Main photo' }, { n: 2, label: 'Photo 2' }, { n: 3, label: 'Photo 3' }];
  const checkPin = e => { e.preventDefault(); if (!/^[1-9]\d{5}$/.test(pin)) { setPerr(true); return; } setPerr(false); setLocation(pin); setEta(etaFor(pin)); };

  return <main className="section-wrap pb-24 pt-6 md:pb-16">
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-xs font-semibold text-ink/50">
      <Link to="/" className="hover:text-accent">Home</Link><ChevronRight size={13} /><Link to={hrefFor({ sport: product.sport })} onClick={toTop} className="hover:text-accent">{sp.name}</Link><ChevronRight size={13} /><Link to={hrefFor({ sport: product.sport, cat: product.cat })} onClick={toTop} className="hover:text-accent">{CAT[product.cat].label}</Link></nav>
    <div className="grid gap-8 md:grid-cols-2 md:gap-14">
      <div className="md:sticky md:top-44 md:self-start">
        <motion.div ref={stage} initial={{ clipPath: 'inset(0 0 100% 0 round 6px)' }} animate={{ clipPath: 'inset(0 0 0% 0 round 6px)' }} transition={{ duration: .9, ease }} className="relative overflow-hidden rounded-[6px]">
          <AnimatePresence mode="wait" initial={false}><motion.div key={view} initial={{ opacity: 0, scale: .94, rotate: -3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: .4, ease }}>
            <ProductArt product={product} n={views[view].n} className="aspect-square w-full" /></motion.div></AnimatePresence>
          {product.tag && <span className="absolute left-4 top-4 rounded-[3px] bg-navy px-3 py-1.5 text-[10px] font-bold text-white">{product.tag}</span>}
        </motion.div>
        <div className="mt-3 flex gap-3">{views.map((v, i) => <button key={i} onClick={() => setView(i)} aria-label={v.label} aria-pressed={view === i} className={`relative h-20 w-20 overflow-hidden rounded-2xl ring-2 transition ${bad[v.n] ? 'hidden' : ''} ${view === i ? 'ring-navy' : 'ring-transparent opacity-70 hover:opacity-100'}`}><ProductArt product={product} n={v.n} className="h-full w-full" onFail={() => setBad(o => ({ ...o, [v.n]: true }))} /></button>)}</div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }} className="flex flex-col">
        {BRANDS.some(b => b.id === product.brand) ? <Link to={hrefFor({ brand: product.brand })} onClick={toTop} className="w-fit text-sm font-bold text-accent hover:underline">{product.brand}</Link> : <span className="w-fit text-sm font-bold text-accent">{product.brand}</span>}
        <h1 className="mt-2 text-4xl font-extrabold leading-[1.02] tracking-[-.05em] [text-wrap:balance] sm:text-5xl"><Words text={product.name} /></h1>
        <div className="mt-4 flex flex-wrap items-center gap-3"><Stars rating={r.rating} size={15} /><button type="button" onClick={() => openTab('reviews')} className="text-xs text-ink/50 underline-offset-4 hover:text-accent hover:underline">({r.count} ratings)</button></div>
        <div className="mt-5 flex items-center gap-3"><span className="text-3xl font-extrabold">{money(product.price)}</span><OldPrice>{money(product.oldPrice)}</OldPrice></div>
        <OfferPanel product={product} />
        <p className="mt-6 max-w-lg text-sm leading-7 text-ink/60">{product.note}. {CAT_COPY[product.cat]}</p>

        {sizes && <div className="mt-6"><div className="mb-2 flex items-center gap-3"><p className="text-sm font-bold">{sizeLabel(product)}</p>
          {hasGuide && !isBat && <button type="button" onClick={() => openTab('size')} className="ml-auto text-xs font-semibold text-ink/65 underline underline-offset-4 hover:text-accent">Size guide</button>}
          <AnimatePresence>{warn > 0 && !size && <motion.span key={warn} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-xs font-semibold text-red-500" role="alert">Choose a {sizeLabel(product).toLowerCase()} first</motion.span>}</AnimatePresence></div>
          <motion.div key={warn} animate={warn ? { x: [0, -8, 8, -5, 5, 0] } : {}} transition={{ duration: .4 }} className="flex flex-wrap gap-2">{sizes.map(s => <button key={s} onClick={() => setSize(s)} aria-pressed={size === s} className={`relative rounded-[3px] border px-4 py-2 text-sm font-bold transition-colors ${size === s ? 'border-navy text-white' : 'border-navy/15 text-ink/65 hover:border-navy/40'}`}>{size === s && <motion.span layoutId="pdp-size" className="absolute inset-0 rounded-full bg-navy" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}<span className="relative">{s}</span></button>)}</motion.div></div>}

        {isBat && <div className="mt-6"><div className="mb-2 flex items-center justify-between gap-3"><p className="text-sm font-bold">Handle</p>
          <button type="button" onClick={() => openTab('size')} className="text-xs font-semibold text-ink/65 underline underline-offset-4 hover:text-accent">Size guide</button></div>
          <div className="flex gap-2" role="radiogroup" aria-label="Handle">{handles.map(h => <button key={h} type="button" role="radio" aria-checked={handle === h} onClick={() => setHandle(h)}
            className={`rounded-[3px] border px-5 py-2.5 text-sm font-bold transition-colors ${handle === h ? 'border-ink bg-ink text-white' : 'border-ink/15 bg-white text-ink/70 hover:border-ink/40'}`}>{h}</button>)}</div></div>}

        <ProductAddons kind={kind} on={addons} setOn={setAddons} eng={eng} setEng={setEng} engErr={engErr} setEngErr={setEngErr} str={str} setStr={setStr} />
        {addonLines.length > 0 && <p className="mt-3 flex items-center justify-between rounded-[4px] bg-mist px-4 py-3 text-sm"><span className="text-ink/60">{product.name} + {addonLines.length} {addonLines.length === 1 ? 'service' : 'services'}</span><b className="text-base">{money(grand)}</b></p>}

        <div ref={buy} className="mt-7 flex flex-wrap gap-3">
          <AddButton onAdd={guard(add)} label={addonLines.length ? `Add to cart · ${money(grand)}` : 'Add to cart'} className="min-w-44 flex-1 sm:flex-none" />
          <Button variant="amber" onClick={guard(() => { add(); navigate('/cart'); })}>Buy now</Button>
          <Button variant="outline" onClick={() => toggleWishlist(product)}><SparkHeart liked={liked} />{liked ? 'Saved' : 'Wishlist'}</Button>
        </div>

        <form onSubmit={checkPin} className="mt-7 rounded-2xl border border-navy/10 bg-white p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-bold"><Truck size={17} className="text-accent" />Delivery</p>
          <div className="flex gap-2"><input value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setPerr(false); }} inputMode="numeric" maxLength={6} placeholder="Enter pincode" aria-label="Delivery pincode" aria-invalid={perr} className={`min-w-0 flex-1 rounded-[3px] border bg-white px-4 py-2.5 text-sm outline-none focus:border-navy ${perr ? 'border-red-400' : 'border-navy/15'}`} /><Button type="submit" variant="outline" className="!py-2.5">Check</Button></div>
          <AnimatePresence mode="wait" initial={false}>{perr ? <motion.p key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 text-xs font-medium text-red-500" role="alert">Enter a valid 6-digit pincode.</motion.p>
            : eta ? <motion.p key={eta} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 flex items-center gap-2 text-sm text-ink/70"><Check size={15} className="text-emerald-600" />Arrives <b>{eta}</b>{cityFor(pin) ? ` in ${cityFor(pin)}` : ''}</motion.p> : null}</AnimatePresence>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink/50"><span className="flex items-center gap-1.5"><RotateCcw size={13} />7-day returns</span><span className="flex items-center gap-1.5"><ShieldCheck size={13} />Genuine product</span></div>
        </form>

        <p className="mt-4 text-xs text-ink/35">Demo storefront. Prices in INR.</p>
      </motion.div>
    </div>

    <ProductDetails product={product} tab={tab} setTab={setTab} serviceKeys={serviceKeys} picked={addons} onPickAddon={pickAddon} rating={r}
      reviews={<RateProduct name={product.name} mine={r.mine} onRate={n => rate(product.id, n)} average={r.rating} count={r.count} />} />

    {together.length > 0 && <section className="mt-16 rounded-[6px] border border-navy/10 bg-white p-5 sm:p-8">
      <h2 className="text-2xl font-extrabold tracking-tight">Complete the kit</h2>
      <div className="mt-5 flex flex-wrap items-center gap-3 sm:gap-5">
        {bundle.map((p, i) => <React.Fragment key={p.id}>{i > 0 && <Plus size={20} className="text-ink/30" />}<Link to={`/product/${p.id}`} className="group w-28 sm:w-36"><ProductArt product={p} className="aspect-square w-full overflow-hidden rounded-2xl transition-transform duration-300 group-hover:-translate-y-1" shadow={false} /><p className="mt-2 truncate text-xs font-bold">{p.name}</p><p className="text-xs text-ink/55">{money(p.price)}</p></Link></React.Fragment>)}
        <div className="ml-auto min-w-48"><p className="text-xs text-ink/50">Bundle total</p><p className="text-2xl font-extrabold">{money(bundleTotal)}</p>
          <div className="mt-3"><AddButton label="Add all 3" onAdd={e => bundle.forEach(p => addToCart(p, stage.current, defaultOption(p)))} className="w-full" /></div></div>
      </div>
    </section>}

    <section className="mt-16"><SectionHeading title="More in this game" />{<ProductGrid products={similar} />}</section>

    <AnimatePresence>{stick && <motion.div initial={{ y: 90 }} animate={{ y: 0 }} exit={{ y: 90 }} transition={{ duration: .35, ease }} className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-navy/10 bg-white/95 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
      <ProductArt product={product} className="h-12 w-12 shrink-0 overflow-hidden rounded-xl" shadow={false} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{product.name}</p><p className="text-sm font-extrabold">{money(grand)}</p></div>
      <AddButton onAdd={guard(add)} size="sm" /></motion.div>}</AnimatePresence>
  </main>;
}
