# ZENMOOVZ v7: sports e-commerce storefront

React 19 · Vite · Tailwind · Framer Motion · Lenis · React Router

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## OTP sign-in

Sign in is now two steps (`src/components/OtpSignIn.jsx`): name + mobile + email, then a 4-digit OTP in a dark glass card.
On **Verify & Proceed** the four boxes fly out into a diamond, orbit once, collapse into one box, a green ring pulses and the box turns into a check;
the key icon becomes a shield, the title becomes "Verified Successfully" and the button turns green ("Verified & Secured"). Then the visitor lands on /profile.
A wrong code flies back into the row and shakes red. Reduced-motion visitors get a quick cross-fade instead of the flight.
Typing: auto-advance, backspace goes back, arrow keys, paste a whole code, mobile one-time-code autofill, Enter to verify, 30 s resend timer.
The verified mobile number is saved on the profile (`user.phone`, `user.phoneVerified`).

**Demo mode (default):** there is no server, so the code is generated in the browser and shown on the card ("Demo mode, no SMS sent"). Nothing is texted.
**Real SMS:** copy `.env.example` to `.env`, set `VITE_OTP_API` to your backend and implement `POST /otp/send { phone }` and `POST /otp/verify { phone, code }`
(MSG91, Twilio Verify, Fast2SMS or Firebase all fit). The card does not change; only `src/lib/otp.js` talks to the server.
Always check the code on the server: a check that lives in the browser can be bypassed.

## What's new in v7

**Header** – location picker (pincode or city), search with live suggestions, profile menu with demo sign-in, wishlist, cart.
Under it, the **sport strip**: All · Badminton · Cricket · Football · Volleyball · Throwball · Basketball · Swimming.
The old Home / Shop / Our Story links are gone. Tapping a sport swaps the home page for that sport's products in place
(`/?sport=cricket`). Search, categories, brands, best sellers and new arrivals all use the same view
(`?q=`, `?cat=`, `?brand=`, `?view=best|new`).

**Home** – hero carousel → best sellers → shop by category → shop by brand → new arrivals → **stay in the game**.

**Stay in the game** – the store's Instagram reels, shown tall (9:16) like Instagram, with "Shop this reel" products beside each one.
Everything is set in `src/data/reels.js`:
- `url`: paste the reel's Instagram link (Share → Copy link). Instagram's own player loads in the section. The reel must be **public**.
- `src`: optional. If you would rather play the video file itself (nothing from Instagram), put the .mp4 in `public/reels/` and set `src: '/reels/cricket.mp4'`.
- `shop`: product ids shown beside that reel; `sport`, `title`, `blurb`: the text next to it. `cover`: optional picture for the small reel cards.
- `INSTAGRAM_PROFILE`: your profile link, used by the "Follow" button and the footer icon.
The five reels in there are your five links, in order. Their sport / title / products are placeholders: edit them to match each reel.

**Buttons** – every variant has its own motion (see `src/ui.jsx`): `solid` floods colour from the pointer, `accent` pops with a light streak,
`outline` wipes in from the left, `light` rolls its label, `ghost` draws an underline, `amber` (Buy now) slides and snaps its bolt.
`AddButton` ripples, shakes the bag, then morphs into a green "Added". Header icons and each sport chip also have their own motion.
`/buttons` still shows the lab.

**Page changes** – no full-screen curtain between pages any more. The brand intro plays once per visit; pages fade quickly.

## Stock photos (v12)

Bats, wooden stumps, cricket balls, badminton rackets, shuttles and volleyballs show free Pexels photos (hotlinked from images.pexels.com, so the site needs internet to show them). They are only a fallback: put your own `public/products/<id>.jpg` and it replaces the stock photo automatically.
Add more in `src/data/stock.js` (one Pexels photo ID per line, per product type). Types with no stock photo yet (shoes, gloves, helmets, goggles, jerseys, footballs, basketballs, throwballs, bags...) still show "Photo coming soon".

## Heroes: content left, scrolling images right

