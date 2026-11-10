import React, { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion';

/* Animated scenes for the three in-store services, in the same calm line-and-wood style as the rest of the shop:
     knock  · a mallet works its way along a bat, tap by tap
     engrave · a stylus writes a name into the blade
     string · a racket is strung, mains first, then the crosses, and the strings hum when done
   Every scene is driven by ONE loop value `p` (0 → 1) so the pieces stay in step. The loop only runs while the scene is on screen.
   Reduced motion: each scene stands still on a finished frame. */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = t => 1 - (1 - t) * (1 - t);
const INK = '#0A0A0A', COPPER = '#B4532A';
const calm = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const SCENE = { knock: { secs: 3.6, rest: .5 }, engrave: { secs: 5.6, rest: .9 }, string: { secs: 6.2, rest: .9 } };

function useLoop(ref, { secs, rest }) {
  const p = useMotionValue(rest), seen = useInView(ref, { margin: '0px 0px -8% 0px' });
  useEffect(() => {
    if (!seen || calm()) { p.set(rest); return; }
    p.set(0); const c = animate(p, 1, { duration: secs, ease: 'linear', repeat: Infinity }); return () => c.stop();
  }, [seen]);
  return p;
}

function Defs() {
  return <defs>
    <linearGradient id="sm-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F4DDB4" /><stop offset=".55" stopColor="#E3BE88" /><stop offset="1" stopColor="#CFA06A" /></linearGradient>
    <linearGradient id="sm-mallet" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#B98354" /><stop offset=".5" stopColor="#8E5C34" /><stop offset="1" stopColor="#6A4125" /></linearGradient>
    <linearGradient id="sm-grip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A2A2D" /><stop offset="1" stopColor="#0E0E10" /></linearGradient>
    <linearGradient id="sm-frame" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3b3b40" /><stop offset=".5" stopColor="#0f0f11" /><stop offset="1" stopColor="#2a2a2e" /></linearGradient>
    <radialGradient id="sm-shadow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#000" stopOpacity=".28" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
    <clipPath id="sm-head"><ellipse cx="100" cy="52" rx="33" ry="41" /></clipPath>
  </defs>;
}

/* ───── Knock-in ───── */
const tap = v => { const u = (v * 4) % 1; return { u, d: u < .3 ? (u / .3) ** 2 : 1 - easeOut((u - .3) / .7) }; };   // d: 0 = mallet raised, 1 = on the bat
function Knock({ p }) {
  const x = useTransform(p, v => 52 + v * 88), y = useTransform(p, v => -26 * (1 - tap(v).d));
  const spark = useTransform(p, v => { const { u } = tap(v); return u >= .3 && u < .62 ? 1 - (u - .3) / .32 : 0; });
  const sparkSize = useTransform(spark, s => 1.25 - s * .35), bounce = useTransform(p, v => tap(v).d > .96 ? 1.2 : 0);
  return <g>
    <ellipse cx="100" cy="103" rx="84" ry="6" fill="url(#sm-shadow)" />
    <motion.g style={{ y: bounce }}>
      {/* bat lying on the bench */}
      <path d="M36 76Q36 68 44 68H146L162 79V91L146 100H44Q36 100 36 92Z" fill="url(#sm-wood)" stroke={INK} strokeOpacity=".7" strokeWidth=".9" strokeLinejoin="round" />
      <path d="M44 74H140M44 80H146M46 86H146M44 93H138" stroke="#9A6B3C" strokeOpacity=".35" strokeWidth=".7" strokeLinecap="round" />
      <path d="M44 69H146" stroke="#fff" strokeOpacity=".55" strokeWidth="1" />
      <rect x="162" y="80" width="30" height="10" rx="4" fill="url(#sm-grip)" stroke={INK} strokeOpacity=".6" strokeWidth=".6" />
      <path d="M170 80V90M176 80V90M182 80V90" stroke="#fff" strokeOpacity=".16" strokeWidth="1" />
    </motion.g>
    {/* mallet: the group travels along the blade, the inner group does the tapping */}
    <motion.g style={{ x, y: 68 }}>
      <motion.g style={{ y }}>
        <rect x="-3" y="-70" width="6" height="52" rx="3" fill="#A06B3F" stroke={INK} strokeOpacity=".6" strokeWidth=".7" />
        <rect x="-18" y="-24" width="36" height="22" rx="4.5" fill="url(#sm-mallet)" stroke={INK} strokeOpacity=".7" strokeWidth=".9" />
        <path d="M-12 -24V-2M12 -24V-2" stroke="#3b2414" strokeOpacity=".5" strokeWidth="1" />
      </motion.g>
      <motion.g style={{ opacity: spark, scale: sparkSize }}>
        <path d="M-16 -4L-26 -11M0 -5V-17M16 -4L26 -11M-9 -3L-14 -13M9 -3L14 -13" stroke={COPPER} strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>
    </motion.g>
  </g>;
}

/* ───── Engraving ───── */
const LETTERS = 'M62 51H78L62 71H78M88 71V51L97 62L106 51V71M122 51H138L128 71';
function Engrave({ p }) {
  const trace = useRef(null), pen = useRef(null);
  const draw = useTransform(p, v => clamp(v / .78)), fade = useTransform(p, v => v > .94 ? 1 - (v - .94) / .06 : 1), penOp = useTransform(p, v => v < .8 ? 1 : clamp(1 - (v - .8) / .08));
  useEffect(() => {
    const el = trace.current, g = pen.current; if (!el || !g) return;
    const L = el.getTotalLength(), move = t => { const pt = el.getPointAtLength(clamp(t) * L); g.setAttribute('transform', `translate(${pt.x} ${pt.y})`); };
    move(draw.get()); return draw.on('change', move);
  }, []);
  return <g>
    <ellipse cx="100" cy="104" rx="82" ry="6" fill="url(#sm-shadow)" />
    {/* the back of the blade */}
    <rect x="26" y="22" width="148" height="78" rx="12" fill="url(#sm-wood)" stroke={INK} strokeOpacity=".7" strokeWidth=".9" />
    <path d="M36 32C80 28 120 36 164 31M34 42C84 40 126 46 166 42M34 76C84 80 126 74 166 79M36 88C80 90 120 86 164 90" fill="none" stroke="#9A6B3C" strokeOpacity=".32" strokeWidth=".8" strokeLinecap="round" />
    <path d="M30 26H170" stroke="#fff" strokeOpacity=".55" strokeWidth="1.2" strokeLinecap="round" />
    <motion.g style={{ opacity: fade }}>
      <motion.path d={LETTERS} transform="translate(.8 1)" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: draw }} />
      <motion.path ref={trace} d={LETTERS} fill="none" stroke="#4A2C16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: draw }} />
    </motion.g>
    {/* the stylus: its tip rides the end of the line being written */}
    <motion.g style={{ opacity: penOp }}>
      <g ref={pen}>
        <circle r="6.5" fill="#F0B87A" opacity=".35" />
        <g transform="rotate(32)">
          <polygon points="0,0 -3.2,-9 3.2,-9" fill="#B9BBC0" stroke={INK} strokeOpacity=".5" strokeWidth=".6" />
          <rect x="-3.4" y="-40" width="6.8" height="31" rx="2.6" fill="url(#sm-grip)" stroke={INK} strokeOpacity=".6" strokeWidth=".6" />
          <rect x="-3.4" y="-40" width="6.8" height="6" rx="2.6" fill="url(#sm-mallet)" />
        </g>
        <motion.circle r="2.2" fill="#FFE2B8" animate={{ opacity: [.35, 1, .5, 1] }} transition={{ duration: .4, repeat: Infinity }} />
      </g>
    </motion.g>
  </g>;
}

