/* ───────────────────────── Order helpers ─────────────────────────
   An order is stored once (store.jsx → addOrder) with its items, totals and `placedAt`. Everything else the summary page shows
   (arrival window, tracking stage, transaction and invoice numbers, GST) is worked out from that, so the page looks the same
   right after payment and whenever the order is opened again from "My orders". */

/* Seller details printed on the invoice block.
   !! PLACEHOLDER: replace the GSTIN (and name if needed) with your real, registered details before going live. */
export const SELLER = { name: 'ZENMOOVZ Sports Outlet', gstin: '33AAAAA0000A1Z5' };
export const SUPPORT = { email: 'hello@zenmoovz.com', phone: '919876543210', phoneLabel: '+91 98765 43210' };

const DAY = 864e5;
export const STAGES = ['Confirmed', 'Packed', 'Shipped', 'Delivered'];

/* Demo tracking: progress follows how long ago the order was placed. Returns the last finished stage (0 = confirmed only). */
export const stageOf = o => { const d = (Date.now() - o.placedAt) / DAY; return d < 1 ? 0 : d < 2 ? 1 : d < 3.5 ? 2 : 3; };

const fmt = (t, o) => new Date(t).toLocaleDateString('en-IN', o);
export const dayLabel = t => fmt(t, { weekday: 'short', day: 'numeric', month: 'short' });                 // Wed, 11 Nov
export const dateTime = t => new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });   // 8 Nov 2026, 11:15 am
export const dateOnly = t => fmt(t, { day: 'numeric', month: 'short', year: 'numeric' });

/* Shipped by day 2, arriving between day 3 and day 5 */
export const shipBy = o => dayLabel(o.placedAt + 2 * DAY);
export const deliverBy = o => dayLabel(o.placedAt + 5 * DAY);
export const arrivalWindow = o => `${dayLabel(o.placedAt + 3 * DAY)} – ${deliverBy(o)}`;

/* Reference numbers, derived from the order id (the demo has no payment gateway behind it) */
const digits = id => String(id).replace(/\D/g, '').padStart(6, '0');
export const txnId = o => `TXN${digits(o.id)}${String(o.id).replace(/[^a-z]/gi, '').toUpperCase()}${String(o.placedAt).slice(-4)}`;
export const invoiceNo = o => `INV-ZM-${new Date(o.placedAt).getFullYear()}-${digits(o.id)}`;

/* Prices already include 18% GST: this is the part of the total that is tax */
export const gstIncluded = total => Math.round(total * 18 / 118);

export const isCod = o => /cash/i.test(o.method || '');
export const unitCount = o => o.items.reduce((s, i) => s + i.qty, 0);
