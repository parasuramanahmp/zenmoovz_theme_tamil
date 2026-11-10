/* ───────────────────────── Champion's Choice ─────────────────────────
   The players shown on the cricket and badminton views. Each one links to that sport's products from the brand they play with
   (the same brand ids as BRANDS in data/catalog.js), so "view all products" always lands on a real, filtered shelf.

   To add or change a player, edit the lists below. Order = order on the page (4 fits one row on desktop).
   Photos: drop a file named after the player into public/champions/ (see the README there). Until a photo exists the
   card shows a monogram tile, so nothing breaks.
   Only list a player whose brand deal or signature gear you can stand behind: this section tells shoppers who plays with what. */

export const CHAMPIONS = {
  cricket: [
    { name: 'KL Rahul', brand: 'SG' },
    { name: 'Hardik Pandya', brand: 'SG' },
    { name: 'Rishabh Pant', brand: 'SG' },
    { name: 'Ishan Kishan', brand: 'SG' },
  ],
  badminton: [
    { name: 'Lakshya Sen', brand: 'Yonex', photo: 'lakshya-sen' },
    { name: 'Satwiksairaj Rankireddy', brand: 'Yonex', photo: 'satwiksairaj-rankireddy' },
    { name: 'Chirag Shetty', brand: 'Yonex', photo: 'chirag-shetty' },
    { name: 'PV Sindhu', brand: 'Li-Ning', photo: 'pv-sindhu' },
  ],
};

/* "KL Rahul" → "kl-rahul": the photo file name, public/champions/kl-rahul.jpg */
export const champSlug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const initialsOf = name => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
