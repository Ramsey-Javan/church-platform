import { useEffect, useRef, useState } from 'react';
import { submitConnectCard } from '../api/client';

const HEARD_OPTIONS = [
  'Friend or family',
  'Social media',
  'Drive by / signage',
  'Google search',
  'Plan a Visit page',
  'Other',
];

function loadTurnstileScript() {
  return new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[data-turnstile]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Turnstile failed to load.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile failed to load.'));
    document.body.appendChild(script);
  });
}

export default function ConnectForm({
  defaultHowHeard = '',
  hideHowHeardField = false,
  submitLabel = 'Send',
  title = 'Connect',
}) {
  const widgetRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    how_heard: defaultHowHeard,
    message: '',
    is_prayer_request: false,
  });

  useEffect(() => {
    setForm((current) => ({ ...current, how_heard: defaultHowHeard || current.how_heard }));
  }, [defaultHowHeard]);

  useEffect(() => {
    let cancelled = false;

    if (!import.meta.env.VITE_TURNSTILE_SITE_KEY) {
      setErrorMessage('Turnstile is not configured for this frontend.');
      return undefined;
    }

    loadTurnstileScript()
      .then(() => {
        if (cancelled) {
          return;
        }
        setIsScriptReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage('Unable to load the verification widget right now.');
        }
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isScriptReady || !widgetRef.current || !window.turnstile || widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(widgetRef.current, {
      sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
      callback: (token) => {
        setTurnstileToken(token);
        setErrorMessage('');
      },
      'expired-callback': () => {
        setTurnstileToken('');
      },
      'error-callback': () => {
        setTurnstileToken('');
        setErrorMessage('Verification failed. Please try again.');
      },
    });
  }, [isScriptReady]);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      how_heard: defaultHowHeard,
      message: '',
      is_prayer_request: false,
    });
    setTurnstileToken('');
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!turnstileToken) {
      setErrorMessage('Please complete the verification first.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitConnectCard({
        ...form,
        turnstile_token: turnstileToken,
      });
      setSuccessMessage('Thanks. We received your message and will follow up soon.');
      resetForm();
    } catch (error) {
      const detail = error?.response?.data;
      const message = typeof detail === 'string'
        ? detail
        : detail?.detail || detail?.non_field_errors?.[0] || 'We could not submit your message right now.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDisabled = isSubmitting || !turnstileToken;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border p-6 md:p-8" style={{ borderColor: 'var(--color-rule)', background: '#fff' }}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--color-sage)' }}>
          {title}
        </p>
        <h2 className="font-display text-3xl" style={{ color: 'var(--color-ink)' }}>
          Send us a note
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="connect-name" className="block text-sm font-medium mb-2">Name</label>
          <input
            id="connect-name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-2xl border px-4 py-3 bg-transparent"
            style={{ borderColor: 'var(--color-rule)' }}
          />
        </div>
        <div>
          <label htmlFor="connect-email" className="block text-sm font-medium mb-2">Email</label>
          <input
            id="connect-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-2xl border px-4 py-3 bg-transparent"
            style={{ borderColor: 'var(--color-rule)' }}
          />
        </div>
        <div>
          <label htmlFor="connect-phone" className="block text-sm font-medium mb-2">Phone</label>
          <input
            id="connect-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-2xl border px-4 py-3 bg-transparent"
            style={{ borderColor: 'var(--color-rule)' }}
          />
        </div>
        {!hideHowHeardField ? (
          <div>
            <label htmlFor="connect-how-heard" className="block text-sm font-medium mb-2">How did you hear about us?</label>
            <select
              id="connect-how-heard"
              name="how_heard"
              value={form.how_heard}
              onChange={handleChange}
              className="w-full rounded-2xl border px-4 py-3 bg-transparent"
              style={{ borderColor: 'var(--color-rule)' }}
            >
              <option value="">Select an option</option>
              {HEARD_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ) : (
          <input type="hidden" name="how_heard" value={form.how_heard} />
        )}
      </div>

      <div>
        <label htmlFor="connect-message" className="block text-sm font-medium mb-2">Message</label>
        <textarea
          id="connect-message"
          name="message"
          rows="5"
          required
          value={form.message}
          onChange={handleChange}
          className="w-full rounded-2xl border px-4 py-3 bg-transparent"
          style={{ borderColor: 'var(--color-rule)' }}
        />
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          name="is_prayer_request"
          type="checkbox"
          checked={form.is_prayer_request}
          onChange={handleChange}
          className="h-4 w-4 rounded border"
          style={{ borderColor: 'var(--color-rule)' }}
        />
        <span>This is a prayer request</span>
      </label>

      <div className="space-y-3">
        <div ref={widgetRef} />
        {!import.meta.env.VITE_TURNSTILE_SITE_KEY && (
          <p className="text-sm" style={{ color: 'var(--color-gold)' }}>
            Add VITE_TURNSTILE_SITE_KEY to enable submissions.
          </p>
        )}
        {successMessage && (
          <p className="text-sm font-medium" style={{ color: 'var(--color-sage)' }}>
            {successMessage}
          </p>
        )}
        {errorMessage && (
          <p className="text-sm font-medium" style={{ color: 'var(--color-gold)' }}>
            {errorMessage}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitDisabled}
        className="px-6 py-3 rounded-full font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'var(--color-gold)' }}
      >
        {isSubmitting ? 'Sending...' : submitLabel}
      </button>
    </form>
  );
}