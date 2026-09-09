import { DOMAIN_OPTIONS } from '../../features/products/productApi.js';

const SHARED_FIELDS = [
  { key: 'brand', label: 'Brand slug', placeholder: 'ferrari' },
  { key: 'category', label: 'Category slug', placeholder: 'car-icons' },
  { key: 'yearMin', label: 'Year from', placeholder: '1950', type: 'number' },
  { key: 'yearMax', label: 'Year to', placeholder: '2025', type: 'number' },
  {
    key: 'rarity',
    label: 'Rarity',
    type: 'select',
    options: ['', 'COMMON', 'COLLECTIBLE', 'RARE', 'ICONIC', 'ULTRA-RARE', 'UNIQUE'],
  },
  { key: 'material', label: 'Material', placeholder: 'aluminium' },
  { key: 'color', label: 'Color', placeholder: 'silver' },
  {
    key: 'availability',
    label: 'Availability',
    type: 'select',
    options: ['', 'unknown', 'museum', 'private', 'auction', 'production', 'discontinued'],
  },
];

const DOMAIN_FIELDS = {
  car: [
    { key: 'bodyStyle', label: 'Body type', placeholder: 'coupe' },
    { key: 'engine', label: 'Engine type', placeholder: 'V8' },
    { key: 'power', label: 'Power', placeholder: '478' },
    { key: 'drivetrain', label: 'Drivetrain', placeholder: 'AWD' },
    { key: 'transmission', label: 'Transmission', placeholder: 'manual' },
    { key: 'productionPeriod', label: 'Production era', placeholder: '1987' },
  ],
  motorcycle: [
    { key: 'engine', label: 'Engine type', placeholder: 'V-twin' },
    { key: 'displacement', label: 'Displacement', placeholder: '1200' },
    { key: 'power', label: 'Power', placeholder: '75' },
    { key: 'transmission', label: 'Transmission', placeholder: '6-speed' },
    { key: 'productionPeriod', label: 'Production era', placeholder: '1970' },
  ],
  watch: [
    { key: 'movement', label: 'Movement', placeholder: 'automatic' },
    { key: 'caseMaterial', label: 'Case material', placeholder: 'steel' },
    { key: 'caseSize', label: 'Case size', placeholder: '40' },
    { key: 'dialColor', label: 'Dial color', placeholder: 'black' },
    { key: 'waterResistance', label: 'Water resistance', placeholder: '100m' },
    { key: 'productionPeriod', label: 'Production period', placeholder: '1960' },
  ],
  all: [
    { key: 'engine', label: 'Engine type', placeholder: 'V8 / V-twin' },
    { key: 'productionPeriod', label: 'Production era', placeholder: '1954–1957' },
  ],
};

function Field({ field, value, onChange }) {
  if (field.type === 'select') {
    return (
      <label className="product-filters__field">
        <span>{field.label}</span>
        <select value={value || ''} onChange={(event) => onChange(field.key, event.target.value)}>
          {field.options.map((option) => (
            <option key={option || 'any'} value={option}>
              {option || 'Any'}
            </option>
          ))}
        </select>
      </label>
    );
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

      <form className="product-filters__section" onSubmit={onSearchSubmit}>
        <p className="product-filters__heading">Search</p>
        <label className="product-filters__field">
          <span className="visually-hidden">Search products</span>
          <input
            type="search"
            value={draftQuery}
            placeholder="Name, reference, brand…"
            onChange={(event) => onDraftQueryChange(event.target.value)}
          />
        </label>
        <button type="submit" className="product-filters__button">
          Search
        </button>
      </form>

      {brands.length ? (
        <div className="product-filters__section">
          <p className="product-filters__heading">Brands</p>
          <div className="product-filters__chips">
            <button
              type="button"
              className={`product-filters__chip ${!params.brand ? 'is-active' : ''}`}
              onClick={() => onChange({ brand: '', page: '1' })}
            >
              Any
            </button>
            {brands.slice(0, 10).map((brand) => (
              <button
                key={brand.slug}
                type="button"
                className={`product-filters__chip ${params.brand === brand.slug ? 'is-active' : ''}`}
                onClick={() => onChange({ brand: brand.slug, page: '1' })}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="product-filters__section">
        <p className="product-filters__heading">Shared filters</p>
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
          {domain === 'all' ? 'More filters' : `${domain} filters`}
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

      <button type="button" className="product-filters__button product-filters__button--ghost" onClick={onClear}>
        Clear filters
      </button>
    </aside>
  );
}
