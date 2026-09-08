import { Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';

export default function PlaceholderPage({
  title,
  eyebrow,
  summary,
  nextPhase,
}) {
  return (
    <AppShell>
      <main className="section-pad" style={{ paddingTop: '4.5rem', paddingBottom: '6rem' }}>
        <div className="section-inner" style={{ maxWidth: '40rem' }}>
          <p className="meta">{eyebrow}</p>
          <span className="hairline" aria-hidden="true" />
          <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', margin: 0 }}>
            {title}
          </h1>
          <p style={{ color: 'var(--muted-ink)', marginTop: '1.25rem', lineHeight: 1.7 }}>{summary}</p>
          <p className="demo-note" style={{ marginTop: '1.5rem' }}>
            Planned for {nextPhase}. Structural route shell only.
          </p>
          <p style={{ marginTop: '2rem' }}>
            <Link className="link-cta" to="/">
              Back to archive
            </Link>
          </p>
        </div>
      </main>
    </AppShell>
  );
}
