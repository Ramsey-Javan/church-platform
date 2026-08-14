import { useInView } from '../hooks/useInView';

export default function LeaderCard({ leader, index }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      data-in-view={inView}
      className="reveal-item"
      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
    >
      {leader.photo && (
        <div className="photo-card mb-3">
          <img
            src={leader.photo}
            alt={leader.name}
            className="w-full aspect-square object-cover"
          />
        </div>
      )}
      <h3 className="font-display text-lg">{leader.name}</h3>
      <p className="text-sm mb-2" style={{ color: 'var(--color-sage)' }}>
        {leader.role}
      </p>
      {leader.bio && <p className="text-sm" style={{ opacity: 0.75 }}>{leader.bio}</p>}
    </div>
  );
}