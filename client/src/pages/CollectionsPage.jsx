import { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import CreateCollectionModal from '../components/collector/CreateCollectionModal.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useDeleteCollectionMutation, useGetCollectionsQuery } from '../app/api.js';

export default function CollectionsPage() {
  const { data: collections = [], isLoading, isError, refetch } = useGetCollectionsQuery();
  const [deleteCollection] = useDeleteCollectionMutation();
  const [createOpen, setCreateOpen] = useState(false);
  useDocumentTitle('Collections');

  return (
    <main className="collector-page">
      <div className="section-inner collector-page__inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Account', to: '/account' },
            { label: 'Collections' },
          ]}
        />
        <header className="page-head page-head--split">
          <div>
            <p className="meta">Private collections</p>
            <h1 className="display page-head__title">Collections</h1>
            <p className="page-lede">Group archive objects into named sets you control.</p>
          </div>
          <button type="button" className="btn btn--soft" onClick={() => setCreateOpen(true)}>
            New collection
          </button>
        </header>

        {isLoading ? <LoadingState /> : null}
        {isError ? <ErrorState message="Could not load collections." onRetry={refetch} /> : null}

        {!isLoading && !isError && !collections.length ? (
          <div className="collector-empty">
            <p>No collections yet.</p>
            <button type="button" className="btn btn--soft" onClick={() => setCreateOpen(true)}>
              Create your first
            </button>
          </div>
        ) : null}

        {collections.length ? (
          <ul className="collection-list">
            {collections.map((collection) => (
              <li key={collection.id} className="collection-list__item">
                <Link to={`/collections/${collection.id}`} className="collection-list__link">
                  {collection.coverImage ? (
                    <img src={collection.coverImage} alt="" />
                  ) : (
                    <span className="collection-list__placeholder" aria-hidden="true" />
                  )}
                  <div>
                    <p className="meta">{collection.visibility}</p>
                    <h2>{collection.name}</h2>
                    <p>
                      {collection.objectCount} object{collection.objectCount === 1 ? '' : 's'}
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  className="quiet-action"
                  onClick={() => {
                    if (window.confirm(`Delete “${collection.name}”?`)) {
                      deleteCollection(collection.id);
                    }
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {createOpen ? <CreateCollectionModal onClose={() => setCreateOpen(false)} /> : null}
    </main>
  );
}
