import { useState } from 'react';
import {
  useDeleteAdminMediaMutation,
  useGetAdminMediaQuery,
  useRegisterAdminMediaUrlMutation,
  useUploadAdminMediaMutation,
} from '../../app/api.js';
import MuseumSelect from '../../components/ui/MuseumSelect.jsx';
import AdminPageShell from './AdminPageShell.jsx';

const IMAGE_TYPES = ['hero', 'gallery', 'detail', 'editorial', 'dial', 'other'];

export default function AdminMediaPage() {
  const { data: media = [], isLoading, isError } = useGetAdminMediaQuery({ limit: 80 });
  const [uploadMedia, uploadState] = useUploadAdminMediaMutation();
  const [registerUrl, registerState] = useRegisterAdminMediaUrlMutation();
  const [deleteMedia] = useDeleteAdminMediaMutation();
  const [alt, setAlt] = useState('');
  const [type, setType] = useState('gallery');
  const [remoteUrl, setRemoteUrl] = useState('');
  const [error, setError] = useState(null);

  const onUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError(null);
    try {
      await uploadMedia({ file, alt, type }).unwrap();
      setAlt('');
    } catch (err) {
      setError(err?.data?.error?.message || 'Upload failed.');
    }
  };

  const onRegister = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await registerUrl({ url: remoteUrl, alt, type }).unwrap();
      setRemoteUrl('');
      setAlt('');
    } catch (err) {
      setError(err?.data?.error?.message || 'Could not register URL.');
    }
  };

  return (
    <AdminPageShell
      eyebrow="Admin · Media"
      title="Media library"
      lede="Upload plates for the archive or register remote image URLs. Attach them from product, brand, and journal forms."
    >
      <form className="admin-form admin-form--compact" onSubmit={onRegister}>
        <div className="admin-form__grid">
          <label>
            <span className="meta">Upload file</span>
            <input type="file" accept="image/*" onChange={onUpload} disabled={uploadState.isLoading} />
          </label>
          <label>
            <span className="meta">Or remote URL</span>
            <input
              type="url"
              placeholder="https://…"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
            />
          </label>
          <label>
            <span className="meta">Alt text</span>
            <input value={alt} onChange={(e) => setAlt(e.target.value)} />
          </label>
          <label>
            <span className="meta">Type</span>
            <MuseumSelect ariaLabel="Image type" value={type} options={IMAGE_TYPES} onChange={setType} />
          </label>
        </div>
        {error ? <p className="auth-form__error">{error}</p> : null}
        <button type="submit" className="btn" disabled={registerState.isLoading || !remoteUrl.trim()}>
          {registerState.isLoading ? 'Saving…' : 'Register URL'}
        </button>
      </form>

      {isLoading ? <p className="admin-muted">Loading media…</p> : null}
      {isError ? <p className="auth-form__error">Could not load media library.</p> : null}

      <ul className="admin-media-grid">
        {media.map((item) => (
          <li key={item.id} className="admin-media-card">
            <div className="admin-media-card__frame">
              <img src={item.url} alt={item.alt || item.originalName || 'Archive media'} />
            </div>
            <div className="admin-media-card__meta">
              <span className={`admin-pill admin-pill--${item.type === 'hero' ? 'pending' : 'active'}`}>
                {item.type}
              </span>
              <p className="admin-muted">{item.alt || item.originalName || item.filename}</p>
              <div className="admin-row-actions">
                <button
                  type="button"
                  className="quiet-action"
                  onClick={() => navigator.clipboard?.writeText(item.url)}
                >
                  Copy URL
                </button>
                <button
                  type="button"
                  className="quiet-action"
                  onClick={async () => {
                    if (!window.confirm('Remove this media asset?')) return;
                    setError(null);
                    try {
                      await deleteMedia(item.id).unwrap();
                    } catch (err) {
                      setError(err?.data?.error?.message || 'Could not delete media asset.');
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {!isLoading && !media.length ? <p className="admin-muted">No media uploaded yet.</p> : null}
    </AdminPageShell>
  );
}
