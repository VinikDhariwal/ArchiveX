import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import ContributionForm from '../components/contribute/ContributionForm.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import {
  useGetMyContributionQuery,
  useUpdateContributionMutation,
} from '../app/api.js';

const EDITABLE = new Set(['pending', 'rejected']);

export default function EditSubmissionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  useDocumentTitle('Edit submission');
  const { data: product, isLoading, isError, refetch } = useGetMyContributionQuery(id);
  const [updateContribution, { isLoading: saving }] = useUpdateContributionMutation();

  if (isLoading) {
    return (
      <main className="collector-page">
        <div className="section-inner">
          <LoadingState />
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="collector-page">
        <div className="section-inner">
          <ErrorState message="Could not load this submission." onRetry={refetch} />
        </div>
      </main>
    );
  }

  if (!product) return <Navigate to="/account/submissions" replace />;
  if (!EDITABLE.has(product.status)) {
    return <Navigate to="/account/submissions" replace />;
  }

  const onSubmit = async (payload) => {
    await updateContribution({ id, ...payload }).unwrap();
    navigate('/account/submissions', {
      replace: true,
      state: { notice: `“${payload.name}” updated.` },
    });
  };

  return (
    <main className="collector-page contribute-page">
      <div className="section-inner collector-page__inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Account', to: '/account' },
            { label: 'Submissions', to: '/account/submissions' },
            { label: 'Edit' },
          ]}
        />
        <header className="page-head page-head--split">
          <div>
            <p className="meta">Edit submission · {product.status}</p>
            <h1 className="display page-head__title">{product.name}</h1>
            <p className="page-lede">
              Revisions to rejected plates return them to the pending queue.
            </p>
          </div>
          <Link className="btn btn--soft" to="/account/submissions">
            Back
          </Link>
        </header>

        <ContributionForm
          initialProduct={product}
          submitLabel="Save changes"
          onSubmit={onSubmit}
          isSaving={saving}
        />
      </div>
    </main>
  );
}
