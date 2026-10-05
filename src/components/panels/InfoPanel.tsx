import { useState } from 'react';
import type { InfoTopic } from '../../state/ui';
import { useUi } from '../../state/ui';
import { PanelHeader } from '../Overlay';

const TOPICS: { id: InfoTopic; label: string }[] = [
  { id: 'size', label: 'Size guide' },
  { id: 'care', label: 'Garment care' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'contact', label: 'Contact' },
];

const SIZE_ROWS = [
  ['XS', '112', '66', '62'],
  ['S', '116', '68', '63'],
  ['M', '120', '70', '64'],
  ['L', '124', '72', '65'],
  ['XL', '128', '74', '66'],
];

export function InfoPanel({ topic: initial }: { topic: InfoTopic }) {
  const { close } = useUi();
  const [topic, setTopic] = useState<InfoTopic>(initial);
  const current = TOPICS.find((t) => t.id === topic)!;

  return (
    <div className="panel panel--info">
      <PanelHeader title={current.label} onClose={() => close()} />
      <div className="info-tabs" role="group" aria-label="Information topics">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="tab"
            aria-pressed={t.id === topic}
            onClick={() => setTopic(t.id)}
            data-autofocus={t.id === initial ? true : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="panel__body info-body">
        <p className="demo-flag">Demo content for a fictional label.</p>
        {topic === 'size' && (
          <>
            <p>OFFHOUR cuts relaxed. If you are between sizes and want a closer line, take the smaller size.</p>
            <table className="size-table">
              <caption>Measurements in cm, garment laid flat</caption>
              <thead>
                <tr>
                  <th scope="col">Size</th>
                  <th scope="col">Chest</th>
                  <th scope="col">Length</th>
                  <th scope="col">Sleeve</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_ROWS.map(([s, c, l, sl]) => (
                  <tr key={s}>
                    <th scope="row">{s}</th>
                    <td>{c}</td>
                    <td>{l}</td>
                    <td>{sl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {topic === 'care' && (
          <>
            <p>Always follow the care label on a real garment. This is stand-in guidance for the concept.</p>
            <dl className="info-list">
              <div>
                <dt>Wash</dt>
                <dd>Cool, with similar colours, turned inside out.</dd>
              </div>
              <div>
                <dt>Dry</dt>
                <dd>Hang or dry flat. Avoid the tumble dryer.</dd>
              </div>
              <div>
                <dt>Press</dt>
                <dd>Low heat on the reverse side.</dd>
              </div>
              <div>
                <dt>Store</dt>
                <dd>Hang jackets on a wide hanger and fold knitwear.</dd>
              </div>
            </dl>
          </>
        )}
        {topic === 'delivery' && (
          <>
            <p>
              OFFHOUR is a concept store, so nothing ships and no order is placed. In a live store this page would set
              out delivery options, timings and returns.
            </p>
            <p>The bag and the Continue demo step show the flow only. No payment is taken.</p>
          </>
        )}
        {topic === 'contact' && (
          <>
            <p>This concept has no live customer service. The address below uses a reserved example domain and is not monitored.</p>
            <p>
              <a className="text-link" href="mailto:hello@offhour.example">
                hello@offhour.example
              </a>
            </p>
            <p>OFFHOUR is a portfolio concept by UZICE STUDIO.</p>
          </>
        )}
      </div>
    </div>
  );
}
