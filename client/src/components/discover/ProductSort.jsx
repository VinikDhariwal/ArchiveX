import { DISCOVER_SORT_OPTIONS } from '../../features/products/productApi.js';

export default function ProductSort({ value, onChange, total, isLoading }) {
  return (
    <div className="product-sort">
      <p className="product-sort__count">
        {isLoading ? 'Loading…' : `${total} result${total === 1 ? '' : 's'}`}
      </p>
      <label className="product-sort__control">
        <span>Sort</span>
        <select
          value={value || 'shuffle'}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Sort discovery results"
        >
          {DISCOVER_SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
