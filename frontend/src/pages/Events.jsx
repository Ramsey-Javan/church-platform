import { useEffect, useState } from 'react';
import { buildApiUrl, getEventCategories, getEvents, rsvpEvent } from '../api/client';

function unwrapCollection(data) {
  if (Array.isArray(data)) {
    return data;
  }
  return data?.results || [];
}

function formatDateTime(value) {
  if (!value) {
    return 'Date unavailable';
  }
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function Events() {
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [rsvpForms, setRsvpForms] = useState({});

  useEffect(() => {
    Promise.all([getEventCategories(), getEvents({ start_after: new Date().toISOString() })])
      .then(([categoriesData, eventsData]) => {
        setCategories(unwrapCollection(categoriesData));
        setEvents(unwrapCollection(eventsData));
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => {
    setStatus((current) => (current === 'error' ? current : 'loading'));
    getEvents({
      start_after: new Date().toISOString(),
      category: categoryFilter || undefined,
    })
      .then((data) => {
        setEvents(unwrapCollection(data));
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [categoryFilter]);

  const handleRsvpChange = (eventId, field, value) => {
    setRsvpForms((current) => ({
      ...current,
      [eventId]: {
        ...(current[eventId] || { name: '', email: '', status: '', error: '' }),
        [field]: value,
      },
    }));
  };

  const handleRsvpSubmit = async (event, eventId) => {
    event.preventDefault();
    setRsvpForms((current) => ({
      ...current,
      [eventId]: {
        ...(current[eventId] || { name: '', email: '' }),
        status: 'saving',
        error: '',
      },
    }));

    const form = rsvpForms[eventId] || {};
    try {
      await rsvpEvent(eventId, { name: form.name || '', email: form.email || '' });
      setRsvpForms((current) => ({
        ...current,
        [eventId]: {
          name: '',
          email: '',
          status: 'saved',
          error: '',
        },
      }));
    } catch (error) {
      const detail = error?.response?.data;
      const message = typeof detail === 'string'
        ? detail
        : detail?.detail || detail?.non_field_errors?.[0] || 'Unable to RSVP right now.';
      setRsvpForms((current) => ({
        ...current,
        [eventId]: {
          ...(current[eventId] || { name: '', email: '' }),
          status: 'error',
          error: message,
        },
      }));
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-16 space-y-12">
      <section className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-sage)' }}>
          Community life
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight" style={{ color: 'var(--color-ink)' }}>
          Upcoming events
        </h1>
        <p className="mt-4 text-lg" style={{ color: 'var(--color-ink)', opacity: 0.78 }}>
          Browse what’s happening and RSVP where registration is required.
        </p>
      </section>

      <section className="rounded-3xl border p-6 bg-white" style={{ borderColor: 'var(--color-rule)' }}>
        <label htmlFor="event-category" className="block text-sm font-medium mb-2">Filter by category</label>
        <select
          id="event-category"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="w-full sm:w-auto rounded-2xl border px-4 py-3 bg-transparent"
          style={{ borderColor: 'var(--color-rule)' }}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </section>

      {status === 'error' && (
        <p className="text-sm" style={{ color: 'var(--color-gold)' }}>
          Events could not be loaded right now.
        </p>
      )}

      <section className="space-y-6">
        {events.map((eventItem) => {
          const rsvpState = rsvpForms[eventItem.id] || {};
          return (
            <article key={eventItem.id} className="rounded-3xl border p-6 md:p-8 bg-white" style={{ borderColor: 'var(--color-rule)' }}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--color-sage)' }}>
                    {eventItem.category?.name || 'Event'}
                  </p>
                  <h2 className="font-display text-3xl mb-3" style={{ color: 'var(--color-ink)' }}>
                    {eventItem.title}
                  </h2>
                  <p className="text-sm mb-2" style={{ opacity: 0.78 }}>
                    {formatDateTime(eventItem.start)}{eventItem.end ? ` – ${formatDateTime(eventItem.end)}` : ''}
                  </p>
                  <p className="text-sm" style={{ opacity: 0.78 }}>
                    {eventItem.location || 'Location to be announced'}
                  </p>
                  {eventItem.description && (
                    <p className="mt-4 text-sm leading-7" style={{ opacity: 0.8 }}>
                      {eventItem.description}
                    </p>
                  )}
                </div>

                <a
                  href={buildApiUrl(`/events/${eventItem.id}/ics/`)}
                  className="inline-flex px-5 py-3 rounded-full font-semibold border"
                  style={{ borderColor: 'var(--color-ink)', color: 'var(--color-ink)' }}
                >
                  Add to Calendar
                </a>
              </div>

              {eventItem.registration_required && (
                <form onSubmit={(formEvent) => handleRsvpSubmit(formEvent, eventItem.id)} className="mt-6 rounded-2xl border p-4 md:p-5" style={{ borderColor: 'var(--color-rule)' }}>
                  <p className="text-sm font-semibold mb-4" style={{ color: 'var(--color-ink)' }}>
                    RSVP to reserve your spot
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`rsvp-name-${eventItem.id}`} className="block text-sm font-medium mb-2">Name</label>
                      <input
                        id={`rsvp-name-${eventItem.id}`}
                        type="text"
                        value={rsvpState.name || ''}
                        onChange={(event) => handleRsvpChange(eventItem.id, 'name', event.target.value)}
                        className="w-full rounded-2xl border px-4 py-3 bg-transparent"
                        style={{ borderColor: 'var(--color-rule)' }}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor={`rsvp-email-${eventItem.id}`} className="block text-sm font-medium mb-2">Email</label>
                      <input
                        id={`rsvp-email-${eventItem.id}`}
                        type="email"
                        value={rsvpState.email || ''}
                        onChange={(event) => handleRsvpChange(eventItem.id, 'email', event.target.value)}
                        className="w-full rounded-2xl border px-4 py-3 bg-transparent"
                        style={{ borderColor: 'var(--color-rule)' }}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <button type="submit" className="px-5 py-3 rounded-full font-semibold text-white" style={{ background: 'var(--color-gold)' }}>
                      {rsvpState.status === 'saving' ? 'Sending...' : 'RSVP'}
                    </button>
                    {rsvpState.status === 'saved' && (
                      <p className="text-sm" style={{ color: 'var(--color-sage)' }}>
                        RSVP received.
                      </p>
                    )}
                    {rsvpState.error && (
                      <p className="text-sm" style={{ color: 'var(--color-gold)' }}>
                        {rsvpState.error}
                      </p>
                    )}
                  </div>
                </form>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
