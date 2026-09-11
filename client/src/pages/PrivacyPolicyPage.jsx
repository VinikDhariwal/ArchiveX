import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { clientConfig } from '../config/clientConfig.js';

const UPDATED = '11 September 2026';

export default function PrivacyPolicyPage() {
  useDocumentTitle('Privacy');

  return (
    <main className="legal-page">
      <div className="section-inner legal-page__inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Privacy' },
          ]}
        />

        <header className="page-head legal-page__head">
          <p className="meta">Archive notice</p>
          <h1 className="display page-head__title">Privacy</h1>
          <p className="page-lede">
            How {clientConfig.appName} treats the information you share while browsing, collecting,
            and contributing to this private archive.
          </p>
          <p className="legal-page__updated">Last updated {UPDATED}</p>
        </header>

        <article className="legal-page__body">
          <section>
            <h2>Who we are</h2>
            <p>
              {clientConfig.appName} is a private automotive and motorcycle archive — with luxury
              watches as a secondary collecting domain — operated by{' '}
              <strong>Vinik Dhariwal</strong>. It is an editorial discovery product, not a
              marketplace.
            </p>
          </section>

          <section>
            <h2>What we collect</h2>
            <p>Depending on how you use the archive, we may process:</p>
            <ul>
              <li>
                <strong>Account details</strong> — name, username, email, and a hashed password when
                you register as a collector.
              </li>
              <li>
                <strong>Archive activity</strong> — favorites, collections, compare selections,
                contribution submissions, and recently viewed objects tied to your account or
                browser session.
              </li>
              <li>
                <strong>Technical signals</strong> — standard request logs (for example timestamps,
                route, and approximate client metadata) needed to keep the service secure and
                reliable.
              </li>
              <li>
                <strong>Staff operations</strong> — audit records when operators moderate catalog
                content inside the admin chamber.
              </li>
            </ul>
            <p>
              We do not sell personal data. We do not use the archive as an advertising exchange.
            </p>
          </section>

          <section>
            <h2>How we use it</h2>
            <ul>
              <li>To authenticate you and maintain your collector desk</li>
              <li>To remember favorites, collections, and compare trays</li>
              <li>To review and publish approved contributions</li>
              <li>To protect the API against abuse and keep the catalog consistent</li>
              <li>To improve discovery performance and editorial presentation</li>
            </ul>
          </section>

          <section>
            <h2>Cookies &amp; local storage</h2>
            <p>
              {clientConfig.appName} uses browser storage for session continuity — for example
              authentication tokens, compare selections, and Discover shuffle seeds. These are
              functional, not advertising trackers. Clearing site data signs you out of local
              sessions and resets guest compare state.
            </p>
          </section>

          <section>
            <h2>Sharing</h2>
            <p>
              Personal data stays with the operators of this archive and the infrastructure that
              hosts it (application servers and database providers). We do not sell or rent your
              information. We may disclose data only if required by law or to protect the integrity
              of the service.
            </p>
          </section>

          <section>
            <h2>Retention</h2>
            <p>
              Account and collector data remain for as long as the account is active. You may update
              profile details or delete your account from Account Settings. Soft-deleted catalog
              records may be retained briefly for moderation integrity, then removed from public
              surfaces.
            </p>
          </section>

          <section>
            <h2>Your choices</h2>
            <ul>
              <li>
                Browse publicly without an account — Discover, Brands, Categories, Journal, and
                product dossiers remain readable.
              </li>
              <li>
                Create a collector account only if you want favorites, collections, or contributions.
              </li>
              <li>
                Edit or delete your account from{' '}
                <Link to="/account/settings">Account Settings</Link> when signed in.
              </li>
              <li>
                Contact the operator below if you need help with access or erasure requests.
              </li>
            </ul>
          </section>

          <section>
            <h2>Children</h2>
            <p>
              The archive is not directed at children under 16. We do not knowingly collect personal
              information from children.
            </p>
          </section>

          <section>
            <h2>Changes</h2>
            <p>
              If this notice changes in a material way, we will update the date above. Continued use
              of {clientConfig.appName} after an update means you have read the revised notice.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              Questions about privacy for this archive may be directed to its operator,{' '}
              <strong>Vinik Dhariwal</strong>, through the channels associated with this project.
            </p>
          </section>
        </article>

        <p className="legal-page__foot">
          <Link className="link-cta" to="/">
            Return home
          </Link>
        </p>
      </div>
    </main>
  );
}
