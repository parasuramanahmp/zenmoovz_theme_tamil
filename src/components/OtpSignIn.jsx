import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, KeyRound, Loader2, ShieldCheck, X } from 'lucide-react';
import { OTP_DEMO, OTP_LENGTH, requestOtp, verifyOtp } from '../lib/otp.js';
import { useStore } from '../store.jsx';

/* ───────────────────────── OTP sign-in ─────────────────────────
   Step 1  details  : name, mobile, email
   Step 2  otp      : the 4-digit code, in a dark glass card
   Verify  : the four boxes fly out into a diamond → orbit once → collapse into one box → a ring pulses → the box turns into a check,
             the title becomes "Verified Successfully", the key becomes a shield and the button turns green.
   A wrong code: the boxes fly out, then straight back into the row, shake red and clear (no orbit). The orbit only plays for a good code.
   Reduced motion: no flight, just a quick cross-fade to the verified state. */

const BOX = 48, PITCH = 60, R = 47, STAGE_H = 152;
const BASE = [-90, 180, 0, 90];                     // diamond order: top, left, right, bottom
const GOLD = '#E6C04A', GREEN = '#008000';
const wait = ms => new Promise(r => setTimeout(r, ms));
const fmt = s => `00:${String(s).padStart(2, '0')}`;
const REASON = { wrong: 'That code is not right. Check it and try again.', expired: 'That code has expired. Tap “Resend” for a new one.', locked: 'Too many tries. Tap “Resend” for a new code.', network: 'Could not reach the server. Check your connection.' };

/* where box i sits: row → diamond (spread), orbiting by `a` degrees, then pulled into the centre (collapse) */
function place(i, s, a, c) {
  const rowX = (i - 1.5) * PITCH, ang = (BASE[i] + a) * Math.PI / 180;
  const dx = R * Math.cos(ang), dy = R * Math.sin(ang);
  return { x: (rowX + (dx - rowX) * s) * (1 - c), y: dy * s * (1 - c), r: s * a, sc: 1 - .45 * c, o: 1 - c };
}

function Cell({ i, ch, focused, bad, flying, spread, spin, collapse, readOnly, inputRef, onChange, onKey, onPaste, onFocus }) {
  const x = useTransform([spread, spin, collapse], ([s, a, c]) => place(i, s, a, c).x);
  const y = useTransform([spread, spin, collapse], ([s, a, c]) => place(i, s, a, c).y);
  const rotate = useTransform([spread, spin, collapse], ([s, a, c]) => place(i, s, a, c).r);
  const scale = useTransform([spread, spin, collapse], ([s, a, c]) => place(i, s, a, c).sc);
  const opacity = useTransform([spread, spin, collapse], ([s, a, c]) => place(i, s, a, c).o);
  const glint = useTransform(spread, v => Math.min(1, Math.max(0, v)));
  return <motion.div style={{ x, y, rotate, scale, opacity, width: BOX, height: BOX, marginLeft: -BOX / 2, marginTop: -BOX / 2 }}
    className={`absolute left-1/2 top-1/2 rounded-[14px] border bg-white/[.06] backdrop-blur-sm transition-[border-color,box-shadow,background-color] duration-200 ${bad ? 'border-red-400/80 shadow-[0_0_0_3px_rgba(248,113,113,.15)]' : focused ? 'border-[#E6C04A] bg-[#E6C04A]/10 shadow-[0_0_0_3px_rgba(230,192,74,.16),0_0_22px_-4px_rgba(230,192,74,.55)]' : 'border-white/15'}`}>
    {/* the red-orange glints on two corners that appear while the boxes are in flight */}
    <motion.span aria-hidden style={{ opacity: glint }} className="pointer-events-none absolute inset-0 rounded-[14px] shadow-[inset_-2px_-2px_0_-1px_rgba(255,112,64,.9),inset_2px_2px_0_-1px_rgba(255,210,150,.45)]" />
    <input ref={inputRef} value={ch} readOnly={readOnly} tabIndex={readOnly ? -1 : 0} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'} aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
      onChange={e => onChange(i, e.target.value)} onKeyDown={e => onKey(i, e)} onPaste={onPaste} onFocus={() => onFocus(i)}
      className="h-full w-full bg-transparent text-center text-[22px] font-semibold text-white caret-transparent outline-none" />
    {focused && !ch && !flying && <motion.span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-6 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded bg-[#E6C04A]" animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 1, repeat: Infinity, times: [0, .5, .5, 1] }} />}
  </motion.div>;
}

/* diagonal gold light streaks: the dark, glossy backdrop of the reference */
const Streaks = ({ glow }) => <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
  <div className="absolute -left-1/4 -top-1/3 h-[160%] w-[150%] rotate-[-18deg] opacity-90" style={{ background: 'linear-gradient(180deg, transparent 18%, rgba(176,141,87,.0) 20%, rgba(214,170,90,.38) 24%, rgba(255,226,150,.12) 26%, transparent 30%, transparent 44%, rgba(120,84,40,.35) 48%, rgba(255,214,130,.18) 49.5%, transparent 52%, transparent 70%, rgba(176,141,87,.22) 74%, transparent 78%)' }} />
  <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,.07), transparent 55%)' }} />
  <motion.div className="absolute inset-0" initial={false} animate={{ opacity: glow ? 1 : 0 }} transition={{ duration: .9 }} style={{ background: 'radial-gradient(70% 55% at 50% 52%, rgba(0,128,0,.26), rgba(16,185,129,.07) 60%, transparent 80%)' }} />
