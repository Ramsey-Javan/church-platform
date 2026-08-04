import { Link } from 'react-router-dom';
import { useChurchSettings } from '../context/ChurchSettingsContext';

export default function Home() {
  const { settings, status } = useChurchSettings();

  return (
    <main>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20">
        <p
          className="text-sm font-semibold tracking-wide uppercase mb-4"
          style={{ color: 'var(--color-sage)' }}
        >
          {status === 'ready' && settings?.service_times
            ? settings.service_times
            : 'Join us this Sunday'}
        </p>

        <h1
          className="font-display text-5xl md:text-6xl leading-tight max-w-2xl"
          style={{ color: 'var(--color-ink)' }}
        >
          {status === 'ready' && settings?.name ? settings.name : 'A place to belong'}
        </h1>

        {settings?.tagline && (
          <p className="mt-2 text-lg" style={{ color: 'var(--color-sage)' }}>
            {settings.tagline}
          </p>
        )}

        <p className="mt-6 max-w-xl text-lg" style={{ color: 'var(--color-ink)', opacity: 0.75 }}>
          Whether it's your first Sunday or your fiftieth year here, there's a seat for you.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/plan-a-visit"
            className="px-6 py-3 rounded-full font-semibold text-white"
            style={{ background: 'var(--color-gold)' }}
          >
            I'm New — Plan a Visit
          </Link>

          <Link
            to="/watch"
            className="px-6 py-3 rounded-full font-semibold border"
            style={{ borderColor: 'var(--color-ink)', color: 'var(--color-ink)' }}
          >
            Watch Online
          </Link>

          <Link
            to="/today"
            className="px-6 py-3 rounded-full font-semibold"
            style={{ color: 'var(--color-sage)' }}
          >
            What's happening today →
          </Link>
        </div>

        {status === 'error' && (
          <p className="mt-6 text-sm" style={{ color: 'var(--color-gold)' }}>
            Backend not reachable yet — add a ChurchSettings row in /admin/ and make sure
            the API is running at the URL in VITE_API_BASE_URL.
          </p>
        )}
      </section>

      {/* Service details strip */}
      <section
        className="border-t"
        style={{ borderColor: 'var(--color-rule)', background: '#fff' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-lg mb-1">Service Times</h3>
            <p style={{ opacity: 0.75 }}>
              {settings?.service_times || 'Set this in Church Settings'}
            </p>
          </div>
          <div>
            <h3 className="font-display text-lg mb-1">Location</h3>
            <p style={{ opacity: 0.75 }}>{settings?.address || 'Set this in Church Settings'}</p>
          </div>
          <div>
            <h3 className="font-display text-lg mb-1">Contact</h3>
            <p style={{ opacity: 0.75 }}>
              {settings?.phone || settings?.email || 'Set this in Church Settings'}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}