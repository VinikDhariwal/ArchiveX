/** URL-only image plates for collector contributions (no GridFS upload). */
export default function ContributeImageList({
  images = [],
  onChange,
  emptyLabel = 'Add at least one image URL when you have a plate to share.',
}) {
  const updateAt = (index, patch) => {
    onChange(images.map((image, i) => (i === index ? { ...image, ...patch } : image)));
  };

  const removeAt = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const addBlank = () => {
    onChange([
      ...images,
      { url: '', alt: '', type: images.length ? 'gallery' : 'hero', sortOrder: images.length },
    ]);
  };

  return (
    <div className="admin-image-list contribute-image-list">
      <div className="admin-row-actions">
        <button type="button" className="btn btn--soft" onClick={addBlank}>
          Add image URL
        </button>
      </div>

      {!images.length ? <p className="admin-muted">{emptyLabel}</p> : null}

      <ul className="admin-image-list__items">
        {images.map((image, index) => (
          <li key={index} className="admin-image-list__item">
            <div className="admin-image-list__preview">
              {image.url ? (
                <img src={image.url} alt={image.alt || ''} />
              ) : (
                <span className="admin-muted">No preview</span>
              )}
            </div>
            <div className="admin-image-list__fields">
              <label>
                <span className="meta">URL</span>
                <input
                  value={image.url || ''}
                  onChange={(e) => updateAt(index, { url: e.target.value })}
                  placeholder="https://…"
                  inputMode="url"
                />
              </label>
              <label>
                <span className="meta">Alt</span>
                <input
                  value={image.alt || ''}
                  onChange={(e) => updateAt(index, { alt: e.target.value })}
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
