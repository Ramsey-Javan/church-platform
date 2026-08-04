import { useEffect, useState } from 'react';
import ConnectForm from '../components/ConnectForm';
import { getChurchSettings } from '../api/client';

function unwrapText(value, fallback) {
  return value || fallback;
}

export default function PlanAVisit() {
  const [settings, setSettings] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    getChurchSettings()
      .then((data) => {
        setSettings(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  const latitude = settings?.latitude;
  const longitude = settings?.longitude;
  const mapSrc = latitude && longitude
    ? `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`
    : '';

  return (
    <main className="max-w-6xl mx-auto px-6 py-16 space-y-16">
      <section className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-sage)' }}>
          First time here?
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight" style={{ color: 'var(--color-ink)' }}>
          Plan a visit
        </h1>
        <p className="mt-4 text-lg" style={{ color: 'var(--color-ink)', opacity: 0.78 }}>
          Come as you are. We’ll help you find parking, kids’ check-in, and a seat without the guesswork.
        </p>
        {status === 'error' && (
          <p className="mt-4 text-sm" style={{ color: 'var(--color-gold)' }}>
            Church settings could not be loaded right now, so some details below use placeholders.
          </p>
        )}
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border p-6 md:p-8" style={{ borderColor: 'var(--color-rule)', background: '#fff' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-sage)' }}>
              Service times
            </p>
            <h2 className="font-display text-3xl mb-3" style={{ color: 'var(--color-ink)' }}>
              {unwrapText(settings?.name, 'Our church')}
            </h2>
            <p className="text-base leading-7" style={{ color: 'var(--color-ink)', opacity: 0.78 }}>
              {unwrapText(settings?.service_times, 'Service times will be posted here.')}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-rule)' }}>
                <p className="font-semibold mb-1" style={{ color: 'var(--color-ink)' }}>Address</p>
                <p style={{ opacity: 0.78 }}>{unwrapText(settings?.address, 'Add your address in Church Settings.')}</p>
              </div>
              <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-rule)' }}>
                <p className="font-semibold mb-1" style={{ color: 'var(--color-ink)' }}>Contact</p>
                <p style={{ opacity: 0.78 }}>{settings?.phone || settings?.email || 'Add phone or email in Church Settings.'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border p-6 md:p-8" style={{ borderColor: 'var(--color-rule)', background: '#fff' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-sage)' }}>
              What to expect
            </p>
            <div className="space-y-5 text-base leading-7" style={{ color: 'var(--color-ink)', opacity: 0.8 }}>
              <p>
                Casual dress is always welcome. Come comfortable, whether that means a T-shirt and jeans or your Sunday best.
              </p>
              <p>
                Parking is available on site and our team can point you to the nearest entrance when you arrive.
              </p>
              <p>
                Families with children can use our kids’ check-in area near the main entrance. A volunteer will walk you through the process.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border overflow-hidden" style={{ borderColor: 'var(--color-rule)', background: '#fff' }}>
          <div className="p-6 border-b" style={{ borderColor: 'var(--color-rule)' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--color-sage)' }}>
              Find us
            </p>
            <h2 className="font-display text-2xl" style={{ color: 'var(--color-ink)' }}>
              Map and directions
            </h2>
          </div>
          {mapSrc ? (
            <iframe
              title="Church location map"
              src={mapSrc}
              className="w-full min-h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="p-6 text-sm" style={{ color: 'var(--color-ink)', opacity: 0.78 }}>
              Add latitude and longitude in Church Settings to show the map here.
            </div>
          )}
        </div>
      </section>

      <section>
        <ConnectForm defaultHowHeard="Plan a Visit page" hideHowHeardField title="Plan a visit" submitLabel="Send Visit Request" />
      </section>
    </main>
  );
}
