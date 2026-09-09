import { useEffect } from 'react';

/**
 * Adds a quiet fade-rise reveal to elements marked with [data-reveal]
 * once they enter the viewport. Respects prefers-reduced-motion.
 * Also watches for nodes mounted after the first paint (e.g. API-driven sections).
 */
export default function useSectionReveal() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pending = new Set();

    const revealAll = () => {
      document.querySelectorAll('[data-reveal]').forEach((node) => {
        node.classList.add('is-revealed');
      });
    };

    if (reduced || typeof IntersectionObserver === 'undefined') {
      revealAll();
      const mo = new MutationObserver(revealAll);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
            pending.delete(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -4% 0px', threshold: 0.02 }
    );

    const watch = () => {
      document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((node) => {
        if (pending.has(node)) return;
        pending.add(node);
        observer.observe(node);
      });
    };

    watch();
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      observer.disconnect();
      pending.clear();
    };
  }, []);
}
