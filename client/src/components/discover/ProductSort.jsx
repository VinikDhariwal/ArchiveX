import { useEffect, useMemo, useRef, useState } from 'react';
import { DISCOVER_SORT_OPTIONS } from '../../features/products/productApi.js';

export default function ProductSort({ value, onChange, total, isLoading }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentId = value || 'shuffle';

  const currentOption = useMemo(
    () => DISCOVER_SORT_OPTIONS.find((item) => item.id === currentId) || DISCOVER_SORT_OPTIONS[0],
    [currentId]
  );

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (event) => {
      const node = dropdownRef.current;
      if (!node) return;
      if (node.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  return (
    <div className="product-sort">
      <p className="product-sort__count">
        {isLoading
          ? 'Loading…'
          : `${total} object${total === 1 ? '' : 's'} in the archive`}
      </p>
      <label className="product-sort__control">
        <span>Sort</span>

        <div className="brand-dropdown product-sort__dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="brand-dropdown__button"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {currentOption.label}
          </button>

          {open ? (
            <div className="brand-dropdown__menu" role="listbox" aria-label="Sort discovery results">
              {DISCOVER_SORT_OPTIONS.map((option) => {
                const isActive = option.id === currentId;
                return (
                  <button
                    type="button"
                    key={option.id}
                    className={`brand-dropdown__item ${isActive ? 'is-active' : ''}`}
                    onClick={() => {
                      onChange(option.id);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </label>
    </div>
  );
}
