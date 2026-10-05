import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react/dist/csr/ArrowLeft';
import { ArrowRight } from '@phosphor-icons/react/dist/csr/ArrowRight';
import { Img } from '../components/Img';
import { bySlug, COLOURS, formatPrice, type ColourId, type Product, type Size } from '../data/catalogue';
import { useBag } from '../state/bag';
import { useDocumentTitle } from '../state/hooks';
import { useUi } from '../state/ui';
import NotFound from './NotFound';

export default function ProductPage() {
  const { slug } = useParams();
  const product = bySlug(slug);
  if (!product) return <NotFound />;
  return <ProductView key={product.slug} product={product} />;
}

function Gallery({ product }: { product: Product }) {
  const images = [product.garment, product.onBody, product.detail];
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  const scrollToIndex = (i: number) => {
    const el = track.current;
    if (!el) return;
    const n = images.length;
    const next = (i + n) % n;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: next * el.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
  };

  // The track is a horizontal scroll-snap strip on small screens and a grid on desktop.
  const onScroll = () => {
    const el = track.current;
    if (!el || el.scrollWidth <= el.clientWidth + 1) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollToIndex(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollToIndex(index - 1);
    }
  };

  return (
    <div className="gallery" role="region" aria-roledescription="carousel" aria-label={`${product.name} images`} tabIndex={0} onKeyDown={onKey}>
      <ul className="gallery__track" ref={track} onScroll={onScroll}>
        {images.map((img, i) => (
          <li key={img.id} className="gallery__item" aria-label={`Image ${i + 1} of ${images.length}`}>
            <Img image={img} sizes="(min-width: 900px) 56vw, 100vw" priority={i === 0} />
          </li>
        ))}
      </ul>
      <div className="gallery__controls">
        <button type="button" className="icon-btn" onClick={() => scrollToIndex(index - 1)} aria-label="Previous image">
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
        <span className="gallery__count" aria-live="polite">
          {index + 1} / {images.length}
        </span>
        <button type="button" className="icon-btn" onClick={() => scrollToIndex(index + 1)} aria-label="Next image">
          <ArrowRight size={22} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function ProductView({ product }: { product: Product }) {
  useDocumentTitle(`${product.name} | OFFHOUR`);
  const { add } = useBag();
  const { open, announce } = useUi();
  const [colour, setColour] = useState<ColourId>(product.colours[0]);
  const [size, setSize] = useState<Size | null>(null);
  const [error, setError] = useState('');
  const sizeGroup = useRef<HTMLFieldSetElement>(null);
  const cta = useRef<HTMLButtonElement>(null);
  const [barVisible, setBarVisible] = useState(false);

  // Mobile purchase bar appears only while the in-page button and the footer are both off screen.
  useEffect(() => {
    const ctaEl = cta.current;
    const footer = document.getElementById('footer');
    if (!ctaEl || typeof IntersectionObserver === 'undefined') return;
    let ctaIn = false;
    let footIn = false;
    const update = () => setBarVisible(!ctaIn && !footIn);
    const a = new IntersectionObserver(([e]) => {
      ctaIn = e.isIntersecting;
      update();
    });
    const b = new IntersectionObserver(([e]) => {
      footIn = e.isIntersecting;
      update();
    });
    a.observe(ctaEl);
    if (footer) b.observe(footer);
    return () => {
      a.disconnect();
      b.disconnect();
    };
  }, []);

  const addToBag = () => {
    if (!size) {
      setError('Select a size to add this piece to your bag.');
      sizeGroup.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      sizeGroup.current?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
      return;
    }
    add({ slug: product.slug, colour, size });
    announce(`${product.name}, ${COLOURS[colour].name}, size ${size} added to bag.`);
    open({ kind: 'bag' });
  };

  return (
    <div className="page-product shell">
      <Gallery product={product} />

      <aside className="buy" aria-label="Purchase">
        <p className="buy__crumb">
          <Link to="/shop">Volume 01</Link>
        </p>
        <h1 className="buy__name">{product.name}</h1>
        <p className="buy__price">{formatPrice(product.price)}</p>

        <fieldset className="opt">
          <legend>
            Colour <span className="opt__value">{COLOURS[colour].name}</span>
          </legend>
          <div className="opt__row">
            {product.colours.map((c) => (
              <label key={c} className="swatch-opt">
                <input type="radio" name="colour" value={c} checked={colour === c} onChange={() => setColour(c)} />
                <span className="swatch-opt__chip" style={{ background: COLOURS[c].hex }} />
                <span className="sr-only">{COLOURS[c].name}</span>
              </label>
            ))}
          </div>
          {product.fabric ? (
            <button type="button" className="link-btn" onClick={() => open({ kind: 'fabric', slug: product.slug })}>
              View fabric
            </button>
          ) : null}
        </fieldset>

        <fieldset className="opt" ref={sizeGroup} aria-describedby={error ? 'size-error' : undefined}>
          <legend>
            Size <span className="opt__value">{size ?? ''}</span>
          </legend>
          <div className="opt__row">
            {product.sizes.map((s) => (
              <label key={s} className="size-opt">
                <input
                  type="radio"
                  name="size"
                  value={s}
                  checked={size === s}
                  onChange={() => {
                    setSize(s);
                    setError('');
                  }}
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
          <p id="size-error" className="field__error" role="alert">
            {error}
          </p>
          <button type="button" className="link-btn" onClick={() => open({ kind: 'info', topic: 'size' })}>
            Size guide
          </button>
        </fieldset>

        <button ref={cta} type="button" className="btn btn--solid btn--block" onClick={addToBag}>
          Add to Bag
        </button>
        <p className="buy__demo">Demo store. Nothing is sold and no payment is processed.</p>

        <div className="buy__fit">
          <h2>Fit</h2>
          <p>{product.fit}</p>
        </div>

        <div className="acc">
          <details>
            <summary>Care</summary>
            <p>
              Stand-in guidance for the concept. Wash cool, hang to dry and follow the label on a real garment.{' '}
              <button type="button" className="link-btn" onClick={() => open({ kind: 'info', topic: 'care' })}>
                More on care
              </button>
            </p>
          </details>
          <details>
            <summary>Delivery</summary>
            <p>
              Nothing ships from this concept store.{' '}
              <button type="button" className="link-btn" onClick={() => open({ kind: 'info', topic: 'delivery' })}>
                Delivery information
              </button>
            </p>
          </details>
        </div>
      </aside>

      <div className={`buybar${barVisible ? ' is-visible' : ''}`} aria-hidden={!barVisible}>
        <div className="buybar__text">
          <span className="buybar__name">{product.name}</span>
          <span>{formatPrice(product.price)}</span>
        </div>
        <button type="button" className="btn btn--solid" onClick={addToBag} tabIndex={barVisible ? 0 : -1}>
          Add to Bag
        </button>
      </div>
    </div>
  );
}