- **Home hero** (`src/components/HeroCarousel.jsx`): headline, text and buttons on the left; on the right, two columns of that sport's product images drift up and down in opposite directions (a single row on phones). The slide changes sport every 7s and the images change with it. Hover pauses; tiles link to the product.
- **Every sport / category / brand / search page** (`src/pages/Collection.jsx`): same layout. Left: breadcrumb, title, line, product count, "From ₹…" and a *Shop the range* button. Right: scrolling images of the products in that view (one of each category first).
- Shared component: `src/components/HeroMedia.jsx`. Images use your `public/products/<id>.jpg`, then the stock photo fallback; if neither exists the tile shows a clean sport-icon tile.

## Feature hotspot viewer (home page only)

One dark "Know your gear" viewer sits on the **home page** (after Shop by category) with a **Cricket / Badminton** switch. It is no longer on individual product pages.

- **Entrance (the one big moment):** when the section scrolls into view, a copper scan line sweeps along the product once and each dot pops in as the line passes it. Then a spotlight fades in.
- **Spotlight:** everything except the open part is dimmed; the light glides (spring) from part to part, with a soft copper glow. Corner brackets lock onto the active dot.
- **Part list (right on desktop, below the photo on phones):** an accordion. The open part shows its headline (word-by-word reveal) and text. A thin copper line under it is the auto-tour timer: it pauses on hover, and stops for good once the visitor picks a part. The small ruler beside each name shows where that part sits along the product.
- Keyboard: Up / Down arrows move between parts. Reduced-motion users get no sweep, no tour and no gliding.

- Featured products: `SHOWCASE` in `src/data/anatomy.js` (cricket = id 9, badminton = id 25). Content and dot positions are in the same file; component: `src/components/Anatomy.jsx`.
- Images: `public/products/9-anatomy.jpg` is your bat photo (portrait, handle top-left; dots measured on it) and `25-anatomy.jpg` is a rendered racket (`python3 tools/render_anatomy.py`, dots computed from the same geometry). A higher-resolution bat photo will look sharper: save it with the same name and re-check the dots with `/?calibrate=1`. The stage takes the picture's own aspect ratio, so dots never drift on differently-shaped images.
- To use a real photo: save it with the same file name (landscape, product lying horizontally, handle on the LEFT, plain dark background), open `/?calibrate=1`, click where each dot should go and paste the JSON into `HOTSPOT_OVERRIDES`.

## Premium theme (v10)

Researched Nike, Adidas, Puma, New Balance, Under Armour and editorial e-commerce (Warby Parker, Everlane, Allbirds). Common thread: near-black + white + hairline grey chrome, colour supplied by the product photography, one condensed uppercase display face plus one clean sans, almost-square flat buttons, generous whitespace, restrained motion.

- **Fonts (only two, self-hosted via @fontsource, no CDN):** Barlow Condensed for headlines (h1, h2, wordmark), Inter for everything else.
- **Palette** (`tailwind.config.js`): ink `#0A0A0A`, warm stone `#F3F1EC`, white, one copper accent `#B4532A` used sparingly (discounts, hover, badges), brass `#B08D57` for rating stars.
- **Shape:** 2–6px corners (circles only for icon buttons/avatars), hairline borders, no gradients or glow shadows.
- **Motion:** soft fades and slow zooms only. Removed magnetic buttons, ripples, wiggles, sparkle bursts, confetti, tilt cards, cricket/emoji copy.
- **Components restyled:** buttons (flat, uppercase), header and sport tabs (underline), product cards, offers (plain labels), categories (editorial tiles), brands (monochrome, invert on hover), outlet shelf, order confirmation, footer.

## Photos instead of drawings (v9)

All SVG product drawings are gone from the storefront. Every product tile, the product page, cart, search, orders, the outlet shelf and the category tiles show **real photos**.
Add your photos to `public/` using the file names in **`PHOTOS.md`** (it lists all 72 products, 8 category tiles and 5 hero banners). Nothing else in the code needs to change.

