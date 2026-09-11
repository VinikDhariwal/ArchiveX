import { useEffect, useMemo, useRef, useState } from 'react';
import { DOMAIN_OPTIONS } from '../../features/products/productApi.js';

const SHARED_FIELDS = [
  { key: 'category', label: 'Category', placeholder: 'Any category' },
  { key: 'yearMin', label: 'Year from', placeholder: 'From', type: 'number' },
  { key: 'yearMax', label: 'Year to', placeholder: 'To', type: 'number' },
  {
    key: 'rarity',
    label: 'Rarity',
    type: 'select',
    options: ['', 'COMMON', 'COLLECTIBLE', 'RARE', 'ICONIC', 'ULTRA-RARE', 'UNIQUE'],
  },
  { key: 'material', label: 'Material', placeholder: 'Any material' },
  { key: 'color', label: 'Color', placeholder: 'Any color' },
  {
    key: 'availability',
    label: 'Availability',
    type: 'select',
    options: ['', 'unknown', 'museum', 'private', 'auction', 'production', 'discontinued'],
  },
];

const DOMAIN_FIELDS = {
  car: [
    { key: 'bodyStyle', label: 'Body type', placeholder: 'Any body type' },
    { key: 'engine', label: 'Engine', placeholder: 'Any engine' },
    { key: 'power', label: 'Power', placeholder: 'Any' },
    { key: 'drivetrain', label: 'Drivetrain', placeholder: 'Any' },
    { key: 'transmission', label: 'Transmission', placeholder: 'Any' },
    { key: 'productionPeriod', label: 'Era', placeholder: 'Any era' },
  ],
  motorcycle: [
    { key: 'engine', label: 'Engine', placeholder: 'Any engine' },
    { key: 'displacement', label: 'Displacement', placeholder: 'Any' },
    { key: 'power', label: 'Power', placeholder: 'Any' },
    { key: 'transmission', label: 'Transmission', placeholder: 'Any' },
    { key: 'productionPeriod', label: 'Era', placeholder: 'Any era' },
  ],
  watch: [
    { key: 'movement', label: 'Movement', placeholder: 'Any movement' },
    { key: 'caseMaterial', label: 'Case', placeholder: 'Any case' },
    { key: 'caseSize', label: 'Size', placeholder: 'Any' },
    { key: 'dialColor', label: 'Dial', placeholder: 'Any dial' },
    { key: 'waterResistance', label: 'Water', placeholder: 'Any' },
    { key: 'productionPeriod', label: 'Era', placeholder: 'Any era' },
  ],
  all: [
    { key: 'engine', label: 'Engine', placeholder: 'Any engine' },
    { key: 'productionPeriod', label: 'Era', placeholder: 'Any era' },
  ],
};

function Field({ field, value, onChange }) {
  if (field.type === 'select') {
    return <SelectDropdownField field={field} value={value} onChange={onChange} />;
  }

  return (
    <label className="product-filters__field">
      <span>{field.label}</span>
      <input
        type={field.type || 'text'}
        value={value || ''}
        placeholder={field.placeholder}
        onChange={(event) => onChange(field.key, event.target.value)}
      />
    </label>
  );
}

