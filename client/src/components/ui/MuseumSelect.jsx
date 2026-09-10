import { useEffect, useRef, useState } from 'react';

function normalizeOptions(options = []) {
  return options.map((option) => {
    if (option && typeof option === 'object') {
      return {
        value: option.value ?? '',
        label: option.label ?? String(option.value ?? ''),
      };
    }
    return { value: option, label: String(option) };
  });
}

/** Discover-style pill dropdown (reuses `.brand-dropdown` museum chrome). */
export default function MuseumSelect({
  value = '',
  onChange,
  options = [],
  ariaLabel = 'Select',
  placeholder = 'Select',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const normalized = normalizeOptions(options);
  const selected = normalized.find((option) => option.value === value);
  const selectedLabel = selected?.label || placeholder;

  useEffect(() => {
    if (!open) return undefined;
    const onDocMouseDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className={`brand-dropdown ${className}`.trim()} ref={dropdownRef}>
      <button
        type="button"
        className="brand-dropdown__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
      >
        {selectedLabel}
      </button>
      {open ? (
        <div className="brand-dropdown__menu" role="listbox" aria-label={ariaLabel}>
          <div className="brand-dropdown__list">
            {normalized.map((option) => {
              const isActive = option.value === value;
              return (
                <button
                  key={`${option.value || 'empty'}-${option.label}`}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`brand-dropdown__item ${isActive ? 'is-active' : ''}`}
                  onClick={() => {
                    onChange?.(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