/* ───── Stringing ───── */
const MAINS = Array.from({ length: 9 }, (_, i) => 100 + (i - 4) * 7.2), CROSS = Array.from({ length: 11 }, (_, j) => 52 + (j - 5) * 7.8);
function Str({ p, x1, y1, x2, y2, s, e }) {
  const l = useTransform(p, v => clamp((v - s) / (e - s)));
  return <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2a2a2e" strokeWidth="1.05" strokeLinecap="round" style={{ pathLength: l }} />;
}
function Strings({ p }) {
  const hum = useTransform(p, v => v > .84 && v < .93 ? Math.sin((v - .84) * 190) * ((.93 - v) / .09) * 1.5 : 0), fade = useTransform(p, v => v > .94 ? 1 - (v - .94) / .06 : 1);
  return <g>
    <ellipse cx="100" cy="106" rx="62" ry="5" fill="url(#sm-shadow)" />
    <motion.g style={{ opacity: fade }}>
      <motion.g style={{ x: hum }} clipPath="url(#sm-head)">
        {MAINS.map((x, i) => <Str key={x} p={p} x1={x} y1="9" x2={x} y2="95" s={.04 + i * .04} e={.16 + i * .04} />)}
        {CROSS.map((y, j) => <Str key={y} p={p} x1={j % 2 ? 136 : 64} y1={y} x2={j % 2 ? 64 : 136} y2={y} s={.44 + j * .03} e={.54 + j * .03} />)}
      </motion.g>
    </motion.g>
    {/* racket frame, throat and handle */}
    <ellipse cx="100" cy="52" rx="36" ry="44" fill="none" stroke="url(#sm-frame)" strokeWidth="5" />
    <ellipse cx="100" cy="52" rx="38.2" ry="46.2" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="1" />
    <path d="M79 86Q100 108 121 86" fill="none" stroke="url(#sm-frame)" strokeWidth="4" strokeLinecap="round" />
    <rect x="97" y="98" width="6" height="14" rx="3" fill="#1b1b1e" />
    <rect x="94.5" y="108" width="11" height="11" rx="3.5" fill={COPPER} stroke={INK} strokeOpacity=".5" strokeWidth=".6" />
  </g>;
}

export default function ServiceMotion({ id, className = '' }) {
  const ref = useRef(null), cfg = SCENE[id] || SCENE.string, p = useLoop(ref, cfg);
  return <div ref={ref} aria-hidden="true" className={`relative overflow-hidden bg-mist ${className}`}>
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(255,255,255,.95),transparent_72%)]" />
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full"><Defs />
      {id === 'knock' ? <Knock p={p} /> : id === 'engrave' ? <Engrave p={p} /> : <Strings p={p} />}
    </svg>
  </div>;
}
