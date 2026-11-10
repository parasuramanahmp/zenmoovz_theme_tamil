import React, { useEffect, useState } from 'react';
import { animate, motion, useMotionValue, useSpring } from 'framer-motion';
import { LOGO } from '../data/logoPaths.js';

/* The big ZENMOOVZ in the footer, in the logo colour (LOGO.navy, #193049).
   Layers (all clipped to the letters): the solid logo navy, a faint top light, a soft sheen that sweeps across on a loop, and a soft
   spotlight that follows the pointer. Behind: a faint navy glow. On top: four star glints.
   Intro: the word wipes in left to right while it rises and un-blurs. `on` replays it each time the footer is uncovered.
   Barlow Condensed 700 is 3.75 units wide per font-size unit, so 261 fills 980. Reduced motion: still, fully visible. */
const ZEN = LOGO.navy;
const ease = [.22, 1, .36, 1];
const FACE = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif';
const WORD = { x: 500, y: 212, textAnchor: 'middle', fontFamily: FACE, fontWeight: 700, fontSize: 261, textLength: 980, lengthAdjust: 'spacing' };
const STAR = 'M0,-1 C.1,-.3 .3,-.1 1,0 C.3,.1 .1,.3 0,1 C-.1,.3 -.3,.1 -1,0 C-.3,-.1 -.1,-.3 0,-1Z';
const GLINTS = [[78, 40, 17, 0], [410, 36, 13, 1.3], [730, 40, 18, 2.6], [940, 170, 12, 3.6]];

export default function NavyWordmark({ on = true, calm = false }) {
  const wipe = useMotionValue(calm ? 1040 : 0), sheen = useMotionValue(-360);
  const mx = useMotionValue(500), my = useMotionValue(120), sx = useSpring(mx, { stiffness: 110, damping: 20 }), sy = useSpring(my, { stiffness: 110, damping: 20 });
  const [hot, setHot] = useState(false);

  useEffect(() => {
    if (calm) { wipe.set(1040); return; }
    const w = animate(wipe, on ? 1040 : 0, { duration: on ? 1.7 : 0, ease: [.65, 0, .35, 1], delay: on ? .15 : 0 });
    let s; if (on) { sheen.set(-360); s = animate(sheen, 1260, { duration: 2.2, ease: [.4, 0, .2, 1], repeat: Infinity, repeatDelay: 2.4, delay: 1.5 }); }
    return () => { w.stop(); s && s.stop(); };
  }, [on, calm]);

  const move = e => { const r = e.currentTarget.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width * 1000); my.set((e.clientY - r.top) / r.height * 232); setHot(true); };

  return <div aria-hidden="true" className="section-wrap select-none pb-4" onPointerMove={calm ? undefined : move} onPointerLeave={() => setHot(false)}>
    <motion.div initial={false} animate={calm || on ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 46, filter: 'blur(14px)' }} transition={{ duration: on ? 1.4 : .3, ease }}>
      <svg viewBox="0 0 1000 232" className="block w-full overflow-visible">
        <defs>
          <linearGradient id="nw-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".16" /><stop offset=".45" stopColor="#fff" stopOpacity="0" /></linearGradient>
          <linearGradient id="nw-sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".26" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
          <radialGradient id="nw-spot"><stop offset="0" stopColor="#fff" stopOpacity=".34" /><stop offset=".5" stopColor="#9FB7D1" stopOpacity=".14" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
          <filter id="nw-blur" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="14" /></filter>
          <filter id="nw-glint" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation=".08" /></filter>
          <clipPath id="nw-clip"><text {...WORD}>ZENMOOVZ</text></clipPath>
          <clipPath id="nw-wipe"><motion.rect x="-30" y="-40" height="320" width={wipe} /></clipPath>
        </defs>
        <g clipPath="url(#nw-wipe)">
          <text {...WORD} fill={ZEN} opacity=".16" filter="url(#nw-blur)" transform="translate(0 8)">ZENMOOVZ</text>
          <g clipPath="url(#nw-clip)">
            <rect x="0" y="0" width="1000" height="232" fill={ZEN} />
            <rect x="0" y="0" width="1000" height="232" fill="url(#nw-top)" />
            <g transform="skewX(-20)"><motion.rect x={sheen} y="-10" width="240" height="260" fill="url(#nw-sheen)" /></g>
            <motion.circle cx={sx} cy={sy} r="190" fill="url(#nw-spot)" initial={false} animate={{ opacity: hot ? 1 : 0 }} transition={{ duration: .6 }} />
          </g>
          {!calm && GLINTS.map(([x, y, s, d]) => <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
            <motion.path d={STAR} fill="#fff" stroke="#9FB7D1" strokeWidth=".06" filter="url(#nw-glint)" initial={{ scale: 0, opacity: 0 }}
              animate={on ? { scale: [0, 1, 0], rotate: [0, 40, 80], opacity: [0, 1, 0] } : { scale: 0, opacity: 0 }} transition={on ? { duration: 1.5, delay: 2 + d, repeat: Infinity, repeatDelay: 4.8, ease: 'easeInOut' } : { duration: 0 }} />
          </g>)}
        </g>
      </svg>
    </motion.div>
  </div>;
}
