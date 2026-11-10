import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';

/*
  Sport scenes shown on the page-change curtain (one per destination page)
  and the "Clean bowled!" payment-failed screen.
  Everything is plain divs styled with Tailwind + Framer Motion — no images.
*/
const loop = once => (once ? {} : { repeat: Infinity, repeatDelay: .3 });
const START = .35; // wait for the curtain to slide in

const Stage = ({ children }) => <div className="relative h-32 w-72 overflow-hidden" aria-hidden="true">{children}<span className="absolute inset-x-0 bottom-0 h-px bg-white/25" /></div>;
const Ball = ({ className = '', children, ...rest }) => <motion.span className={`absolute block rounded-full ${className}`} {...rest}>{children}</motion.span>;
const Seam = () => <span className="absolute inset-x-0 top-1/2 h-px bg-white/80" />;
const Ring = ({ className, d, times }) => <motion.span className={`absolute block rounded-full border-2 border-white/70 ${className}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 0, 2.2], opacity: [0, .9, 0] }} transition={{ ...d, times }} />;

/* HOME — cricket: bowled in, smashed for SIX */
export function Six({ once }) {
  const d = { duration: 1.1, delay: START, ...loop(once) };
  return <Stage>
    <motion.div className="absolute left-16 top-3 h-24 w-4 origin-top" initial={{ rotate: 40 }} animate={{ rotate: [40, 40, -70, -70] }} transition={{ ...d, times: [0, .3, .5, 1], ease: 'easeIn' }}>
      <span className="mx-auto block h-7 w-1.5 rounded-full bg-white/70" />
      <span className="block h-[68px] w-4 rounded-b-md rounded-t-sm bg-amber-200" />
    </motion.div>
    {[0, 1, 2].map(i => <Ball key={i} className="left-[117px] top-[62px] h-4 w-4 bg-red-500 shadow-[inset_-2px_-2px_3px_rgba(0,0,0,.35)]"
      initial={{ x: 150, y: -6, opacity: 0 }}
      animate={{ x: [150, 0, 0, 100, 190], y: [-6, 0, 0, -56, -34], scale: [1, 1, 1, .8, .5], opacity: [1, 1, 1, 1, 0].map(v => v * (1 - i * .35)) }}
      transition={{ ...d, delay: d.delay + i * .035, times: [0, .46, .48, .75, 1], ease: 'easeOut' }}>{i === 0 && <Seam />}</Ball>)}
    <motion.span className="absolute right-3 top-2 text-3xl font-black italic tracking-tight text-[#FFE08A]" initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0, 1, 1, 0], scale: [.4, .4, 1.3, 1, 1], rotate: [0, 0, -8, -8, -8] }} transition={{ ...d, times: [0, .48, .58, .92, 1] }}>SIX!</motion.span>
  </Stage>;
}

/* SHOP — volleyball rally over the net */
export function Volley({ once }) {
  const d = { duration: 1.2, delay: START, ...loop(once) }, e = ['easeOut', 'easeIn', 'easeOut', 'easeIn'];
  return <Stage>
    <span className="absolute bottom-0 left-1/2 h-20 w-1 -translate-x-1/2 rounded bg-white/70" />
    <span className="absolute bottom-8 left-1/2 h-12 w-8 -translate-x-1/2 border-y-2 border-white/60 opacity-70 [background-image:linear-gradient(rgba(255,255,255,.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.55)_1px,transparent_1px)] [background-size:8px_8px]" />
    <motion.span className="absolute bottom-0 left-6 h-1.5 w-8 rounded-full bg-black/30" initial={{ opacity: 0 }} animate={{ x: [0, 106, 212, 106, 0], scaleX: [1, .5, 1, .5, 1], opacity: 1 }} transition={{ ...d, ease: 'linear' }} />
    <Ball className="bottom-1 left-6 h-8 w-8 overflow-hidden bg-gradient-to-br from-white to-glow" initial={{ opacity: 0 }}
      animate={{ x: [0, 106, 212, 106, 0], y: [0, -92, 0, -92, 0], rotate: [0, 360, 720, 1080, 1440], opacity: 1 }} transition={{ ...d, ease: e }}>
      <span className="absolute inset-1 rounded-full border-2 border-transparent border-t-accent/70 rotate-45" />
      <span className="absolute inset-1 rounded-full border-2 border-transparent border-b-accent/70 -rotate-12" />
      <span className="absolute inset-y-0 left-1/2 w-0.5 bg-accent/40" />
    </Ball>
  </Stage>;
}

/* PRODUCT — tennis serve: toss, smash, ball flies off */
export function Racket({ once }) {
  const d = { duration: 1.1, delay: START, ...loop(once) };
  return <Stage>
    <motion.div className="absolute bottom-0 left-[66px] w-12 origin-bottom" initial={{ rotate: -55 }} animate={{ rotate: [-55, -55, 50, 50] }} transition={{ ...d, times: [0, .35, .52, 1], ease: 'easeIn' }}>
      <span className="block h-16 w-12 rounded-[50%] border-4 border-white [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:6px_6px]" />
      <span className="mx-auto block h-10 w-1.5 rounded-full bg-white/80" />
    </motion.div>
    <Ball className="bottom-[51px] left-[123px] h-4 w-4 bg-[#D7F25A] shadow-[inset_-2px_-2px_3px_rgba(0,0,0,.25)]" initial={{ opacity: 0 }}
      animate={{ x: [0, 0, 150], y: [-50, 0, 40], scaleX: [1, 1.25, .9], opacity: [1, 1, 1] }} transition={{ ...d, times: [0, .5, 1], ease: ['easeIn', 'easeOut'] }} />
    <Ring className="bottom-[43px] left-[115px] h-8 w-8" d={d} times={[0, .5, 1]} />
  </Stage>;
}

/* CART — ball arcs straight into the bag */
export function CartDrop({ once }) {
  const d = { duration: 1.1, delay: START, ...loop(once) };
  return <Stage>
    <Ball className="bottom-1 left-4 h-6 w-6 border-2 border-orange-800/40 bg-orange-400" initial={{ opacity: 0 }}
      animate={{ x: [0, 100, 196, 196], y: [0, -96, -22, -22], scale: [1, 1, .9, .3], opacity: [1, 1, 1, 0], rotate: [0, 360, 540, 540] }} transition={{ ...d, times: [0, .5, .8, 1], ease: ['easeOut', 'easeIn', 'easeOut'] }}>
      <span className="absolute inset-x-0 top-1/2 h-px bg-orange-800/50" /><span className="absolute inset-y-0 left-1/2 w-px bg-orange-800/50" />
    </Ball>
    <motion.div className="absolute bottom-0 right-8 origin-bottom text-white/90" animate={{ scale: [1, 1, 1.14, .94, 1] }} transition={{ ...d, times: [0, .78, .84, .92, 1] }}><ShoppingBag size={64} strokeWidth={1.4} /></motion.div>
    <motion.span className="absolute bottom-[72px] right-12 text-sm font-black text-[#FFE08A]" initial={{ opacity: 0 }} animate={{ y: [0, 0, -22], opacity: [0, 1, 0] }} transition={{ ...d, times: [0, .84, 1] }}>+1</motion.span>
  </Stage>;
}

/* WISHLIST — keepy-uppy with a heart that pulses on every touch */
export function Juggle({ once }) {
  const d = { duration: 1.2, delay: START, ...loop(once) }, e = ['easeOut', 'easeIn', 'easeOut', 'easeIn'];
  return <Stage>
    <motion.span className="absolute bottom-0 left-1/2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-black/30" initial={{ opacity: 0 }} animate={{ scaleX: [1, .5, 1, .5, 1], opacity: 1 }} transition={{ ...d, ease: e }} />
    <Ball className="bottom-1 left-1/2 -ml-4 h-8 w-8 bg-white" initial={{ opacity: 0 }} animate={{ y: [0, -70, 0, -70, 0], rotate: [0, 180, 360, 540, 720], opacity: 1 }} transition={{ ...d, ease: e }}>
      <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] bg-ink" />
      {[0, 72, 144, 216, 288].map(r => <span key={r} className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-ink/70" style={{ transform: `rotate(${r}deg) translateY(-11px)` }} />)}
    </Ball>
    <motion.span className="absolute left-1/2 top-1 -ml-3 text-glow" initial={{ opacity: 0 }} animate={{ scale: [1, 1.5, 1, 1.5, 1], opacity: 1 }} transition={{ ...d, ease: 'easeInOut' }}><Heart size={24} fill="currentColor" /></motion.span>
  </Stage>;
}

/* CHECKOUT — final stretch to the finish line */
export function Finish({ once }) {
  const d = { duration: 1.1, delay: START, ...loop(once) };
  return <Stage>
    {['bottom-3', 'bottom-8', 'bottom-[52px]'].map(c => <span key={c} className={`absolute inset-x-0 h-px bg-white/15 ${c}`} />)}
    <span className="absolute bottom-0 right-8 h-28 w-2 [background-image:repeating-conic-gradient(#fff_0_25%,transparent_0_50%)] [background-size:8px_8px]" />
    {[10, 26, 42].map((b, i) => <motion.span key={b} className="absolute left-0 h-0.5 w-16 origin-left rounded bg-white/40" style={{ bottom: b }} initial={{ opacity: 0 }} animate={{ x: [0, 130, 190], scaleX: [.4, 1, .4], opacity: [0, .8, 0] }} transition={{ ...d, delay: d.delay + i * .05, times: [0, .7, .85], ease: 'easeIn' }} />)}
    <Ball className="bottom-1 left-3 h-7 w-7 bg-gradient-to-br from-white to-glow" initial={{ opacity: 0 }} animate={{ x: [0, 218], rotate: [0, 900], opacity: [1, 1] }} transition={{ ...d, times: [0, .75], ease: 'easeIn' }}><Seam /></Ball>
    <Ring className="bottom-4 right-3 h-9 w-9" d={d} times={[0, .75, 1]} />
    <motion.span className="absolute right-3 top-1 rounded bg-white px-2 py-0.5 text-[10px] font-black tracking-widest text-navy" initial={{ opacity: 0 }} animate={{ scale: [.6, .6, 1.2, 1], opacity: [0, 0, 1, 1] }} transition={{ ...d, times: [0, .75, .85, 1] }}>FINISH</motion.span>
  </Stage>;
}

/* 404 (ball misses) and payment-failed (ball hits: stumps and bails fly) */
export function Stumps({ hit = false, once = false }) {
  const d = { duration: 1.2, delay: START, ...loop(once) };
  const fall = [[-52, -26], [18, 14], [52, 26]]; // rotate, x of each stump
  const bails = [[-34, -420], [40, 520]];
  return <Stage>
    <div className="absolute bottom-0 right-20 flex gap-1.5">
      {fall.map(([r, x], i) => <motion.span key={i} className="block h-20 w-1.5 origin-bottom rounded-t-full bg-amber-200"
        animate={hit ? { rotate: [0, 0, r, r], x: [0, 0, x, x], y: [0, 0, -2, 0] } : {}} transition={{ ...d, times: [0, .62, .78, 1], ease: 'easeOut' }} />)}
      {bails.map(([x, r], i) => <motion.span key={i} className={`absolute -top-1 h-1 w-3.5 rounded bg-amber-100 ${i ? 'left-3.5' : 'left-0.5'}`}
        animate={hit ? { x: [0, 0, x, x * 1.4], y: [0, 0, -64, -8], rotate: [0, 0, r * .6, r], opacity: [1, 1, 1, 0] } : {}} transition={{ ...d, times: [0, .62, .8, 1], ease: 'easeOut' }} />)}
    </div>
    <Ball className="bottom-1 left-4 h-4 w-4 bg-red-500 shadow-[inset_-2px_-2px_3px_rgba(0,0,0,.35)]" initial={{ opacity: 0 }}
      animate={hit ? { x: [0, 62, 106, 146, 96], y: [-50, 0, -28, -4, 0], rotate: [0, 300, 600, 900, 600], opacity: [1, 1, 1, 1, 1] } : { x: [0, 62, 106, 146, 290], y: [-50, 0, -28, -92, -96], rotate: [0, 300, 600, 900, 1200], opacity: [1, 1, 1, 1, 1] }}
      transition={{ ...d, times: [0, .3, .5, .62, 1], ease: ['easeIn', 'easeOut', 'easeIn', 'easeOut'] }}><Seam /></Ball>
  </Stage>;
}

const MAP = { six: Six, volley: Volley, racket: Racket, cart: CartDrop, juggle: Juggle, finish: Finish, miss: Stumps };
export const Scene = ({ kind, once }) => { const C = MAP[kind] || Six; return <C once={once} />; };
