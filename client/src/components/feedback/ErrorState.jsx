export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="feedback-state feedback-state--error" role="alert">
      <p>{message}</p>
      {onRetry ? (
        <p>
          <button type="button" className="btn" onClick={onRetry}>
            Retry
          </button>
        </p>
      ) : null}
    </div>
  );
}
