const PRODUCT_TYPE_LABELS = {
  car: 'Cars',
  motorcycle: 'Motorcycles',
  watch: 'Watches',
};

/** Humanize catalog domain codes for public UI. */
export function formatProductType(value, { singular = false } = {}) {
  const key = String(value || '').toLowerCase();
  if (!key) return '';
  if (!singular) return PRODUCT_TYPE_LABELS[key] || value;
  const map = { car: 'Car', motorcycle: 'Motorcycle', watch: 'Watch' };
  return map[key] || value;
}

export default formatProductType;
