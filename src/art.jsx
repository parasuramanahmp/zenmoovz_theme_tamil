import { useEffect, useId, useState } from 'react';
import { Camera, Hammer, Pencil } from 'lucide-react';
import { SPORT } from './data/catalog.js';
import { stockFor } from './data/stock.js';

/*
  SVG drawings. The storefront no longer uses them (it shows real photos, see below);
  they only remain for the animated placeholder reels in reels.jsx.
  Each kind has a viewBox [w, h], an optional card rotation, and a draw(a, b, uid) function.
  a / b are the two colours a product uses (set in data/catalog.js).
  The same drawings are used by the product cards and the outlet racks.
*/
const pent = (cx, cy, r, rot = -90) => Array.from({ length: 5 }, (_, i) => { const t = (rot + i * 72) * Math.PI / 180; return `${(cx + r * Math.cos(t)).toFixed(1)},${(cy + r * Math.sin(t)).toFixed(1)}`; }).join(' ');

/* Soft highlight + edge shade that turns a flat circle into a ball */
const Shade = ({ u, r = 46 }) => <>
  <defs><radialGradient id={`${u}s`} cx=".34" cy=".28" r=".85"><stop offset="0" stopColor="#fff" stopOpacity=".6" /><stop offset=".45" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".38" /></radialGradient>
    <clipPath id={`${u}c`}><circle cx="50" cy="50" r={r} /></clipPath></defs>
  <circle cx="50" cy="50" r={r} fill={`url(#${u}s)`} />
</>;

