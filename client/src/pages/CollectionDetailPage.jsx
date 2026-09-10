import { Link, useNavigate, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import ObjectCard from '../components/archive/ObjectCard.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import {
  useGetCollectionQuery,
  useRemoveProductFromCollectionMutation,
  useUpdateCollectionMutation,
} from '../app/api.js';

export default function CollectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: collection, isLoading, isError, refetch } = useGetCollectionQuery(id, {
    skip: !id,
  });
  const [removeProduct] = useRemoveProductFromCollectionMutation();
  const [updateCollection, { isLoading: saving }] = useUpdateCollectionMutation();
  useDocumentTitle(collection?.name || 'Collection');

  if (isLoading) {
    return (
      <main className="collector-page">
        <div className="section-inner">
          <LoadingState />
        </div>
      </main>
    );
  }

  if (isError || !collection) {
    return (
      <main className="collector-page">
        <div className="section-inner">
          <ErrorState message="Collection not found." onRetry={refetch} />
          <Link className="btn btn--soft" to="/collections">
            Back to collections
          </Link>
        </div>
      </main>
    );
  }

  const products = collection.products || [];

  return (
    <main className="collector-page">
      <div className="section-inner collector-page__inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Collections', to: '/collections' },
            { label: collection.name },
          ]}
        />
        <header className="page-head page-head--split">
          <div>
            <p className="meta">{collection.visibility} collection</p>
            <h1 className="display page-head__title">{collection.name}</h1>
            {collection.description ? <p className="page-lede">{collection.description}</p> : null}
          </div>
          <div className="collector-page__actions">
            <label className="collector-field">
              <span className="meta">Visibility</span>
              <select
                value={collection.visibility}
                disabled={saving}
                onChange={(event) =>
                  updateCollection({ id: collection.id, visibility: event.target.value })
                }
              >
                <option value="private">Private</option>
                <option value="shared">Shared</option>
                <option value="public">Public</option>
              </select>
            </label>
            <button type="button" className="quiet-action" onClick={() => navigate('/collections')}>
              All collections
            </button>
          </div>
        </header>

        {!products.length ? (
          <div className="collector-empty">
            <p>This collection is empty.</p>
            <Link className="btn btn--soft" to="/discover">
              Add from discover
            </Link>
          </div>
        ) : (
          <div className="object-grid object-grid--discover">
            {products.map((product) => (
              <div className="collector-card" key={product.id}>
                <ObjectCard object={product} />
                <button
                  type="button"
                  className="quiet-action collector-card__action"
                  onClick={() =>
                    removeProduct({ collectionId: collection.id, productId: product.id })
                  }
                >
                  Remove from collection
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
