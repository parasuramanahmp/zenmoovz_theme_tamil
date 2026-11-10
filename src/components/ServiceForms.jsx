import React, { useId, useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { ENGRAVE, KNOCK, STRINGS, STRING_BY_ID, STRING_FROM, STRING_LABOUR, TENSIONS, TENSION_HINT, stringTotal } from '../data/services.js';
import { money } from '../store.jsx';

/* Form pieces shared by the /services page and the add-ons on bat and racket product pages.
   They only edit the choices; the page that uses them builds the cart line (see data/services.js). */

const field = 'w-full rounded-[3px] border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-ink';
const num = n => n.toLocaleString('en-IN');

export const FieldLabel = ({ children, hint, id }) => <div className="mb-2 flex items-end justify-between gap-3">
  <p id={id} className="text-[11px] font-bold uppercase tracking-[.16em] text-ink/50">{children}</p>
  {hint && <p className="text-right text-[11px] text-ink/45">{hint}</p>}
</div>;

/* One selectable row: title + sub line on the left, a price on the right */
const Choice = ({ on, onClick, title, sub, price }) => <button type="button" role="radio" aria-checked={on} onClick={onClick}
  className={`flex w-full items-center justify-between gap-4 rounded-[4px] border px-4 py-3 text-left transition-colors ${on ? 'border-ink bg-ink/[.04] ring-1 ring-ink' : 'border-ink/15 bg-white hover:border-ink/40'}`}>
  <span className="min-w-0"><span className="block text-sm font-bold">{title}</span>{sub && <span className="block text-xs text-ink/55">{sub}</span>}</span>
  {price && <span className="shrink-0 text-sm font-bold">{price}</span>}
</button>;

/* Itemised price: dotted rows, then the total */
export const PriceRows = ({ rows, total }) => <div className="mt-5 rounded-[4px] bg-mist/70 px-4 py-3 text-sm">
  {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-dashed border-ink/15 py-2 text-ink/60 last:border-0"><span>{k}</span><span className="font-semibold text-ink/80">{v}</span></div>)}
  <div className="flex justify-between gap-4 border-t border-ink/15 pt-3 text-base font-extrabold"><span>Total · GST included</span><span>{total}</span></div>
</div>;

/* ───── Bat knocking-in: number of knocks ───── */
export function KnockFields({ n, setN }) {
  const [raw, setRaw] = useState(String(n)), id = useId();
  const commit = v => { const x = Math.min(KNOCK.max, Math.max(KNOCK.min, Math.round(Number(v) || KNOCK.recommended))); setN(x); setRaw(String(x)); };
  const bump = d => commit(n + d * KNOCK.step);
  const step = 'grid h-[46px] w-[54px] shrink-0 place-items-center rounded-[3px] border border-ink/15 bg-white text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink/15';
  return <>
    <ul className="mb-5 grid gap-2.5 text-sm">
      {[[`${num(n)} controlled mallet knocks`, ' on the face and edges'], ['Linseed oil finish', ' where needed'], ['Ready in about 3 days', '']].map(([b, r]) => <li key={b} className="flex items-start gap-3"><Check size={16} className="mt-0.5 shrink-0 text-ink/60" /><span><b>{b}</b>{r}</span></li>)}
    </ul>
    <FieldLabel id={id} hint={`${num(KNOCK.recommended)} recommended`}>Number of knocks</FieldLabel>
    <div className="flex gap-2" role="group" aria-labelledby={id}>
      <button type="button" onClick={() => bump(-1)} disabled={n <= KNOCK.min} aria-label="Fewer knocks" className={step}><Minus size={16} /></button>
      <input value={raw} onChange={e => setRaw(e.target.value.replace(/\D/g, '').slice(0, 5))} onBlur={() => commit(raw)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), commit(raw))} inputMode="numeric" aria-label="Number of knocks" className={`${field} min-w-0 flex-1 border-ink/15 text-center text-base font-semibold`} />
      <button type="button" onClick={() => bump(1)} disabled={n >= KNOCK.max} aria-label="More knocks" className={step}><Plus size={16} /></button>
    </div>
    <p className="mt-2 text-[11px] text-ink/45">{num(KNOCK.min)} to {num(KNOCK.max)} knocks, in steps of {num(KNOCK.step)}.</p>
  </>;
}
export const knockRows = n => {
  const extra = Math.max(0, Math.ceil((n - KNOCK.included) / KNOCK.step));
  return [[`Knocking-in (up to ${num(KNOCK.included)} knocks)`, money(KNOCK.base)], ...(extra ? [[`${extra} extra ${extra === 1 ? 'block' : 'blocks'} of ${num(KNOCK.step)}`, money(extra * KNOCK.per)]] : [])];
};

