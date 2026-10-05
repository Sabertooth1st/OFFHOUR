import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GarmentStudy } from '../components/GarmentStudy';
import { Hero } from '../components/Hero';
import { Img } from '../components/Img';
import { Lookbook } from '../components/Lookbook';
import { ProductCard } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import { Signup } from '../components/Signup';
import { ViewToggle, type View } from '../components/ViewToggle';
import { PRODUCTS } from '../data/catalogue';
import { plate } from '../data/images';
import { useDocumentTitle } from '../state/hooks';

const chair = plate('brand-chair', 'Garment draped over a chair (placeholder plate showing a fabric swatch)');

export default function Home() {
  const [view, setView] = useState<View>('garment');
  useDocumentTitle('OFFHOUR Volume 01');

  return (
    <>
      <Hero />

      <section id="about" className="intro shell" aria-labelledby="intro-title">
        <div className="intro__text">
          <Reveal as="h2" className="display display--lg" id="intro-title">
            Room to move. Shape to keep.
          </Reveal>
          <Reveal as="p" className="lead" delay={60}>
            Relaxed silhouettes, substantial textures and pieces built to work together, from the shell jacket to the
            heavyweight tee.
          </Reveal>
        </div>
        <Reveal className="intro__media">
          <div className="frame frame--portrait">
            <Img image={chair} sizes="(min-width: 900px) 30vw, 70vw" />
          </div>
        </Reveal>
      </section>

      <section id="collection" className="collection shell" aria-labelledby="collection-title">
        <div className="section-head">
          <Reveal as="h2" className="display display--lg" id="collection-title">
            Volume 01
          </Reveal>
          <div className="section-head__tools">
            <ViewToggle view={view} onChange={setView} />
            <Link className="text-link" to="/shop">
              View all pieces
            </Link>
          </div>
        </div>
        <div className="grid">
          {PRODUCTS.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 40}>
              <ProductCard product={p} view={view} />
            </Reveal>
          ))}
        </div>
      </section>

      <GarmentStudy />

      <Lookbook />

      <section className="closing" aria-labelledby="closing-title">
        <div className="shell closing__grid">
          <Reveal as="h2" className="closing__statement" id="closing-title">
            OFFHOUR makes clothes for the hours between one place and the next.
          </Reveal>
          <Reveal className="closing__form" delay={60}>
            <Signup />
          </Reveal>
        </div>
      </section>
    </>
  );
}
