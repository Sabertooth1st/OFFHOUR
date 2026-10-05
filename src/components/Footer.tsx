import { Link } from 'react-router-dom';
import { useUi, type InfoTopic } from '../state/ui';
import { HashLink } from './HashLink';

const INFO: { id: InfoTopic; label: string }[] = [
  { id: 'size', label: 'Size guide' },
  { id: 'care', label: 'Garment care' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'contact', label: 'Contact' },
];

export function Footer() {
  const { open } = useUi();
  return (
    <footer className="site-footer" id="footer">
      <div className="shell site-footer__grid">
        <nav aria-label="Explore" className="footer-col">
          <h2 className="footer-col__title">Explore</h2>
          <ul>
            <li>
              <Link to="/shop">Shop</Link>
            </li>
            <li>
              <HashLink hash="details">Details</HashLink>
            </li>
            <li>
              <HashLink hash="about">About</HashLink>
            </li>
          </ul>
        </nav>
        <nav aria-label="Customer information" className="footer-col">
          <h2 className="footer-col__title">Information</h2>
          <ul>
            {INFO.map((i) => (
              <li key={i.id}>
                <button type="button" onClick={() => open({ kind: 'info', topic: i.id })}>
                  {i.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="footer-col footer-col--note">
          <h2 className="footer-col__title">Concept store</h2>
          <p>
            OFFHOUR is a fictional label and a UZICE STUDIO concept store. Prices are in CHF, nothing is sold, and no
            payment is processed. Pictures are replaceable placeholder plates until campaign photography is supplied.
          </p>
        </div>
      </div>
      <div className="shell site-footer__mark" aria-hidden="true">
        OFFHOUR
      </div>
      <div className="shell site-footer__legal">
        <p>UZICE STUDIO concept store</p>
        <p>Volume 01 / Autumn Collection</p>
      </div>
    </footer>
  );
}
