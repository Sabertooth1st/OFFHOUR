import { Link } from 'react-router-dom';
import { bySlug, formatPrice, LOOKS } from '../../data/catalogue';
import { useUi } from '../../state/ui';
import { Img } from '../Img';
import { PanelHeader } from '../Overlay';

export function LookPanel({ lookId }: { lookId: string }) {
  const { close } = useUi();
  const look = LOOKS.find((l) => l.id === lookId);
  if (!look) return null;
  const pieces = look.pieces.map((s) => bySlug(s)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="panel panel--look">
      <PanelHeader title="Shop this look" onClose={() => close()} />
      <div className="panel__body">
        <h3 className="panel__lead">{look.title}</h3>
        <p>{look.caption}</p>
        <ul className="look-list">
          {pieces.map((p, i) => (
            <li key={p.slug}>
              <Link
                to={`/shop/${p.slug}`}
                className="look-item"
                onClick={() => close({ restoreFocus: false })}
                data-autofocus={i === 0 ? true : undefined}
              >
                <span className="look-item__media">
                  <Img image={p.garment} sizes="88px" decorative />
                </span>
                <span className="look-item__text">
                  <span className="look-item__name">{p.name}</span>
                  <span className="look-item__meta">{p.type}</span>
                </span>
                <span className="look-item__price">{formatPrice(p.price)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