export const ART = {
  bat: {
    vb: [44, 200], rot: 28, k: 1,
    draw: (a, b, u) => <g>
      <defs><linearGradient id={`${u}w`} x1="0" x2="1"><stop offset="0" stopColor="#EFD3A6" /><stop offset=".55" stopColor="#DDB57A" /><stop offset="1" stopColor="#B98A50" /></linearGradient></defs>
      <rect x="17" y="2" width="10" height="58" rx="5" fill={b} />
      {[10, 18, 26, 34, 42].map(y => <path key={y} d={`M17 ${y}l10 4`} stroke="#fff" strokeOpacity=".3" strokeWidth="1.4" />)}
      <rect x="15" y="52" width="14" height="6" rx="2" fill={a} />
      <path d="M16 58h12l9 22H7z" fill={`url(#${u}w)`} />
      <path d="M5 78h34l1 100q0 12-12 12H16q-12 0-12-12z" fill={`url(#${u}w)`} />
      {[13, 19, 25, 31].map(x => <path key={x} d={`M${x} 82V176`} stroke="#8A5A28" strokeOpacity=".2" />)}
      <rect x="11" y="104" width="22" height="48" rx="3" fill={a} />
      <path d="M11 116h22M11 140h22" stroke="#fff" strokeOpacity=".75" strokeWidth="1.6" />
      <path d="M4.5 176h35v3q0 11-12 11H16q-12 0-12-11z" fill={b} opacity=".85" />
      <path d="M38 80l1 96" stroke="#fff" strokeOpacity=".4" strokeWidth="2" />
    </g>,
  },
  racket: {
    vb: [70, 200], rot: -32, k: 1,
    draw: (a, b, u) => <g>
      <defs><clipPath id={`${u}r`}><ellipse cx="35" cy="44" rx="24" ry="34" /></clipPath></defs>
      <ellipse cx="35" cy="44" rx="24" ry="34" fill="#fff" fillOpacity=".5" />
      <g clipPath={`url(#${u}r)`} stroke={b} strokeOpacity=".55" strokeWidth=".9">
        {Array.from({ length: 9 }, (_, i) => <path key={`v${i}`} d={`M${15 + i * 5} 8V82`} />)}
        {Array.from({ length: 13 }, (_, i) => <path key={`h${i}`} d={`M8 ${14 + i * 5.2}H62`} />)}
      </g>
      <ellipse cx="35" cy="44" rx="24" ry="34" fill="none" stroke={a} strokeWidth="5.5" />
      <ellipse cx="35" cy="44" rx="24" ry="34" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.2" />
      <path d="M17 66L32 108M53 66L38 108" stroke={a} strokeWidth="4.5" strokeLinecap="round" />
      <rect x="33.5" y="100" width="3" height="46" fill={b} />
      <rect x="29" y="140" width="12" height="52" rx="4" fill={b} />
      {[148, 156, 164, 172, 180].map(y => <path key={y} d={`M29 ${y}l12 4`} stroke="#fff" strokeOpacity=".35" strokeWidth="1.3" />)}
      <rect x="27" y="188" width="16" height="8" rx="3" fill={a} />
    </g>,
  },
  football: { vb: [100, 100], k: 1, draw: (a, b, u) => <g>
    <circle cx="50" cy="50" r="46" fill={a} />
    <g clipPath={`url(#${u}c)`}>
      <polygon points={pent(50, 50, 14)} fill={b} />
      {[0, 1, 2, 3, 4].map(i => { const t = (-90 + i * 72) * Math.PI / 180, t2 = t + Math.PI / 5; return <g key={i}>
        <path d={`M${50 + 14 * Math.cos(t)} ${50 + 14 * Math.sin(t)}L${50 + 30 * Math.cos(t)} ${50 + 30 * Math.sin(t)}`} stroke={b} strokeWidth="2.2" />
        <polygon points={pent(50 + 44 * Math.cos(t2), 50 + 44 * Math.sin(t2), 15, (t2 * 180 / Math.PI) + 90)} fill={b} />
      </g>; })}
    </g>
    <Shade u={u} /></g> },
  basketball: { vb: [100, 100], k: 1, draw: (a, b, u) => <g>
    <circle cx="50" cy="50" r="46" fill={a} />
    <g clipPath={`url(#${u}c)`} stroke={b} strokeWidth="2.6" fill="none"><path d="M50 0V100M0 50H100" /><path d="M17 12C37 32 37 68 17 88M83 12C63 32 63 68 83 88" /></g>
    <Shade u={u} /></g> },
  volleyball: { vb: [100, 100], k: 1, draw: (a, b, u) => <g>
    <circle cx="50" cy="50" r="46" fill={a} />
    <g clipPath={`url(#${u}c)`}>{[0, 120, 240].map(r => <path key={r} transform={`rotate(${r} 50 50)`} d="M50 50C36 40 28 24 32 9A46 46 0 0 1 72 10C60 22 58 38 50 50Z" fill={b} fillOpacity=".92" stroke="#fff" strokeOpacity=".7" strokeWidth="1.2" />)}</g>
    <Shade u={u} /></g> },
  throwball: { vb: [100, 100], k: 1, draw: (a, b, u) => <g>
    <circle cx="50" cy="50" r="46" fill={a} />
    <g clipPath={`url(#${u}c)`}>{[0, 90, 180, 270].map(r => <path key={r} transform={`rotate(${r} 50 50)`} d="M50 50L50 0A50 50 0 0 1 85.4 14.6Z" fill={b} fillOpacity=".9" />)}
      <circle cx="50" cy="50" r="13" fill={a} stroke={b} strokeWidth="2.2" /></g>
    <Shade u={u} /></g> },
  cball: { vb: [100, 100], k: 1, draw: (a, b, u) => <g>
    <circle cx="50" cy="50" r="46" fill={a} />
    <g clipPath={`url(#${u}c)`} fill="none" stroke={b}><path d="M42 2C60 34 60 66 42 98M58 2C76 34 76 66 58 98" strokeWidth="1.6" strokeOpacity=".9" /><path d="M46 4C64 34 64 66 46 96M54 4C72 34 72 66 54 96" strokeWidth="5" strokeDasharray="1.6 3.4" strokeOpacity=".95" /></g>
    <Shade u={u} /></g> },
  cork: { vb: [100, 100], k: 1, draw: (a, b, u) => <g>
    <circle cx="50" cy="50" r="46" fill={a} />
    <g clipPath={`url(#${u}c)`} fill="none" stroke={b} strokeOpacity=".8"><path d="M4 50H96" strokeWidth="3" /><path d="M6 44H94M6 56H94" strokeWidth="1.4" strokeDasharray="2 3" />{[16, 30, 70, 84].map(x => <circle key={x} cx={x} cy={x % 2 ? 24 : 76} r="1.6" fill={b} stroke="none" />)}</g>
    <Shade u={u} /></g> },
  shoe: { vb: [200, 120], rot: -6, k: 1.05, draw: (a, b) => <g>
    <path d="M14 96V50q0-10 12-11l32-3q8 20 28 26l48 8q42 6 56 26v4z" fill={a} stroke="#0A0A0A" strokeOpacity=".28" strokeWidth="2" strokeLinejoin="round" />
    <path d="M26 39q4-14 18-12l14 9z" fill={b} />
    <path d="M30 84q50 8 112-18" stroke={b} strokeWidth="6" strokeLinecap="round" fill="none" />
    <path d="M70 52l12-6M82 58l12-6M94 62l12-6M106 66l12-6" stroke={b === '#FFFFFF' || b === '#fff' ? '#9AA7B5' : '#fff'} strokeOpacity=".9" strokeWidth="3" strokeLinecap="round" />
    <path d="M12 52q-5 22 0 44" stroke={b} strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M10 94h184q3 0 3 4v6q0 8-8 8H16q-8 0-8-8z" fill="#F4F7FA" stroke="#CBD5DF" strokeWidth="1.5" />
    <path d="M12 103h180" stroke={b} strokeWidth="3" strokeOpacity=".75" />
  </g> },
  gloves: { vb: [100, 130], rot: -12, k: 1, draw: (a, b) => <g>
    <rect x="26" y="98" width="48" height="26" rx="6" fill={b} />
    <path d="M24 98V56q0-8 8-8h36q8 0 8 8v42z" fill={a} />
    {[26, 40, 54, 68].map(x => <g key={x}><rect x={x} y="12" width="12" height="46" rx="6" fill={a} /><path d={`M${x} 28h12M${x} 40h12`} stroke={b} strokeOpacity=".45" strokeWidth="1.5" /></g>)}
    <rect x="4" y="54" width="13" height="40" rx="6.5" fill={a} transform="rotate(-28 10 74)" />
    <path d="M30 70h40M30 82h40" stroke={b} strokeOpacity=".4" strokeWidth="2" />
  </g> },
  pads: { vb: [80, 190], rot: 16, k: 1, draw: (a, b) => <g>
    <path d="M12 28h56l4 130q0 22-18 22H26q-18 0-18-22z" fill={a} stroke="#C9D3DE" strokeWidth="1.5" />
    {[26, 40, 54].map(x => <path key={x} d={`M${x} 54V168`} stroke={b} strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" />)}
    <rect x="2" y="6" width="76" height="40" rx="16" fill={b} />
    <path d="M14 19Q40 10 66 19" stroke="#fff" strokeOpacity=".35" strokeWidth="3" fill="none" strokeLinecap="round" />
    {[74, 126].map(y => <g key={y}><rect x="0" y={y} width="80" height="9" rx="4" fill={b} /><rect x="58" y={y - 2} width="11" height="13" rx="2" fill="#E8EDF2" stroke="#9AA7B5" /></g>)}
  </g> },
  helmet: { vb: [140, 130], rot: 0, k: 1, draw: (a, b) => <g>
    <path d="M14 82Q14 20 74 18Q132 18 132 82z" fill={a} />
    <path d="M74 18V82" stroke={b} strokeWidth="7" />
    <path d="M14 82h118v9H14z" fill={b} />
    <circle cx="48" cy="94" r="16" fill={b} />
    <g stroke="#CBD5DF" strokeWidth="3.4" fill="none" strokeLinecap="round"><path d="M92 90h40M92 104h38M92 118h30" /><path d="M96 90v32M110 90v30M124 90v26" /></g>
    <path d="M30 40Q50 24 80 24" stroke="#fff" strokeOpacity=".4" strokeWidth="4" fill="none" strokeLinecap="round" />
  </g> },
  jersey: { vb: [160, 150], rot: 0, k: 1, draw: (a, b) => <g>
    <path d="M50 14L20 30L4 62l24 12 12-14v76h80V60l12 14 24-12-16-32-30-16Q80 38 50 14z" fill={a} />
    <path d="M50 14Q80 38 110 14" stroke={b} strokeWidth="5" fill="none" />
    <path d="M4 62l24 12M156 62l-24 12" stroke={b} strokeWidth="6" />
    <rect x="40" y="96" width="80" height="6" fill={b} fillOpacity=".5" />
    <text x="80" y="88" textAnchor="middle" fontSize="30" fontWeight="900" fill={b} style={{ fontFamily: 'Bricolage Grotesque, Arial, sans-serif' }}>10</text>
  </g> },
  shorts: { vb: [140, 130], rot: 0, k: 1, draw: (a, b) => <g>
    <path d="M22 24H118L128 114Q128 120 122 120H80L70 70L60 120H18Q12 120 12 114Z" fill={a} />
    <rect x="21" y="22" width="98" height="16" rx="5" fill={b} />
    <path d="M62 38v14M78 38v14" stroke="#fff" strokeOpacity=".8" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M26 46L17 112M114 46l9 66" stroke={b} strokeWidth="5" strokeOpacity=".8" />
  </g> },
  cap: { vb: [120, 110], rot: -8, k: 1, draw: (a, b) => <g>
    <path d="M12 88Q10 14 60 14Q110 14 108 88Q60 104 12 88z" fill={a} />
    <path d="M12 72Q60 88 108 72" stroke={b} strokeWidth="9" fill="none" />
    <path d="M30 34Q42 22 62 22" stroke="#fff" strokeOpacity=".45" strokeWidth="4" fill="none" strokeLinecap="round" />
    <circle cx="60" cy="52" r="8" fill={b} fillOpacity=".9" />
  </g> },
  goggles: { vb: [170, 90], rot: -8, k: 1, draw: (a, b, u) => <g>
    <defs><linearGradient id={`${u}l`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={b} /><stop offset="1" stopColor="#000" stopOpacity=".7" /></linearGradient></defs>
    <path d="M18 40H2M152 40H168" stroke={a} strokeWidth="7" strokeLinecap="round" />
    <path d="M70 42Q85 32 100 42" stroke={a} strokeWidth="7" fill="none" strokeLinecap="round" />
    {[16, 94].map(x => <g key={x}><rect x={x} y="18" width="60" height="48" rx="22" fill={a} /><rect x={x + 6} y="24" width="48" height="36" rx="17" fill={`url(#${u}l)`} /><path d={`M${x + 14} 36Q${x + 20} 29 ${x + 30} 29`} stroke="#fff" strokeOpacity=".7" strokeWidth="3" fill="none" strokeLinecap="round" /></g>)}
  </g> },
  shuttle: { vb: [100, 140], rot: 18, k: 1, draw: (a, b) => <g>
    <path d="M38 104L16 20Q50 6 84 20L62 104z" fill="#fff" stroke="#D5DDE6" strokeWidth="1.5" />
    {[24, 32, 40, 50, 60, 70, 76].map((x, i) => <path key={i} d={`M${x < 50 ? 44 + (x - 40) * .25 : 50 + (x - 50) * .25} 104L${x} 18`} stroke="#D5DDE6" strokeWidth="1.3" />)}
    <path d="M24 56Q50 66 76 56" stroke={b} strokeWidth="5" fill="none" />
    <path d="M18 28Q50 38 82 28" stroke={a} strokeWidth="4" fill="none" strokeOpacity=".85" />
    <path d="M16 20Q50 6 84 20" stroke={a} strokeWidth="3" fill="none" />
    <circle cx="50" cy="112" r="15" fill="#F4E3C0" stroke="#D9C089" strokeWidth="2" /><path d="M40 108Q50 102 60 108" stroke="#fff" strokeOpacity=".7" strokeWidth="3" fill="none" />
  </g> },
  net: { vb: [200, 140], rot: 0, k: 1, draw: (a, b) => <g>
    <rect x="12" y="8" width="7" height="126" rx="3" fill={b} /><rect x="181" y="8" width="7" height="126" rx="3" fill={b} />
    <rect x="19" y="26" width="162" height="72" fill={b} fillOpacity=".06" />
    <g stroke={b} strokeOpacity=".45" strokeWidth="1">{Array.from({ length: 21 }, (_, i) => <path key={`v${i}`} d={`M${19 + i * 8.1} 26V98`} />)}{Array.from({ length: 9 }, (_, i) => <path key={`h${i}`} d={`M19 ${26 + i * 9}H181`} />)}</g>
    <rect x="19" y="22" width="162" height="8" fill={a} stroke="#C9D3DE" /><rect x="19" y="94" width="162" height="5" fill={b} />
    <path d="M6 134h188" stroke={b} strokeWidth="3" strokeLinecap="round" />
  </g> },
  bag: { vb: [200, 120], rot: 0, k: 1, draw: (a, b) => <g>
    <path d="M66 32Q66 6 100 6Q134 6 134 32" stroke={b} strokeWidth="8" fill="none" strokeLinecap="round" />
    <path d="M14 46Q14 30 30 30H170Q186 30 186 46V96Q186 110 172 110H28Q14 110 14 96z" fill={a} stroke="#C9D3DE" strokeWidth="1.2" />
    <rect x="14" y="62" width="172" height="14" fill={b} />
    <rect x="148" y="50" width="30" height="48" rx="9" fill={b} fillOpacity=".55" />
    <path d="M100 30V110" stroke="#000" strokeOpacity=".18" strokeWidth="2" /><circle cx="100" cy="68" r="4" fill="#fff" />
  </g> },
  kneepad: { vb: [120, 120], rot: -10, k: 1, draw: (a, b) => <g>
    <rect x="8" y="38" width="104" height="16" rx="8" fill={b} /><rect x="8" y="68" width="104" height="16" rx="8" fill={b} />
    <rect x="30" y="16" width="60" height="88" rx="26" fill={a} stroke="#C9D3DE" strokeWidth="1.4" />
    <ellipse cx="60" cy="60" rx="20" ry="30" fill={b} fillOpacity=".3" />
    <path d="M44 40Q60 30 76 40" stroke="#fff" strokeOpacity=".6" strokeWidth="3" fill="none" strokeLinecap="round" />
  </g> },
  board: { vb: [120, 160], rot: 14, k: 1, draw: (a, b) => <g>
    <path d="M32 8H88Q108 8 108 30V120Q108 152 60 152Q12 152 12 120V30Q12 8 32 8z" fill={a} />
    <ellipse cx="60" cy="38" rx="24" ry="9" fill="#000" fillOpacity=".25" /><ellipse cx="60" cy="36" rx="24" ry="9" fill={b} fillOpacity=".5" />
    <path d="M12 100H108" stroke={b} strokeWidth="9" strokeOpacity=".8" />
    <path d="M24 20Q22 60 26 110" stroke="#fff" strokeOpacity=".4" strokeWidth="4" fill="none" strokeLinecap="round" />
  </g> },
  stumps: { vb: [100, 170], rot: 0, k: 1, draw: (a, b) => <g>
    {[22, 46, 70].map(x => <rect key={x} x={x} y="20" width="8" height="140" rx="3" fill="#E7C48B" stroke="#C99C57" strokeWidth="1" />)}
    <rect x="18" y="12" width="26" height="7" rx="3.5" fill={b} /><rect x="56" y="12" width="26" height="7" rx="3.5" fill={b} />
    <path d="M8 160h84" stroke="#0A0A0A" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" />
  </g> },
};

/* Card background tint comes from the sport the product belongs to */
export const stage = sport => {
  const t = SPORT[sport]?.tint || '#E9EFF5';
  return `radial-gradient(circle at 50% 38%, #ffffff 0%, ${t} 58%, ${t} 100%)`;
};

/* ───────────────────────── Photos ─────────────────────────
   Product photos live in /public/products/<id>.jpg (extra angles: <id>-2.jpg, <id>-3.jpg).
   A product can also carry `image: 'https://…'` / `images: [...]` in data/catalog.js.
   If a photo is missing, a clean "photo coming soon" tile shows instead, never a drawing. */
export const slug = t => String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const photoOf = (p, n = 1) => p.images?.[n - 1] || (n === 1 && p.image) || `/products/${p.id}${n > 1 ? `-${n}` : ''}.jpg`;
export const heroPhoto = sport => `/hero/${sport}.jpg`;
export const categoryPhoto = cat => `/categories/${slug(cat)}.jpg`;

const SMALL = /\bh-(?:\d|1\d|2\d)\b|\bw-(?:\d|1\d|2\d)\b/;
function Placeholder({ sport, label, className }) {
  const small = SMALL.test(className);
  return <div className={`relative grid place-items-center overflow-hidden ${className}`} style={{ background: stage(sport) }} role="img" aria-label={label ? `${label} (photo coming soon)` : 'Photo coming soon'}>
    <div className="flex flex-col items-center gap-2 px-3 text-center text-navy/40">
      <span className={`grid place-items-center rounded-full bg-white/80 ${small ? 'h-7 w-7' : 'h-12 w-12'}`}><Camera size={small ? 14 : 22} /></span>
      {!small && <span className="text-[11px] font-semibold">Photo coming soon</span>}
    </div>
  </div>;
}

/* One photo with a graceful fallback chain: src can be a list (your own file first, then stock),
   and fit can be a matching list. Placeholder shows only when every source fails. */
export function Photo({ src, alt = '', sport, className = '', fit = 'contain', onFail, eager = false }) {
  const list = (Array.isArray(src) ? src : [src]).filter(Boolean), key = list.join('|');
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [key]);
  const done = i >= list.length;
  useEffect(() => { if (done) onFail?.(); }, [done]);
  if (done) return <Placeholder sport={sport} label={alt} className={className} />;
  const f = Array.isArray(fit) ? fit[i] || 'contain' : fit;
  return <div className={`overflow-hidden ${f === 'contain' ? 'bg-white' : 'bg-mist'} ${className}`}>
    <img key={list[i]} src={list[i]} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" referrerPolicy="no-referrer" onError={() => setI(v => v + 1)}
      className={`h-full w-full ${f === 'contain' ? 'object-contain p-[6%]' : 'object-cover'}`} />
  </div>;
}

/* Every product tile uses this: your photo from public/products first, then a free stock photo for that product type */
export function ProductArt({ product, className = '', n = 1, onFail }) {
  if (product.service) return <ServiceTile service={product.service} name={product.name} className={className} />;
  const stock = n === 1 ? stockFor(product) : null;
  return <Photo src={[photoOf(product, n), stock]} fit="contain" alt={product.name} sport={product.sport} className={className} onFail={onFail} />;
}

/* In-store services have no product photo: a calm icon tile stands in for it in the cart, toasts, checkout and orders */
export function ServiceIcon({ id, size = 22, className = '' }) {
  if (id === 'knock') return <Hammer size={size} strokeWidth={1.7} className={className} aria-hidden="true" />;
  if (id === 'engrave') return <Pencil size={size} strokeWidth={1.7} className={className} aria-hidden="true" />;
  return <SportIcon id="badminton" size={size} className={className} />;
}
function ServiceTile({ service, name, className }) {
  return <div className={`grid place-items-center bg-mist ${className}`} role="img" aria-label={`${name} (in-store service)`}>
    <span className="grid h-[58%] w-[58%] place-items-center rounded-full bg-white text-ink"><ServiceIcon id={service} className="h-1/2 w-1/2" /></span>
  </div>;
}

/* Small line icons for the sport strip */
const I = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
export function SportIcon({ id, size = 22, className = '' }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', className, 'aria-hidden': true, ...I };
  switch (id) {
    case 'badminton': return <svg {...p}><g transform="rotate(38 12 12)"><path d="M7.4 3.6Q12 2 16.6 3.6L14.1 16H9.9Z" /><path d="M9.4 4.2L10.6 16M12 3.3V16M14.6 4.2L13.4 16" strokeWidth="1.1" /><path d="M7.4 3.6Q12 5.4 16.6 3.6" strokeWidth="1.3" /><path d="M9.9 16Q12 17.4 14.1 16" /><circle cx="12" cy="19.2" r="2.5" /></g></svg>;
    case 'cricket': return <svg {...p}><g transform="rotate(38 10 12)"><rect x="9" y="2" width="2" height="6.5" rx="1" /><path d="M7.8 8.6h4.4v10.4a2.2 2.2 0 0 1-4.4 0z" /><path d="M10 11v6" strokeWidth="1.1" /></g><circle cx="17.6" cy="17.4" r="3.4" /><path d="M15.2 15.6Q17.6 17.4 20 19.2" strokeWidth="1.2" /></svg>;
    case 'football': return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8.2l3.3 2.4-1.3 3.9H10l-1.3-3.9z" /><path d="M12 8.2V3.3M15.3 10.6l4.6-1.5M14 14.5l2.8 3.9M10 14.5l-2.8 3.9M8.7 10.6L4.1 9.1" /></svg>;
    case 'volleyball': return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 3c-2.5 4-2 7.5 0 9s6 2 9 .5M12 12c-4 .5-7.4 3-8.6 6.6M12 12c1-3.6 3.2-6 6-7.4" /></svg>;
    case 'throwball': return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" /><circle cx="12" cy="12" r="3" /></svg>;
    case 'basketball': return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18M5.2 5.8Q9 9 9 12t-3.8 6.2M18.8 5.8Q15 9 15 12t3.8 6.2" /></svg>;
    case 'swimming': return <svg {...p}><rect x="2.5" y="8" width="8" height="7" rx="3.2" /><rect x="13.5" y="8" width="8" height="7" rx="3.2" /><path d="M10.5 11.5h3M2.5 11.5H1M21.5 11.5H23" /><path d="M3 19q2-1.6 4.5 0t4.5 0 4.5 0 4.5 0" /></svg>;
    default: return <svg {...p}><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></svg>;
  }
}
