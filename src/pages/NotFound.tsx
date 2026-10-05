import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../state/hooks';

export default function NotFound() {
  useDocumentTitle('Not found | OFFHOUR');
  return (
    <div className="shell notfound">
      <h1 className="display display--lg">Off the map.</h1>
      <p className="lead">That page is not part of Volume 01.</p>
      <Link className="btn" to="/shop">
        Shop Volume 01
      </Link>
    </div>
  );
}
