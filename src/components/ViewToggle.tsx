export type View = 'garment' | 'body';

export function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div className="seg" role="group" aria-label="Product view">
      <button type="button" aria-pressed={view === 'garment'} onClick={() => onChange('garment')}>
        Garment
      </button>
      <button type="button" aria-pressed={view === 'body'} onClick={() => onChange('body')}>
        On body
      </button>
    </div>
  );
}
