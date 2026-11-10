# ZENMOOVZ local product image fallbacks

These are original, generic studio-style product visuals used as local fallbacks so the demo shop can render product images without making external image requests.

They are product-type illustrations, not verified manufacturer photographs or exact Strikr, Aerolite, Kickora, Hooplane, Netform, Tidal, Zenpro, or Stride SKUs. Replace a fallback with the exact product photo by adding a file named `public/products/<product-id>.jpg` (see the product ID table in `PHOTOS.md`). Exact per-product images take priority over these fallback assets.

The fallback selection is handled by `src/data/stock.js` and covers all product kinds currently present in `src/data/catalog.js`.
