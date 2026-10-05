import { plate, type ImageRef, type PlateId } from './images';

export type ColourId = 'oxblood' | 'concrete' | 'chalk' | 'charcoal' | 'washed-charcoal' | 'oat';
export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type Category = 'outerwear' | 'tops' | 'trousers' | 'knitwear';

export interface Colour {
  id: ColourId;
  name: string;
  hex: string;
}

export interface Product {
  slug: string;
  name: string;
  /** CHF, whole francs. Single source for cards, search, product page and bag. */
  price: number;
  type: string;
  category: Category;
  /** A colour is only listed once its imagery exists in `images`. */
  colours: ColourId[];
  sizes: Size[];
  fit: string;
  summary: string;
  garment: ImageRef;
  onBody: ImageRef;
  detail: ImageRef;
  /** Large close-up for the "View fabric" dialog. */
  fabric?: ImageRef;
  /** Garment isolated on a transparent background, for the dark home stage. */
  cutout?: ImageRef;
  featured?: boolean;
}

export const COLOURS: Record<ColourId, Colour> = {
  oxblood: { id: 'oxblood', name: 'Oxblood', hex: '#74333D' },
  concrete: { id: 'concrete', name: 'Concrete grey', hex: '#86877F' },
  chalk: { id: 'chalk', name: 'Chalk', hex: '#E4E1D8' },
  charcoal: { id: 'charcoal', name: 'Charcoal', hex: '#30312F' },
  'washed-charcoal': { id: 'washed-charcoal', name: 'Washed charcoal', hex: '#585956' },
  oat: { id: 'oat', name: 'Oat', hex: '#D0C2A5' },
};

const imgs = (slug: string, label: string) => ({
  garment: plate(`${slug}-garment` as PlateId, `${label}, garment view (placeholder plate)`),
  onBody: plate(`${slug}-body` as PlateId, `${label}, on body (placeholder plate)`),
  detail: plate(`${slug}-detail` as PlateId, `${label}, detail (placeholder plate)`),
});

export const PRODUCTS: Product[] = [
  {
    slug: 'form-shell-jacket',
    name: 'Form Shell Jacket',
    price: 240,
    type: 'Jacket',
    category: 'outerwear',
    colours: ['oxblood'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fit: 'Cropped, boxy shell with room through the shoulder. Stand collar, central zip and two large front pockets. Sits at the hip.',
    summary: 'A muted oxblood cropped shell with a stand collar, central zip and two large front pockets.',
    garment: plate('jacket-front', 'Form Shell Jacket in oxblood, front view'),
    onBody: plate('jacket-body', 'Model wearing the Form Shell Jacket open over a chalk tee and charcoal trousers'),
    detail: plate('jacket-collar', 'Stand collar and zip pull of the Form Shell Jacket'),
    fabric: plate('jacket-fabric', 'Close-up of the oxblood shell fabric weave'),
    cutout: plate('jacket-cutout', 'Form Shell Jacket in oxblood, front view'),
    featured: true,
  },
  {
    slug: 'field-wool-overshirt',
    name: 'Field Wool Overshirt',
    price: 190,
    type: 'Overshirt',
    category: 'outerwear',
    colours: ['concrete'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fit: 'Relaxed overshirt cut long enough to wear open over a tee. Two chest pockets and a straight hem.',
    summary: 'A concrete grey woollen overshirt with a relaxed, straight cut.',
    ...imgs('field-wool-overshirt', 'Field Wool Overshirt'),
  },
  {
    slug: 'heavyweight-tee',
    name: 'Heavyweight Tee',
    price: 65,
    type: 'T-shirt',
    category: 'tops',
    colours: ['chalk'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fit: 'Square, heavyweight tee with a wide neck rib and a slightly dropped shoulder.',
    summary: 'A chalk heavyweight jersey tee with a square, easy fit.',
    ...imgs('heavyweight-tee', 'Heavyweight Tee'),
  },
  {
    slug: 'relaxed-pleat-trouser',
    name: 'Relaxed Pleat Trouser',
    price: 145,
    type: 'Trousers',
    category: 'trousers',
    colours: ['charcoal'],
    sizes: ['S', 'M', 'L', 'XL'],
    fit: 'Relaxed through the hip with a single forward pleat and a straight, full-length leg.',
    summary: 'Charcoal tailored trousers with a forward pleat and a straight leg.',
    ...imgs('relaxed-pleat-trouser', 'Relaxed Pleat Trouser'),
  },
  {
    slug: 'volume-hoodie',
    name: 'Volume Hoodie',
    price: 135,
    type: 'Hoodie',
    category: 'tops',
    colours: ['washed-charcoal'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fit: 'Roomy hoodie with a deep hood, dropped shoulder and a kangaroo pocket. Washed for a softer, lived-in surface.',
    summary: 'A washed charcoal hoodie with a deep hood and generous body.',
    ...imgs('volume-hoodie', 'Volume Hoodie'),
  },
  {
    slug: 'rib-knit',
    name: 'Rib Knit',
    price: 165,
    type: 'Knitwear',
    category: 'knitwear',
    colours: ['oat'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fit: 'Textured rib knit with a close neck and a relaxed body. Layers under the Form Shell Jacket.',
    summary: 'An oat rib knit with a close neck and a relaxed body.',
    ...imgs('rib-knit', 'Rib Knit'),
  },
];

export const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'tops', label: 'Tops' },
  { id: 'trousers', label: 'Trousers' },
  { id: 'knitwear', label: 'Knitwear' },
];

export const bySlug = (slug: string | undefined) => PRODUCTS.find((p) => p.slug === slug);

export const formatPrice = (n: number) => `CHF ${n.toLocaleString('en-CH').replace(/[’']/g, ',')}`;

/** Name, type, category and colour search over the local catalogue. */
export function searchCatalogue(query: string): Product[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return PRODUCTS.filter((p) => {
    const hay = [p.name, p.type, p.category, ...p.colours.map((c) => COLOURS[c].name)].join(' ').toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name';
export const SORTS: { id: SortKey; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price, low to high' },
  { id: 'price-desc', label: 'Price, high to low' },
  { id: 'name', label: 'Name' },
];

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const out = [...list];
  if (sort === 'price-asc') out.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') out.sort((a, b) => b.price - a.price);
  else if (sort === 'name') out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}
