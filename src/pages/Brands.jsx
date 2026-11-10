import React from 'react';
import { Link } from 'react-router-dom';
import { Words } from '../motion.jsx';
import { BRANDS } from '../data/catalog.js';
import { BrandCard } from '../components/BrandCard.jsx';

/* /brands: every brand we stock. 28 cards divide evenly into 2, 4 and 7 columns, so the last row is never ragged. */
export default function Brands() {
  return <main className="section-wrap min-h-[55vh] pb-20 pt-10">
    <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink/50"><Link to="/" className="hover:text-ink">Home</Link><span className="mx-1.5">/</span><span className="font-semibold text-ink">Brands</span></nav>
    <div className="mb-10"><h1 className="text-4xl font-extrabold tracking-[-.05em] sm:text-5xl"><Words text="All brands" /><span className="lime-text">.</span></h1><p className="mt-3 text-sm text-ink/50">{BRANDS.length} labels, one place to play. Pick a brand to see its gear.</p></div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-7">
      {BRANDS.map((b, i) => <BrandCard key={b.id} brand={b} index={i} cols={7} dense />)}
    </div>
  </main>;
}
