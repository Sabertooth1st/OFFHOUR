import { Angles } from '../home/Angles';
import { CollectionRun } from '../home/CollectionRun';
import { DetailDive } from '../home/DetailDive';
import { Finale } from '../home/Finale';
import { HeroIntro } from '../home/HeroIntro';
import { Identity } from '../home/Identity';
import { useDocumentTitle } from '../state/hooks';

export default function Home() {
  useDocumentTitle('OFFHOUR Volume 01');
  return (
    <div className="home">
      <HeroIntro />
      <CollectionRun />
      <Angles />
      <Identity />
      <DetailDive />
      <Finale />
    </div>
  );
}
