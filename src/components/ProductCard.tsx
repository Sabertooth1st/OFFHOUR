import { Link } from 'react-router-dom';
import { COLOURS, formatPrice, type Product } from '../data/catalogue';
import { Img } from './Img';
import type { View } from './ViewToggle';

interface Props {
  product: Product;
  view: View;
  /** First row can load eagerly; the rest are lazy. */
  priority?: boolean;
  linkState?: unknown;
}

export function ProductCard({ product, view, priority }: Props) {
  const primary = view === 'garment' ? product.garment : product.onBody;
  const alt = view === 'garment' ? product.onBody : product.garment;
  const sizes = '(min-width: 900px) 30vw, 46vw';
  return (
    <article className="card">
      <div className="card__media">
        <Img image={primary} sizes={sizes} className="card__img" priority={priority} decorative />
        <Img image={alt} sizes={sizes} className="card__img card__img--alt" decorative />
      </div>
      <div className="card__meta">
        <h3 className="card__name">
          <Link to={`/shop/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="card__price">{formatPrice(product.price)}</p>
        <ul className="card__colours" aria-label="Colour">
          {product.colours.map((c) => (
            <li key={c}>
              <span className="swatch" style={{ background: COLOURS[c].hex }} aria-hidden="true" />
              {COLOURS[c].name}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
