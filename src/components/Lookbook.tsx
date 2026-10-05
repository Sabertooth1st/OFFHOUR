import { LOOKS } from '../data/catalogue';
import { useUi } from '../state/ui';
import { ParallaxImage } from './ParallaxImage';
import { Reveal } from './Reveal';

export function Lookbook() {
  const { open } = useUi();
  const [portrait, landscape] = LOOKS;
  return (
    <section id="lookbook" className="lookbook shell" aria-labelledby="lookbook-title">
      <Reveal as="h2" className="display display--lg lookbook__title" id="lookbook-title">
        Between places.
      </Reveal>

      <div className="lookbook__grid">
        <Reveal as="figure" className="look look--portrait">
          <ParallaxImage image={portrait.image} sizes="(min-width: 900px) 48vw, 100vw" className="frame--portrait" />
          <figcaption className="look__caption">
            <h3>{portrait.title}</h3>
            <p>{portrait.caption}</p>
            <button type="button" className="btn" onClick={() => open({ kind: 'look', lookId: portrait.id })}>
              Shop this look
            </button>
          </figcaption>
        </Reveal>

        <Reveal as="figure" className="look look--landscape" delay={60}>
          <ParallaxImage image={landscape.image} sizes="(min-width: 900px) 36vw, 100vw" className="frame--landscape" travel={28} />
          <figcaption className="look__caption">
            <h3>{landscape.title}</h3>
            <p>{landscape.caption}</p>
            <button type="button" className="btn" onClick={() => open({ kind: 'look', lookId: landscape.id })}>
              Shop this look
            </button>
          </figcaption>
        </Reveal>
      </div>
    </section>
  );
}
