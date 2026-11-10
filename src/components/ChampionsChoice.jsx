import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SPORT } from '../data/catalog.js';
import { CHAMPIONS, champSlug, initialsOf } from '../data/champions.js';
import { hrefFor } from '../lib/shop.js';
import { Words } from '../motion.jsx';
import { toTop } from './Header.jsx';

const ease = [.22, 1, .36, 1];

/* The player's photo (public/champions/<name>.jpg), or a monogram tile in the sport's colours until one exists */
function Portrait({ player, sport }) {
  const [failed, setFailed] = useState(false), [c1, c2] = SPORT[sport]?.hue || ['#111111', '#B4532A'];
  const src = `/champions/${player.photo || champSlug(player.name)}.jpg`;
  return <div className="relative aspect-square overflow-hidden rounded-[6px] bg-mist">
    {failed
      /* no photo yet: a monogram tile that behaves like a photo, greyscale at rest, brand colour + zoom on hover */
      ? <div className="grid h-full w-full place-items-center grayscale transition duration-500 group-hover:scale-[1.03] group-hover:grayscale-0" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }} aria-hidden="true">
          <span className="font-display text-[clamp(3.5rem,9vw,6rem)] font-bold leading-none text-white/25 transition-transform duration-500 group-hover:scale-110">{initialsOf(player.name)}</span>
          <span className="absolute bottom-3 left-3 rounded-[3px] bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-ink">{player.brand}</span>
        </div>
      : <img src={src} alt={player.name} loading="lazy" onError={() => setFailed(true)}
          className="h-full w-full object-cover object-top grayscale transition duration-500 group-hover:scale-[1.03] group-hover:grayscale-0" />}
  </div>;
}

/* Champion's Choice: the players who play with this sport's brands. Each card opens that brand's products in the sport. */
export default function ChampionsChoice({ sport }) {
  const players = CHAMPIONS[sport];
  if (!players?.length) return null;
  return <section id="champions" aria-label="Champion’s Choice" className="mt-14 scroll-mt-40 sm:mt-16">
    <div className="mb-8 text-center sm:mb-10">
      <h2 className="text-[clamp(2.2rem,5vw,3.6rem)]"><Words text="Champion’s Choice" inView /></h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/55">The players behind the {SPORT[sport].name.toLowerCase()} brands we stock.</p>
    </div>
    <ul className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4">
      {players.map((pl, i) => <motion.li key={pl.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: i * .08, duration: .6, ease }}>
        <Link to={hrefFor({ sport, brand: pl.brand })} onClick={toTop} aria-label={`${pl.name}: view all ${pl.brand} products`}
          className="group block rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4">
          <Portrait player={pl} sport={sport} />
          <h3 className="mt-5 text-center font-display text-lg font-bold uppercase leading-tight tracking-wide sm:text-xl">{pl.name}</h3>
          <p className="mt-2 flex items-center justify-center gap-1 text-sm text-ink/55 transition-colors group-hover:text-ink">view all {pl.brand} products <ChevronRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" /></p>
        </Link>
      </motion.li>)}
    </ul>
  </section>;
}
