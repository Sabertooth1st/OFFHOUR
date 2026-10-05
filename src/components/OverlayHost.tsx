import { bySlug, LOOKS } from '../data/catalogue';
import { useUi } from '../state/ui';
import { Overlay, type OverlayVariant } from './Overlay';
import { BagPanel } from './panels/BagPanel';
import { FabricPanel } from './panels/FabricPanel';
import { InfoPanel } from './panels/InfoPanel';
import { LookPanel } from './panels/LookPanel';
import { MenuPanel } from './panels/MenuPanel';
import { SearchPanel } from './panels/SearchPanel';

export function OverlayHost() {
  const { overlay, shown, close } = useUi();
  if (!overlay) return null;

  const base = { shown, onClose: () => close() };
  let variant: OverlayVariant = 'dialog';
  let label = '';
  let body: React.ReactNode = null;

  switch (overlay.kind) {
    case 'bag':
      variant = 'drawer';
      label = 'Bag';
      body = <BagPanel />;
      break;
    case 'menu':
      variant = 'menu';
      label = 'Menu';
      body = <MenuPanel />;
      break;
    case 'search':
      variant = 'sheet';
      label = 'Search';
      body = <SearchPanel />;
      break;
    case 'info':
      variant = 'dialog';
      label = 'Information';
      body = <InfoPanel topic={overlay.topic} />;
      break;
    case 'look':
      variant = 'drawer';
      label = `Shop this look: ${LOOKS.find((l) => l.id === overlay.lookId)?.title ?? ''}`;
      body = <LookPanel lookId={overlay.lookId} />;
      break;
    case 'fabric':
      variant = 'lightbox';
      label = `${bySlug(overlay.slug)?.name ?? 'Garment'} fabric close-up`;
      body = <FabricPanel slug={overlay.slug} />;
      break;
  }

  return (
    <Overlay key={overlay.kind} variant={variant} label={label} {...base}>
      {body}
    </Overlay>
  );
}
