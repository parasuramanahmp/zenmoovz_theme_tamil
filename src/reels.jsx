import React, { useMemo } from 'react';
import { motion, useTransform } from 'framer-motion';
import { ART } from './art.jsx';
import { SPORT } from './data/catalog.js';

/*
  Animated "reels" used as the video placeholders in Stay in the game.
  Every scene is a pure function of playback time `t` (a MotionValue, in seconds), so pausing, scrubbing
  and jumping to a product moment all work exactly like a real video. Replace with real footage by
  setting `src` on a video in data/catalog.js.
*/
const clamp = x => Math.min(1, Math.max(0, x));
const sm = (a, b, p) => { const x = clamp((p - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a, b, x) => a + (b - a) * x;
/* Turn a function of progress (0–1) into a MotionValue that follows the clock */
function useFn(t, L, fn, n = 120) {
  const [ts, vs] = useMemo(() => { const ts = Array.from({ length: n + 1 }, (_, i) => i / n * L); return [ts, ts.map(x => fn(x / L))]; }, [L]);
  return useTransform(t, ts, vs);
}
const Bg = ({ sport, id }) => { const [a, b] = SPORT[sport].hue; return <><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs><rect width="640" height="360" fill={`url(#${id})`} /></>; };
const Pop = ({ t, L, at, to, x, y, children, color = '#fff' }) => {
  const s = useFn(t, L, p => sm(at, at + .05, p) * (1 - sm(to - .06, to, p)) * (1 + .12 * Math.sin(sm(at, at + .08, p) * Math.PI)));
  return <motion.text x={x} y={y} textAnchor="middle" fontSize="54" fontWeight="800" fill={color} style={{ scale: s, opacity: s, fontFamily: 'Bricolage Grotesque, Arial, sans-serif', letterSpacing: '-.03em', transformBox: 'fill-box', transformOrigin: 'center' }}>{children}</motion.text>;
};

function Cricket({ t, L }) {
  const bx = useFn(t, L, p => p < .38 ? lerp(640, 351, p / .38) : lerp(351, 680, clamp((p - .38) / .34)));
  const by = useFn(t, L, p => { if (p < .38) return lerp(190, 262, p / .38); const u = clamp((p - .38) / .34); return 262 - 520 * u + 330 * u * u; });
  const bo = useFn(t, L, p => p < .02 ? p / .02 : p > .72 ? 0 : 1);
  const rot = useFn(t, L, p => p < .2 ? 60 : p < .38 ? lerp(60, -25, sm(.2, .38, p)) : p < .5 ? lerp(-25, -70, sm(.38, .5, p)) : p < .78 ? lerp(-70, 60, sm(.5, .78, p)) : 60);
  const flash = useFn(t, L, p => .3 * (1 - sm(.38, .5, p)) * sm(.36, .38, p));
  return <svg viewBox="0 0 640 360" className="h-full w-full"><Bg sport="cricket" id="rc" />
    <g fill="#fff" opacity=".18">{Array.from({ length: 30 }, (_, i) => <circle key={i} cx={14 + i * 21.5} cy={96 + (i % 3) * 7} r="5" />)}</g>
    <path d="M110 360L250 250H390L530 360Z" fill="#C9A56B" /><path d="M250 250H390M215 285H425" stroke="#fff" strokeOpacity=".7" strokeWidth="3" />
    <g fill="#08121D"><circle cx="300" cy="104" r="17" /><rect x="282" y="122" width="36" height="76" rx="14" /><rect x="283" y="190" width="14" height="86" rx="6" /><rect x="304" y="190" width="14" height="86" rx="6" /></g>
    <motion.g style={{ x: 300, y: 150, rotate: rot, originX: .5, originY: .05 }}><g transform="translate(-20 -6) scale(.9)">{ART.bat.draw('#B08D57', '#0A0A0A', 'rcb')}</g></motion.g>
    <motion.g style={{ x: bx, y: by, opacity: bo, rotate: useFn(t, L, p => p * 1500) }}><circle r="11" fill="#C0392B" /><path d="M-9 -3Q0 3 9 -3M-9 3Q0 9 9 3" stroke="#F8E3C8" strokeWidth="1.4" fill="none" /></motion.g>
    <motion.rect width="640" height="360" fill="#fff" style={{ opacity: flash }} /><Pop t={t} L={L} at={.52} to={.9} x={470} y={130} color="#B08D57">SIX!</Pop></svg>;
}

function Badminton({ t, L }) {
  const sx = useFn(t, L, p => lerp(120, 520, p < .5 ? p / .5 : 1 - (p - .5) / .5));
  const sy = useFn(t, L, p => { const u = (p % .5) / .5; return 225 - 210 * 4 * u * (1 - u) - (u > .5 ? 0 : 0); });
  const sr = useFn(t, L, p => p < .5 ? lerp(-70, 70, p / .5) : lerp(70, -70, (p - .5) / .5));
  const l = useFn(t, L, p => p < .05 ? lerp(-45, 40, sm(0, .05, p)) : p < .14 ? lerp(40, -45, sm(.05, .14, p)) : p < .94 ? -45 : lerp(-45, 40, sm(.94, 1, p)));
  const r = useFn(t, L, p => p < .44 ? 45 : p < .5 ? lerp(45, -40, sm(.44, .5, p)) : p < .6 ? lerp(-40, 45, sm(.5, .6, p)) : 45);
  return <svg viewBox="0 0 640 360" className="h-full w-full"><Bg sport="badminton" id="rb" />
    <path d="M40 360L120 240H520L600 360Z" fill="#fff" fillOpacity=".1" /><path d="M120 240H520M320 240V360M70 300H570" stroke="#fff" strokeOpacity=".5" strokeWidth="2.5" />
    <g><rect x="316" y="130" width="8" height="150" fill="#0A0A0A" /><rect x="312" y="130" width="16" height="8" rx="3" fill="#C8E04A" />
      <path d="M170 150H470V215H170Z" fill="#fff" fillOpacity=".08" /><g stroke="#fff" strokeOpacity=".45">{Array.from({ length: 25 }, (_, i) => <path key={i} d={`M${170 + i * 12.5} 150V215`} />)}{Array.from({ length: 6 }, (_, i) => <path key={i} d={`M170 ${150 + i * 13}H470`} />)}</g><rect x="170" y="146" width="300" height="7" fill="#fff" /></g>
    <motion.g style={{ x: 98, y: 214, rotate: l, originX: .5, originY: .92 }}><g transform="translate(-28 -176) scale(.88) "> {ART.racket.draw('#C8E04A', '#0A0A0A', 'rbl')}</g></motion.g>
    <motion.g style={{ x: 542, y: 214, rotate: r, originX: .5, originY: .92 }}><g transform="translate(-28 -176) scale(.88)">{ART.racket.draw('#B08D57', '#0A0A0A', 'rbr')}</g></motion.g>
    <motion.g style={{ x: sx, y: sy, rotate: sr }}><g transform="translate(-14 -22) scale(.28)">{ART.shuttle.draw('#fff', '#D94B3D', 'rbs')}</g></motion.g>
    <Pop t={t} L={L} at={.46} to={.62} x={440} y={90} color="#C8E04A">Smash</Pop></svg>;
}

function Basketball({ t, L }) {
  const bx = useFn(t, L, p => p < .62 ? lerp(70, 480, p / .62) : p < .8 ? 480 + 4 * Math.sin((p - .62) * 60) : lerp(482, 540, (p - .8) / .2));
  const by = useFn(t, L, p => { if (p < .62) { const u = p / .62; return 300 - 760 * u + 600 * u * u; } if (p < .8) return lerp(140, 312, Math.pow((p - .62) / .18, 1.6)); const v = (p - .8) / .2; return 312 - 100 * 4 * v * (1 - v); });
  const net = useFn(t, L, p => 1 + .3 * Math.sin(clamp((p - .62) / .14) * Math.PI));
  return <svg viewBox="0 0 640 360" className="h-full w-full"><Bg sport="basketball" id="rk" />
    <rect y="326" width="640" height="34" fill="#C07A3C" /><path d="M0 326H640" stroke="#fff" strokeOpacity=".5" strokeWidth="3" /><path d="M60 360L150 326M240 360L260 326" stroke="#fff" strokeOpacity=".25" />
    <rect x="534" y="40" width="12" height="130" rx="3" fill="#fff" /><rect x="538" y="320" width="5" height="12" fill="#0A0A0A" /><path d="M540 170V326" stroke="#0A0A0A" strokeWidth="9" />
    <rect x="520" y="104" width="22" height="8" fill="#B08D57" />
    <motion.g style={{ scaleY: net, originX: .5, originY: 0, x: 480, y: 140 }}><g stroke="#fff" strokeWidth="1.6" fill="none"><path d="M-34 0L-22 52M-17 0L-11 56M0 0V58M17 0L11 56M34 0L22 52M-28 22H28M-24 40H24" /></g></motion.g>
    <motion.g style={{ x: bx, y: by, rotate: useFn(t, L, p => p * 1100) }}><g transform="translate(-19 -19) scale(.38)">{ART.basketball.draw('#D9531E', '#0A0A0A', 'rkb')}</g></motion.g>
    <ellipse cx="480" cy="140" rx="36" ry="9" fill="none" stroke="#B08D57" strokeWidth="6" /><path d="M444 140a36 9 0 0 0 72 0" fill="none" stroke="#B08D57" strokeWidth="2" opacity=".0" />
    <Pop t={t} L={L} at={.66} to={.94} x={330} y={110} color="#FFD2A8">Swish</Pop></svg>;
}

function Football({ t, L }) {
  const bx = useFn(t, L, p => p < .52 ? lerp(90, 548, p / .52) : lerp(548, 566, sm(.52, .7, p)));
  const by = useFn(t, L, p => { if (p < .52) { const u = p / .52; return 300 - 420 * u + 270 * u * u + (-0) * u; } return lerp(150, 200, sm(.52, .75, p)); });
  const net = useFn(t, L, p => 1 + .12 * Math.sin(clamp((p - .52) / .2) * Math.PI));
  const kr = useFn(t, L, p => lerp(0, -85, sm(.4, .6, p)) * (1 - sm(.8, 1, p)));
  const ky = useFn(t, L, p => -70 * Math.sin(sm(.4, .6, p) * Math.PI * .8));
  return <svg viewBox="0 0 640 360" className="h-full w-full"><Bg sport="football" id="rf" />
    {[0, 1, 2, 3].map(i => <rect key={i} x={i * 160} y="300" width="80" height="60" fill="#fff" fillOpacity=".05" />)}<path d="M0 300H640" stroke="#fff" strokeOpacity=".4" strokeWidth="3" />
    <motion.g style={{ scale: net, originX: 1, originY: .5 }}><rect x="500" y="110" width="124" height="190" fill="#fff" fillOpacity=".06" /><g stroke="#fff" strokeOpacity=".45">{Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${500 + i * 15.5} 110V300`} />)}{Array.from({ length: 12 }, (_, i) => <path key={i} d={`M500 ${110 + i * 16}H624`} />)}</g></motion.g>
    <rect x="496" y="104" width="130" height="8" rx="3" fill="#fff" /><rect x="496" y="104" width="8" height="196" rx="3" fill="#fff" />
    <motion.g style={{ x: 560, y: 262 + 0, rotate: kr }}><g style={{ transform: `translateY(0px)` }}><motion.g style={{ y: ky }}><rect x="-12" y="-70" width="24" height="64" rx="11" fill="#C8E04A" /><circle cy="-84" r="13" fill="#F4C9A0" /><rect x="-26" y="-64" width="52" height="10" rx="5" fill="#C8E04A" /><rect x="-10" y="-8" width="9" height="40" rx="4" fill="#0A0A0A" /><rect x="3" y="-8" width="9" height="40" rx="4" fill="#0A0A0A" /></motion.g></g></motion.g>
    <motion.g style={{ x: bx, y: by, rotate: useFn(t, L, p => p * 1300) }}><g transform="translate(-15 -15) scale(.3)">{ART.football.draw('#fff', '#0A0A0A', 'rfb')}</g></motion.g>
    <Pop t={t} L={L} at={.56} to={.94} x={300} y={110} color="#fff">GOAL!</Pop></svg>;
}

function Swimming({ t, L }) {
  const wave = useTransform(t, v => -((v * 70) % 120));
  const sx = useFn(t, L, p => lerp(-70, 700, p));
  const arm = useTransform(t, v => v * 500), kick = useTransform(t, v => Math.sin(v * 14) * 14);
  const ring = useTransform(t, v => (v * 1.4) % 1);
  const rs = useTransform(ring, v => .4 + v * 1.6), ro = useTransform(ring, v => 1 - v);
  const wv = 'M0 0q30 -14 60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0';
  return <svg viewBox="0 0 640 360" className="h-full w-full"><Bg sport="swimming" id="rs" />
    <rect y="170" width="640" height="190" fill="#032C44" fillOpacity=".55" />
    <g>{Array.from({ length: 22 }, (_, i) => <circle key={i} cx={i * 30} cy="150" r="5" fill={i % 2 ? '#B08D57' : '#fff'} />)}<path d="M0 150H640" stroke="#fff" strokeOpacity=".5" /></g>
    <g stroke="#fff" strokeOpacity=".08" strokeWidth="2">{[250, 300, 340].map(y => <path key={y} d={`M0 ${y}H640`} />)}</g>
    <motion.g style={{ x: sx }}>
      <motion.g style={{ x: 0 }}>
        <motion.ellipse cx="-4" cy="196" rx="38" ry="12" fill="#BFF0FF" fillOpacity=".5" style={{ scale: rs, opacity: ro, transformBox: 'fill-box', transformOrigin: 'center' }} />
        <ellipse cx="-62" cy="186" rx="64" ry="14" fill="#0A0A0A" /><circle cx="8" cy="178" r="15" fill="#B08D57" /><rect x="7" y="173" width="14" height="9" rx="4" fill="#0A0A0A" /><rect x="13" y="175" width="6" height="5" rx="2" fill="#BFF0FF" />
        <motion.g style={{ rotate: kick, x: -128, y: 186 }}><rect x="-26" y="-4" width="34" height="8" rx="4" fill="#0A0A0A" /></motion.g>
        <motion.g style={{ x: -30, y: 184, rotate: arm }}><rect x="-5" y="-4" width="10" height="64" rx="5" fill="#F4C9A0" transform="translate(0 -60)" /></motion.g>
      </motion.g>
    </motion.g>
    <rect y="186" width="640" height="174" fill="#04405F" fillOpacity=".25" />
    <motion.g style={{ x: wave }}><path d={wv} transform="translate(0 190)" stroke="#BFF0FF" strokeOpacity=".7" strokeWidth="3" fill="none" /><path d={wv} transform="translate(-30 232)" stroke="#BFF0FF" strokeOpacity=".35" strokeWidth="3" fill="none" /><path d={wv} transform="translate(0 284)" stroke="#BFF0FF" strokeOpacity=".22" strokeWidth="3" fill="none" /></motion.g></svg>;
}

const SCENES = { cricket: Cricket, badminton: Badminton, basketball: Basketball, football: Football, swimming: Swimming };
export const Reel = ({ kind, t, length }) => { const S = SCENES[kind]; return S ? <S t={t} L={length} /> : null; };
