import { Link } from 'react-router-dom';
import { clientConfig } from '../../config/clientConfig.js';
import { DEMO_DISCLAIMER } from '../../data/demoData.js';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <p className="site-footer__brand">{clientConfig.appName}</p>
          <p>
            A private automotive and motorcycle archive with watches as a secondary collecting
            domain — discovery, history, and craftsmanship over commerce.
          </p>
        </div>
        <div>
          <p className="meta" style={{ color: 'var(--brass)' }}>
            Explore
          </p>
          <p>
            <Link to="/discover">Archive</Link>
          </p>
          <p>
            <Link to="/discover?domain=car">Cars</Link>
          </p>
          <p>
            <Link to="/discover?domain=motorcycle">Motorcycles</Link>
          </p>
          <p>
            <Link to="/journal">Journal</Link>
          </p>
        </div>
        <div>
          <p className="meta" style={{ color: 'var(--brass)' }}>
            Note
          </p>
          <p>{DEMO_DISCLAIMER}</p>
        </div>
      </div>
      <div className="site-footer__meta">
        <span>{clientConfig.appName}</span>
        <span>The Ivory Museum</span>
      </div>
    </footer>
  );
}
