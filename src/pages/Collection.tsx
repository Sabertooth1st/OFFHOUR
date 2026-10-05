import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ViewToggle, type View } from '../components/ViewToggle';
import { CATEGORIES, PRODUCTS, SORTS, sortProducts, type SortKey } from '../data/catalogue';
import { useDocumentTitle } from '../state/hooks';

const isCategory = (v: string | null) => CATEGORIES.some((c) => c.id === v);
const isSort = (v: string | null): v is SortKey => SORTS.some((s) => s.id === v);

export default function Collection() {
  useDocumentTitle('Volume 01 | OFFHOUR');
  const [params, setParams] = useSearchParams();
  const rawCat = params.get('cat');
  const cat = isCategory(rawCat) ? rawCat! : 'all';
  const rawSort = params.get('sort');
  const sort: SortKey = isSort(rawSort) ? rawSort : 'featured';
  const view: View = params.get('view') === 'body' ? 'body' : 'garment';

  // State lives in the URL so Back from a product returns to the same filtered, sorted view.
  const update = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params);
    if (value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const filtered = PRODUCTS.filter((p) => cat === 'all' || p.category === cat);
  const list = sortProducts(filtered, sort);

  return (
    <div className="page-shop shell">
      <header className="shop-head">
        <h1 className="display display--xl">Volume 01</h1>
        <p className="lead">Outerwear, heavyweight basics, relaxed tailoring and knitwear.</p>
      </header>

      <div className="shop-controls">
        <div className="filters" role="group" aria-label="Filter by category">
          {CATEGORIES.map((c) => (
            <button key={c.id} type="button" className="tab" aria-pressed={cat === c.id} onClick={() => update('cat', c.id, 'all')}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="shop-controls__right">
          <ViewToggle view={view} onChange={(v) => update('view', v, 'garment')} />
          <div className="select">
            <label htmlFor="sort">Sort</label>
            <select id="sort" value={sort} onChange={(e) => update('sort', e.target.value, 'featured')}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="shop-count" role="status">
        {list.length} {list.length === 1 ? 'piece' : 'pieces'}
      </p>

      {list.length === 0 ? (
        <div className="empty">
          <h2 className="panel__lead">No pieces in this category.</h2>
          <Link className="btn" to="/shop">
            Show all pieces
          </Link>
        </div>
      ) : (
        <div className="grid">
          {list.map((p, i) => (
            <ProductCard key={p.slug} product={p} view={view} priority={i < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
