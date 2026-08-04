import { useEffect, useState } from 'react';
import { getAboutPage, getGallery, getLeaders } from '../api/client';

export default function About() {
  const [about, setAbout] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    Promise.all([getAboutPage(), getGallery(), getLeaders()])
      .then(([aboutData, galleryData, leadersData]) => {
        setAbout(aboutData);
        setGallery(galleryData.results || galleryData);
        setLeaders(leadersData.results || leadersData);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl mb-6" style={{ color: 'var(--color-ink)' }}>
        Our Story
      </h1>

      {status === 'error' && (
        <p className="text-sm mb-8" style={{ color: 'var(--color-gold)' }}>
          Couldn't load this page right now — add an About Page entry in /admin/ if you
          haven't yet.
        </p>
      )}

      {about?.mission_statement && (
        <section className="mb-12 max-w-3xl">
          <h2 className="font-display text-2xl mb-3">Our Mission</h2>
          <p style={{ opacity: 0.8, whiteSpace: 'pre-line' }}>{about.mission_statement}</p>
        </section>
      )}

      {about?.history && (
        <section className="mb-16 max-w-3xl">
          <h2 className="font-display text-2xl mb-3">Our History</h2>
          <p style={{ opacity: 0.8, whiteSpace: 'pre-line' }}>{about.history}</p>
        </section>
      )}

      {leaders.length > 0 && (
        <section className="mb-16">
          <h2 className="font-display text-2xl mb-6">Leadership</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {leaders.map((leader) => (
              <div key={leader.id}>
                {leader.photo && (
                  <img
                    src={leader.photo}
                    alt={leader.name}
                    className="w-full aspect-square object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-display text-lg">{leader.name}</h3>
                <p className="text-sm mb-2" style={{ color: 'var(--color-sage)' }}>
                  {leader.role}
                </p>
                {leader.bio && <p className="text-sm" style={{ opacity: 0.75 }}>{leader.bio}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section>
          <h2 className="font-display text-2xl mb-6">Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {gallery.map((img) => (
              <figure key={img.id} className="relative">
                <img
                  src={img.image}
                  alt={img.caption || 'Church photo'}
                  className="w-full aspect-square object-cover rounded-lg"
                  loading="lazy"
                />
                {img.caption && (
                  <figcaption className="text-xs mt-1" style={{ opacity: 0.6 }}>
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}