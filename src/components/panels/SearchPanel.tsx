import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { COLOURS, formatPrice, searchCatalogue } from '../../data/catalogue';
import { useUi } from '../../state/ui';
import { Img } from '../Img';
import { PanelHeader } from '../Overlay';

const SUGGESTIONS = ['Jacket', 'Knit', 'Trousers', 'Tee'];

export function SearchPanel() {
  const { close } = useUi();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchCatalogue(query), [query]);
  const hasQuery = query.trim().length > 0;

  return (
    <div className="panel panel--search">
      <PanelHeader title="Search" onClose={() => close()} />
      <form className="field" role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="search-input" className="field__label">
          Search the collection
        </label>
        <input
          id="search-input"
          className="field__input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder="Name or type of piece"
          data-autofocus
        />
      </form>

      <div className="search-results" aria-live="polite">
        {!hasQuery ? (
          <p className="panel__note">
            Try{' '}
            {SUGGESTIONS.map((s, i) => (
              <span key={s}>
                <button type="button" className="link-btn" onClick={() => setQuery(s)}>
                  {s.toLowerCase()}
                </button>
                {i < SUGGESTIONS.length - 1 ? ', ' : '.'}
              </span>
            ))}
          </p>
        ) : results.length === 0 ? (
          <div className="search-empty">
            <p className="panel__lead">Nothing matches &ldquo;{query.trim()}&rdquo;.</p>
            <p>Search by piece name or type, such as jacket, knit or trousers.</p>
            <Link className="btn" to="/shop" onClick={() => close({ restoreFocus: false })}>
              Browse the collection
            </Link>
          </div>
        ) : (
          <>
            <p className="sr-only">{results.length} results</p>
            <ul className="search-list">
              {results.map((p) => (
                <li key={p.slug}>
                  <Link to={`/shop/${p.slug}`} className="search-item" onClick={() => close({ restoreFocus: false })}>
                    <span className="search-item__media">
                      <Img image={p.garment} sizes="72px" decorative />
                    </span>
                    <span className="search-item__text">
                      <span className="search-item__name">{p.name}</span>
                      <span className="search-item__meta">
                        {p.type}, {COLOURS[p.colours[0]].name}
                      </span>
                    </span>
                    <span className="search-item__price">{formatPrice(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
