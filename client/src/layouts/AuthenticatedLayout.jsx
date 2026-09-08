import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import PageSkeleton from '../components/feedback/PageSkeleton.jsx';

/**
 * Authenticated collector layout — same website chrome as public for now.
 * Real auth guards arrive in Phase 6; this is a structural boundary only.
 */
export default function AuthenticatedLayout() {
  return (
    <AppShell>
      <div className="layout-banner" role="note">
        <p className="meta">Collector area · authentication arrives in Phase 6</p>
      </div>
      <Suspense fallback={<PageSkeleton variant="shell" />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}
