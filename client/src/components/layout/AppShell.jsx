import { useEffect, useState } from 'react';
import DesktopHeader from './DesktopHeader.jsx';
import MobileHeader from './MobileHeader.jsx';
import Footer from './Footer.jsx';

export default function AppShell({ children, compareCount = 0, onOpenCompare }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <div className="page-shell">
      <div className={`site-header ${condensed ? 'is-condensed' : ''}`}>
        <DesktopHeader compareCount={compareCount} onOpenCompare={onOpenCompare} />        <MobileHeader
          menuOpen={menuOpen}
          onOpenMenu={() => setMenuOpen(true)}
          onCloseMenu={() => setMenuOpen(false)}
          compareCount={compareCount}
          onOpenCompare={onOpenCompare}
        />
      </div>
      {children}
      <Footer />
    </div>
  );
}
