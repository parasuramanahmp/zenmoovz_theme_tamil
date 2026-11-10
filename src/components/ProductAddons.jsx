import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ENGRAVE, KNOCK, STRING_FROM, stringTotal } from '../data/services.js';
import { money } from '../store.jsx';
import { EngraveFields, STRING_DEFAULT, StringFields } from './ServiceForms.jsx';

export { STRING_DEFAULT };
export const ENGRAVE_DEFAULT = { text: '', spot: ENGRAVE.spots[0] };

/* One add-on: a checkbox row (title, what it is, price). Ticking it opens its options underneath. */
function AddonCard({ on, onToggle, title, sub, price, children }) {
  return <div className={`rounded-[4px] border bg-white transition-colors ${on ? 'border-ink ring-1 ring-ink' : 'border-ink/15'}`}>
    <label className="flex cursor-pointer items-center gap-4 px-4 py-3.5">
      <input type="checkbox" checked={on} onChange={onToggle} className="peer sr-only" />
      <span aria-hidden="true" className={`grid h-6 w-6 shrink-0 place-items-center rounded-[4px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2 ${on ? 'border-ink bg-ink text-white' : 'border-ink/25 bg-white'}`}>{on && <Check size={14} strokeWidth={3} />}</span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{title}</span><span className="block text-xs text-ink/55">{sub}</span></span>
      <span className="shrink-0 text-sm font-bold">{price}</span>
    </label>
    <AnimatePresence initial={false}>{on && children && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .3, ease: [.22, 1, .36, 1] }} className="overflow-hidden">
      <div className="border-t border-ink/10 px-4 pb-4 pt-4">{children}</div></motion.div>}</AnimatePresence>
  </div>;
}

/* Bats: knocking-in and engraving. Rackets: stringing. Anything else renders nothing. */
export default function ProductAddons({ kind, on, setOn, eng, setEng, engErr, setEngErr, str, setStr }) {
  const toggle = k => () => setOn({ ...on, [k]: !on[k] });
  if (kind === 'bat') return <div id="pdp-addons" className="mt-6 scroll-mt-44">
    <p className="mb-2 text-sm font-bold">Add-ons <span className="font-medium text-ink/45">· done at our counter</span></p>
    <div className="grid gap-2.5">
      <AddonCard on={on.knock} onToggle={toggle('knock')} title="Add bat knocking-in" sub={`${KNOCK.recommended.toLocaleString('en-IN')} knocks at our counter · GST incl.`} price={money(KNOCK.base)} />
      <AddonCard on={on.engrave} onToggle={toggle('engrave')} title="Add bat engraving" sub="Your name or number on the bat · GST incl." price={money(ENGRAVE.price)}>
        <EngraveFields text={eng.text} setText={t => { setEng({ ...eng, text: t }); setEngErr(''); }} spot={eng.spot} setSpot={s => setEng({ ...eng, spot: s })} error={engErr} />
      </AddonCard>
    </div>
  </div>;
  if (kind === 'racket') return <div id="pdp-addons" className="mt-6 scroll-mt-44">
    <p className="mb-2 text-sm font-bold">Add-ons <span className="font-medium text-ink/45">· done at our counter</span></p>
    <AddonCard on={on.string} onToggle={toggle('string')} title="Add stringing" sub="Fresh string, fitted while you wait · GST incl." price={on.string ? money(stringTotal(str.mode, str.string)) : `from ${money(STRING_FROM)}`}>
      <StringFields cfg={str} setCfg={setStr} />
    </AddonCard>
  </div>;
  return null;
}
