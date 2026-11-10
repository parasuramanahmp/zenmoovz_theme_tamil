import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { PRODUCTS } from '../data/catalog.js';
import { hrefFor } from '../lib/shop.js';
import { toTop } from './Header.jsx';

/* One brand tile: logo on a white card, brand name and product count underneath.
   Used by the home "Shop by brand" section (8 cards) and the /brands page (all of them). */
export function BrandCard({ brand: b, index = 0, cols = 4, dense = false }) {
  const n = PRODUCTS.filter(p => p.brand === b.id).length;
  return <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }} transition={{ delay: (index % cols) * .05, duration: .45 }}>
    <Link to={hrefFor({ brand: b.id })} onClick={toTop} aria-label={`Shop ${b.id}, ${n} ${n === 1 ? 'product' : 'products'}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#132B3B]/10 bg-white shadow-[0_8px_24px_rgba(19,43,59,.06)] outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(19,43,59,.13)] focus-visible:ring-2 focus-visible:ring-[#132B3B] focus-visible:ring-offset-2">
      {/* fixed logo box: the logo is absolutely placed and capped, so a tall logo (SG, SS) can never stretch its card */}
      <span className="relative block aspect-[5/4] w-full">
        <img src={b.logo} alt="" loading="lazy" decoding="async" draggable="false" className={`absolute inset-0 m-auto object-contain transition-transform duration-500 group-hover:scale-[1.06] ${dense ? 'max-h-[62%] max-w-[78%]' : 'max-h-[60%] max-w-[72%]'}`} />
      </span>
      <span className={`flex items-center justify-between gap-2 border-t border-[#132B3B]/[.07] py-3 ${dense ? 'px-3' : 'px-4'}`}>
        <span className="min-w-0">
          <span className={`block truncate font-display font-bold uppercase text-[#132B3B] ${dense ? 'text-[14px] tracking-[.05em]' : 'text-[17px] tracking-[.07em]'}`}>{b.id}</span>
          <span className="block text-[11px] text-[#132B3B]/50">{n} {n === 1 ? 'product' : 'products'}</span>
        </span>
        <ArrowUpRight size={17} className="shrink-0 text-[#132B3B]/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#B4532A]" aria-hidden="true" />
      </span>
      <span aria-hidden="true" className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#B4532A] transition-all duration-500 group-hover:w-full" />
    </Link>
  </motion.div>;
}
