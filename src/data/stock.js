/*
  Local, category-accurate product photos used when a product has no exact SKU photo.
  Add your own exact image as public/products/<product-id>.jpg; ProductArt will use it first.
  The generated fallback images live in public/products/_stock/ and keep the shop working offline.
*/
const local = name => `/products/_stock/${name}.webp`;

export const STOCK = {
  bat: local('bat'),
  stumps: local('stumps'),
  cball: local('cricket-ball'),
  cork: local('cork-ball'),
  racket: local('badminton-racket'),
  shuttle: local('shuttlecock'),
  football: local('football'),
  basketball: local('basketball'),
  volleyball: local('volleyball'),
  throwball: local('throwball'),
  net: local('volleyball-net'),
  jersey: local('jersey'),
  pads: local('batting-pads'),
  helmet: local('cricket-helmet'),
  goggles: local('swim-goggles'),
  cap: local('swim-cap'),
  shorts: local('swim-shorts'),
};

export function stockFor(product) {
  if (!product?.art?.kind) return null;
  const { kind } = product.art;
  const sport = product.sport;
  const id = Number(product.id);

  // Shoes vary by sport, so each group gets the right outsole and silhouette.
  if (kind === 'shoe') {
    if (sport === 'cricket') return local('cricket-spikes');
    if (sport === 'football') return local('football-boots');
    if (sport === 'basketball') return local('basketball-high-tops');
    return local('court-shoes');
  }

  // Cricket batting gloves and football goalkeeper gloves are different products.
  if (kind === 'gloves') {
    return sport === 'football' ? local('keeper-gloves') : local('batting-gloves');
  }

  // Guards are chosen by the actual product, not only the shared art kind.
  if (kind === 'kneepad') {
    if (sport === 'football') return local('shin-guards');
    if (id === 63) return local('elbow-knee-guards');
    return local('knee-pads');
  }

  if (kind === 'bag') {
    return sport === 'swimming' ? local('swim-mesh-bag') : local('sports-duffel');
  }

  if (kind === 'board') {
    return id === 71 ? local('pull-buoy') : local('kickboard');
  }

  return STOCK[kind] || null;
}
