import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Hammer } from 'lucide-react';
import { ServiceIcon } from '../art.jsx';
import { SERVICE_LIST } from '../data/services.js';

/* Services, docked on the right edge at mid-height.
   At rest a copper tab (TAB wide) stays on screen. Point at it, focus it, or tap it on a phone and the panel slides out with the three
   services; it slides back when the pointer leaves or you tap elsewhere / press Esc. Hidden at checkout and on /services itself.
   Only the tab itself reacts to the pointer while it is closed. The wrapper and the slid-out panel have pointer-events off
   (otherwise the invisible box of the hidden panel, which still sits to the left of the tab, would open it from empty page).
   The slide is a plain inline transform (not a Tailwind class) so it can't be lost in the build. */
const TAB = '2.75rem';
export default function ServicesDock() {
  const { pathname } = useLocation(), box = useRef(null);
  const [hot, setHot] = useState(false), [tap, setTap] = useState(false), [focus, setFocus] = useState(false), show = hot || tap || focus;
  useEffect(() => { setTap(false); setHot(false); }, [pathname]);
  useEffect(() => {
    if (!tap) return;
    const off = e => { if (!box.current?.contains(e.target)) setTap(false); }, esc = e => { if (e.key === 'Escape') setTap(false); };
    document.addEventListener('pointerdown', off); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', off); document.removeEventListener('keydown', esc); };
  }, [tap]);
  if (pathname === '/checkout' || pathname === '/services') return null;

  return <aside ref={box} aria-label="In-store services" style={{ position: 'fixed', top: '50%', right: 0, zIndex: 90, transform: 'translateY(-50%)', pointerEvents: 'none' }}
    onPointerEnter={e => { if (e.pointerType === 'mouse') setHot(true); }} onPointerLeave={e => { if (e.pointerType === 'mouse') setHot(false); }}
    onFocus={() => setFocus(true)} onBlur={e => { if (!box.current?.contains(e.relatedTarget)) setFocus(false); }}>
    <div className="flex items-stretch" style={{ pointerEvents: 'none', transform: show ? 'translateX(0)' : `translateX(calc(100% - ${TAB}))`, transition: 'transform .32s cubic-bezier(.22,1,.36,1)' }}>
      <button type="button" onClick={() => setTap(t => !t)} aria-expanded={show} aria-label="In-store services"
        className="relative flex shrink-0 flex-col items-center justify-center gap-3 rounded-l-[8px] bg-accent py-6 text-white shadow-lift outline-none transition-colors hover:bg-[#98431F] focus-visible:bg-[#98431F]" style={{ width: TAB, pointerEvents: 'auto' }}>
        <Hammer size={18} strokeWidth={2} />
        <span className="text-[11px] font-bold uppercase tracking-[.2em]" style={{ writingMode: 'vertical-rl' }}>Services</span>
      </button>
      <div className="w-64 border-y border-ink/10 bg-white p-3 shadow-lift sm:w-72" style={{ pointerEvents: show ? 'auto' : 'none' }}>
        <p className="px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[.2em] text-accent">In-store services</p>
        <ul className="grid">
          {SERVICE_LIST.map(sv => <li key={sv.key}>
            <Link to={`/services#${sv.key}`} className="flex items-center gap-3 rounded-[4px] px-2 py-2.5 outline-none transition-colors hover:bg-mist focus-visible:bg-mist">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist text-ink"><ServiceIcon id={sv.key} size={18} /></span>
              <span className="min-w-0"><span className="block text-sm font-bold">{sv.title}</span><span className="block text-xs text-ink/55">{sv.price}</span></span>
            </Link>
          </li>)}
        </ul>
        <Link to="/services" className="mt-1 flex items-center justify-between border-t border-ink/10 px-2 pt-3 text-xs font-bold uppercase tracking-[.14em] text-ink outline-none hover:text-accent focus-visible:text-accent">See all services <ArrowRight size={14} /></Link>
      </div>
    </div>
  </aside>;
}
