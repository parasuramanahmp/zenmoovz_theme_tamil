import React from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import { Words } from '../motion.jsx';
import { useStore } from '../store.jsx';
import { Button, EmptyState } from '../ui.jsx';
import { ProductGrid } from '../components/ProductCard.jsx';

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useStore();
  return <main className="section-wrap min-h-[55vh] pb-16 pt-10">
    <div className="mb-10"><h1 className="text-4xl font-extrabold tracking-[-.05em] sm:text-5xl"><Words text="Your wishlist" /><span className="lime-text">.</span></h1><p className="mt-3 text-sm text-ink/50">The gear you love, all in one place.</p></div>
    {wishlist.length ? <><div className="mb-6 flex items-center justify-between text-xs text-ink/50"><span>{wishlist.length} saved item{wishlist.length === 1 ? '' : 's'}</span><button onClick={() => wishlist.forEach(p => toggleWishlist(p))} className="font-semibold hover:text-accent">Clear wishlist</button></div><ProductGrid products={wishlist} /><div className="mt-10 flex justify-center"><Button to="/" variant="outline">Discover more gear <ArrowRight size={16} /></Button></div></>
      : <EmptyState title="Nothing saved. Yet." body="Tap the heart on any product to keep your favourites close." action={<Button to="/">Find your favourites <Heart size={16} /></Button>} />}
  </main>;
}
