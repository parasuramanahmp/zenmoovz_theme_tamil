import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { LOGO } from '../data/logoPaths.js';
import { toTop } from './Header.jsx';

/* Back-to-top button. Appears once you have scrolled a little; the ring around it fills as you move down the page (logo navy, LOGO.navy).
   It sits outside the page card so it stays put over the footer reveal, lifts above the product page's sticky buy bar, and
   rises a little at the very bottom so it never covers the footer's copyright line.
   Scrolling uses the same smooth scroll as the rest of the site (toTop in Header.jsx). */
const ZEN = LOGO.navy, R = 21, C = 2 * Math.PI * R;
export default function ToTop() {
  const { pathname } = useLocation(), [show, setShow] = useState(false), [end, setEnd] = useState(false), ring = useRef(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY, max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setShow(y > 600); setEnd(max - y < 200);       // at the very bottom, lift clear of the footer's copyright line
      if (ring.current) ring.current.style.strokeDashoffset = String(C * (1 - Math.min(1, y / max)));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf); };
  }, [pathname]);
  const pos = pathname.startsWith('/product/') ? 'bottom-24' : end ? 'bottom-16' : 'bottom-6';
  return <button type="button" onClick={toTop} aria-label="Back to top" aria-hidden={!show} tabIndex={show ? 0 : -1}
    className={`group fixed right-4 z-50 grid h-12 w-12 place-items-center rounded-full bg-white text-[#193049] shadow-lift ring-1 ring-ink/10 transition-[bottom,transform,opacity] duration-300 hover:-translate-y-1 sm:right-6 ${pos} ${show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}>
    <svg aria-hidden="true" viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
      <circle cx="24" cy="24" r={R} fill="none" stroke={ZEN} strokeOpacity=".14" strokeWidth="2" />
      <circle ref={ring} cx="24" cy="24" r={R} fill="none" stroke={ZEN} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C} />
    </svg>
    <ArrowUp size={18} strokeWidth={2.2} className="relative transition-transform duration-300 group-hover:-translate-y-0.5" />
  </button>;
}
