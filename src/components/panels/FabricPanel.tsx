import { bySlug } from '../../data/catalogue';
import { useUi } from '../../state/ui';
import { Img } from '../Img';

export function FabricPanel({ slug }: { slug: string }) {
  const { close } = useUi();
  const product = bySlug(slug);
  if (!product?.fabric) return null;
  return (
    <figure className="panel panel--fabric">
      <button type="button" className="icon-btn icon-btn--on-dark panel__close-abs" onClick={() => close()} data-autofocus>
        <span className="sr-only">Close fabric close-up</span>
        <span aria-hidden="true" className="close-word">
          Close
        </span>
      </button>
      <Img image={product.fabric} sizes="(min-width: 900px) 60vh, 90vw" className="fabric-img" />
      <figcaption>{product.name}, fabric close-up</figcaption>
    </figure>
  );
}
