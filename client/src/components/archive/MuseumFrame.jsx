export default function MuseumFrame({ children, className = '' }) {
  return (
    <div className={`museum-frame ${className}`.trim()}>
      <div className="museum-frame__mat">{children}</div>
    </div>
  );
}
