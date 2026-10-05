import { Link } from 'react-router-dom';
import { useUi } from '../../state/ui';
import { PanelHeader } from '../Overlay';
import { HashLink } from '../HashLink';

export function MenuPanel() {
  const { close, open } = useUi();
  const done = () => close({ restoreFocus: false });
  return (
    <div className="panel panel--menu">
      <PanelHeader title="Menu" onClose={() => close()} />
      <nav aria-label="Menu">
        <ul className="menu-list">
          <li>
            <Link to="/shop" onClick={done} data-autofocus>
              Shop
            </Link>
          </li>
          <li>
            <HashLink hash="lookbook" onNavigate={done}>
              Lookbook
            </HashLink>
          </li>
          <li>
            <HashLink hash="about" onNavigate={done}>
              About
            </HashLink>
          </li>
          <li>
            <button type="button" onClick={() => open({ kind: 'search' })}>
              Search
            </button>
          </li>
        </ul>
      </nav>
      <p className="panel__note">OFFHOUR Volume 01. A UZICE STUDIO concept, simulated commerce.</p>
    </div>
  );
}
