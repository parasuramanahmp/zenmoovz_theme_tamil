import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, ShoppingBag } from 'lucide-react';
import { Swap, Words } from './motion.jsx';

const MLink = motion.create(Link);

/* Flat, almost-square, uppercase labels: the way premium sportswear stores do buttons. No shadows, no gradients. */
const base = 'relative inline-flex select-none items-center justify-center gap-2 rounded-[2px] px-7 py-4 text-[12px] font-semibold uppercase leading-none tracking-[.14em] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2';

const Tag = ({ to, onClick, type = 'button', className, children }) => to
  ? <MLink to={to} onClick={onClick} className={className} whileTap={{ scale: .985 }}>{children}</MLink>
  : <motion.button type={type} onClick={onClick} className={className} whileTap={{ scale: .985 }}>{children}</motion.button>;

const STYLES = {
  solid: 'btn-nudge bg-ink text-white hover:bg-[#2B2B2B]',
  accent: 'btn-nudge bg-accent text-white hover:bg-[#98431F]',
  outline: 'btn-nudge border border-ink text-ink hover:bg-ink hover:text-white',
  light: 'btn-nudge bg-white text-ink hover:bg-mist',
  amber: 'btn-nudge bg-accent text-white hover:bg-[#98431F]',
  ghost: 'btn-nudge !px-0 !py-2 text-ink underline decoration-ink/25 decoration-1 underline-offset-[7px] hover:decoration-ink',
};
STYLES.lime = STYLES.dark = STYLES.solid;

export function Button({ children, to, onClick, variant = 'solid', className = '', type = 'button' }) {
  const full = className.includes('w-full');
  const el = <Tag to={to} onClick={onClick} type={type} className={`${base} ${STYLES[variant] || STYLES.solid} ${className}`}>{children}</Tag>;
  return full ? <span className="flex w-full">{el}</span> : el;
}

/* Add to cart: label swaps to "Added" with a check, then resets. tone="white" sits on top of product photos. */
export function AddButton({ onAdd, label = 'Add to cart', tone = 'navy', size = 'md', className = '', disabled = false }) {
  const [st, setSt] = useState('idle');
  const click = e => { if (disabled || st !== 'idle') return; onAdd?.(e); setSt('added'); setTimeout(() => setSt('idle'), 1600); };
  const tones = disabled ? 'cursor-not-allowed bg-ink/35 text-white' : st === 'added' ? 'bg-ink text-white' : tone === 'white' ? 'bg-white text-ink hover:bg-ink hover:text-white' : 'bg-ink text-white hover:bg-[#2B2B2B]';
  return <motion.button type="button" onClick={click} aria-disabled={disabled || undefined} whileTap={disabled ? undefined : { scale: .985 }} aria-live="polite" className={`${base} ${size === 'sm' ? '!px-4 !py-3 !text-[11px]' : ''} ${tones} ${className}`}>
    <Swap k={st}>{st === 'added' ? <><Check size={size === 'sm' ? 14 : 16} />Added</> : <><ShoppingBag size={size === 'sm' ? 14 : 16} />{label}</>}</Swap>
  </motion.button>;
}

export function SectionHeading({ title, description, action, id }) {
  return <div id={id} className="mb-10 flex scroll-mt-40 flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      <h2 className="max-w-2xl text-[clamp(2.4rem,5vw,3.8rem)]"><Words text={title} inView /></h2>
      {description && <p className="mt-3 max-w-xl text-sm leading-6 text-ink/55">{description}</p>}
    </div>
    {action}
  </div>;
}

export function EmptyState({ title, body, action }) {
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[320px] flex-col items-center justify-center rounded-[4px] border border-ink/10 bg-white px-6 text-center">
    <span className="mb-5 grid h-14 w-14 place-items-center rounded-full border border-ink/15 text-ink"><ShoppingBag size={22} strokeWidth={1.6} /></span>
    <h2 className="text-3xl">{title}</h2>
    <p className="mt-3 max-w-sm text-sm leading-6 text-ink/55">{body}</p>
    {action && <div className="mt-7">{action}</div>}
  </motion.div>;
}
