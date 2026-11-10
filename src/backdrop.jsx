import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

/*
  Footer backdrop: faint line-art sports gear drifting over court markings.
  Drawn at ~9% opacity and kept behind the footer content (z-0), so the text above stays crisp.
*/
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
const ICONS = {
  ball: <><circle cx="32" cy="32" r="24" /><path d="M14 18c8 6 8 22 0 28M50 18c-8 6-8 22 0 28M17 22l4 2M16 28l5 1M16 35l5-1M17 41l4-2M47 22l-4 2M48 28l-5 1M48 35l-5-1M47 41l-4-2" /></>,
  volleyball: <><circle cx="32" cy="32" r="24" /><path d="M32 8c-5 10-5 19 0 24s14 6 24 4M32 32c-9 2-17 8-21 18M32 32c7-8 9-17 6-24" /></>,
  racket: <><ellipse cx="25" cy="25" rx="14" ry="19" transform="rotate(-40 25 25)" /><ellipse cx="25" cy="25" rx="8" ry="12" transform="rotate(-40 25 25)" /><path d="M36 38l16 16M46 58l10-10" /></>,
  bat: <g transform="rotate(35 32 32)"><rect x="23" y="3" width="18" height="36" rx="4" /><path d="M29 39v9M35 39v9M29 48h6v11h-6z" /></g>,
  shuttle: <><circle cx="32" cy="50" r="7" /><path d="M26 45L15 10M38 45l11-35M32 43V8M15 10c11-5 23-5 34 0M20 24c8-3 16-3 24 0" /></>,
  stumps: <path d="M18 58V16M32 58V16M46 58V16M16 11h18M30 11h18" />,
  shoe: <><path d="M5 44V29c0-3 2-4 5-4h8l6 8c4 2 10 3 16 5 6 1 12 3 12 9v3H5z" /><path d="M5 51h54M19 33l4-4M25 38l4-4" /></>,
};
const Icon = ({ k, className }) => k === 'trophy' ? <Trophy className={className} strokeWidth={1.6} /> : <svg viewBox="0 0 64 64" className={className} aria-hidden="true" {...P}>{ICONS[k]}</svg>;

// kind, position + size classes, tilt, float duration
const ITEMS = [
  ['bat', 'left-[3%] top-[10%] h-28 w-28', -12, 7], ['ball', 'left-[22%] bottom-[16%] h-16 w-16', 8, 6], ['racket', 'left-[40%] top-[5%] h-24 w-24', 14, 8],
  ['volleyball', 'right-[24%] bottom-[24%] h-20 w-20', -8, 7], ['shoe', 'right-[6%] top-[9%] h-28 w-28', 6, 9], ['shuttle', 'left-[58%] bottom-[8%] h-16 w-16', -16, 6.5],
  ['stumps', 'right-[2%] bottom-[7%] h-24 w-24', 4, 8.5], ['trophy', 'left-[10%] bottom-[5%] h-14 w-14', -6, 7.5], ['ball', 'right-[42%] top-[30%] h-12 w-12', 20, 9],
];

export default function SportsBackdrop() {
  return <div className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden text-navy/[.09]" aria-hidden="true">
    {/* court markings */}
    <svg viewBox="0 0 400 400" className="absolute -right-24 -top-24 h-[460px] w-[460px]" {...P} strokeWidth={1.5}><circle cx="200" cy="200" r="150" /><circle cx="200" cy="200" r="60" /><path d="M200 50v300M50 200h300" /><circle cx="200" cy="200" r="5" fill="currentColor" /></svg>
    <svg viewBox="0 0 400 240" className="absolute -bottom-10 -left-16 h-[300px] w-[500px]" {...P} strokeWidth={1.5}><rect x="10" y="10" width="380" height="220" rx="6" /><path d="M200 10v220M10 70h380M10 170h380" /><path d="M10 120h95M295 120h95" strokeDasharray="6 8" /></svg>
    <svg viewBox="0 0 600 60" className="absolute inset-x-0 top-0 h-10 w-full" preserveAspectRatio="none" {...P} strokeWidth={1.5}><path d="M0 30h600" strokeDasharray="4 10" /></svg>
    {ITEMS.map(([k, pos, tilt, dur], i) => <motion.div key={i} className={`absolute ${pos}`} initial={{ rotate: tilt }} animate={{ y: [0, -14, 0], rotate: [tilt, tilt + 7, tilt] }} transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay: i * .4 }}>
      <Icon k={k} className="h-full w-full" />
    </motion.div>)}
  </div>;
}
