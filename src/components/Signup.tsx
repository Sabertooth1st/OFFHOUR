import { useId, useState, type FormEvent } from 'react';

type Status = { kind: 'idle' } | { kind: 'error'; message: string } | { kind: 'done' };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Demonstrates the interaction only. The address is validated locally and never leaves the page. */
export function Signup() {
  const id = useId();
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return setStatus({ kind: 'error', message: 'Enter your email address.' });
    if (!EMAIL.test(v)) return setStatus({ kind: 'error', message: 'Check the address. It should look like name@example.com.' });
    setStatus({ kind: 'done' });
    setValue('');
  };

  const error = status.kind === 'error' ? status.message : '';

  return (
    <form className="signup" onSubmit={onSubmit} noValidate>
      <label className="field__label" htmlFor={`${id}-email`}>
        Email for Volume 02 news
      </label>
      <div className="signup__row">
        <input
          id={`${id}-email`}
          className="field__input"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (status.kind !== 'idle') setStatus({ kind: 'idle' });
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-help ${error ? `${id}-error` : ''}`.trim()}
        />
        <button type="submit" className="btn btn--solid">
          Notify me
        </button>
      </div>
      <p id={`${id}-help`} className="field__help">
        Demo only. Your address is checked in the page and is not sent or stored.
      </p>
      <p id={`${id}-error`} className="field__error" role="alert">
        {error}
      </p>
      <p className="signup__done" role="status">
        {status.kind === 'done' ? 'Thank you. This is a demo, so no subscription was created.' : ''}
      </p>
    </form>
  );
}
