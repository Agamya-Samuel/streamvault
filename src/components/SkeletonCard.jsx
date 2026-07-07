export default function SkeletonCard() {
  return (
    <div className="show-card skeleton-card">
      <div className="show-card-image shimmer" />
      <div className="show-card-info">
        <div className="skeleton-line shimmer" style={{ width: '80%', height: 14 }} />
        <div className="skeleton-line shimmer" style={{ width: '50%', height: 12, marginTop: 6 }} />
      </div>
    </div>
  );
}
