import { Signup } from '../components/Signup';
import { Film } from '../home/Film';
import { useDocumentTitle } from '../state/hooks';

export default function Home() {
  useDocumentTitle('OFFHOUR Volume 01');
  return (
    <div className="home">
      <Film />
      <section className="after shell" aria-labelledby="after-title">
        <h2 className="after__title" id="after-title">
          Hear when Volume 02 lands.
        </h2>
        <div className="after__form">
          <Signup />
        </div>
      </section>
    </div>
  );
}
