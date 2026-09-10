import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { removeCompare } from '../../features/compare/compareSlice.js';
import { getPrimaryImage } from '../../utils/archiveObject.js';
import { buildCompareSections } from '../../utils/compareTable.js';

export default function ComparisonTable({ products = [] }) {
  const dispatch = useDispatch();
  const sections = buildCompareSections(products);

  if (!products.length) return null;

  return (
    <div className="compare-table-wrap">
      <table className="compare-table">
        <thead>
          <tr>
            <th scope="col">Attribute</th>
            {products.map((product) => {
              const image = getPrimaryImage(product);
              return (
                <th scope="col" key={product.id}>
                  <div className="compare-table__head">
                    {image ? <img src={image.url} alt="" /> : null}
                    <p className="meta">
                      {product.brand} · {product.year}
                    </p>
                    <Link to={`/products/${product.slug}`}>{product.name}</Link>
                    <button
                      type="button"
                      className="quiet-action"
                      onClick={() => dispatch(removeCompare(product.id))}
                    >
                      Remove
                    </button>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <FragmentSection key={section.id} section={section} colSpan={products.length + 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FragmentSection({ section, colSpan }) {
  return (
    <>
      <tr className="compare-table__section">
        <th scope="colgroup" colSpan={colSpan}>
          {section.title}
        </th>
      </tr>
      {section.rows.map((row) => (
        <tr key={row.key}>
          <th scope="row">{row.label}</th>
          {row.values.map((value, index) => (
            <td key={`${row.key}-${index}`}>{value}</td>
          ))}
        </tr>
      ))}
    </>
  );
}
