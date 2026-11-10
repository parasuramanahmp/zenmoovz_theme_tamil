/* ───────────────────────── Instagram reels for "Stay in the game" ─────────────────────────
   HOW TO ADD YOUR REELS
   BEST: PLAY ON THIS SCREEN WITH YOUR OWN VIDEO FILE (nothing opens Instagram)
      Put the reel's video file (the same .mp4 you posted, ideally under 10 MB) in public/reels/ and set  src: '/reels/cricket.mp4'.
      It plays right inside the section with pause, sound and seek. The first frame is used as the cover automatically.
   OPTIONAL: Instagram link (only used when a reel has no `src`)
   1. On Instagram open a reel, tap ··· → Copy link, and paste it into `url` below.
      Both  https://www.instagram.com/reel/XXXXXXXXXXX/  and  https://www.instagram.com/p/XXXXXXXXXXX/  work.
      The reel must be PUBLIC (a public business or creator account) or Instagram will refuse to show it.
   2. Optional cover picture: save a screenshot of the reel as public/reels/<name>.jpg and set  cover: '/reels/<name>.jpg'.
      Instagram does not give websites a thumbnail, so without a cover the card shows a sport animation instead.
   3. `shop` is the list of product ids (see data/catalog.js) shown beside the reel as "Shop this reel".
   4. Add or remove reels freely. Two to eight looks best.
   A reel with a `src` or a `url` starts playing / loading by itself when it is selected (no poster, nothing to press first).
   A reel with neither shows a plain sport-coloured placeholder marked "coming soon". */
export const INSTAGRAM_PROFILE = 'https://www.instagram.com/';   // ← put your profile link here, e.g. https://www.instagram.com/zenmoovz/

/* The five reels, in this order. Each line is one reel: `url` is its Instagram link, `cover` is its thumbnail (public/reels/*.jpg),
   `title` / `blurb` are the text beside it, `sport` sets the label and colour, and `shop` lists the product ids shown as "Shop this reel".
   If a thumbnail is on the wrong reel, swap the `url` values (leave the covers and text where they are). The url order was reversed and has been corrected. */
export const REELS = [
  { src: '', url: 'https://www.instagram.com/reel/DeJ5Yu0EeY0/', cover: '/reels/swimming-accessories.jpg', scene: 'swimming', sport: 'swimming', title: 'Swimming accessories',   blurb: 'Special offers on swimming accessories: goggles, caps and more for the pool.',                                  shop: [65, 72, 67] },
  { src: '', url: 'https://www.instagram.com/reel/Deb0gppCaZl/', cover: '/reels/yonex-astrox-100-zz.jpg',  scene: 'badminton', sport: 'badminton', title: 'Yonex Astrox 100 ZZ',  blurb: 'A close look at the Yonex Astrox 100 ZZ, with Aerosensa and Mavis shuttles. Shop Yonex rackets and shuttles.', shop: [24, 2, 29] },
  { src: '', url: 'https://www.instagram.com/reel/DehIH5JDbgv/', cover: '/reels/english-willow.jpg',       scene: 'cricket', sport: 'cricket', title: 'English willow, offer o offer', blurb: 'English willow bats from ₹8,000, with free knocking on bats above ₹10,000.',                            shop: [10, 9, 12] },
  { src: '', url: 'https://www.instagram.com/reel/Det8beYidY4/', cover: '/reels/li-ning-axforce-100.jpg',  scene: 'badminton', sport: 'badminton', title: 'Li-Ning Axforce 100',  blurb: 'The Li-Ning Axforce 100, shown with Mavis 200 and Mavis 350 shuttles. Shop Li-Ning rackets and shuttles.',     shop: [25, 22, 29] },
  { src: '', url: 'https://www.instagram.com/reel/DezGCEcgZ0g/', cover: '/reels/cricket-kit-bags.jpg',     scene: 'cricket', sport: 'cricket', title: 'Cricket kit bags',     blurb: 'Special offer on cricket kit bags. Pack the bat, pads and gloves in one carry.',                                shop: [20, 17, 16] },
];

/* Turn any Instagram reel / post link into its canonical permalink, or '' if it is not one */
export const reelLink = url => { const m = /instagram\.com\/(?:[\w.]+\/)?(?:reels?|p|tv)\/([\w-]+)/i.exec(url || ''); return m ? `https://www.instagram.com/reel/${m[1]}/` : ''; };
export const handleOf = () => { const m = /instagram\.com\/([\w.]+)/i.exec(INSTAGRAM_PROFILE); return m ? `@${m[1]}` : '@zenmoovz'; };
