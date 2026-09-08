import { useGetHealthQuery } from '../app/api.js';
import { clientConfig } from '../config/clientConfig.js';

export default function HomePage() {
  const { data, isLoading, isError, error, isSuccess } = useGetHealthQuery();
  const healthPayload = data?.data;

  return (
    <main className="foundation">
      <header className="foundation__header">
        <p className="foundation__eyebrow">{clientConfig.appName}</p>
        <h1>{clientConfig.tagline}</h1>
        <p className="foundation__lede">
          Production foundation shell. Catalog content, domains, and copy will load from
          configuration and APIs — not hardcoded UI placeholders — except where a phase
          explicitly authorizes demo or seed data.
        </p>
      </header>

      <section className="foundation__panel" aria-live="polite">
        <h2>API foundation</h2>
        {isLoading && <p>Checking health endpoint…</p>}
        {isError && (
          <p className="foundation__error">
            Health check failed: {error?.error || error?.status || 'unknown error'}
          </p>
        )}
        {isSuccess && (
          <pre className="foundation__code">{JSON.stringify(healthPayload ?? data, null, 2)}</pre>
        )}
      </section>
    </main>
  );
}
