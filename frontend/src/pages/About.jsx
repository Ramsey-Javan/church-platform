import { useEffect, useMemo, useState } from 'react';
import { getAboutPage, getGallery, getLeaders } from '../api/client';
import { useParallax } from '../hooks/useParallax';
import CustomCursor from '../components/CustomCursor';
import GalleryPhotoCard from '../components/GalleryPhotoCard';
import LeaderCard from '../components/LeaderCard';

const RECENT_MS = 14 * 24 * 60 * 60 * 1000;

export default function About() {
  const [about, setAbout] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [status, setStatus] = useState('loading');
  const [activeCategory, setActiveCategory] = useState('All');

  const [heroRef, heroOffset] = useParallax(0.3);

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

  // Categories, derived from whatever's actually in the data — no hardcoding.
  const categories = useMemo(() => {
    const found = new Set(gallery.map((g) => g.category).filter(Boolean));
    return ['All', ...found];
  }, [gallery]);

  const filteredGallery = useMemo(() => {
    if (activeCategory === 'All') return gallery;
    return gallery.filter((g) => g.category === activeCategory);
  }, [gallery, activeCategory]);

  // Return-visit hook: how many photos landed in the last two weeks.
  const recentCount = useMemo(
    () =>
      gallery.filter(
        (g) => g.created_at && Date.now() - new Date(g.created_at).getTime() < RECENT_MS
      ).length,
    [gallery]
  );

  const heroPhoto = useMemo(
    () => gallery.find((g) => g.is_featured) || gallery[0],
    [gallery]
  );

  return (
    <CustomCursor>
      <main className="max-w-6xl mx-auto px-6 py-16">
        <span className="eyebrow">Who we are</span>
        <h1 className="font-display text-4xl mb-6" style={{ color: 'var(--color-ink)' }}>
          Our Story
        </h1>

        {status === 'error' && (
          <p className="text-sm mb-8" style={{ color: 'var(--color-gold)' }}>
            Couldn't load this page right now — add an About Page entry in /admin/ if you
            haven't yet.
          </p>
        )}

        {/* Parallax hero photo */}
        {heroPhoto && (
          <div
            ref={heroRef}
            className="relative w-full h-[38vh] sm:h-[48vh] rounded-xl overflow-hidden mb-16"
          >
            <img
              src={heroPhoto.image}
              alt={heroPhoto.caption || 'Our church'}
              className="w-full h-[130%] object-cover"
              style={{ transform: `translateY(${heroOffset}px)`, willChange: 'transform' }}
            />
          </div>
        )}

        {about?.mission_statement && (
          <section className="mb-12 max-w-3xl">
            <span className="eyebrow">Our mission</span>
            <h2 className="font-display text-2xl mb-3">What we believe</h2>
            <p style={{ opacity: 0.8, whiteSpace: 'pre-line' }}>{about.mission_statement}</p>
          </section>
        )}

        {about?.history && (
          <section className="mb-16 max-w-3xl">
            <span className="eyebrow">Our history</span>
            <h2 className="font-display text-2xl mb-3">How we got here</h2>
            <p style={{ opacity: 0.8, whiteSpace: 'pre-line' }}>{about.history}</p>
          </section>
        )}

        {leaders.length > 0 && (
          <section className="mb-20">
            <span className="eyebrow">Leadership</span>
            <h2 className="font-display text-2xl mb-6">The people behind it</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
              {leaders.map((leader, i) => (
                <LeaderCard key={leader.id} leader={leader} index={i} />
              ))}
            </div>
          </section>
        )}

        {gallery.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
              <div>
                <span className="eyebrow">Moments</span>
                <h2 className="font-display text-2xl">Gallery</h2>
              </div>
              {recentCount > 0 && (
                <p className="text-xs" style={{ color: 'var(--color-sage)' }}>
                  {recentCount} new photo{recentCount > 1 ? 's' : ''} added recently
                </p>
              )}
            </div>

            {/* Category rail — replaces boring tabs */}
            {categories.length > 2 && (
              <div className="category-rail mb-6 mt-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className="category-pill"
                    data-active={activeCategory === cat}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* key={activeCategory} forces remount → the whole grid re-plays
                its staggered reveal, which reads as a deliberate "morph"
                between categories rather than an instant swap. */}
            <div
              key={activeCategory}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 auto-rows-[160px] sm:auto-rows-[190px] grid-flow-dense gap-4"
            >
              {filteredGallery.map((img, i) => (
                <GalleryPhotoCard key={img.id} photo={img} index={i} />
              ))}
            </div>
          </section>
        )}
      </main>
    </CustomCursor>
  );
}