</div>;

const inp = 'w-full rounded-[12px] border border-white/15 bg-white/[.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#E6C04A] focus:bg-[#E6C04A]/10 focus:shadow-[0_0_0_3px_rgba(230,192,74,.16)]';

export default function OtpSignIn({ open, onClose }) {
  const { signIn, user } = useStore(), navigate = useNavigate(), reduce = useReducedMotion();
  const [step, setStep] = useState('details');                       // details | otp
  const [f, setF] = useState({ name: '', phone: '', email: '' }), [err, setErr] = useState({});
  const [digits, setDigits] = useState(() => Array(OTP_LENGTH).fill('')), [focus, setFocus] = useState(0);
  const [phase, setPhase] = useState('idle');                        // idle | verifying | merge | success
  const [bad, setBad] = useState(false), [msg, setMsg] = useState(''), [shake, setShake] = useState(0);
  const [sending, setSending] = useState(false), [demoCode, setDemoCode] = useState(''), [left, setLeft] = useState(0);
  const refs = useRef([]), alive = useRef(true);
  const spread = useMotionValue(0), spin = useMotionValue(0), collapse = useMotionValue(0);
  const busy = phase !== 'idle', code = digits.join(''), flying = phase === 'verifying';

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  /* every time the dialog opens it starts clean */
  useEffect(() => {
    if (!open) return;
    setF({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '' });
    setStep('details'); setErr({}); setDigits(Array(OTP_LENGTH).fill('')); setPhase('idle'); setBad(false); setMsg(''); setDemoCode(''); setLeft(0);
    spread.set(0); spin.set(0); collapse.set(0);
  }, [open]);
  useEffect(() => { if (!open) return; const k = e => e.key === 'Escape' && !busy && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [open, busy, onClose]);
  /* resend countdown */
  useEffect(() => { if (step !== 'otp' || left <= 0) return; const t = setTimeout(() => setLeft(l => l - 1), 1000); return () => clearTimeout(t); }, [step, left]);
  useEffect(() => { if (step === 'otp' && phase === 'idle') refs.current[0]?.focus(); }, [step]);

  /* ───── step 1 → step 2 ───── */
  const send = async (resend = false) => {
    setSending(true); setMsg('');
    try {
      const r = await requestOtp(f.phone);
      if (!alive.current) return;
      setDemoCode(r.demoCode || ''); setLeft(30); setDigits(Array(OTP_LENGTH).fill('')); setBad(false); setStep('otp');
      if (resend) setTimeout(() => refs.current[0]?.focus(), 30);
    } catch { if (alive.current) setMsg('We could not send the code. Please try again.'); }
    finally { if (alive.current) setSending(false); }
  };
  const submitDetails = e => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Tell us your name';
    if (!/^[6-9]\d{9}$/.test(f.phone)) er.phone = 'Enter a valid 10-digit mobile number';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = 'Enter a valid email';
    setErr(er);
    if (!Object.keys(er).length) send();
  };

  /* ───── typing into the boxes ───── */
  const clearBad = () => { if (bad) { setBad(false); setMsg(''); } };
  const fill = (i, raw) => {
    const chars = raw.replace(/\D/g, '').slice(0, OTP_LENGTH - i).split('');
    if (!chars.length) return;
    clearBad();
    setDigits(d => { const n = [...d]; chars.forEach((c, k) => { n[i + k] = c; }); return n; });
    refs.current[Math.min(i + chars.length, OTP_LENGTH - 1)]?.focus();
  };
  const onChange = (i, v) => { if (busy) return; if (!v) { setDigits(d => d.map((x, k) => k === i ? '' : x)); return; } fill(i, v.length > 1 ? v : v.slice(-1)); };
  const onKey = (i, e) => {
    if (busy) return;
    if (e.key === 'Backspace') { e.preventDefault(); clearBad(); if (digits[i]) setDigits(d => d.map((x, k) => k === i ? '' : x)); else if (i > 0) { setDigits(d => d.map((x, k) => k === i - 1 ? '' : x)); refs.current[i - 1]?.focus(); } }
    else if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); refs.current[i - 1]?.focus(); }
    else if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) { e.preventDefault(); refs.current[i + 1]?.focus(); }
    else if (e.key === 'Enter') { e.preventDefault(); submitCode(); }
  };
  const onPaste = e => { e.preventDefault(); fill(0, e.clipboardData.getData('text')); };

  /* ───── the verify animation ───── */
  const submitCode = async () => {
    if (busy || code.length < OTP_LENGTH) return;
    setPhase('verifying'); setBad(false); setMsg('');
    document.activeElement?.blur?.();
    const check = verifyOtp(f.phone, code);

    if (!reduce) await animate(spread, 1, { duration: .55, ease: [.34, 1.4, .64, 1] });   // boxes pop out into a diamond
    else await wait(450);
    const res = await check;                                                              // a wrong code is known here: no orbit, straight back
    if (!alive.current) return;

    if (!res.ok) {                                                                        // fly back into the row, shake, red
      if (!reduce) await animate(spread, 0, { duration: .5, ease: [.22, 1, .36, 1] });
      if (!alive.current) return;
      setPhase('idle'); setBad(true); setMsg(REASON[res.reason] || REASON.wrong); setShake(s => s + 1); setDigits(Array(OTP_LENGTH).fill(''));
      if (res.reason === 'expired' || res.reason === 'locked') setLeft(0);
      setTimeout(() => refs.current[0]?.focus(), 60);
      return;
    }

    if (!reduce) { await animate(spin, 360, { duration: 1.7, ease: [.65, 0, .35, 1] }); spin.set(0); }   // one full orbit
    if (!alive.current) return;
    if (!reduce) { await wait(180); await animate(collapse, 1, { duration: .42, ease: [.7, 0, .84, 0] }); }   // pull into one box
    else collapse.set(1);
    if (!alive.current) return;
    setPhase('merge');                                                                  // single box, ring spinning
    await wait(reduce ? 250 : 750);
    if (!alive.current) return;
    setPhase('success');                                                                // ring pulse, check, green
    signIn(f.name.trim(), f.email.trim(), f.phone);
    await wait(reduce ? 900 : 1900);
    if (!alive.current) return;
    onClose(); navigate('/profile');
  };

  const done = phase === 'success', locked = left > 0;
  const masked = `+91 ${f.phone.slice(0, 2)}••••••${f.phone.slice(-2)}`;
  const title = done ? <>Verified <span style={{ color: GREEN }}>Successfully</span></> : step === 'otp' ? <>Verify <span style={{ color: GOLD }}>OTP</span></> : user ? <>Verify your <span style={{ color: GOLD }}>mobile</span></> : <>Sign in to <span style={{ color: GOLD }}>ZENMOOVZ</span></>;
  const sub = done ? 'Your security verification code has been confirmed.' : step === 'otp' ? `Enter the ${OTP_LENGTH}-digit security code sent to ${masked}` : user ? 'Confirm your number with a one-time code to secure your account.' : 'Save your wishlist and speed through checkout. We will text you a one-time code.';

  return createPortal(<AnimatePresence>{open && <motion.div className="fixed inset-0 z-[120] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => !busy && onClose()} />
    <motion.div role="dialog" aria-modal="true" aria-label={step === 'otp' ? 'Verify OTP' : 'Sign in'} initial={{ y: 40, opacity: 0, scale: .96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 24, opacity: 0, scale: .97 }} transition={{ duration: .45, ease: [.22, 1, .36, 1] }}
      className="relative w-full max-w-[400px] overflow-hidden rounded-[26px] border border-white/10 bg-[#0E0C0A]/95 px-6 pb-7 pt-9 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,.9),inset_0_1px_0_rgba(255,255,255,.08)] sm:px-8">
      <Streaks glow={done || phase === 'merge'} />
      {!busy && <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full text-white/50 transition hover:rotate-90 hover:bg-white/10 hover:text-white"><X size={18} /></button>}

      <div className="relative">
        {/* icon: key → shield */}
        <motion.span className="mx-auto grid h-11 w-11 place-items-center rounded-[13px] border" animate={{ borderColor: done || phase === 'merge' ? 'rgba(0,128,0,.55)' : 'rgba(230,192,74,.45)', backgroundColor: done || phase === 'merge' ? 'rgba(0,128,0,.10)' : 'rgba(230,192,74,.08)', color: done || phase === 'merge' ? GREEN : GOLD }} transition={{ duration: .4 }}>
          <AnimatePresence mode="wait" initial={false}><motion.span key={done || phase === 'merge' ? 's' : 'k'} initial={{ scale: .3, rotate: -40, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: .3, opacity: 0 }} transition={{ duration: .25 }}>{done || phase === 'merge' ? <ShieldCheck size={20} /> : <KeyRound size={20} />}</motion.span></AnimatePresence>
        </motion.span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={done ? 'done' : step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .25 }} className="text-center">
            <p className="mt-4 text-[22px] font-bold leading-tight tracking-tight" role="heading" aria-level={2}>{title}</p>
            <p className="mx-auto mt-2 max-w-[300px] text-[12.5px] leading-5 text-white/55">{sub}</p>
          </motion.div>
        </AnimatePresence>

        {step === 'details'
          ? <form onSubmit={submitDetails} noValidate className="mt-6 grid gap-3">
              <label className="grid gap-1.5 text-xs font-semibold text-white/60">Name<input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} autoFocus autoComplete="name" className={`${inp} ${err.name ? '!border-red-400/80' : ''}`} placeholder="Your name" />{err.name && <span className="text-red-300" role="alert">{err.name}</span>}</label>
              <label className="grid gap-1.5 text-xs font-semibold text-white/60">Mobile number
                <span className="flex"><span className="grid place-items-center rounded-l-[12px] border border-r-0 border-white/15 bg-white/[.04] px-3 text-sm text-white/60">+91</span><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} inputMode="numeric" autoComplete="tel-national" className={`${inp} !rounded-l-none ${err.phone ? '!border-red-400/80' : ''}`} placeholder="10-digit number" /></span>
                {err.phone && <span className="text-red-300" role="alert">{err.phone}</span>}</label>
              <label className="grid gap-1.5 text-xs font-semibold text-white/60">Email<input value={f.email} onChange={e => setF({ ...f, email: e.target.value })} type="email" autoComplete="email" className={`${inp} ${err.email ? '!border-red-400/80' : ''}`} placeholder="you@example.com" />{err.email && <span className="text-red-300" role="alert">{err.email}</span>}</label>
              {msg && <p className="text-xs text-red-300" role="alert">{msg}</p>}
              <button type="submit" disabled={sending} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[#C9A62F] text-[13px] font-bold text-[#17120A] transition hover:bg-[#DDB93A] active:scale-[.985] disabled:opacity-70">
                {sending ? <><Loader2 size={15} className="animate-spin" />Sending code…</> : <>Send OTP <ArrowRight size={15} /></>}
              </button>
            </form>
          : <>
              {/* the stage: four boxes in a row, or the diamond / orbit / merge / check */}
              <motion.div key={shake} className="relative mx-auto mt-5 w-full" style={{ height: STAGE_H }} animate={{ x: shake ? [0, -10, 10, -7, 7, -3, 0] : 0 }} transition={{ duration: .45 }}>
                {digits.map((ch, i) => <Cell key={i} i={i} ch={ch} focused={focus === i && !busy} bad={bad} flying={flying} spread={spread} spin={spin} collapse={collapse} readOnly={busy}
                  inputRef={el => { refs.current[i] = el; }} onChange={onChange} onKey={onKey} onPaste={onPaste} onFocus={setFocus} />)}

                {/* the merged box with its spinning ring, then the check */}
                <AnimatePresence>{(phase === 'merge' || done) && <motion.div key="core" className="absolute left-1/2 top-1/2 -ml-[44px] -mt-[44px] grid h-[88px] w-[88px] place-items-center" initial={{ scale: .4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 20 }}>
                  {phase === 'merge' && <motion.span aria-hidden className="absolute inset-0 rounded-full border-2 border-transparent" style={{ borderTopColor: GREEN, borderRightColor: 'rgba(0,128,0,.35)', boxShadow: '0 0 22px -4px rgba(0,128,0,.6)' }} animate={{ rotate: 360 }} transition={{ duration: .8, ease: 'linear', repeat: Infinity }} />}
                  {done && <>
                    <motion.span aria-hidden className="absolute inset-0 rounded-full border-2" style={{ borderColor: GREEN, boxShadow: '0 0 30px -2px rgba(0,128,0,.7), inset 0 0 18px -6px rgba(0,128,0,.6)' }} initial={{ scale: .55, opacity: 1 }} animate={{ scale: 1.55, opacity: 0 }} transition={{ duration: .9, ease: [.22, 1, .36, 1] }} />
                    <motion.span aria-hidden className="absolute inset-[6px] rounded-full border" style={{ borderColor: 'rgba(0,128,0,.5)' }} initial={{ scale: .6, opacity: 0 }} animate={{ scale: 1, opacity: [0, 1, 0] }} transition={{ duration: 1, ease: 'easeOut' }} />
                  </>}
                  <motion.span className="relative grid h-[42px] w-[42px] place-items-center rounded-[12px] border-2 bg-black/30" animate={{ borderColor: done ? GREEN : '#F0883E', boxShadow: done ? '0 0 20px -2px rgba(0,128,0,.65)' : '0 0 14px -4px rgba(240,136,62,.6)' }} transition={{ duration: .35 }}>
                    {done && <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .45, delay: .2, ease: 'easeOut' }} /></svg>}
                  </motion.span>
                </motion.div>}</AnimatePresence>
              </motion.div>

              <div className="min-h-[20px] text-center text-xs" aria-live="polite">
                {msg ? <span className="text-red-300" role="alert">{msg}</span> : OTP_DEMO && demoCode && !busy ? <button type="button" onClick={() => fill(0, demoCode)} className="rounded-full border border-white/10 bg-white/[.05] px-3 py-1 text-white/55 transition hover:border-[#E6C04A]/50 hover:text-white">Demo mode, no SMS sent. Your code is <b className="tracking-[.2em] text-[#E6C04A]">{demoCode}</b> · tap to fill</button> : null}
              </div>

              <p className="mt-5 text-center text-[11.5px] text-white/50">
                {done ? 'Signed in. Taking you to your profile…' : <>Didn’t receive the code?{' '}
                  {locked ? <span className="font-semibold text-[#E6C04A]">Resend in {fmt(left)}</span>
                    : <button type="button" disabled={busy || sending} onClick={() => send(true)} className="font-semibold text-[#E6C04A] underline-offset-4 hover:underline disabled:opacity-50">{sending ? 'Sending…' : 'Resend code'}</button>}
                  {' · '}<button type="button" disabled={busy} onClick={() => { setStep('details'); setMsg(''); setBad(false); }} className="font-semibold text-white/70 underline-offset-4 hover:underline disabled:opacity-50">Change number</button></>}
              </p>

              <motion.button type="button" onClick={submitCode} disabled={busy ? true : code.length < OTP_LENGTH} whileTap={!busy && code.length === OTP_LENGTH ? { scale: .985 } : undefined}
                animate={{ backgroundColor: done || phase === 'merge' ? '#008000' : '#C9A62F', color: done || phase === 'merge' ? '#FFFFFF' : '#17120A', boxShadow: done ? '0 10px 30px -10px rgba(0,128,0,.65)' : '0 10px 30px -14px rgba(201,166,47,.5)' }} transition={{ duration: .4 }}
                className={`mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[12px] text-[13px] font-bold ${!busy && code.length < OTP_LENGTH ? 'cursor-not-allowed opacity-45' : ''}`}>
                <AnimatePresence mode="wait" initial={false}><motion.span key={phase} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .18 }} className="flex items-center gap-2">
                  {phase === 'verifying' ? <><Loader2 size={15} className="animate-spin" />Verifying Code…</> : phase === 'idle' ? <>Verify &amp; Proceed <ArrowRight size={15} /></> : <><ShieldCheck size={15} />Verified &amp; Secured</>}
                </motion.span></AnimatePresence>
              </motion.button>
            </>}
      </div>
    </motion.div>
  </motion.div>}</AnimatePresence>, document.body);
}
