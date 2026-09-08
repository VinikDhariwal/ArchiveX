export default function LoadingState({ label = 'Loading archive…' }) {
  return (
    <div className="feedback-state" role="status" aria-live="polite">
      {label}
    </div>
  );
}
