import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, Trophy } from 'lucide-react';
import { Burst, Roll, Swap } from './motion.jsx';

const LABELS = ['Tap a star to rate', 'Not for me', 'Could be better', 'Pretty good', 'Really great', 'Game-changer!'];
const FACES = ['⭐', '😕', '🙂', '😀', '😍', '🤩'];

/* Hover previews the stars, click fills them one after another, throws sparkles and updates the average */
export default function RateProduct({ name, mine, onRate, average, count }) {
  const [hover, setHover] = useState(0), [pulse, setPulse] = useState(0), [at, setAt] = useState(0);
  const shown = hover || mine;
  return <div className="relative overflow-hidden rounded-[6px] border border-navy/10 bg-white p-5">
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-bold">{mine ? 'Thanks for rating!' : `How was the ${name}?`}</p>
      <AnimatePresence>{mine === 5 && <motion.span initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 12 }} className="text-amber-500"><Trophy size={20} /></motion.span>}</AnimatePresence>
    </div>
    <div className="mt-3 flex items-center" role="radiogroup" aria-label="Rate this product" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(n => <button key={n} type="button" role="radio" aria-checked={mine === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
        onMouseEnter={() => setHover(n)} onFocus={() => setHover(n)} onBlur={() => setHover(0)} onClick={() => { onRate(n); setAt(n); setPulse(p => p + 1); }}
        className="relative rounded-full p-1 outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <motion.span key={`${n}-${pulse}`} className="relative grid place-items-center" whileHover={{ scale: 1.2, rotate: -8 }} whileTap={{ scale: .8 }}
          animate={pulse && n <= mine ? { scale: [1, 1.55, 1], rotate: [0, -22, 0] } : { scale: 1 }} transition={{ duration: .5, delay: pulse ? (n - 1) * .09 : 0 }}>
          <Star size={36} className="text-navy/15" fill="currentColor" strokeWidth={0} />
          <motion.span className="absolute inset-0 grid place-items-center" initial={false} animate={{ scale: shown >= n ? 1 : 0, opacity: shown >= n ? 1 : 0 }} transition={{ type: 'spring', stiffness: 420, damping: 16 }}>
            <Star size={36} className={hover ? 'text-amber-300' : 'text-[#B08D57]'} fill="currentColor" strokeWidth={0} />
          </motion.span>
          {at === n && pulse > 0 && <Burst key={pulse} />}
        </motion.span>
      </button>)}
    </div>
    <p className="mt-2 text-sm font-semibold text-ink/70"><Swap k={shown}><span>{FACES[shown]}</span>{LABELS[shown]}</Swap></p>
    <AnimatePresence>{mine > 0 && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden text-xs leading-5 text-ink/50">
      <span className="block pt-3">Your {mine}-star rating is in. New average <b className="text-ink">{average.toFixed(1)}</b> from <Roll v={count} className="align-bottom font-bold text-ink" /> ratings.</span>
    </motion.p>}</AnimatePresence>
  </div>;
}
