import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { formatProductType } from '../utils/formatProductType.js';
import {
  useDeleteContributionMutation,
  useGetMyContributionsQuery,
} from '../app/api.js';

const EDITABLE = new Set(['pending', 'rejected']);

export default function MySubmissionsPage() {
  useDocumentTitle('My submissions');
  const location = useLocation();
  const { data: items = [], isLoading, isError, refetch } = useGetMyContributionsQuery();
  const [withdraw, { isLoading: withdrawing }] = useDeleteContributionMutation();
  const [actionError, setActionError] = useState(null);
  const notice = location.state?.notice;

  const onWithdraw = async (item) => {
    if (!window.confirm(`Withdraw “${item.name}”?`)) return;
    setActionError(null);
    try {
      await withdraw(item.id).unwrap();
    } catch (err) {
      setActionError(err?.data?.error?.message || `Could not withdraw “${item.name}”.`);
    }
  };

  return (
    <main className="collector-page">
      <div className="section-inner collector-page__inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Account', to: '/account' },
            { label: 'Submissions' },
          ]}
        />
        <header className="page-head page-head--split">
          <div>
            <p className="meta">Your proposals</p>
            <h1 className="display page-head__title">My submissions</h1>
            <p className="page-lede">
              Track review status. Edit or withdraw only while pending or rejected.
            </p>
          </div>
          <Link className="btn btn--soft" to="/contribute">
            Contribute
          </Link>
        </header>

        {notice ? <p className="account-settings__ok">{notice}</p> : null}
        {isLoading ? <LoadingState /> : null}
        {isError ? <ErrorState message="Could not load submissions." onRetry={refetch} /> : null}
        {actionError ? (
          <p className="auth-form__error" role="alert">
            {actionError}
          </p>
        ) : null}

        {!isLoading && !isError && !items.length ? (
          <div className="collector-empty">
            <p>No submissions yet.</p>
            <Link className="btn btn--soft" to="/contribute">
              Propose an object
            </Link>
          </div>
        ) : null}

        {items.length ? (
          <ul className="submission-list">
            {items.map((item) => {
              const canEdit = EDITABLE.has(item.status);
              return (
                <li key={item.id} className="submission-list__item">
                  <div>
                    <p className="meta">
                      {formatProductType(item.productType, { singular: true })} · {item.brand}
                    </p>
                    <h2 className="submission-list__title">{item.name}</h2>
                    <p className="admin-muted">{item.shortDescription}</p>
                    <span className={`admin-pill admin-pill--${item.status}`}>{item.status}</span>
                  </div>
                  <div className="admin-row-actions">
                    {canEdit ? (
                      <>
                        <Link
                          className="quiet-action"
                          to={`/account/submissions/${item.id}/edit`}
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="quiet-action"
                          disabled={withdrawing}
                          onClick={() => onWithdraw(item)}
                        >
                          Withdraw
                        </button>
                      </>
                    ) : (
                      <span className="admin-muted">Locked after approval</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </main>
  );
}