/* ───── Bat engraving: the text and where it goes ───── */
export function EngraveFields({ text, setText, spot, setSpot, error }) {
  const id = useId(), tid = useId();
  return <>
    <FieldLabel id={tid} hint={`${text.length}/${ENGRAVE.max}`}>Name or text</FieldLabel>
    <input aria-labelledby={tid} value={text} maxLength={ENGRAVE.max} onChange={e => setText(e.target.value)} placeholder="e.g. ARJUN 18" autoComplete="off" aria-invalid={!!error}
      className={`${field} ${error ? 'border-red-400' : 'border-ink/15'}`} />
    {error && <p className="mt-1.5 text-xs font-medium text-red-500" role="alert">{error}</p>}
    <div className="mt-5"><FieldLabel id={id}>Where on the bat?</FieldLabel>
      <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby={id}>
        {ENGRAVE.spots.map(s => <button key={s} type="button" onClick={() => setSpot(s)} aria-pressed={spot === s}
          className={`rounded-[3px] border px-3 py-3 text-sm font-semibold transition-colors ${spot === s ? 'border-ink bg-ink/[.04] ring-1 ring-ink' : 'border-ink/15 bg-white text-ink/75 hover:border-ink/40'}`}>{s}</button>)}
      </div>
    </div>
  </>;
}

/* ───── Badminton stringing: own string or ours, which string, and the tension ───── */
export const STRING_DEFAULT = { mode: 'ours', string: STRINGS[0].id, tension: 24 };
export function StringFields({ cfg, setCfg }) {
  const a = useId(), b = useId(), c = useId(), set = patch => setCfg({ ...cfg, ...patch });
  return <>
    <FieldLabel id={a}>What do you need?</FieldLabel>
    <div className="grid gap-2" role="radiogroup" aria-labelledby={a}>
      <Choice on={cfg.mode === 'ours'} onClick={() => set({ mode: 'ours' })} title="String + service" sub="Pick a string, we fit it" price={`from ${money(STRING_FROM)}`} />
      <Choice on={cfg.mode === 'own'} onClick={() => set({ mode: 'own' })} title="I bring my own string" sub="Stringing labour only" price={money(STRING_LABOUR)} />
    </div>
    {cfg.mode === 'ours' && <div className="mt-5"><FieldLabel id={b}>String type</FieldLabel>
      <div className="grid gap-2" role="radiogroup" aria-labelledby={b}>
        {STRINGS.map(s => <Choice key={s.id} on={cfg.string === s.id} onClick={() => set({ string: s.id })} title={s.id} sub={s.blurb} price={money(stringTotal('ours', s.id))} />)}
      </div></div>}
    <div className="mt-5"><FieldLabel id={c} hint={TENSION_HINT}>Tension</FieldLabel>
      <select aria-labelledby={c} value={cfg.tension} onChange={e => set({ tension: Number(e.target.value) })} className={`${field} border-ink/15`}>
        {TENSIONS.map(t => <option key={t} value={t}>{t} lbs</option>)}
      </select></div>
  </>;
}
export const stringRows = cfg => cfg.mode === 'ours'
  ? [[`${cfg.string} string`, money(STRING_BY_ID[cfg.string].price)], ['Stringing labour', money(STRING_LABOUR)]]
  : [['Stringing labour (your string)', money(STRING_LABOUR)]];

