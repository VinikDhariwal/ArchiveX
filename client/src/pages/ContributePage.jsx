import { Link, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import ContributionForm from '../components/contribute/ContributionForm.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useCreateContributionMutation } from '../app/api.js';

export default function ContributePage() {
  useDocumentTitle('Contribute');
  const navigate = useNavigate();
  const [createContribution, { isLoading }] = useCreateContributionMutation();

  const onSubmit = async (payload) => {
    const product = await createContribution(payload).unwrap();
    navigate('/account/submissions', {
      replace: true,
      state: { notice: `“${product.name}” submitted for review.` },
    });
  };

  return (
    <main className="collector-page contribute-page">
      <div className="section-inner collector-page__inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Account', to: '/account' },
            { label: 'Contribute' },
          ]}
        />
        <header className="page-head page-head--split">
          <div>
            <p className="meta">Collector contribution</p>
            <h1 className="display page-head__title">Contribute an object</h1>
            <p className="page-lede">
              Propose a plate under an active brand. Staff review every submission before it enters
              the public archive.
            </p>
          </div>
          <Link className="btn btn--soft" to="/account/submissions">
            My submissions
          </Link>
        </header>

        <ContributionForm onSubmit={onSubmit} isSaving={isLoading} />
      </div>
    </main>
  );
}
