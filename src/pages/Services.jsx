import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronRight, MapPin } from 'lucide-react';
import { ServiceIcon } from '../art.jsx';
import { ENGRAVE, KNOCK, cleanText, engraveLine, knockLine, knockPrice, stringLine, stringTotal } from '../data/services.js';
import { hrefFor } from '../lib/shop.js';
import { Words } from '../motion.jsx';
import { money, useStore } from '../store.jsx';
import { AddButton, Button } from '../ui.jsx';
import { toTop } from '../components/Header.jsx';
import ServiceMedia from '../components/ServiceMedia.jsx';
import ServiceGallery from '../components/ServiceGallery.jsx';
import { EngraveFields, KnockFields, PriceRows, STRING_DEFAULT, StringFields, knockRows, stringRows } from '../components/ServiceForms.jsx';

const ease = [.22, 1, .36, 1];

/* One service: icon + name on top, the choices in the middle, price and the add button pinned to the bottom so the three buttons line up */
function Card({ id, index, title, tagline, children, foot, action }) {
  return <motion.article id={id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: index * .08, duration: .6, ease }}
    className="flex scroll-mt-44 flex-col rounded-[6px] border border-ink/10 bg-white p-5 sm:p-6">
    <ServiceMedia id={id} className="mb-3 aspect-[5/3] rounded-[4px]" /><ServiceGallery id={id} />
    <header className="mb-6 flex items-center gap-4">
      <div className="min-w-0"><h2 className="text-[1.7rem]">{title}</h2><p className="mt-1 text-sm text-ink/55">{tagline}</p></div>
    </header>
    <div>{children}</div>
    <div className="mt-auto pt-6">{action}<p className="mt-3 text-center text-xs leading-5 text-ink/50">{foot}</p></div>
  </motion.article>;
}

function KnockCard({ index }) {
  const { addToCart } = useStore(), [n, setN] = useState(KNOCK.recommended), price = knockPrice(n);
  return <Card id="knock" index={index} title="Bat knocking-in" tagline="Prepares a new bat for a hard ball"
    foot={`${money(KNOCK.base)} for up to ${KNOCK.included.toLocaleString('en-IN')} knocks, then ${money(KNOCK.per)} per extra ${KNOCK.step.toLocaleString('en-IN')}. Same price for any bat.`}
    action={<><PriceRows rows={knockRows(n)} total={money(price)} /><div className="mt-5"><AddButton className="w-full" label={`Add to cart · ${money(price)}`} onAdd={e => { const l = knockLine(n); addToCart(l.product, e.currentTarget, l.size, l.price); }} /></div></>}>
    <KnockFields n={n} setN={setN} />
  </Card>;
}

function EngraveCard({ index }) {
  const { addToCart } = useStore(), [text, setText] = useState(''), [spot, setSpot] = useState(ENGRAVE.spots[0]), ready = cleanText(text).length > 0;
  return <Card id="engrave" index={index} title="Bat engraving" tagline="Your name or number on the bat" foot={`Flat ${money(ENGRAVE.price)} including GST.`}
    action={<><PriceRows rows={[['Engraving (base price)', money(ENGRAVE.price)]]} total={money(ENGRAVE.price)} /><div className="mt-5"><AddButton className="w-full" disabled={!ready} label={ready ? `Add to cart · ${money(ENGRAVE.price)}` : 'Enter your text to continue'} onAdd={e => { const l = engraveLine(text, spot); addToCart(l.product, e.currentTarget, l.size, l.price); }} /></div></>}>
    <EngraveFields text={text} setText={setText} spot={spot} setSpot={setSpot} />
  </Card>;
}

function StringCard({ index }) {
  const { addToCart } = useStore(), [cfg, setCfg] = useState(STRING_DEFAULT), total = stringTotal(cfg.mode, cfg.string);
  return <Card id="string" index={index} title="Badminton stringing" tagline="Fresh string, fitted while you wait" foot="Check your racket’s maximum tension. GST included."
    action={<><PriceRows rows={stringRows(cfg)} total={money(total)} /><div className="mt-5"><AddButton className="w-full" label={`Add to cart · ${money(total)}`} onAdd={e => { const l = stringLine(cfg); addToCart(l.product, e.currentTarget, l.size, l.price); }} /></div></>}>
    <StringFields cfg={cfg} setCfg={setCfg} />
  </Card>;
}

const STEPS = [
  ['Add it to your cart', 'Choose the service, check out as usual. Nothing is shipped for a service.'],
  ['Drop your gear in', 'Bring the bat or racket to our Pallikaranai counter, in Chennai.'],
  ['We do the work', 'Stringing is fitted while you wait. Knocking-in takes about 3 days.'],
];

export default function Services() {
  const { hash } = useLocation();
  /* Cards arrive from links like /services#string: make sure the right one is in view once the page is on screen */
  useEffect(() => { if (!hash) return; const t = setTimeout(() => { const el = document.getElementById(hash.slice(1)); if (el) window.__lenis ? window.__lenis.scrollTo(el, { offset: -150 }) : el.scrollIntoView({ behavior: 'smooth' }); }, 450); return () => clearTimeout(t); }, [hash]);
  return <main className="section-wrap pb-20 pt-6 sm:pt-8">
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-xs font-semibold text-ink/50"><Link to="/" className="hover:text-accent">Home</Link><ChevronRight size={13} /><span className="text-ink">In-store services</span></nav>
    <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-[clamp(2.8rem,6vw,4.6rem)] font-bold leading-[.92]"><Words text="In-store services" /></h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-ink/60">Done at our Pallikaranai counter by people who play. Add to your cart and drop your gear in.</p>
      </div>
      <a href="https://www.google.com/maps/search/?api=1&query=Pallikaranai%2C%20Chennai" target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink/65 transition-colors hover:text-accent"><MapPin size={17} className="text-accent" />Pallikaranai, Chennai</a>
    </div>

    <div className="grid items-stretch gap-4 lg:grid-cols-3 lg:gap-5">
      <KnockCard index={0} /><EngraveCard index={1} /><StringCard index={2} />
    </div>

    <section aria-label="How in-store services work" className="mt-14 grid gap-px overflow-hidden rounded-[6px] border border-ink/10 bg-ink/10 sm:grid-cols-3">
      {STEPS.map(([t, s], i) => <div key={t} className="bg-white p-6"><span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-bold text-white">{i + 1}</span><h3 className="mt-4 text-sm font-bold">{t}</h3><p className="mt-1.5 text-sm leading-6 text-ink/55">{s}</p></div>)}
    </section>

    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[6px] bg-ink px-6 py-6 text-white sm:px-8">
      <p className="max-w-md text-sm leading-6 text-white/75">Need the gear first? Pick a bat or racket, and add its service on the product page.</p>
      <div className="flex flex-wrap gap-3"><Button variant="light" to={hrefFor({ sport: 'cricket', cat: 'Bats' })} onClick={toTop}>Shop bats <ArrowRight size={16} /></Button><Button variant="light" to={hrefFor({ sport: 'badminton', cat: 'Rackets' })} onClick={toTop}>Shop rackets <ArrowRight size={16} /></Button></div>
    </div>
  </main>;
}
