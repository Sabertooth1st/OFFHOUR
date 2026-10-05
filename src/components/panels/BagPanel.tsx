import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus } from '@phosphor-icons/react/dist/csr/Minus';
import { Plus } from '@phosphor-icons/react/dist/csr/Plus';
import { bySlug, COLOURS, formatPrice } from '../../data/catalogue';
import { lineKey, MAX_QTY, useBag } from '../../state/bag';
import { useUi } from '../../state/ui';
import { Img } from '../Img';
import { PanelHeader } from '../Overlay';

export function BagPanel() {
  const { lines, count, subtotal, setQty, remove } = useBag();
  const { close, open } = useUi();
  const [step, setStep] = useState<'bag' | 'demo'>('bag');

  return (
    <div className="panel panel--bag">
      <PanelHeader title="Bag" count={`(${count})`} onClose={() => close()} />

      {step === 'demo' ? (
        <div className="panel__body">
          <h3 className="panel__lead">Demo ends here.</h3>
          <p>
            This is where checkout would begin. In this concept nothing is ordered, charged or sent, and no card details
            are collected. Your bag stays saved on this device.
          </p>
          <button type="button" className="btn" data-autofocus onClick={() => setStep('bag')}>
            Back to bag
          </button>
        </div>
      ) : lines.length === 0 ? (
        <div className="panel__body panel__body--empty">
          <h3 className="panel__lead">Your bag is empty.</h3>
          <p>Add a piece from Volume 01 and it will appear here.</p>
          <Link className="btn" to="/shop" onClick={() => close({ restoreFocus: false })} data-autofocus>
            Shop Volume 01
          </Link>
        </div>
      ) : (
        <>
          <ul className="bag-list">
            {lines.map((line) => {
              const product = bySlug(line.slug);
              if (!product) return null;
              const key = lineKey(line);
              return (
                <li className="bag-line" key={key}>
                  <Link
                    to={`/shop/${product.slug}`}
                    className="bag-line__media"
                    onClick={() => close({ restoreFocus: false })}
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <Img image={product.garment} sizes="96px" decorative />
                  </Link>
                  <div className="bag-line__info">
                    <h3 className="bag-line__name">
                      <Link to={`/shop/${product.slug}`} onClick={() => close({ restoreFocus: false })}>
                        {product.name}
                      </Link>
                    </h3>
                    <p className="bag-line__meta">
                      {COLOURS[line.colour].name}, size {line.size}
                    </p>
                    <p className="bag-line__price">{formatPrice(product.price)}</p>
                    <div className="bag-line__actions">
                      <div className="stepper" role="group" aria-label={`Quantity for ${product.name}`}>
                        <button
                          type="button"
                          className="stepper__btn"
                          onClick={() => setQty(key, line.qty - 1)}
                          disabled={line.qty <= 1}
                          aria-label={`Decrease quantity of ${product.name}`}
                        >
                          <Minus size={16} aria-hidden="true" />
                        </button>
                        <output className="stepper__value" aria-live="polite">
                          {line.qty}
                        </output>
                        <button
                          type="button"
                          className="stepper__btn"
                          onClick={() => setQty(key, line.qty + 1)}
                          disabled={line.qty >= MAX_QTY}
                          aria-label={`Increase quantity of ${product.name}`}
                        >
                          <Plus size={16} aria-hidden="true" />
                        </button>
                      </div>
                      <button type="button" className="link-btn" onClick={() => remove(key)}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="bag-line__total" aria-label={`Line total ${formatPrice(product.price * line.qty)}`}>
                    {formatPrice(product.price * line.qty)}
                  </p>
                </li>
              );
            })}
          </ul>

          <footer className="panel__foot">
            <p className="bag-subtotal">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </p>
            <p className="panel__note">
              Demo store. No purchase or payment will be processed.{' '}
              <button type="button" className="link-btn" onClick={() => open({ kind: 'info', topic: 'delivery' })}>
                Delivery information
              </button>
            </p>
            <button type="button" className="btn btn--solid btn--block" onClick={() => setStep('demo')}>
              Continue demo
            </button>
          </footer>
        </>
      )}
    </div>
  );
}
