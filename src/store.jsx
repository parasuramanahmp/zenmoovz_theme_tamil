import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useFly } from './motion.jsx';
import { ProductArt } from './art.jsx';
import { PRODUCTS, BY_ID } from './data/catalog.js';
import { cityFor } from './lib/shop.js';

export { PRODUCTS };
export const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
export const pct = p => Math.round((1 - p.price / p.oldPrice) * 100);
export const saved = p => p.oldPrice - p.price;
export const FREE_SHIP = 999;
export const shippingFor = subtotal => (subtotal >= FREE_SHIP || subtotal === 0 ? 0 : 79);
/* In-store services are done at the counter: they are never shipped and don't count toward free delivery */
export const goodsTotal = items => items.reduce((s, p) => p.service ? s : s + p.price * p.qty, 0);
export const shippingForCart = items => shippingFor(goodsTotal(items));
export const servicesOnly = items => items.length > 0 && items.every(p => p.service);

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || '') ?? d; } catch { return d; } };
const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);
const lineKey = (id, size) => `${id}|${size || ''}`;
/* Add one unit of a product to a list of cart lines. `price` is only stored for in-store services, whose price depends on what was chosen. */
const upsert = (old, { product, size, price }) => {
  const k = lineKey(product.id, size), f = old.find(l => lineKey(l.id, l.size) === k);
  return f ? old.map(l => lineKey(l.id, l.size) === k ? { ...l, qty: l.qty + 1 } : l) : [...old, { id: product.id, size, qty: 1, ...(product.service && price != null ? { price } : {}) }];
};

