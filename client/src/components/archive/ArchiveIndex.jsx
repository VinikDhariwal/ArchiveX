import { archiveStats } from '../../data/demoData.js';

export default function ArchiveIndex() {
  const items = [
    { label: 'Registry', value: archiveStats.archiveId },
    { label: 'Objects', value: archiveStats.objectCount },
    { label: 'Brands', value: archiveStats.brandCount },
    { label: 'Last updated', value: archiveStats.lastUpdated },
  ];

  return (
    <section className="archive-index" aria-label="Archive statistics" data-reveal>
      <div className="archive-index__grid">
        {items.map((item) => (
          <div className="archive-index__item" key={item.label}>
            <span className="meta">{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
