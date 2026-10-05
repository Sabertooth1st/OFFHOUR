import { Link } from 'react-router-dom';
import { Img } from '../components/Img';
import { Reveal } from '../components/Reveal';
import { Signup } from '../components/Signup';
import { plate } from '../data/images';

const worn = plate('jacket-body', 'Model in the Form Shell Jacket under the concrete overhang');

export function Finale() {
  return (
    <section className="finale" aria-labelledby="finale-title">
      <div className="finale__grid shell">
        <Reveal className="finale__media">
          <div className="frame frame--portrait">
            <Img image={worn} sizes="(min-width: 900px) 30vw, 90vw" />
          </div>
        </Reveal>
        <div className="finale__copy">
          <Reveal as="h2" className="finale__statement" id="finale-title">
            Between places.
          </Reveal>
          <Reveal as="p" className="lead" delay={60}>
            Volume 01 is six pieces for the hours between one place and the next.
          </Reveal>
          <Reveal delay={120}>
            <Link className="btn btn--solid-light" to="/shop">
              Shop Volume 01
            </Link>
          </Reveal>
          <Reveal className="finale__signup" delay={160}>
            <Signup />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
