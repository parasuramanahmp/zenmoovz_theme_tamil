import React, { Suspense, lazy, useEffect } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Intro, useLenis } from './motion.jsx';
import { RouteLoader } from './components/LogoLoader.jsx';
import { StoreProvider } from './store.jsx';
import { Button, EmptyState } from './ui.jsx';
import Header from './components/Header.jsx';
import Shell from './components/Footer.jsx';
import Storefront from './pages/Storefront.jsx';
import CricketKit from './components/CricketKit.jsx';
import { InStoreServices, ValueProps } from './components/HomeSections.jsx';
import ToTop from './components/ToTop.jsx';
import ServicesDock from './components/ServicesDock.jsx';
import { isAllView } from './lib/shop.js';
const ProductPage = lazy(() => import('./pages/ProductPage.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'));
const Brands = lazy(() => import('./pages/Brands.jsx'));
const Checkout = lazy(() => import('./Checkout.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Services = lazy(() => import('./pages/Services.jsx'));
const OrderPage = lazy(() => import('./pages/OrderPage.jsx'));
const ButtonLab = lazy(() => import('./ButtonLab.jsx'));

const NotFound = () => <main className="section-wrap py-24"><EmptyState title="Looks like you took a wrong turn." body="The page you're looking for isn't on this court." action={<Button to="/">Back to the store <ArrowRight size={16} /></Button>} /></main>;

/* New page → back to the top. Anchor links (#id) scroll to their section instead. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => { if (hash) return; window.__lenis ? window.__lenis.scrollTo(0, { immediate: true }) : window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  useEffect(() => { if (!hash) return; const t = setTimeout(() => { const el = document.getElementById(hash.slice(1)); if (el) window.__lenis ? window.__lenis.scrollTo(el, { offset: -150 }) : el.scrollIntoView({ behavior: 'smooth' }); }, 150); return () => clearTimeout(t); }, [hash, pathname]);
  return null;
}

export default function App() {
  useLenis();
  const loc = useLocation();
  return <MotionConfig reducedMotion="user"><StoreProvider>
    <Intro /><RouteLoader /><ScrollToTop />
    <Shell><Header />
      {/* page change: the animated logo panel (RouteLoader) covers the swap; the fade below is the fallback */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={loc.pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: { duration: .4, ease: [.22, 1, .36, 1] } }} exit={{ opacity: 0, transition: { duration: .15 } }}>
          <Suspense fallback={<div className="min-h-[60vh]" />}><Routes location={loc}>
            <Route path="/" element={<Storefront />} /><Route path="/shop" element={<Navigate to="/" replace />} />
            <Route path="/product/:id" element={<ProductPage />} /><Route path="/cart" element={<Cart />} /><Route path="/checkout" element={<Checkout />} />
            <Route path="/wishlist" element={<Wishlist />} /><Route path="/brands" element={<Brands />} /><Route path="/services" element={<Services />} /><Route path="/order/:id" element={<OrderPage />} /><Route path="/profile" element={<Profile />} /><Route path="/buttons" element={<ButtonLab />} /><Route path="*" element={<NotFound />} />
          </Routes></Suspense>
        </motion.div>
      </AnimatePresence>
      {/* Cricket kit bag: sits above the footer on every page except checkout, and starts closed on each new page */}
      {/* the kit bag lives on the ALL view only: "/" with no sport / category / brand / search filter; the in-store services (knocking-in, engraving, stringing) and the trust strip sit right under it */}
      {loc.pathname === '/' && isAllView(new URLSearchParams(loc.search)) && <><CricketKit /><InStoreServices /><ValueProps /></>}
    </Shell>
    <ServicesDock /><ToTop />
  </StoreProvider></MotionConfig>;
}
