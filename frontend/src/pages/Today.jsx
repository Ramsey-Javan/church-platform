import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTodayProgram } from '../api/client';

const todayLabel = new Date().toLocaleDateString(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export default function Today() {
  const [service, setService] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    getTodayProgram()
      .then((data) => {
        setService(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <p
        className="text-sm font-semibold tracking-wide uppercase mb-2"
        style={{ color: 'var(--color-sage)' }}
      >
        {todayLabel}
      </p>
      <h1 className="font-display text-4xl mb-8" style={{ color: 'var(--color-ink)' }}>
        Today's Program
      </h1>

      {status === 'loading' && <p style={{ opacity: 0.6 }}>Loading...</p>}

      {status === 'error' && (
        <p style={{ color: 'var(--color-gold)' }}>
          Couldn't load today's program right now — please try again shortly.
        </p>
      )}

      {status === 'ready' && !service && (
        <div>
          <p style={{ opacity: 0.75 }}>Nothing scheduled today. Check upcoming events instead.</p>
          <Link
            to="/events"
            className="inline-block mt-4 px-5 py-2.5 rounded-full font-semibold text-white"
            style={{ background: 'var(--color-gold)' }}
          >
            View Events
          </Link>
        </div>
      )}

      {status === 'ready' && service && (
        <div>
          <h2 className="font-display text-2xl mb-6">{service.title}</h2>
          <ol className="space-y-0">
            {service.items.map((item, i) => (
              <li
                key={item.id}
                className="flex gap-4 py-4 border-t"
                style={{ borderColor: 'var(--color-rule)' }}
              >
                <span
                  className="text-sm font-semibold shrink-0 w-16"
                  style={{ color: 'var(--color-sage)' }}
                >
                  {item.time
                    ? new Date(`1970-01-01T${item.time}`).toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : ''}
                </span>
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-ink)' }}>
                    {item.title}
                  </p>
                  {item.leader && (
                    <p className="text-sm" style={{ opacity: 0.65 }}>
                      {item.leader}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-sm mt-1" style={{ opacity: 0.6 }}>
                      {item.notes}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </main>
  );
}