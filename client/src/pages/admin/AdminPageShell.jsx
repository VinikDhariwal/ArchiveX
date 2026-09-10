import useDocumentTitle from '../../hooks/useDocumentTitle.js';

/** Shared admin page frame — Ivory Museum control-room layout. */
export default function AdminPageShell({ eyebrow, title, lede, actions = null, children }) {
  useDocumentTitle(title);

  return (
    <main className="admin-page">
      <div className="admin-page__inner">
        <header className="admin-page__head">
          <div className="admin-page__intro">
            {eyebrow ? <p className="meta">{eyebrow}</p> : null}
            <h1 className="display page-head__title">{title}</h1>
            <span className="hairline" aria-hidden="true" />
            {lede ? <p className="page-lede">{lede}</p> : null}
          </div>
          {actions ? <div className="admin-page__actions">{actions}</div> : null}
        </header>
        <div className="admin-page__body">{children}</div>
      </div>
    </main>
  );
}