export function StoreProvider({ children }) {
  const { fly, layer } = useFly();
  /* Only ids, sizes and quantities are stored; product details always come from the catalogue */
  const [lines, setLines] = useState(() => read('zm7-cart', []));
  const [wishIds, setWishIds] = useState(() => read('zm7-wishlist', []));
  const [ratings, setRatings] = useState(() => read('zm7-ratings', {}));
  const [location, setLocationState] = useState(() => read('zm7-location', null));
  const [user, setUserState] = useState(() => read('zm7-user', null));
  const [orders, setOrders] = useState(() => read('zm7-orders', []));
  const [addresses, setAddresses] = useState(() => read('zm7-addresses', []));
  const [authOpen, setAuthOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  useEffect(() => localStorage.setItem('zm7-cart', JSON.stringify(lines)), [lines]);
  useEffect(() => localStorage.setItem('zm7-wishlist', JSON.stringify(wishIds)), [wishIds]);
  useEffect(() => localStorage.setItem('zm7-ratings', JSON.stringify(ratings)), [ratings]);
  useEffect(() => localStorage.setItem('zm7-location', JSON.stringify(location)), [location]);
  useEffect(() => localStorage.setItem('zm7-user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('zm7-orders', JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem('zm7-addresses', JSON.stringify(addresses)), [addresses]);

  const cart = useMemo(() => lines.map(l => BY_ID[l.id] && { ...BY_ID[l.id], ...(BY_ID[l.id].service && l.price != null ? { price: l.price, oldPrice: l.price } : {}), qty: l.qty, size: l.size, key: lineKey(l.id, l.size) }).filter(Boolean), [lines]);
  const wishlist = useMemo(() => wishIds.map(id => BY_ID[id]).filter(Boolean), [wishIds]);

  const toast = useCallback(t => { const id = Math.random(); setToasts(o => [...o.slice(-2), { ...t, id }]); setTimeout(() => setToasts(o => o.filter(x => x.id !== id)), 3200); }, []);
  const addToCart = (product, el, size, price) => {
    fly(product, el);
    setLines(old => upsert(old, { product, size, price }));
    toast({ product, text: 'Added to cart' });
  };
  /* A product together with the in-store services picked for it: ONE toast, every picture still flies to the cart.
     entries = [{ product, size, price }], the first is the main product. */
  const addMany = (entries, el, text) => {
    entries.forEach((e, i) => setTimeout(() => fly(e.product, el), i * 120));
    setLines(old => entries.reduce(upsert, old));
    toast({ product: entries[0].product, text: text || `${entries.length} items added to cart` });
  };
  /* "Buy kit": ONE cart line (the Cricket Kit product) and ONE toast. fliers = [{ product, el }]: each piece's picture still flies to the cart icon, one after another. */
  const addKit = (kit, size, fliers = []) => {
    fliers.forEach((f, i) => setTimeout(() => fly(f.product, f.el), i * 120));
    setLines(old => { const k = lineKey(kit.id, size), f = old.find(l => lineKey(l.id, l.size) === k); return f ? old.map(l => lineKey(l.id, l.size) === k ? { ...l, qty: l.qty + 1 } : l) : [...old, { id: kit.id, size, qty: 1 }]; });
    toast({ product: kit, text: `${kit.name} added to cart` });
  };
  /* "Buy again": put every line of a past order back in the cart with its quantity and size */
  const reorder = items => {
    const ok = items.filter(i => BY_ID[i.id]); if (!ok.length) return;
    setLines(old => ok.reduce((acc, i) => { const k = lineKey(i.id, i.size), f = acc.find(l => lineKey(l.id, l.size) === k); return f ? acc.map(l => lineKey(l.id, l.size) === k ? { ...l, qty: l.qty + i.qty } : l) : [...acc, { id: i.id, size: i.size, qty: i.qty, ...(BY_ID[i.id].service && i.price != null ? { price: i.price } : {}) }]; }, old));
    toast({ product: BY_ID[ok[0].id], text: ok.length > 1 ? `${ok.length} items added to cart` : 'Added to cart' });
  };
  const removeFromCart = key => setLines(old => old.filter(l => lineKey(l.id, l.size) !== key));
  const clearCart = () => setLines([]);
  const setQty = (key, qty) => setLines(old => qty < 1 ? old.filter(l => lineKey(l.id, l.size) !== key) : old.map(l => lineKey(l.id, l.size) === key ? { ...l, qty } : l));
  const toggleWishlist = product => {
    const had = wishIds.includes(product.id);
    setWishIds(old => had ? old.filter(i => i !== product.id) : [...old, product.id]);
    if (!had) toast({ product, text: 'Saved to wishlist', to: '/wishlist', cta: 'View' });
  };
  const setLocation = (pin, city) => setLocationState(pin ? { pin, city: city || cityFor(pin) || `Pincode ${pin}` } : null);
  /* phone = the mobile number that was just verified with an OTP; it is kept on the profile and marked verified */
  const signIn = (name, email, phone) => setUserState(u => ({ phone: '', gender: '', dob: '', ...u, name, email, ...(phone ? { phone, phoneVerified: true } : {}), since: u?.since || Date.now() }));
  const signOut = () => setUserState(null);
  /* changing the mobile number on the profile drops the verified mark until it is confirmed with an OTP again */
  const updateUser = patch => setUserState(u => u && { ...u, ...patch, ...(patch.phone !== undefined && patch.phone !== u.phone ? { phoneVerified: false } : {}) });

  /* Orders keep only ids, sizes, quantities and the price paid; art and names come from the catalogue */
  const addOrder = o => setOrders(old => [{ ...o, items: o.items.map(i => ({ id: i.id, size: i.size, qty: i.qty, price: i.price })), placedAt: o.placedAt || Date.now() }, ...old]);
  const cancelOrder = id => setOrders(old => old.map(o => o.id === id ? { ...o, status: 'cancelled', cancelledAt: Date.now() } : o));

  /* Saved addresses: the first one becomes the default; deleting the default promotes the next */
  const saveAddress = a => setAddresses(old => {
    const id = a.id || 'a' + Date.now().toString(36);
    let next = old.some(x => x.id === id) ? old.map(x => x.id === id ? { ...x, ...a, id } : x) : [...old, { ...a, id }];
    if (a.isDefault || next.length === 1) next = next.map(x => ({ ...x, isDefault: x.id === id }));
    if (!next.some(x => x.isDefault)) next = next.map((x, i) => ({ ...x, isDefault: i === 0 }));
    return next;
  });
  const removeAddress = id => setAddresses(old => { const next = old.filter(x => x.id !== id); return next.length && !next.some(x => x.isDefault) ? next.map((x, i) => ({ ...x, isDefault: i === 0 })) : next; });
  const makeDefaultAddress = id => setAddresses(old => old.map(x => ({ ...x, isDefault: x.id === id })));

  /* The visitor's own rating is blended into the demo average so the star row reacts to it */
  const rate = (id, n) => setRatings(o => ({ ...o, [id]: n }));
  const ratingOf = p => {
    const base = BY_ID[p.id] || p, mine = ratings[p.id] || 0, n = base.reviews || 0;
    return mine ? { rating: Math.round(((base.rating * n + mine) / (n + 1)) * 10) / 10, count: n + 1, mine } : { rating: base.rating, count: n, mine: 0 };
  };

  return <StoreContext.Provider value={{ cart, wishlist, addToCart, addMany, addKit, reorder, removeFromCart, clearCart, setQty, toggleWishlist, rate, ratingOf, location, setLocation, user, signIn, signOut, updateUser, orders, addOrder, cancelOrder, addresses, saveAddress, removeAddress, makeDefaultAddress, authOpen, setAuthOpen, toast }}>
    {children}{layer}
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[95] flex flex-col items-center gap-2 px-4" aria-live="polite">
      <AnimatePresence>{toasts.map(t => <motion.div key={t.id} layout initial={{ opacity: 0, y: 30, scale: .92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 14, scale: .95 }} transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        className="pointer-events-auto flex items-center gap-3 rounded-[3px] bg-ink py-2 pl-2 pr-4 text-white shadow-lift">
        <ProductArt product={t.product} className="h-9 w-9 overflow-hidden rounded-full" shadow={false} />
        <span className="flex items-center gap-1.5 text-sm font-semibold"><Check size={15} className="text-emerald-300" />{t.text}</span>
        <Link to={t.to || '/cart'} className="ml-1 rounded-[3px] bg-white/15 px-3 py-1 text-xs font-bold transition hover:bg-white/25">{t.cta || 'View cart'}</Link>
      </motion.div>)}</AnimatePresence>
    </div>
  </StoreContext.Provider>;
}
