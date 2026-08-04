import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { buildApiUrl, getChurchSettings, getSermon, getSermons } from '../api/client';

function unwrapCollection(data) {
  if (Array.isArray(data)) {
    return data;
  }
  return data?.results || [];
}

function toYouTubeEmbedUrl(url) {
  if (!url) {
    return '';
  }
  if (url.includes('/embed/')) {
    return url;
  }
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch?.[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }
  const shortMatch = url.match(/youtu\.be\/([^?&/]+)/);
  if (shortMatch?.[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }
  return url;
}

function resolveMediaUrl(url) {
  return url ? buildApiUrl(url) : '';
}

function formatDate(value) {
  if (!value) {
    return 'Date unavailable';
  }
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export default function Watch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [settings, setSettings] = useState(null);
  const [archiveData, setArchiveData] = useState(null);
  const [archiveStatus, setArchiveStatus] = useState('loading');
  const [detailData, setDetailData] = useState(null);
  const [detailStatus, setDetailStatus] = useState('idle');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [speakerFilter, setSpeakerFilter] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('');

  const selectedSermonId = searchParams.get('sermon') || '';

  useEffect(() => {
    getChurchSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  useEffect(() => {
    setArchiveStatus('loading');
    getSermons({
      search: searchTerm || undefined,
      speaker: speakerFilter || undefined,
      series: seriesFilter || undefined,
    })
      .then((data) => {
        setArchiveData(data);
        setArchiveStatus('ready');
      })
      .catch(() => setArchiveStatus('error'));
  }, [searchTerm, speakerFilter, seriesFilter]);

  useEffect(() => {
    if (!selectedSermonId) {
      setDetailData(null);
      setDetailStatus('idle');
      return;
    }

    setDetailStatus('loading');
    getSermon(selectedSermonId)
      .then((data) => {
        setDetailData(data);
        setDetailStatus('ready');
      })
      .catch(() => setDetailStatus('error'));
  }, [selectedSermonId]);

  const sermons = unwrapCollection(archiveData);
  const speakerOptions = sermons
    .map((sermon) => sermon.speaker)
    .filter(Boolean)
    .reduce((options, speaker) => {
      if (!options.some((option) => option.id === speaker.id)) {
        options.push(speaker);
      }
      return options;
    }, []);
  const seriesOptions = sermons
    .map((sermon) => sermon.series)
    .filter(Boolean)
    .reduce((options, series) => {
      if (!options.some((option) => option.id === series.id)) {
        options.push(series);
      }
      return options;
    }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchTerm(searchInput.trim());
  };

  const selectedSermon = detailData;
  const liveStreamEmbed = toYouTubeEmbedUrl(settings?.live_stream_url);

  return (
    <main className="max-w-6xl mx-auto px-6 py-16 space-y-16">
      <section className="space-y-5 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--color-sage)' }}>
          Worship online
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight" style={{ color: 'var(--color-ink)' }}>
          Watch live and catch up on sermons
        </h1>
        <p className="text-lg" style={{ color: 'var(--color-ink)', opacity: 0.78 }}>
          Join the livestream below, then explore the archive by speaker, series, or search term.
        </p>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border overflow-hidden" style={{ borderColor: 'var(--color-rule)', background: '#fff' }}>
          <div className="p-6 border-b" style={{ borderColor: 'var(--color-rule)' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--color-sage)' }}>
              Live stream
            </p>
            <h2 className="font-display text-2xl" style={{ color: 'var(--color-ink)' }}>
              Join us online
            </h2>
          </div>
          {liveStreamEmbed ? (
            <iframe
              title="Live stream"
              src={liveStreamEmbed}
              className="w-full min-h-[420px]"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="p-6 text-sm" style={{ color: 'var(--color-ink)', opacity: 0.78 }}>
              Add a live_stream_url in Church Settings to display the live stream here.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <form onSubmit={handleSearchSubmit} className="rounded-3xl border p-6 space-y-4" style={{ borderColor: 'var(--color-rule)', background: '#fff' }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--color-sage)' }}>
                Archive filters
              </p>
              <h2 className="font-display text-2xl" style={{ color: 'var(--color-ink)' }}>
                Find a message
              </h2>
            </div>
            <div>
              <label htmlFor="sermon-search" className="block text-sm font-medium mb-2">Search</label>
              <input
                id="sermon-search"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="w-full rounded-2xl border px-4 py-3 bg-transparent"
                style={{ borderColor: 'var(--color-rule)' }}
                placeholder="Search sermons"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="speaker-filter" className="block text-sm font-medium mb-2">Speaker</label>
                <select
                  id="speaker-filter"
                  value={speakerFilter}
                  onChange={(event) => setSpeakerFilter(event.target.value)}
                  className="w-full rounded-2xl border px-4 py-3 bg-transparent"
                  style={{ borderColor: 'var(--color-rule)' }}
                >
                  <option value="">All speakers</option>
                  {speakerOptions.map((speaker) => (
                    <option key={speaker.id} value={speaker.id}>{speaker.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="series-filter" className="block text-sm font-medium mb-2">Series</label>
                <select
                  id="series-filter"
                  value={seriesFilter}
                  onChange={(event) => setSeriesFilter(event.target.value)}
                  className="w-full rounded-2xl border px-4 py-3 bg-transparent"
                  style={{ borderColor: 'var(--color-rule)' }}
                >
                  <option value="">All series</option>
                  {seriesOptions.map((series) => (
                    <option key={series.id} value={series.id}>{series.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="px-5 py-3 rounded-full font-semibold text-white" style={{ background: 'var(--color-gold)' }}>
                Search
              </button>
              <button
                type="button"
                className="px-5 py-3 rounded-full font-semibold border"
                style={{ borderColor: 'var(--color-ink)', color: 'var(--color-ink)' }}
                onClick={() => {
                  setSearchInput('');
                  setSearchTerm('');
                  setSpeakerFilter('');
                  setSeriesFilter('');
                }}
              >
                Clear
              </button>
            </div>
          </form>

          <div className="rounded-3xl border p-6" style={{ borderColor: 'var(--color-rule)', background: '#fff' }}>
            <p className="text-sm uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-sage)' }}>
              Current selection
            </p>
            {settings?.name && <p className="text-sm mb-2" style={{ opacity: 0.7 }}>{settings.name}</p>}
            {selectedSermon ? (
              <p className="text-sm" style={{ color: 'var(--color-ink)', opacity: 0.8 }}>
                {selectedSermon.title}
              </p>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-ink)', opacity: 0.78 }}>
                Select a sermon card to open the detail view below.
              </p>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--color-sage)' }}>
              Sermon archive
            </p>
            <h2 className="font-display text-3xl" style={{ color: 'var(--color-ink)' }}>
              Recent messages
            </h2>
          </div>
          {archiveStatus === 'loading' && <p className="text-sm" style={{ opacity: 0.7 }}>Loading archive…</p>}
        </div>

        {archiveStatus === 'error' && (
          <p className="text-sm mb-6" style={{ color: 'var(--color-gold)' }}>
            Sermons could not be loaded right now.
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sermons.map((sermon) => {
            const previewImage = sermon.series?.cover_image || sermon.speaker?.photo || '';
            return (
              <article key={sermon.id} className="rounded-3xl border overflow-hidden bg-white" style={{ borderColor: 'var(--color-rule)' }}>
                {previewImage && (
                  <img
                    src={resolveMediaUrl(previewImage)}
                    alt={sermon.title}
                    className="h-52 w-full object-cover"
                  />
                )}
                <div className="p-6 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--color-sage)' }}>
                    {sermon.series?.title || 'Sermon'}
                  </p>
                  <h3 className="font-display text-2xl leading-tight" style={{ color: 'var(--color-ink)' }}>
                    {sermon.title}
                  </h3>
                  <p className="text-sm" style={{ opacity: 0.78 }}>
                    {sermon.speaker?.name || 'Speaker unavailable'} · {formatDate(sermon.date)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchParams({ sermon: String(sermon.id) })}
                    className="px-5 py-3 rounded-full font-semibold text-white"
                    style={{ background: 'var(--color-gold)' }}
                  >
                    View sermon
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border p-6 md:p-8 bg-white" id="sermon-detail" style={{ borderColor: 'var(--color-rule)' }}>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-sage)' }}>
          Detail view
        </p>
        {detailStatus === 'loading' && <p className="text-sm" style={{ opacity: 0.7 }}>Loading sermon…</p>}
        {detailStatus === 'error' && <p className="text-sm" style={{ color: 'var(--color-gold)' }}>That sermon could not be loaded.</p>}
        {!selectedSermon && detailStatus !== 'loading' && (
          <p className="text-sm" style={{ opacity: 0.78 }}>Choose a sermon to see the video, transcript, and downloads.</p>
        )}

        {selectedSermon && detailStatus === 'ready' && (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-3xl leading-tight" style={{ color: 'var(--color-ink)' }}>
                  {selectedSermon.title}
                </h2>
                <p className="mt-2 text-sm" style={{ opacity: 0.78 }}>
                  {selectedSermon.speaker?.name || 'Speaker unavailable'} · {formatDate(selectedSermon.date)}
                </p>
              </div>

              {selectedSermon.video_url && (
                <iframe
                  title={selectedSermon.title}
                  src={toYouTubeEmbedUrl(selectedSermon.video_url)}
                  className="w-full min-h-[320px] rounded-2xl border"
                  style={{ borderColor: 'var(--color-rule)' }}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            <div className="space-y-5">
              <div>
                <h3 className="font-display text-xl mb-2" style={{ color: 'var(--color-ink)' }}>
                  Transcript
                </h3>
                <p className="whitespace-pre-line text-sm leading-7" style={{ opacity: 0.8 }}>
                  {selectedSermon.transcript_text || 'Transcript not available yet.'}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-display text-xl" style={{ color: 'var(--color-ink)' }}>
                  Downloads
                </h3>
                {selectedSermon.audio_file ? (
                  <a className="inline-flex px-5 py-3 rounded-full font-semibold text-white" style={{ background: 'var(--color-gold)' }} href={resolveMediaUrl(selectedSermon.audio_file)}>
                    Download audio
                  </a>
                ) : null}
                {selectedSermon.slides_file ? (
                  <div>
                    <a className="inline-flex px-5 py-3 rounded-full font-semibold border" style={{ borderColor: 'var(--color-ink)', color: 'var(--color-ink)' }} href={resolveMediaUrl(selectedSermon.slides_file)}>
                      Download slides
                    </a>
                  </div>
                ) : null}
                {!selectedSermon.audio_file && !selectedSermon.slides_file && (
                  <p className="text-sm" style={{ opacity: 0.78 }}>No downloadable files were uploaded for this sermon.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
