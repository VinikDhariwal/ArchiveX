import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import PageSkeleton from '../components/feedback/PageSkeleton.jsx';
import useSectionReveal from '../hooks/useSectionReveal.js';

/**
 * Public website layout — reuses AppShell (header + footer).
 * Keeps the wide Ivory Museum composition for all public routes.
 */
export default function PublicLayout() {
  useSectionReveal();

  return (
    <AppShell>
      <Suspense fallback={<PageSkeleton />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}
