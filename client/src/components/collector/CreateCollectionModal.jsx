import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCollectionMutation } from '../../app/api.js';
import useModalBehavior from '../../hooks/useModalBehavior.js';

export default function CreateCollectionModal({ onClose, onCreated }) {
  const titleId = useId();
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [createCollection, { isLoading, error }] = useCreateCollectionMutation();

  useModalBehavior(panelRef, onClose);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const collection = await createCollection({ name, description, visibility }).unwrap();
      onCreated?.(collection);
      onClose();
      navigate(`/collections/${collection.id}`);
    } catch {
      /* surfaced below */
    }
  }

  return (
    <div className="collector-modal" role="presentation" onClick={onClose}>
      <div
        ref={panelRef}
        className="collector-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="meta" id={titleId}>
          New collection
        </p>
        <form className="collector-form" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input
              ref={inputRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={120}
            />
          </label>
          <label>
            <span>Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              maxLength={2000}
            />
          </label>
          <label>
            <span>Visibility</span>
            <select value={visibility} onChange={(event) => setVisibility(event.target.value)}>
              <option value="private">Private</option>
              <option value="shared">Shared</option>
              <option value="public">Public</option>
            </select>
          </label>
          {error ? <p className="form-error">Could not create collection.</p> : null}
          <div className="collector-form__actions">
            <button type="button" className="quiet-action" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--soft" disabled={isLoading || !name.trim()}>
              {isLoading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
