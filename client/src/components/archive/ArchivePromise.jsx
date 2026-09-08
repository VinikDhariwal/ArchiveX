export default function ArchivePromise({ promise }) {
  return (
    <section className="archive-promise" id="promise" aria-labelledby="promise-title" data-reveal>
      <div className="archive-promise__inner">
        <div className="archive-promise__copy">
          <p className="meta">{promise.eyebrow}</p>
          <span className="hairline" aria-hidden="true" />
          <h2 id="promise-title" className="display archive-promise__title">
            {promise.title}
          </h2>
          <p className="archive-promise__body">{promise.body}</p>
        </div>
        <blockquote className="archive-promise__quote">
          <p>{promise.quote}</p>
          <footer>— {promise.quoteCredit}</footer>
        </blockquote>
      </div>
    </section>
  );
}