function SelectDropdownField({ field, value, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const normalized = value || '';

  const selectedLabel = normalized || 'Any';

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
    <label className="product-filters__field">
      <span>{field.label}</span>

      <div className="brand-dropdown" ref={dropdownRef}>
        <button
          type="button"
          className="brand-dropdown__button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {selectedLabel}
        </button>

        {open ? (
          <div className="brand-dropdown__menu" role="listbox" aria-label={field.label}>
            {field.options.map((option) => {
              const optValue = option || '';
              const optLabel = option || 'Any';
              const isActive = optValue === normalized;
              return (
                <button
                  key={option || 'any'}
                  type="button"
                  className={`brand-dropdown__item ${isActive ? 'is-active' : ''}`}
                  onClick={() => {
                    onChange(field.key, optValue);
                    setOpen(false);
                  }}
                >
                  {optLabel}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </label>
  );
}

export default function ProductFilters({
  params,
  draftQuery,
  onDraftQueryChange,
  onSearchSubmit,
  onChange,
  onClear,
  brands = [],
}) {
  const domain = params.domain || 'all';
  const domainFields = DOMAIN_FIELDS[domain] || DOMAIN_FIELDS.all;
  const [brandOpen, setBrandOpen] = useState(false);
  const [brandQuery, setBrandQuery] = useState('');
  const dropdownRef = useRef(null);
  const brandSearchRef = useRef(null);
  const selectedBrand = useMemo(
    () => brands.find((item) => item.slug === params.brand) || null,
    [brands, params.brand]
  );
  const filteredBrands = useMemo(() => {
    const needle = brandQuery.trim().toLowerCase();
    if (!needle) return brands;
    return brands.filter((brand) => brand.name.toLowerCase().includes(needle));
  }, [brands, brandQuery]);

  useEffect(() => {
    // Close dropdown when query/domain/chamber changes so it doesn't float over new content.
    setBrandOpen(false);
    setBrandQuery('');
  }, [params.domain, params.q]);

  useEffect(() => {
    if (!brandOpen) return;

    const onDocMouseDown = (event) => {
      const node = dropdownRef.current;
      if (!node) return;
      if (node.contains(event.target)) return;
      setBrandOpen(false);
      setBrandQuery('');
    };

    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [brandOpen]);

  useEffect(() => {
    if (!brandOpen) return;
    brandSearchRef.current?.focus();
  }, [brandOpen]);

  return (
    <aside className="product-filters" aria-label="Discovery filters">
      <div className="product-filters__section">
        <p className="product-filters__heading">Domain</p>
        <div className="product-filters__domains" role="tablist" aria-label="Domain filter">
          {DOMAIN_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={domain === option.id}
              className={`product-filters__domain ${domain === option.id ? 'is-active' : ''}`}
              onClick={() => onChange({ domain: option.id, page: '1' })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <form className="product-filters__section product-filters__search" onSubmit={onSearchSubmit}>
        <p className="product-filters__heading">Search</p>
        <div className="product-filters__search-row">
          <label className="product-filters__field product-filters__field--grow">
            <span className="visually-hidden">Search products</span>
            <input
              type="search"
              value={draftQuery}
              placeholder="Name, reference, brand…"
              onChange={(event) => onDraftQueryChange(event.target.value)}
            />
          </label>
          <button type="submit" className="product-filters__text-action">
            Search
          </button>
        </div>
      </form>

      {brands.length ? (
        <div className="product-filters__section">
          <p className="product-filters__heading">Brands</p>
          <div className="brand-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className="brand-dropdown__button"
              aria-haspopup="listbox"
              aria-expanded={brandOpen}
              onClick={() => {
                setBrandOpen((v) => {
                  const next = !v;
                  if (!next) setBrandQuery('');
                  return next;
                });
              }}
            >
              {selectedBrand ? selectedBrand.name : 'Any'}
            </button>

            {brandOpen ? (
              <div className="brand-dropdown__menu" role="listbox" aria-label="Brand">
                <div className="brand-dropdown__search">
                  <label className="visually-hidden" htmlFor="brand-dropdown-search">
                    Search brands
                  </label>
                  <input
                    id="brand-dropdown-search"
                    ref={brandSearchRef}
                    type="search"
                    value={brandQuery}
                    placeholder="Search brands…"
                    onChange={(event) => setBrandQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        setBrandOpen(false);
                        setBrandQuery('');
                      }
                    }}
                  />
                </div>

                <div className="brand-dropdown__list">
                  {!brandQuery.trim() ? (
                    <button
                      type="button"
                      className={`brand-dropdown__item ${!params.brand ? 'is-active' : ''}`}
                      onClick={() => {
                        onChange({ brand: '', page: '1' });
                        setBrandOpen(false);
                        setBrandQuery('');
                      }}
                    >
                      Any
                    </button>
                  ) : null}

                  {filteredBrands.map((brand) => (
                    <button
                      type="button"
                      key={brand.slug}
                      className={`brand-dropdown__item ${
                        params.brand === brand.slug ? 'is-active' : ''
                      }`}
                      onClick={() => {
                        onChange({ brand: brand.slug, page: '1' });
                        setBrandOpen(false);
                        setBrandQuery('');
                      }}
                    >
                      {brand.name}
                    </button>
                  ))}

                  {!filteredBrands.length ? (
                    <p className="brand-dropdown__empty">No brands match.</p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="product-filters__section">
        <p className="product-filters__heading">Refine</p>
        <div className="product-filters__fields">
          {SHARED_FIELDS.map((field) => (
            <Field
              key={field.key}
              field={field}
              value={params[field.key]}
              onChange={(key, value) => onChange({ [key]: value, page: '1' })}
            />
          ))}
        </div>
      </div>

      <div className="product-filters__section">
        <p className="product-filters__heading">
          {domain === 'all'
            ? 'Details'
            : `${domain.charAt(0).toUpperCase()}${domain.slice(1)} details`}
        </p>
        <div className="product-filters__fields">
          {domainFields.map((field) => (
            <Field
              key={field.key}
              field={field}
              value={params[field.key]}
              onChange={(key, value) => onChange({ [key]: value, page: '1' })}
            />
          ))}
        </div>
      </div>

      <button type="button" className="product-filters__text-action" onClick={onClear}>
        Clear all
      </button>
    </aside>
  );
}
