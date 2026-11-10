import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import FeatureShowcase from '../components/Anatomy.jsx';
import HeroCarousel from '../components/HeroCarousel.jsx';
import { BestSellers, Brands, Categories, Marquee, NewArrivals } from '../components/HomeSections.jsx';
import StayInGame from '../components/StayInGame.jsx';
import Collection from './Collection.jsx';
import { isAllView } from '../lib/shop.js';

/* "/" is a single storefront. The sport strip, search, brand and category tiles all swap this view in place. */
export default function Storefront() {
  const [params] = useSearchParams(), first = useRef(true);
  const home = isAllView(params);
  useEffect(() => { if (first.current) { first.current = false; return; } window.__lenis ? window.__lenis.scrollTo(0, { immediate: true }) : window.scrollTo({ top: 0 }); }, [params.toString()]);
  return <AnimatePresence mode="wait" initial={false}>
    {home
      ? <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .25 }}>
        <HeroCarousel /><Marquee /><Categories /><BestSellers /><FeatureShowcase /><Brands /><NewArrivals /><StayInGame />
      </motion.div>
      : <motion.div key="collection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .25 }}><Collection /></motion.div>}
  </AnimatePresence>;
}
