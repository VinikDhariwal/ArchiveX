import { useEffect, useId, useState } from 'react';
import {
  useAddProductToCollectionMutation,
  useCreateCollectionMutation,
  useGetCollectionsQuery,
} from '../../app/api.js';

export default function AddToCollectionModal({ product, onClose }) {
  const titleId = useId();
  const { data: collections = [], isLoading } = useGetCollectionsQuery();
  const [addProduct, { isLoading: adding }] = useAddProductToCollectionMutation();
  const [createCollection, { isLoading: creating }] = useCreateCollectionMutation();
  const [newName, setNewName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleAdd(collectionId) {
    setMessage('');
    try {
      await addProduct({ collectionId, productId: product.id }).unwrap();
      setMessage('Added to collection.');
      window.setTimeout(onClose, 500);
    } catch {
      setMessage('Could not add to collection.');
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (!newName.trim()) return;
    try {
      const collection = await createCollection({ name: newName.trim() }).unwrap();
      await addProduct({ collectionId: collection.id, productId: product.id }).unwrap();
      onClose();
    } catch {
      setMessage('Could not create collection.');
    }
  }

  return (
    <div className="collector-modal" role="presentation" onClick={onClose}>
      <div
        className="collector-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="meta" id={titleId}>
          Add to collection
        </p>
        <p className="collector-modal__lede">{product.name}</p>

        {isLoading ? <p className="meta">Loading collections…</p> : null}

        {!isLoading && collections.length ? (
          <ul className="collector-picker">
            {collections.map((collection) => (
              <li key={collection.id}>
                <button
                  type="button"
                  className="collector-picker__item"
                  disabled={adding}
                  onClick={() => handleAdd(collection.id)}
                >
                  <strong>{collection.name}</strong>
                  <span>
                    {collection.objectCount} object{collection.objectCount === 1 ? '' : 's'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <form className="collector-form collector-form--compact" onSubmit={handleCreate}>
          <label>
            <span>Or create new</span>
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Collection name"
              maxLength={120}
            />
          </label>
          <div className="collector-form__actions">
            <button type="button" className="quiet-action" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--soft"
              disabled={creating || adding || !newName.trim()}
            >
              Create & add
            </button>
          </div>
        </form>
        {message ? <p className="meta">{message}</p> : null}
      </div>
    </div>
  );
}
