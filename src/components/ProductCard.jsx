import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HeartButton, Stars, TiltCard } from '../motion.jsx';
import { ProductArt } from '../art.jsx';
import { money, pct, useStore } from '../store.jsx';
import { AddButton } from '../ui.jsx';

export function ProductCard({ product, index = 0, layout = true }) {
  const { addToCart, wishlist, toggleWishlist, ratingOf } = useStore();
  const liked = wishlist.some(x => x.id === product.id), r = ratingOf(product), off = pct(product);
  const art = e => e.currentTarget.closest('.product-card').querySelector('.product-image');
  return <TiltCard index={index} layout={layout} className="product-card group min-w-0">
    <div className="relative overflow-hidden rounded-[2px] bg-white">
      <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`} className="block aspect-[4/5] overflow-hidden">
        <ProductArt product={product} className="product-image h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
      </Link>
      {product.tag && <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[.14em] text-ink ring-1 ring-ink/10">{product.tag}</span>}
      <HeartButton liked={liked} onClick={() => toggleWishlist(product)} className="absolute right-3 top-3 shadow-sm" />
      <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100 max-sm:translate-y-0 max-sm:opacity-100">
        <AddButton tone="white" size="sm" label="Quick add" className="w-full" onAdd={e => addToCart(product, art(e))} />
      </div>
    </div>
    <div className="pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <Link to={`/product/${product.id}`} className="min-w-0 truncate text-[15px] font-medium transition-colors hover:text-accent">{product.name}</Link>
        <span className="shrink-0 text-[15px] font-semibold">{money(product.price)}</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-3 text-xs text-ink/50">
        <span className="truncate">{product.brand}</span>
        <span className="flex shrink-0 items-center gap-2"><span className="line-through">{money(product.oldPrice)}</span><span className="font-semibold text-accent">−{off}%</span></span>
      </div>
      <div className="mt-2"><Stars rating={r.rating} size={11} /></div>
    </div>
  </TiltCard>;
}

export function ProductGrid({ products, className = '' }) {
  return <div className={`grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4 ${className}`}>
    <AnimatePresence mode="popLayout">{products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</AnimatePresence>
  </div>;
}

/* Horizontally scrolling row with arrow buttons that dim at either end and a progress bar */
export function Rail({ children, label }) {
  const ref = useRef(null), [s, setS] = useState({ l: false, r: true, p: 0 });
  const update = () => { const el = ref.current; if (!el) return; const max = Math.max(1, el.scrollWidth - el.clientWidth); setS({ l: el.scrollLeft > 8, r: el.scrollLeft < max - 8, p: el.scrollLeft / max }); };
  useEffect(() => { update(); const el = ref.current; el.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); }; }, []);
  const by = d => ref.current.scrollBy({ left: d * ref.current.clientWidth * .8, behavior: 'smooth' });
  const Arrow = ({ dir, on }) => <motion.button onClick={() => by(dir)} disabled={!on} aria-label={dir < 0 ? `Previous ${label}` : `Next ${label}`} whileTap={on ? { scale: .92 } : {}}
    className={`grid h-11 w-11 place-items-center rounded-full border transition-colors ${on ? 'border-ink/25 bg-white text-ink hover:bg-ink hover:text-white' : 'cursor-default border-navy/10 text-navy/25'}`}>
    {dir < 0 ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}</motion.button>;
  return <div>
    <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:gap-6 sm:px-6" role="list" aria-label={label}>
      {React.Children.map(children, c => <div role="listitem" className="w-[62%] shrink-0 snap-start sm:w-[34%] md:w-[27%] lg:w-[23.4%]">{c}</div>)}
    </div>
    <div className="mt-6 flex items-center gap-4">
      <div className="h-px flex-1 overflow-hidden bg-ink/15"><motion.div className="h-full w-full origin-left bg-ink" animate={{ scaleX: Math.max(.12, s.p) }} transition={{ type: 'spring', stiffness: 200, damping: 30 }} /></div>
      <div className="flex gap-2"><Arrow dir={-1} on={s.l} /><Arrow dir={1} on={s.r} /></div>
    </div>
  </div>;
}
