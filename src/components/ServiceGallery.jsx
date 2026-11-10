import React, { useState } from 'react';
import { SERVICE_MEDIA } from '../data/services.js';

/* A row of related photos under a service's main picture (e.g. /services/knock-1.jpg, knock-2.jpg, knock-3.jpg).
   Each photo that exists shows; the row stays out of sight until at least one has loaded, so missing files leave no gaps. */
export default function ServiceGallery({ id }) {
  const list = SERVICE_MEDIA[id]?.gallery || [], [ok, setOk] = useState({}), [bad, setBad] = useState({});
  const any = list.some(s => ok[s] && !bad[s]);
  return <ul className={any ? 'mb-5 grid grid-cols-3 gap-2' : 'sr-only'} aria-label="Related photos">
    {list.map(src => !bad[src] && <li key={src} className={`aspect-square overflow-hidden rounded-[4px] bg-mist ${ok[src] ? '' : 'invisible'}`}>
      <img src={src} alt="" loading="eager" decoding="async" onLoad={() => setOk(o => ({ ...o, [src]: true }))} onError={() => setBad(o => ({ ...o, [src]: true }))} className="h-full w-full object-cover" />
    </li>)}
  </ul>;
}
