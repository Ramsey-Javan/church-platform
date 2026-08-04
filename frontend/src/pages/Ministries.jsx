import { useEffect, useState } from 'react';
import { getMinistries, getSmallGroups } from '../api/client';

function unwrapCollection(data) {
  if (Array.isArray(data)) {
    return data;
  }
  return data?.results || [];
}

export default function Ministries() {
  const [ministries, setMinistries] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [groups, setGroups] = useState([]);
  const [status, setStatus] = useState('loading');
  const [locationArea, setLocationArea] = useState('');
  const [meetingDay, setMeetingDay] = useState('');

  useEffect(() => {
    Promise.all([getMinistries(), getSmallGroups()])
      .then(([ministriesData, groupsData]) => {
        const ministriesList = unwrapCollection(ministriesData);
        const groupsList = unwrapCollection(groupsData);
        setMinistries(ministriesList);
        setAllGroups(groupsList);
        setGroups(groupsList);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => {
    const filtered = allGroups.filter((group) => {
      const matchesLocation = !locationArea || group.location_area === locationArea;
      const matchesDay = !meetingDay || group.meeting_day === meetingDay;
      return matchesLocation && matchesDay;
    });
    setGroups(filtered);
  }, [allGroups, locationArea, meetingDay]);

  const locationOptions = [...new Set(allGroups.map((group) => group.location_area).filter(Boolean))];
  const dayOptions = [...new Set(allGroups.map((group) => group.meeting_day).filter(Boolean))];

  return (
    <main className="max-w-6xl mx-auto px-6 py-16 space-y-16">
      <section className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-sage)' }}>
          Life together
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight" style={{ color: 'var(--color-ink)' }}>
          Ministries and small groups
        </h1>
        <p className="mt-4 text-lg" style={{ color: 'var(--color-ink)', opacity: 0.78 }}>
          Find a place to serve, grow, and build relationships.
        </p>
        {status === 'error' && (
          <p className="mt-4 text-sm" style={{ color: 'var(--color-gold)' }}>
            Ministries could not be loaded right now.
          </p>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {ministries.map((ministry) => (
          <article key={ministry.id} className="rounded-3xl border p-6 bg-white" style={{ borderColor: 'var(--color-rule)' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-sage)' }}>
              Ministry
            </p>
            <h2 className="font-display text-2xl mb-3" style={{ color: 'var(--color-ink)' }}>
              {ministry.name}
            </h2>
            <p className="text-sm leading-7" style={{ opacity: 0.78 }}>
              {ministry.description || 'Description coming soon.'}
            </p>
            {ministry.leader_contact && (
              <p className="mt-4 text-sm" style={{ opacity: 0.78 }}>
                Leader contact: {ministry.leader_contact}
              </p>
            )}
          </article>
        ))}
      </section>

      <section className="rounded-3xl border p-6 md:p-8 bg-white" style={{ borderColor: 'var(--color-rule)' }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--color-sage)' }}>
              Small groups
            </p>
            <h2 className="font-display text-3xl" style={{ color: 'var(--color-ink)' }}>
              Group directory
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="small-group-location" className="block text-sm font-medium mb-2">Location area</label>
              <select
                id="small-group-location"
                value={locationArea}
                onChange={(event) => setLocationArea(event.target.value)}
                className="w-full rounded-2xl border px-4 py-3 bg-transparent"
                style={{ borderColor: 'var(--color-rule)' }}
              >
                <option value="">All areas</option>
                {locationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="small-group-day" className="block text-sm font-medium mb-2">Meeting day</label>
              <select
                id="small-group-day"
                value={meetingDay}
                onChange={(event) => setMeetingDay(event.target.value)}
                className="w-full rounded-2xl border px-4 py-3 bg-transparent"
                style={{ borderColor: 'var(--color-rule)' }}
              >
                <option value="">All days</option>
                {dayOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <article key={group.id} className="rounded-3xl border p-5" style={{ borderColor: 'var(--color-rule)', background: '#fff' }}>
              <h3 className="font-display text-2xl mb-2" style={{ color: 'var(--color-ink)' }}>
                {group.name}
              </h3>
              <p className="text-sm mb-2" style={{ opacity: 0.78 }}>
                {group.location_area || 'Location not listed'}
              </p>
              <p className="text-sm" style={{ opacity: 0.78 }}>
                {group.meeting_day || 'Meeting day not listed'} {group.meeting_time ? `· ${group.meeting_time}` : ''}
              </p>
              {group.leader_contact && (
                <p className="mt-3 text-sm" style={{ opacity: 0.78 }}>
                  Leader contact: {group.leader_contact}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
