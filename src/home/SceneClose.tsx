import { Link } from 'react-router-dom';
import { motion, useTransform } from 'motion/react';
import { Img } from '../components/Img';
import { plate } from '../data/images';
import { useChapter, type SceneProps } from './chapters';

const NIGHT = plate('hero', '');

function Copy() {
  return (
    <div className="close__copy">
      <h2 className="cap cap--xl" id="last-light-title">
        Stay <em>off</em> the clock.
      </h2>
      <p className="close__lead">Volume 01. Six pieces for the hours in between.</p>
      <Link className="btn btn--solid-light" to="/shop">
        Shop Volume 01
      </Link>
    </div>
  );
}

/** Midnight: the opening frame returns, graded to night, and the film closes on the shop. */
function Moving() {
  const { local } = useChapter(5);
  const scale = useTransform(local, [0, 1], [1.25, 1.08]);
  const dark = useTransform(local, [0, 0.6], [0.35, 0.72]);
  const copyY = useTransform(local, [0, 0.5], [40, 0]);
  return (
    <>
      <div className="close__photo">
        <motion.div className="close__push" style={{ scale }}>
          <Img image={NIGHT} sizes="100vw" decorative />
        </motion.div>
        <motion.div className="scrim scrim--night" style={{ opacity: dark }} aria-hidden="true" />
      </div>
      <motion.div className="close__wrap" style={{ y: copyY }}>
        <Copy />
      </motion.div>
    </>
  );
}

export function SceneClose({ still }: SceneProps) {
  if (!still) return <Moving />;
  return (
    <>
      <div className="close__photo">
        <Img image={NIGHT} sizes="100vw" decorative />
        <div className="scrim scrim--night" style={{ opacity: 0.7 }} aria-hidden="true" />
      </div>
      <div className="close__wrap">
        <Copy />
      </div>
    </>
  );
}
