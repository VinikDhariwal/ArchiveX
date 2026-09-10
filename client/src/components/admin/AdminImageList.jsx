import MuseumSelect from '../ui/MuseumSelect.jsx';
import { useUploadAdminMediaMutation } from '../../app/api.js';

const IMAGE_TYPES = ['hero', 'gallery', 'detail', 'editorial', 'dial', 'other'];

/** Editable list of product/brand/article image plates. */
export default function AdminImageList({ images = [], onChange, emptyLabel = 'No images yet.' }) {
  const [uploadMedia, uploadState] = useUploadAdminMediaMutation();

  const updateAt = (index, patch) => {
    onChange(images.map((image, i) => (i === index ? { ...image, ...patch } : image)));
  };

  const removeAt = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const addImage = (image) => {
    onChange([
      ...images,
      {
        url: image.url,
        alt: image.alt || '',
        type: image.type || 'gallery',
        sortOrder: images.length,
      },
    ]);
  };

  const onUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const uploaded = await uploadMedia({ file, type: 'gallery' }).unwrap();
      addImage(uploaded);
    } catch {
      /* parent can show form-level errors later */
    }
  };

  const addBlankUrl = () => {
    addImage({ url: '', alt: '', type: 'gallery' });
  };

  return (
    <div className="admin-image-list">
      <div className="admin-row-actions">
        <label className="btn admin-image-list__upload">
          {uploadState.isLoading ? 'Uploading…' : 'Upload image'}
          <input type="file" accept="image/*" hidden onChange={onUpload} disabled={uploadState.isLoading} />
        </label>
        <button type="button" className="quiet-action" onClick={addBlankUrl}>
          Add URL
        </button>
      </div>

      {!images.length ? <p className="admin-muted">{emptyLabel}</p> : null}

      <ul className="admin-image-list__items">
        {images.map((image, index) => (
          <li key={`${image.url}-${index}`} className="admin-image-list__item">
            <div className="admin-image-list__preview">
              {image.url ? <img src={image.url} alt={image.alt || ''} /> : <span className="admin-muted">No preview</span>}
            </div>
            <div className="admin-image-list__fields">
              <label>
                <span className="meta">URL</span>
                <input
                  value={image.url || ''}
                  onChange={(e) => updateAt(index, { url: e.target.value })}
                  placeholder="https://… or /media/…"
                />
              </label>
              <label>
                <span className="meta">Alt</span>
                <input value={image.alt || ''} onChange={(e) => updateAt(index, { alt: e.target.value })} />
              </label>
              <label>
                <span className="meta">Type</span>
                <MuseumSelect
                  ariaLabel={`Image type ${index + 1}`}
                  value={image.type || 'gallery'}
                  options={IMAGE_TYPES}
                  onChange={(type) => updateAt(index, { type })}
                />
              </label>
              <label>
                <span className="meta">Sort</span>
                <input
                  type="number"
                  value={image.sortOrder ?? index}
                  onChange={(e) => updateAt(index, { sortOrder: Number(e.target.value) || 0 })}
                />
              </label>
              <button type="button" className="quiet-action" onClick={() => removeAt(index)}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
