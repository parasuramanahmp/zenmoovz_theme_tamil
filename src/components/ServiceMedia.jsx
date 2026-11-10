import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { SERVICE_MEDIA } from '../data/services.js';
import ServiceMotion from './ServiceMotion.jsx';

/* The picture on a service card. Best available wins: real video → real photo → the animated drawing.
   The video plays muted and looped, only while it is on screen. If a file is missing (or the browser can't play it) the next one is used,
   so footage can be added one service at a time. "Reduce motion": the photo, never the video. */
const calm = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ServiceMedia({ id, className = '' }) {
  const m = SERVICE_MEDIA[id] || {}, ref = useRef(null), vid = useRef(null), seen = useInView(ref, { margin: '0px 0px -8% 0px' });
  const [stage, setStage] = useState(m.video && !calm() ? 'video' : m.image ? 'image' : 'anim'), [ready, setReady] = useState(false);
  useEffect(() => { const v = vid.current; if (!v) return; if (seen) v.play().catch(() => {}); else v.pause(); }, [seen, stage]);
  const next = from => setStage(from === 'video' && m.image ? 'image' : 'anim');

  if (stage === 'anim') return <ServiceMotion id={id} className={className} />;
  return <div ref={ref} className={`relative overflow-hidden bg-mist ${className}`}>
    {/* the drawing holds the space until the footage is ready, so a slow video never shows a blank box */}
    {stage === 'video' && !ready && <ServiceMotion id={id} className="absolute inset-0" />}
    {stage === 'video'
      ? <video ref={vid} src={m.video} poster={m.image} muted loop playsInline preload="metadata" aria-label={m.alt} onCanPlay={() => setReady(true)} onError={() => next('video')}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`} />
      : <img src={m.image} alt={m.alt} loading="lazy" decoding="async" onError={() => next('image')} className="absolute inset-0 h-full w-full object-cover" />}
  </div>;
}
