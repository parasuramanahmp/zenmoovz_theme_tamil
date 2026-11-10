/* ───────────────────────── Cricket kit bag ─────────────────────────
   Which products come out of the bag, in the order they are lifted out, and why each one earns its place.
   Each benefit is [icon name, text]. Icon names map to lucide icons in components/CricketKit.jsx.
   Product details (name, price, photo, rating) always come from catalog.js, so edit prices and photos there.
   Benefits are written from the catalogue notes plus standard equipment knowledge: check them against the exact
   specs of the stock you load. */
export const KIT = [
  { id: 9, role: 'The scoring tool', benefits: [
    ['Target', 'Large sweet spot, so slightly off-centre shots still carry'],
    ['Feather', 'English willow picks up lighter and gives more “ping” than Kashmir willow'],
    ['Zap', 'Straight, even grain moves the energy cleanly from blade to ball'],
  ] },
  { id: 18, role: 'Head protection', benefits: [
    ['ShieldCheck', 'Steel grille keeps the ball away from the face'],
    ['Wind', 'Ventilated shell lets heat out through a long innings'],
    ['Target', 'Worn against pace and spin, and by close-in fielders'],
  ] },
  { id: 17, role: 'Leg protection', benefits: [
    ['Layers', 'Cushioned knee roll takes the sting out of a hard-ball strike'],
    ['Feather', 'Lightweight build keeps running between the wickets quick'],
    ['ShieldCheck', 'Covers the shin and knee, where the ball arrives fastest'],
  ] },
  { id: 16, role: 'Grip and guard', benefits: [
    ['Hand', 'Segmented finger sections flex for a secure grip'],
    ['ShieldCheck', 'Padding sits where the ball lands: fingers and back of hand'],
    ['Wind', 'Breathable palm keeps hands drier, so the handle stays steady'],
  ] },
  { id: 19, role: 'Traction', benefits: [
    ['Footprints', 'Spiked outsole digs into turf for sharp starts and turns'],
    ['Gauge', 'Locked-in heel keeps the foot steady through crease work'],
    ['Zap', 'Quicker singles and a firmer base for every stroke'],
  ] },
  { id: 4, role: 'The match ball', benefits: [
    ['Gauge', 'Consistent bounce and feel from the first over to the last'],
    ['Target', 'Raised seam lets bowlers grip it for swing and turn'],
    ['ShieldCheck', 'Match-grade, so nets prepare you for the real thing'],
  ] },
  { id: 21, role: 'The wicket', benefits: [
    ['Check', 'Three stumps and bails: a full wicket, ready to set'],
    ['Layers', 'Wood stands up to repeated hits from the ball'],
    ['Target', 'Turns any open patch into a pitch'],
  ] },
  { id: 20, role: 'Carries it all', benefits: [
    ['Package', 'Room for a bat, pads, helmet and shoes in one carry'],
    ['Check', 'Everything stays together, so nothing is missing at the ground'],
    ['Layers', 'Duffel shape packs flat and loads easily into a boot'],
  ] },
];
