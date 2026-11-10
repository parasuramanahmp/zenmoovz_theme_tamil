import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { ProductArt } from '../art.jsx';
import { BY_ID, SPORT, sizeLabel, sizesFor } from '../data/catalog.js';
import { INSTAGRAM_PROFILE, REELS, handleOf, reelLink } from '../data/reels.js';
import { Words } from '../motion.jsx';
import { money, useStore } from '../store.jsx';
import { AddButton } from '../ui.jsx';

/* "Stay in the game": the brand's Instagram reels, shown the way Instagram shows them (tall, 9:16).
   A reel with a video file (`src`) plays here straight away; a reel with an Instagram link (`url`) loads Instagram's own player
   straight away (no poster, no play disc to press first). Pick another reel and it plays instead; shop that reel's products beside it.
   Reels, covers and products are all set in data/reels.js. */
const ease = [.22, 1, .36, 1];

function IgGlyph({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" /><circle cx="12" cy="12" r="4.3" /><path d="M17.6 6.4h.01" strokeWidth="2.6" /></svg>;
}
const PlayDisc = () => <span className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full bg-white text-navy shadow-glow transition-transform duration-300 group-hover:scale-110"><Play size={28} fill="currentColor" className="ml-1" /></span>;

/* Placeholder for a reel that has no video / link yet (or whose Instagram player could not load): the sport's colours, its name and the
   Instagram mark. It deliberately shows no product cards, the product shop sits beside the reel instead. */
function Poster({ r }) {
  const [a, b] = SPORT[r.sport].hue;
  return <div className="absolute inset-0 overflow-hidden" style={{ background: `linear-gradient(165deg, ${a}, ${b})`, containerType: 'inline-size' }}>
    <span aria-hidden className="absolute -right-[4%] top-[6%] select-none font-display font-bold uppercase leading-none tracking-tight text-white/[.09]" style={{ writingMode: 'vertical-rl', fontSize: '28cqw' }}>{SPORT[r.sport].name}</span>
    <span aria-hidden className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 text-white/80" style={{ width: '22cqw', height: '22cqw' }}><IgGlyph size="100%" /></span>
  </div>;
}
const Cover = ({ r }) => r.cover ? <img src={r.cover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
  : r.src ? <video src={`${r.src}#t=0.1`} preload="metadata" muted playsInline tabIndex={-1} aria-hidden className="absolute inset-0 h-full w-full object-cover" />
  : <Poster r={r} />;

/* The reel plays right here, in the 9:16 frame: tap to pause, tap the speaker for sound, tap the bar to seek. It pauses itself when scrolled out of view. */
function ReelVideo({ r, handle }) {
  const v = useRef(null), box = useRef(null), seen = useInView(box, { amount: .3 }), [playing, setPlaying] = useState(true), [muted, setMuted] = useState(false), prog = useMotionValue(0), w = useTransform(prog, x => `${x * 100}%`);
  useEffect(() => {
    const el = v.current; if (!el) return;
    if (seen && playing) el.play().catch(() => { el.muted = true; setMuted(true); el.play().catch(() => setPlaying(false)); }); else el.pause();
  }, [seen, playing]);
  const seek = e => { const el = v.current, b = e.currentTarget.getBoundingClientRect(); if (el?.duration) el.currentTime = Math.min(.999, Math.max(0, (e.clientX - b.left) / b.width)) * el.duration; };
  return <div ref={box} className="relative aspect-[9/16] bg-black">
    <video ref={v} src={r.src} poster={r.cover || undefined} loop playsInline muted={muted} onTimeUpdate={e => prog.set(e.currentTarget.currentTime / (e.currentTarget.duration || 1))} className="h-full w-full object-cover" />
    <button type="button" onClick={() => setPlaying(x => !x)} aria-label={playing ? 'Pause reel' : 'Play reel'} className="absolute inset-0 grid place-items-center focus-visible:outline-offset-[-4px]">
      <AnimatePresence>{!playing && <motion.span initial={{ scale: .6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.3, opacity: 0 }} className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full bg-white text-navy shadow-glow"><Play size={28} fill="currentColor" className="ml-1" /></motion.span>}</AnimatePresence>
    </button>
    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-2 bg-gradient-to-b from-black/60 to-transparent p-4 text-white"><IgGlyph /><span className="text-xs font-semibold tracking-wide">{handle}</span><span className="ml-auto rounded-[3px] bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">Reel</span></div>
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-14 text-white">
      <p className="mb-2 text-base font-extrabold tracking-tight">{r.title}</p>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setPlaying(x => !x)} aria-label={playing ? 'Pause' : 'Play'} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 transition hover:bg-white hover:text-navy">{playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}</button>
        <div role="slider" tabIndex={0} aria-label="Seek" aria-valuemin={0} aria-valuemax={100} onClick={seek} onKeyDown={e => { const el = v.current; if (!el?.duration) return; if (e.key === 'ArrowRight') el.currentTime = Math.min(el.duration, el.currentTime + 3); if (e.key === 'ArrowLeft') el.currentTime = Math.max(0, el.currentTime - 3); }} className="relative h-5 flex-1 cursor-pointer"><div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/25"><motion.div className="h-full rounded-full bg-white" style={{ width: w }} /></div></div>
        <button type="button" onClick={() => setMuted(x => !x)} aria-label={muted ? 'Unmute' : 'Mute'} className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-white/15">{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
      </div>
    </div>
  </div>;
}

/* Instagram's own embed. Their script swaps the blockquote for the live player and sizes it. If it cannot load (blocked, offline, private reel) `onFail` fires. */
function Embed({ link, onFail }) {
  const box = useRef(null);
  useEffect(() => {
    const go = () => window.instgrm?.Embeds?.process(box.current);
    let s = document.getElementById('ig-embed-js');
    if (window.instgrm) go();
    else { if (!s) { s = Object.assign(document.createElement('script'), { id: 'ig-embed-js', async: true, src: 'https://www.instagram.com/embed.js' }); document.body.appendChild(s); } s.addEventListener('load', go); }
    const timer = setTimeout(() => { if (!box.current?.querySelector('iframe')) onFail(); }, 8000);
    return () => { clearTimeout(timer); s && s.removeEventListener('load', go); };
  }, [link]);
  return <div ref={box} className="min-h-[24rem] bg-white">
    <blockquote className="instagram-media" data-instgrm-permalink={`${link}?utm_source=ig_embed&utm_campaign=loading`} data-instgrm-version="14"
      style={{ background: '#FFF', border: 0, borderRadius: 3, margin: 0, maxWidth: 540, minWidth: 280, padding: 0, width: '100%' }}>
      <p className="p-6 text-center text-sm text-ink/60">Loading reel from Instagram…</p>
    </blockquote>
  </div>;
}

export default function StayInGame() {
  const [i, setI] = useState(0), [failed, setFailed] = useState(false), r = REELS[i], link = reelLink(r.url), { addToCart } = useStore(), frame = useRef(null), near = useInView(frame, { once: true, margin: '400px 0px' });
  const products = r.shop.map(id => BY_ID[id]).filter(Boolean), handle = handleOf();
  useEffect(() => { setFailed(false); }, [i]);
  /* a video file plays by itself; an Instagram link loads Instagram's player (once the section is near the screen, so the page does not load Instagram's script up front) */
  const showVideo = !!r.src, showEmbed = near && !r.src && !!link && !failed;

  return <section className="section-wrap py-16" aria-labelledby="stay-title">
    <div className="relative overflow-hidden rounded-[6px] bg-ink p-4 text-white sm:p-8 lg:p-10">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-30" style={{ background: `radial-gradient(closest-side, ${SPORT[r.sport].hue[1]}, transparent)`, transition: 'background .8s' }} />
      <div className="relative mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 id="stay-title" className="text-3xl font-extrabold leading-[1.05] tracking-[-.04em] sm:text-5xl"><Words text="Stay in the game" inView /></h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/60">Fresh from our Instagram reels. Watch the play, then shop the kit from every reel.</p>
        </div>
        <a href={INSTAGRAM_PROFILE} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-[12px] font-semibold uppercase tracking-[.14em] transition-colors hover:bg-white hover:text-ink"><IgGlyph size={16} />Follow {handle}<ArrowUpRight size={14} aria-hidden="true" /></a>
      </div>

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,22.5rem)_minmax(0,1fr)] lg:gap-10">
        {/* the reel */}
        <div className="mx-auto w-full max-w-[22.5rem] lg:mx-0">
          <div ref={frame} className="relative overflow-hidden rounded-[26px] bg-black shadow-lift ring-1 ring-white/15">
            <AnimatePresence mode="wait" initial={false}>
              {showVideo
                ? <motion.div key={`v-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ReelVideo r={r} handle={handle} /></motion.div>
                : showEmbed
                  ? <motion.div key={`e-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Embed link={link} onFail={() => setFailed(true)} /></motion.div>
                  : <motion.div key={`c-${i}`} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: .45, ease }} className="relative aspect-[9/16]">
                    <Cover r={r} />
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-2 bg-gradient-to-b from-black/60 to-transparent p-4 text-white"><IgGlyph /><span className="text-xs font-semibold tracking-wide">{handle}</span><span className="ml-auto rounded-[3px] bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">Reel</span></div>
                    {failed && link && <a href={link} target="_blank" rel="noreferrer" aria-label={`Watch on Instagram: ${r.title}`} className="group absolute inset-0 grid place-items-center focus-visible:outline-offset-[-4px]"><PlayDisc /></a>}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-16">
                      <span className="inline-flex rounded-[3px] bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">{r.src || link ? SPORT[r.sport].name : `${SPORT[r.sport].name} · coming soon`}</span>
                      <h3 className="mt-2 text-xl font-extrabold tracking-tight">{r.title}</h3>
                    </div>
                  </motion.div>}
            </AnimatePresence>
          </div>
          {failed && <p className="mt-3 text-xs text-white/60">The reel could not load here. {link && <a href={link} target="_blank" rel="noreferrer" className="font-semibold text-white underline underline-offset-4">Watch it on Instagram</a>}</p>}
        </div>

        {/* shop + more reels */}
        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .4, ease }}>
              <p className="text-[11px] font-bold uppercase tracking-[.22em] text-glow">{SPORT[r.sport].name} · Instagram reel</p>
              <h3 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{r.title}</h3>
              <p className="mt-2 max-w-lg text-sm leading-6 text-white/60">{r.blurb}</p>
              <p className="mb-3 mt-7 text-sm font-bold">Shop this reel</p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p, k) => <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 + k * .07, duration: .45, ease }} className="flex flex-col gap-3 rounded-2xl bg-white/[.06] p-3 ring-1 ring-white/10 transition-colors hover:bg-white/10">
                  <div className="flex items-center gap-3">
                    <Link to={`/product/${p.id}`} className="shrink-0"><ProductArt product={p} className="h-16 w-16 overflow-hidden rounded-xl" shadow={false} /></Link>
                    <div className="min-w-0 flex-1"><Link to={`/product/${p.id}`} className="line-clamp-2 text-sm font-bold leading-snug hover:underline">{p.name}</Link><p className="mt-0.5 text-sm font-extrabold">{money(p.price)}</p></div>
                  </div>
                  {sizesFor(p)
                    ? <Link to={`/product/${p.id}`} className="inline-flex w-full items-center justify-center gap-2 rounded-[2px] bg-white px-4 py-3 text-[11px] font-semibold uppercase tracking-[.14em] text-ink transition-colors hover:bg-white/85">Choose {sizeLabel(p).toLowerCase()}<ArrowUpRight size={13} aria-hidden="true" /></Link>
                    : <AddButton size="sm" label="Add" tone="white" className="w-full" onAdd={e => addToCart(p, e.currentTarget)} />}
                </motion.div>)}
              </div>
            </motion.div>
          </AnimatePresence>

          <p className="mb-3 mt-9 text-sm font-bold">More reels</p>
          <div role="list" className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
            {REELS.map((x, k) => <button key={k} role="listitem" type="button" onClick={() => setI(k)} aria-current={k === i} aria-label={`Show reel: ${x.title}`}
              className={`group w-[6.75rem] shrink-0 text-left transition-opacity sm:w-32 ${k === i ? '' : 'opacity-75 hover:opacity-100'}`}>
              <span className={`relative block aspect-[9/16] overflow-hidden rounded-2xl ring-2 transition-all ${k === i ? 'ring-white' : 'ring-white/10 group-hover:ring-white/40'}`}>
                <Cover r={x} />
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute left-2 top-2 text-white"><IgGlyph size={14} /></span>
                <span className="absolute inset-x-0 bottom-0 p-2 text-[11px] font-bold leading-tight">{x.title}</span>
              </span>
            </button>)}
          </div>
        </div>
      </div>
    </div>
  </section>;
}
