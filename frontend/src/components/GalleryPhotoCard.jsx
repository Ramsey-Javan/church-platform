import { useInView } from '../hooks/useInView';
import { useCursorLabel } from './CustomCursor';

const RECENT_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

function isRecent(dateStr) {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < RECENT_MS;
}

// Every 5th tile (index 0, 5, 10...) goes big. Deliberate rhythm, not random.
function spanClasses(index) {
  return index % 5 === 0
    ? 'col-span-2 row-span-2'
    : 'col-span-1 row-span-1';
}

export default function GalleryPhotoCard({ photo, index }) {
  const [ref, inView] = useInView();
  const setCursorLabel = useCursorLabel();

  // No file attached in admin — skip instead of rendering a silent broken img.
  if (!photo.image) return null;

  return (
    <figure
      ref={ref}
      data-in-view={inView}
      className={`reveal-item photo-card h-full ${spanClasses(index)}`}
      style={{ animationDelay: `${Math.min(index * 55, 550)}ms` }}
      onMouseEnter={() => setCursorLabel('View')}
      onMouseLeave={() => setCursorLabel('')}
    >
      <img
        src={photo.image}
        alt={photo.caption || 'Church photo'}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {isRecent(photo.created_at) && <span className="new-badge">New</span>}
      {photo.caption && (
        <figcaption className="photo-caption-overlay">{photo.caption}</figcaption>
      )}
    </figure>
  );
}
