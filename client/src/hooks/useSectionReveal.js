import { useEffect } from 'react';

/**
 * Adds a quiet fade-rise reveal to elements marked with [data-reveal]
 * once they enter the viewport. Respects prefers-reduced-motion.
 */
export default function useSectionReveal() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nodes = Array.from(document.querySelectorAll('[data-reveal]'));

    if (reduced || typeof IntersectionObserver === 'undefined') {
      nodes.forEach((node) => node.classList.add('is-revealed'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -4% 0px', threshold: 0.02 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}
