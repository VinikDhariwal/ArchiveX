import { useId, useRef, useState } from 'react';
import { useUploadAdminMediaMutation } from '../../app/api.js';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

/**
 * Drag-and-drop / click logo uploader for admin brand forms.
 * Uploads via staff media API (GridFS) and returns the public URL.
 */
export default function AdminLogoDropzone({
  url = '',
  alt = '',
  onUrlChange,
  onError,
  disabled = false,
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploadMedia, uploadState] = useUploadAdminMediaMutation();
  const busy = disabled || uploadState.isLoading;

  const handleFile = async (file) => {
    if (!file || busy) return;
    if (!file.type.startsWith('image/')) {
      onError?.('Please choose an image file (JPEG, PNG, WebP, or GIF).');
      return;
    }
    try {
      onError?.(null);
      const uploaded = await uploadMedia({
        file,
        alt: alt || file.name.replace(/\.[^.]+$/, ''),
        type: 'other',
      }).unwrap();
      if (uploaded?.url) onUrlChange?.(uploaded.url);
    } catch (err) {
      onError?.(err?.data?.error?.message || 'Could not upload logo.');
    }
  };

  const onDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    const file = event.dataTransfer?.files?.[0];
    handleFile(file);
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!busy) setDragging(true);
  };

  const onDragLeave = (event) => {
    event.preventDefault();
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setDragging(false);
  };

  return (
    <div className="admin-logo-dropzone">
      <span className="meta">Brand logo</span>
      <div
        className={`admin-logo-dropzone__zone${dragging ? ' is-dragging' : ''}${url ? ' has-preview' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDragEnter={onDragOver}
      >
        {url ? (
          <div className="admin-logo-dropzone__preview">
            <img src={url} alt={alt || 'Brand logo preview'} />
          </div>
        ) : (
          <p className="admin-logo-dropzone__hint">
            {busy ? 'Uploading…' : 'Drag & drop a logo here'}
          </p>
        )}

        <div className="admin-logo-dropzone__actions">
          <label htmlFor={inputId} className={`btn admin-logo-dropzone__upload${busy ? ' is-disabled' : ''}`}>
            {uploadState.isLoading ? 'Uploading…' : url ? 'Replace logo' : 'Upload file'}
          </label>
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            hidden
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              handleFile(file);
            }}
          />
          {url ? (
            <button
              type="button"
              className="quiet-action"
              disabled={busy}
              onClick={() => {
                onError?.(null);
                onUrlChange?.('');
              }}
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
      <p className="admin-muted admin-logo-dropzone__note">JPEG, PNG, WebP, or GIF · stored in media library</p>
    </div>
  );
}