- `public/products/<id>.jpg` (+ optional `<id>-2.jpg`, `<id>-3.jpg` extra angles on the product page)
- `public/categories/<category>.jpg`
- `public/hero/<sport>.jpg`, landscape ~1920×900, subject on the right

Missing photo: a neutral "Photo coming soon" tile (the hero falls back to the sport's colours). Or set `image: 'https://…'` on a product in `src/data/catalog.js`.
The new hero is a full-width photo with a slow zoom, a featured-product card for each sport, progress tabs, swipe and arrows. The outlet is now a photo shelf with price tags.

## Profile page (`/profile`)

Click the profile icon in the header: signed-out visitors get the sign-in popup (and land on their profile afterwards); signed-in users go straight to `/profile`.
Four sections, switchable with `?tab=`: **Overview** (stats, recent orders, default address, profile strength), **Profile details** (name, email, mobile, birthday, gender, validated, with save/discard),
**My orders** (every successful checkout is saved, with a tracking bar, items, "Buy again") and **Saved addresses** (add, edit, delete, set default, "Deliver here" updates the header location).
Orders, addresses and profile details are kept in localStorage (`zm7-orders`, `zm7-addresses`, `zm7-user`). Order tracking is a demo that advances with the time since the order was placed.

## Where things live

| File | What it holds |
|---|---|
| `src/data/catalog.js` | Sports, categories, brands, all 72 products, outlet racks. **Edit this to change the store.** |
| `src/art.jsx` | SVG product artwork. Add `image: 'https://…'` to a product to use a photo instead. |
| `src/components/` | Header, hero, outlet racks, video section, product card, home sections, footer |
| `src/pages/` | Storefront (home ⇄ collection), Collection, ProductPage, Cart, Wishlist, **Profile** |
| `src/data/reels.js` | The Instagram reels for Stay in the game (links, products, profile) |
| `src/reels.jsx` | Drawn preview scenes (older placeholders, no longer used by the section) |
| `src/store.jsx` | Cart (stores ids, sizes, quantities), wishlist, location, demo profile, toasts |

## Notes

- Brands (Strikr, Aerolite, Kickora …) and all products are placeholders. Swap them for your real stock.
- Sign-in, checkout and payments are demo-only; nothing leaves the browser.
- Fonts (Bricolage Grotesque, Figtree) load from Google Fonts and fall back to system fonts offline.
- Old carts saved by v6 are ignored (storage keys changed to `zm7-*`).
- Research notes are in `RESEARCH.md`.

## Order confirmation

The "Order confirmed" page fires two confetti bursts (`Confetti` in `src/Checkout.jsx`), once, and skips it for users who prefer reduced motion.


## Brand logo strip
The scrolling strip under the hero shows the eight brand logos instead of sport names (`Marquee` in `src/components/HomeSections.jsx`). Logos are inline SVG in `src/components/BrandLogos.jsx`; edit `MARKS` / `BRAND_LOGOS` there, or drop in real artwork later. Each logo links to `?brand=<name>`, pauses on hover/focus, and becomes a scrollable row for reduced-motion users.

## Animated logo loader
Your portrait logo is traced to vector (`tools/vectorize_logo.py` → `src/data/logoPaths.js`, also `public/zenmoovz-logo.svg`) and animated in `src/components/LogoLoader.jsx`:
square pops in → white Z shapes slide through → ball drops → "Zenmoovz" rises letter by letter → panel wipes up.
- **Intro** – full animation, once per visit (replaces the old small-logo intro).
- **Every navigation** – a quicker version on every page change (home → product → cart …) AND every storefront view change (sport tabs, category / brand tiles, search), with a **transparent background**: only the logo animation shows over the page, then fades. Sorting / price filters and #anchor scrolls stay quiet.
- Tuning is at the top of `LogoLoader.jsx`: `ROUTE_SPEED` sets the navigation speed (lower = faster; the hold time follows automatically so the animation always finishes); `ROUTE_LOADER = false` turns it off. Reduced-motion users never see it.

## Footer
- **Name** (`NavyWordmark.jsx`): the big ZENMOOVZ is solid logo navy (`LOGO.navy`, #193049) with a soft light sweep, a pointer spotlight and star glints. It wipes in, rising and un-blurring, each time the footer is uncovered.
- **Service strip** (`ValueProps` in `HomeSections.jsx`, rendered by `App.jsx`): Fast delivery, Quality picks, Bat knocking-in and Bat engraving (laser-engraved name or number), directly below the "Open the kit bag" section on the All view. Edit the `SERVICES` list to change the wording.
- **Back to top** (`ToTop.jsx`, mounted in `App.jsx`): a round button with a progress ring that appears after you scroll. It lifts above the product page's sticky buy bar and rises a little at the very bottom so it never covers the copyright line.
- **Brand block** (`BrandExtras` in `src/components/Footer.jsx`): tagline "Move with confidence", Instagram / Facebook / X / LinkedIn buttons, and Pallikaranai Chennai, phone and email lines (tap-to-call, tap-to-mail, opens Maps). Social links point at each site's home page: replace the URLs in `SOCIALS` with your handles.
- **Sticky footer reveal** (`Shell`): the page is a card that slides up over the footer. If the footer fits the screen it is pinned underneath; if it is taller (small laptops, phones) its content still glides out from under the card, so the reveal works at every screen size. Reduced-motion users keep the layout without the sliding.

## Header logo
The header uses your animated logo (`public/zenmoovz-logo-intro.webp`, plays once then holds the final frame) via `HeaderLogo` in `src/components/Header.jsx`.
- First visit: it starts when the intro leaves, so the animation is seen. Return visits in the same session: it plays straight away.
- Reduced motion: shows a still of the final frame (`public/zenmoovz-logo-header.png`).
- Size: change `[--h:52px] sm:[--h:64px]` (canvas height; the mark is ~0.59 x this). The footer keeps the original static `Logo`.

## Brands (real logos)
- **Data**: `BRANDS` in `src/data/catalog.js` (28 brands). Logos are `public/brands/<slug>.webp` (transparent, cut from your screenshots with `tools/extract_brand_logos.py`). `featured: 1-8` marks the 8 brands shown on the home page; change the numbers to feature different brands.
- **Marquee** (`Marquee` in `HomeSections.jsx`): scrolls all 28 logos, each linking to that brand's page. Speed scales with the number of brands.
- **Shop by brand** (`Brands` in `HomeSections.jsx`): 8 equal-size logo cards (2 columns on phones, 4 on larger screens) + a "View all 28 brands" button.
- **All brands page**: `/brands` (`src/pages/Brands.jsx`): every brand in a 2 / 4 / 7 column grid. Cards are `BrandCard.jsx`.
- **Demo products**: the 72 placeholder products were re-pointed to these brands by sport and category (so every brand page has products). Edit the brand column in `catalog.js` when you load your real stock. A brand's subtitle ("Cricket · Badminton gear") is built from its products.
- **Forma**: the supplied image has white lettering, so only the yellow swoosh shows. Replace `public/brands/forma.webp` with a dark or full-colour version.

## Page-change animation
The page behind is blurred (frosted) while only the logo animation plays on top. No glow around the logo.

## Cricket kit bag
- Closed: no cards on screen at all (the dashed empty placeholder cards and the big "08" placeholder were removed). Only the bag, a "Tap to open the bag" pill and a small "8 pieces packed inside" caption show.
- The card area is collapsed while the bag is closed and expands (as the flaps open) so the real cards rise out of the bag into it. "Repack the bag" puts the cards back and collapses it again. See `CricketKit.jsx` (`expanded`, `railH`, `bagW`).

### Kit bag name background
`NameBackdrop` in `CricketKit.jsx` replaces the old faint "KIT" watermark: a giant outlined ZENMOOVZ the bag stands on, with a copper floor-light fill, a pool of copper light behind the bag, and a slow highlight sweep (off for reduced motion). It brightens when the bag opens. Tune the look via the gradients inside `NameBackdrop` and the `.14` padding on the stage (how much of the name shows under the bag).

### Kit bag: silver-blue cards, no add-to-cart, All view only
- **Cards** (`KitCard` in `CricketKit.jsx`, `.kc-card` in `index.css`): silver-blue brushed-metal frame with a light that sweeps across, staggered card by card. The size / weight picker and Add to cart button were removed; each card ends with a "View details" link to the product page. The section's "Add full kit" button was removed too (it depended on those size pickers); the full-kit total, "Repack the bag" and "Shop all cricket" remain.
- **Name**: the ZENMOOVZ backdrop is now silver-blue with a bright silver highlight sweep (`NameBackdrop`).
- **Where it shows**: only on the ALL view ("/" with no sport / category / brand / search filter, or `?sport=all`). See `isAllView` in `src/lib/shop.js`, used by `App.jsx` and `Storefront.jsx`.

## Reels ("Stay in the game")
- A reel that has a video file (`src`) or an Instagram link (`url`) in `src/data/reels.js` now **plays / loads by itself** when it is selected. There is no poster and no play disc to press first.
- Instagram links load Instagram's own player (only once the section is near the screen, so the page does not load Instagram's script up front). If it cannot load (private reel, blocked, offline) it falls back to a "Watch it on Instagram" link.
- A reel with neither shows a plain sport-coloured placeholder marked "coming soon". It no longer shows product cards: the products are in "Shop this reel" beside it.
- To add your reels: see the instructions at the top of `src/data/reels.js` (best: put the .mp4 in `public/reels/` and set `src`).

## In-store services, specs and size guides

- **`src/data/services.js`**: every price and option for knocking-in, engraving and stringing (and how a chosen service becomes a cart line). Change a price here and the home page, `/services`, product pages and cart all follow.
- **Real footage on the service cards**: put `knock.mp4/.jpg`, `engrave.mp4/.jpg`, `string.mp4/.jpg` in `public/services/` (see the README.txt there). Video plays muted on a loop while on screen; a missing file falls back to the photo, then to the animated drawing (`src/components/ServiceMedia.jsx`).
- **Services dock**: Services is no longer in the sport strip. A slim tab sits on the right edge at mid-height; point at it (or tap it on a phone) and the panel slides out with the three services (`src/components/ServicesDock.jsx`). Related photos (`knock-1.jpg` …) show under each card on `/services` (`ServiceGallery.jsx`).
- **`/services`** (`src/pages/Services.jsx`): the three calculators. Deep links: `/services#knock`, `#engrave`, `#string`.
- **Where services show**: home page (All view), bat / cricket views (knocking-in, engraving), racket / badminton views (stringing), and as add-ons on bat and racket product pages. Services are cart products too (ids 9001 to 9003) but never appear in the shop grid or search.
- **`src/data/specs.js`**: specification cards and size guides, built per product kind from catalogue fields. To give one product its exact specs, add a `specs` object to its row in `data/catalog.js` (see the comment at the top of `specs.js`).

## Champion's Choice

Shown at the bottom of the **Cricket** and **Badminton** views (not on searches or best-seller / new-arrival lists). Each player links to that sport's products from the brand they play with.

- Players and brands: `src/data/champions.js`
- Photos: drop `kl-rahul.jpg`, `lakshya-sen.jpg`, … into `public/champions/` (details in the README there). Without a photo a monogram tile is shown.

## Order summary page

- Shown right after payment, and any time from **My orders → View order** at `/order/<order id>` (`src/components/OrderSummary.jsx`, `src/pages/OrderPage.jsx`).
- Dates, tracking stage, transaction / invoice numbers and the GST amount are worked out from the stored order in `src/lib/orders.js`. Tracking is a demo (it follows how long ago the order was placed).
- **Before going live, replace the placeholder seller GSTIN** in `SELLER` (`src/lib/orders.js`).
- "Cancel order" is available until the order is shipped. "Print / PDF" prints only the summary.
- Cart → Checkout → Payment → Order Summary progress bar is shared by the payment page and the summary.
